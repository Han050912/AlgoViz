import api from "./api";
import type { TraceStep } from "@/types/trace";

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
  const base = api.defaults.baseURL ?? "";
  const url = base + "/analyses/stream?project_id=" + encodeURIComponent(projectId) + "&api_config_id=" + encodeURIComponent(apiConfigId);

  fetch(url, {
    method: "POST",
    headers: token ? { Authorization: "Bearer " + token, "Content-Type": "application/json" } : { "Content-Type": "application/json" },
    body: "{}",
    signal: abort.signal,
  }).then(async (res) => {
    if (!res.ok) {
      // 401 时尝试用 refresh token 刷新后重试一次
      if (res.status === 401) {
        const refreshToken =
          localStorage.getItem("refresh_token") || sessionStorage.getItem("refresh_token");
        if (refreshToken) {
          try {
            const { data } = await api.post("/auth/refresh", { refresh_token: refreshToken });
            const store = localStorage.getItem("refresh_token") ? localStorage : sessionStorage;
            store.setItem("access_token", data.data.access_token);
            store.setItem("refresh_token", data.data.refresh_token);
            const newToken = data.data.access_token;
            const retryRes = await fetch(url, {
              method: "POST",
              headers: { Authorization: "Bearer " + newToken, "Content-Type": "application/json" },
              body: "{}",
              signal: abort.signal,
            });
            if (retryRes.ok) {
              return streamReader(retryRes, callbacks, abort);
            }
          } catch {
            /* refresh 失败则按原错误上报 */
          }
        }
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        sessionStorage.removeItem("access_token");
        sessionStorage.removeItem("refresh_token");
      }
      callbacks.onError?.("HTTP " + res.status);
      return;
    }
    return streamReader(res, callbacks, abort);
  }).catch((err) => {
    if (err.name !== "AbortError") {
      callbacks.onError?.(err.message || String(err));
    }
  });

  return abort;
}

// 抽取出的流读取逻辑，供首请求与 refresh 重试共用
function streamReader(
  res: Response,
  callbacks: SSECallbacks,
  abort: AbortController,
): Promise<void> {
  return new Promise<void>((resolve) => {
    const reader = res.body?.getReader();
    if (!reader) { callbacks.onError?.("No response body"); resolve(); return; }

    const decoder = new TextDecoder();
    let buffer = "";
    let analysisChunks = "";

    (async () => {
      try {
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
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          callbacks.onError?.((err as Error).message || String(err));
        }
      } finally {
        resolve();
      }
    })();
  });
}

function parseMarkdownReport(md: string): AnalysisReport {
  // 纯文本格式解析：从中文标题提取
  const timeMatch = md.match(/时间复杂度[:：]\s*([^\n]+)/i);
  const spaceMatch = md.match(/空间复杂度[:：]\s*([^\n]+)/i);
  const summary = md.split("\n")[0]?.trim() || "分析报告";

  // 匹配"步骤 N:" 格式
  const stepRegex = /(?:步骤|Step)\s*(\d+)[:：]\s*([^\n]+)/gi;
  const steps: { step: number; explanation: string }[] = [];
  let match;
  while ((match = stepRegex.exec(md)) !== null) {
    steps.push({ step: parseInt(match[1], 10) - 1, explanation: match[2].trim() });
  }

  if (steps.length === 0) {
    // 退化为逐行展示
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
