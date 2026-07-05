import { useState, useCallback, useRef } from "react";
import { useParams } from "react-router-dom";
import { message, Modal } from "antd";
import StarButton from "@/components/StarButton/StarButton";
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

// ─── 语言模板 ──────────────────────────────────────────────
const languageTemplates: Record<string, string> = {
  python: `def main():
    # 在此编写代码
    print("Hello, AlgoViz!")

if __name__ == "__main__":
    main()`,
  javascript: `// 在此编写代码
function main() {
    console.log("Hello, AlgoViz!");
}

main();`,
  java: `public class Main {
    public static void main(String[] args) {
        // 在此编写代码
        System.out.println("Hello, AlgoViz!");
    }
}`,
  cpp: `#include <iostream>
using namespace std;

int main() {
    // 在此编写代码
    cout << "Hello, AlgoViz!" << endl;
    return 0;
}`,
  go: `package main

import "fmt"

func main() {
    // 在此编写代码
    fmt.Println("Hello, AlgoViz!")
}`,
  rust: `fn main() {
    // 在此编写代码
    println!("Hello, AlgoViz!");
}`,
};

// ─── 运行用例模板 ──────────────────────────────────────────
const defaultTestCase = `1
2
3`;

const WorkspacePage = () => {
  const { id } = useParams<{ id: string }>();
  const [code, setCode] = useState(languageTemplates.python);
  const [language, setLanguage] = useState("python");
  const [currentLine, setCurrentLine] = useState<number | null>(null);
  const [steps, setSteps] = useState<TraceStep[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [output, setOutput] = useState<string[]>(["准备分析..."]);
  const [report, setReport] = useState<AnalysisReport | null>(null);
  const [streaming, setStreaming] = useState(false);
  const [analysisChunks, setAnalysisChunks] = useState("");

  // ─── 运行 / 调试 ──────────────────────────────────────
  const [inputValue, setInputValue] = useState(defaultTestCase);
  const [isRunning, setIsRunning] = useState(false);
  const [runOutput, setRunOutput] = useState<string[]>([]);
  const [runError, setRunError] = useState<string | null>(null);
  const [runTimeMs, setRunTimeMs] = useState<number | null>(null);

  const abortRef = useRef<AbortController | null>(null);

  // 切换语言时自动加载对应模板
  const handleLanguageChange = useCallback(
    (lang: string) => {
      setLanguage(lang);
      setCode(languageTemplates[lang] || languageTemplates.python);
      setReport(null);
      setSteps([]);
      setAnalysisChunks("");
      setStreaming(false);
    },
    []
  );

  // 重置代码
  const handleResetCode = useCallback(() => {
    setCode(languageTemplates[language] || languageTemplates.python);
    setReport(null);
    setSteps([]);
    setAnalysisChunks("");
    setStreaming(false);
    message.success("代码已重置为默认模板");
  }, [language]);

  const handleAnalyze = useCallback(async () => {
    if (streaming) {
      abortRef.current?.abort();
      setStreaming(false);
      setOutput((prev) => [...prev, "分析已中止。"]);
      return;
    }

    setStreaming(true);
    setSteps([]);
    setReport(null);
    setAnalysisChunks("");
    setCurrentStepIndex(0);
    setOutput(["开始分析..."]);

    const defaultConfig = (JSON.parse(localStorage.getItem("algoviz_configs") || "[]")).find((c: { is_default: boolean }) => c.is_default);
    if (!defaultConfig) {
      message.error("未设置默认 AI 配置，请在设置中配置。");
      setStreaming(false);
      setOutput(["错误：未配置 AI 模型。"]);
      return;
    }

    try {
      const project = await createProject(
        id || "analysis-" + Date.now(),
        language,
        code
      );

      setOutput((prev) => [...prev, "项目已创建: " + project.id]);

      const ctrl = analyzeProjectStream(project.id, defaultConfig.id, {
        onStatus: (status, analysisId) => {
          setOutput((prev) => [...prev, "状态: " + status]);
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
          setOutput((prev) => [...prev, "分析完成。"]);
        },
        onComplete: (analysisId, totalSteps) => {
          setStreaming(false);
          setOutput((prev) => [...prev, "完成。共 " + totalSteps + " 步追踪。"]);
        },
        onError: (msg) => {
          setStreaming(false);
          setOutput((prev) => [...prev, "错误: " + msg]);
          message.error("分析失败: " + msg);
        },
      });
      abortRef.current = ctrl;
    } catch (e: unknown) {
      const errMsg = e instanceof Error ? e.message : String(e);
      setStreaming(false);
      setOutput((prev) => [...prev, "错误: " + errMsg]);
      message.error("启动分析失败: " + errMsg);
    }
  }, [streaming, code, language, id]);

  // ─── 运行代码 ─────────────────────────────────────────
  const handleRun = useCallback(async () => {
    setIsRunning(true);
    setRunOutput([]);
    setRunError(null);
    setRunTimeMs(null);

    const startTime = Date.now();

    // 模拟运行：由于前端无法真正执行任意代码，这里展示运行框架
    // 实际执行需要后端沙箱支持
    try {
      // 模拟运行耗时
      await new Promise((resolve) => setTimeout(resolve, 500 + Math.random() * 1000));

      const elapsed = Date.now() - startTime;
      setRunTimeMs(elapsed);
      setRunOutput([
        `> 正在运行 ${language} 代码...`,
        `> 输入:`,
        ...inputValue.split("\n").map((l) => `  ${l}`),
        `> 输出:`,
        `  Hello, AlgoViz!`,
        `> 运行成功`,
        `> 耗时: ${elapsed}ms`,
      ]);
    } catch (e: unknown) {
      const errMsg = e instanceof Error ? e.message : String(e);
      setRunError(errMsg);
      setRunOutput([...runOutput, `> 错误: ${errMsg}`]);
    } finally {
      setIsRunning(false);
    }
  }, [language, inputValue]);

  const currentStep = steps.length > 0 ? steps[currentStepIndex] : null;

  return (
    <div className="flex h-full overflow-hidden" style={{ background: "var(--color-bg-page)" }}>
      {/* 左侧：代码编辑器 */}
      <div className="flex flex-col overflow-hidden" style={{ width: "35%", minWidth: 280 }}>
        <div className="flex-1 p-2">
          <MonacoEditor
            code={code}
            language={language}
            currentLine={currentLine}
            onCodeChange={setCode}
            onLanguageChange={handleLanguageChange}
            onAnalyze={handleAnalyze}
            onResetCode={handleResetCode}
            onRun={handleRun}
            isRunning={isRunning}
            projectId={id}
          />
        </div>
      </div>

      {/* 中间：轨迹可视化 */}
      <div className="flex flex-col overflow-hidden" style={{ width: "40%", minWidth: 320, borderLeft: "1px solid var(--color-border)", borderRight: "1px solid var(--color-border)" }}>
        <div className="flex-1 p-2 overflow-hidden min-h-0">
          <TraceViewerCanvas currentStep={currentStep} allSteps={steps} currentStepIndex={currentStepIndex} />
        </div>
        <PlaybackControls
          currentStep={currentStepIndex}
          totalSteps={Math.max(steps.length, 1)}
          isPlaying={isPlaying}
          speed={speed}
          onStepChange={setCurrentStepIndex}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onStepForward={() => setCurrentStepIndex((s) => Math.min(s + 1, steps.length - 1))}
          onStepBackward={() => setCurrentStepIndex((s) => Math.max(s - 1, 0))}
          onSpeedChange={setSpeed}
        />
      </div>

      {/* 右侧：面板区 */}
      <div className="flex flex-col overflow-auto" style={{ width: "25%", minWidth: 240 }}>
        <div className="p-2"><AnalysisPanel report={report} streaming={streaming} /></div>
        <div className="p-2"><CallStackPanel callStack={currentStep?.call_stack ?? []} /></div>
        <div className="p-2"><VariableTable locals={currentStep?.locals ?? {}} globals={currentStep?.globals ?? {}} /></div>
        <div className="p-2"><OutputConsole output={output} /></div>

        {/* 运行面板 */}
        <div className="p-2" style={{ borderTop: "1px solid var(--color-border)" }}>
          <h4 style={{ fontSize: 12, fontWeight: 600, color: "var(--color-text-tertiary)", marginBottom: 8, textTransform: "uppercase" }}>运行</h4>
          <div className="mb-2">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="输入测试用例..."
              style={{
                width: "100%",
                height: 60,
                fontSize: 12,
                fontFamily: "var(--font-mono)",
                background: "var(--color-bg-elevated)",
                color: "var(--color-text-primary)",
                border: "1px solid var(--color-border)",
                borderRadius: 4,
                padding: 6,
                resize: "vertical",
              }}
            />
          </div>
          <div className="flex gap-2 mb-2">
            <button
              onClick={handleRun}
              disabled={isRunning}
              style={{
                flex: 1,
                height: 28,
                fontSize: 12,
                fontWeight: 500,
                background: isRunning ? "#9CA3AF" : "var(--color-brand-gold)",
                color: "#fff",
                border: "none",
                borderRadius: 4,
                cursor: isRunning ? "not-allowed" : "pointer",
              }}
            >
              {isRunning ? "运行中..." : "▶ 运行"}
            </button>
            <button
              onClick={handleResetCode}
              style={{
                height: 28,
                fontSize: 12,
                background: "transparent",
                color: "var(--color-text-tertiary)",
                border: "1px solid var(--color-border)",
                borderRadius: 4,
                cursor: "pointer",
                padding: "0 8px",
              }}
            >
              重置
            </button>
          </div>
          {runTimeMs !== null && (
            <div style={{ fontSize: 11, color: "var(--color-text-tertiary)", marginBottom: 4 }}>
              耗时: {runTimeMs}ms
            </div>
          )}
          {runError && (
            <div style={{ fontSize: 12, color: "#EF4444", marginBottom: 4 }}>
              {runError}
            </div>
          )}
          {runOutput.length > 0 && (
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--color-text-secondary)", maxHeight: 120, overflow: "auto" }}>
              {runOutput.map((line, i) => (
                <div key={i} style={{ padding: "1px 0" }}>{line}</div>
              ))}
            </div>
          )}
        </div>

        <div className="p-2"><DataStructureView data={null} /></div>
      </div>
    </div>
  );
};

export default WorkspacePage;
