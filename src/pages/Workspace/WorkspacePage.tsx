import { useState, useCallback, useRef } from "react";
import { useParams } from "react-router-dom";
import { message } from "antd";
import MonacoEditor from "@/components/CodeEditor/MonacoEditor";
import TraceViewerCanvas from "@/components/TraceViewer/TraceViewerCanvas";
import PlaybackControls from "@/components/TraceViewer/PlaybackControls";
import CallStackPanel from "@/components/TraceViewer/CallStackPanel";
import VariableTable from "@/components/TraceViewer/VariableTable";
import OutputConsole from "@/components/TraceViewer/OutputConsole";
import DataStructureView from "@/components/TraceViewer/DataStructureView";
import AnalysisPanel from "@/components/AnalysisPanel/AnalysisPanel";
import { createProject, analyzeProjectStream } from "@/services/analysisApi";

import type { TraceStep } from "@/types/trace";
import type { AnalysisReport } from "@/services/analysisApi";

const defaultCode = `def bubble_sort(arr):
    n = len(arr)
    for i in range(n):
        for j in range(0, n - i - 1):
            if arr[j] > arr[j + 1]:
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
    return arr

arr = [64, 34, 25, 12, 22, 11, 90]
print(bubble_sort(arr))`;

const WorkspacePage = () => {
  const { id } = useParams<{ id: string }>();
  const [code, setCode] = useState(defaultCode);
  const [language, setLanguage] = useState("python");
  const [currentLine, setCurrentLine] = useState<number | null>(null);
  const [steps, setSteps] = useState<TraceStep[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [output, setOutput] = useState<string[]>(["Ready to analyze..."]);
  const [report, setReport] = useState<AnalysisReport | null>(null);
  const [streaming, setStreaming] = useState(false);
  const [analysisChunks, setAnalysisChunks] = useState("");
  const abortRef = useRef<AbortController | null>(null);

  const handleAnalyze = useCallback(async () => {
    if (streaming) {
      abortRef.current?.abort();
      setStreaming(false);
      return;
    }

    setStreaming(true);
    setSteps([]);
    setReport(null);
    setAnalysisChunks("");
    setCurrentStepIndex(0);
    setOutput(["Starting analysis..."]);

    const defaultConfig = (JSON.parse(localStorage.getItem("algoviz_configs") || "[]")).find((c: { is_default: boolean }) => c.is_default);
    if (!defaultConfig) {
      message.error("No default AI config set. Please configure in Settings.");
      setStreaming(false);
      setOutput(["Error: No AI model configured."]);
      return;
    }

    try {
      const project = await createProject(
        id || "analysis-" + Date.now(),
        language,
        code
      );

      setOutput((prev) => [...prev, "Project created: " + project.id]);

      const ctrl = analyzeProjectStream(project.id, defaultConfig.id, {
        onStatus: (status, analysisId) => {
          setOutput((prev) => [...prev, "Status: " + status]);
        },
        onTraceStep: (step) => {
          setSteps((prev) => [...prev, step]);
          setCurrentLine(step.line ?? null);
        },
        onAnalysisChunk: (chunk) => {
          setAnalysisChunks((prev) => prev + chunk);
        },
        onReportReady: (r) => {
          setReport(r);
          setOutput((prev) => [...prev, "Analysis complete."]);
        },
        onComplete: (analysisId, totalSteps) => {
          setStreaming(false);
          setOutput((prev) => [...prev, "Done. " + totalSteps + " trace steps."]);
        },
        onError: (msg) => {
          setStreaming(false);
          setOutput((prev) => [...prev, "Error: " + msg]);
          message.error("Analysis failed: " + msg);
        },
      });
      abortRef.current = ctrl;
    } catch (e: unknown) {
      const errMsg = e instanceof Error ? e.message : String(e);
      setStreaming(false);
      setOutput((prev) => [...prev, "Error: " + errMsg]);
      message.error("Failed to start analysis: " + errMsg);
    }
  }, [streaming, code, language, id]);

  const currentStep = steps.length > 0 ? steps[currentStepIndex] : null;

  return (
    <div className="flex h-full overflow-hidden" style={{ background: "var(--color-bg-page)" }}>
      <div className="flex flex-col overflow-hidden" style={{ width: "35%", minWidth: 280 }}>
        <div className="flex-1 p-2">
          <MonacoEditor code={code} language={language} currentLine={currentLine} onCodeChange={setCode} onLanguageChange={setLanguage} onAnalyze={handleAnalyze} />
        </div>
      </div>
      <div className="flex flex-col overflow-hidden" style={{ width: "40%", minWidth: 320, borderLeft: "1px solid var(--color-border)", borderRight: "1px solid var(--color-border)" }}>
        <div className="flex-1 p-2 overflow-hidden min-h-0">
          <TraceViewerCanvas currentStep={currentStep} allSteps={steps} currentStepIndex={currentStepIndex} />
        </div>
        <PlaybackControls currentStep={currentStepIndex} totalSteps={Math.max(steps.length, 1)} isPlaying={isPlaying} speed={speed} onStepChange={setCurrentStepIndex} onPlay={() => setIsPlaying(true)} onPause={() => setIsPlaying(false)} onStepForward={() => setCurrentStepIndex((s) => Math.min(s + 1, steps.length - 1))} onStepBackward={() => setCurrentStepIndex((s) => Math.max(s - 1, 0))} onSpeedChange={setSpeed} />
      </div>
      <div className="flex flex-col overflow-auto" style={{ width: "25%", minWidth: 240 }}>
        <div className="p-2"><AnalysisPanel report={report} streaming={streaming} /></div>
        <div className="p-2"><CallStackPanel callStack={currentStep?.call_stack ?? []} /></div>
        <div className="p-2"><VariableTable locals={currentStep?.locals ?? {}} globals={currentStep?.globals ?? {}} /></div>
        <div className="p-2"><OutputConsole output={output} /></div>
        <div className="p-2"><DataStructureView data={null} /></div>
      </div>
    </div>
  );
};

export default WorkspacePage;


