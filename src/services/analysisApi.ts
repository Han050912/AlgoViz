import api from "./api";
import type { TraceStep } from "@/types/trace";

const BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";

interface AnalysisReport {
  time: string;
  space: string;
  summary: string;
  steps: { step: number; explanation: string }[];
}

interface SSECallbacks {
  onStatus?: (status: string, analysisId?: string) => void;
  onTraceStep?: (step: TraceStep) => void;
  onAnalysisChunk?: (chunk: string) => void;
  onComplete?: (analysisId: string, totalSteps: number) => void;
  onError?: (message: string) => void;
  onReportReady?: (report: AnalysisReport) => void;
}

export async function createProject(name: string, language: string, sourceCode: string): Promise<{ id: string }> {
  const res = await api.post("/projects", { name, language, source_code: sourceCode });
  return { id: res.data.data.id };
}

export function analyzeProjectStream(
  projectId: string,
  apiConfigId: string,
  callbacks: SSECallbacks,
): AbortController {
  const abort = new AbortController();
  const token = localStorage.getItem("access_token") || sessionStorage.getItem("access_token");
  const url = BASE + "/analyses/stream?project_id=" + encodeURIComponent(projectId) + "&api_config_id=" + encodeURIComponent(apiConfigId);

  fetch(url, {
    method: "POST",
    headers: token ? { Authorization: "Bearer " + token, "Content-Type": "application/json" } : { "Content-Type": "application/json" },
    body: "{}",
    signal: abort.signal,
  }).then(async (res) => {
    if (!res.ok) {
      callbacks.onError?.("HTTP " + res.status);
      return;
    }
    const reader = res.body?.getReader();
    if (!reader) { callbacks.onError?.("No response body"); return; }

    const decoder = new TextDecoder();
    let buffer = "";
    let analysisChunks = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      let eventType = "";
      for (const line of lines) {
        if (line.startsWith("event: ")) {
          eventType = line.slice(7).trim();
        } else if (line.startsWith("data: ")) {
          try {
            const data = JSON.parse(line.slice(6));
            switch (eventType) {
              case "status":
                callbacks.onStatus?.(data.status, data.analysis_id);
                break;
              case "trace":
                callbacks.onTraceStep?.(data);
                break;
              case "analysis":
                analysisChunks += data.chunk;
                callbacks.onAnalysisChunk?.(data.chunk);
                break;
              case "complete":
                callbacks.onComplete?.(data.analysis_id, data.total_steps);
                if (analysisChunks) {
                  const report = parseMarkdownReport(analysisChunks);
                  callbacks.onReportReady?.(report);
                }
                break;
              case "error":
                callbacks.onError?.(data.message);
                break;
            }
          } catch { /* skip malformed SSE data */ }
        }
      }
    }
  }).catch((err) => {
    if (err.name !== "AbortError") {
      callbacks.onError?.(err.message || String(err));
    }
  });

  return abort;
}

function parseMarkdownReport(md: string): AnalysisReport {
  const timeMatch = md.match(/(?:Time Complexity|时间复杂度)[:：]\s*\**([^*\n]+)\**/i);
  const spaceMatch = md.match(/(?:Space Complexity|空间复杂度)[:：]\s*\**([^*\n]+)\**/i);
  const summary = md.split("\n")[0]?.replace(/^#+\s*/, "").trim() || "Analysis Report";

  const stepRegex = /(?:Step|步骤)\s*(\d+)[:：]\s*([^\n]+)/gi;
  const steps: { step: number; explanation: string }[] = [];
  let match;
  while ((match = stepRegex.exec(md)) !== null) {
    steps.push({ step: parseInt(match[1], 10) - 1, explanation: match[2].trim() });
  }

  if (steps.length === 0) {
    const lines = md.split("\n").filter(l => l.trim());
    lines.forEach((l, i) => {
      steps.push({ step: i, explanation: l.replace(/^[-*#]\s*/, "").trim() });
    });
  }

  return {
    time: (timeMatch?.[1] || "O(n)").trim(),
    space: (spaceMatch?.[1] || "O(1)").trim(),
    summary,
    steps: steps.slice(0, 20),
  };
}

export type { AnalysisReport, SSECallbacks };
