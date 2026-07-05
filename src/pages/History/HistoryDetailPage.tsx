import { useParams, useNavigate } from "react-router-dom";
import { Button, Tag } from "antd";
import { ArrowLeftOutlined, CodeOutlined } from "@ant-design/icons";
import Editor from "@monaco-editor/react";
import TraceViewerCanvas from "@/components/TraceViewer/TraceViewerCanvas";
import PlaybackControls from "@/components/TraceViewer/PlaybackControls";
import CallStackPanel from "@/components/TraceViewer/CallStackPanel";
import VariableTable from "@/components/TraceViewer/VariableTable";
import AnalysisPanel from "@/components/AnalysisPanel/AnalysisPanel";
import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import type { TraceStep } from "@/types/trace";
import { useTheme } from "@/hooks/ThemeContext";

// Mock history entries with code content
const mockHistoryData: Record<string, { name: string; language: string; code: string; steps: number }> = {
  "1": {
    name: "冒泡排序分析",
    language: "python",
    code: `def bubble_sort(arr):
    n = len(arr)
    for i in range(n):
        for j in range(0, n - i - 1):
            if arr[j] > arr[j + 1]:
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
    return arr

arr = [64, 34, 25, 12, 22, 11, 90]
print(bubble_sort(arr))`,
    steps: 15,
  },
  "2": {
    name: "快速排序分析",
    language: "python",
    code: `def quick_sort(arr):
    if len(arr) <= 1:
        return arr
    pivot = arr[len(arr) // 2]
    left = [x for x in arr if x < pivot]
    middle = [x for x in arr if x == pivot]
    right = [x for x in arr if x > pivot]
    return quick_sort(left) + middle + quick_sort(right)

arr = [64, 34, 25, 12, 22, 11, 90]
print(quick_sort(arr))`,
    steps: 22,
  },
  "3": {
    name: "二分查找分析",
    language: "python",
    code: `def binary_search(arr, target):
    left, right = 0, len(arr) - 1
    while left <= right:
        mid = (left + right) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    return -1

arr = [1, 3, 5, 7, 9, 11, 13]
print(binary_search(arr, 7))`,
    steps: 8,
  },
};

const langColors: Record<string, string> = { python: "#3B82F6", javascript: "#F59E0B", java: "#EF4444", cpp: "#22C55E", go: "#06B6D4", rust: "#F97316" };

const HistoryDetailPage = () => {
  const { theme } = useTheme();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [showCode, setShowCode] = useState(true);
  const playTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const historyEntry = id ? mockHistoryData[id] : null;

  const steps: TraceStep[] = useMemo(() => {
    if (!historyEntry) return [];
    return Array.from({ length: historyEntry.steps }, (_, i) => ({
      step: i,
      line: i + 1,
      action: i % 3 === 0 ? "step" : i % 3 === 1 ? "compare" : "swap",
      function: historyEntry.name,
      call_stack: [historyEntry.name],
      locals: { i: i, j: 0 },
      globals: { arr: [64, 34, 25, 12, 22, 11, 90] },
    }));
  }, [historyEntry]);

  const hasData = !!historyEntry && steps.length > 0;

  const currentStep = steps.length > 0 ? steps[currentStepIndex] : null;

  // 停止播放（不清除当前进度，只停定时器）
  const stopPlayback = useCallback(() => {
    if (playTimerRef.current) {
      clearInterval(playTimerRef.current);
      playTimerRef.current = null;
    }
  }, []);

  // 播放/暂停状态变化时驱动定时器
  useEffect(() => {
    if (isPlaying && hasData) {
      // 如果已经在最后一帧，重置回第一步
      if (currentStepIndex >= steps.length - 1) {
        setCurrentStepIndex(0);
      }
      playTimerRef.current = setInterval(() => {
        setCurrentStepIndex((prev) => {
          const next = prev + 1;
          if (next >= steps.length - 1) {
            // 到达最后一帧，停止播放
            setIsPlaying(false);
            if (playTimerRef.current) {
              clearInterval(playTimerRef.current);
              playTimerRef.current = null;
            }
            return steps.length - 1;
          }
          return next;
        });
      }, Math.round(1000 / speed));
    } else {
      if (playTimerRef.current) {
        clearInterval(playTimerRef.current);
        playTimerRef.current = null;
      }
    }
    // 组件卸载时清理
    return () => {
      if (playTimerRef.current) {
        clearInterval(playTimerRef.current);
        playTimerRef.current = null;
      }
    };
  }, [isPlaying, hasData, speed, currentStepIndex, steps.length]);

  if (!historyEntry) {
    return (
      <div className="flex items-center justify-center h-full" style={{ background: "var(--color-bg-page)" }}>
        <p style={{ fontSize: 16, color: "var(--color-text-tertiary)" }}>找不到该历史记录</p>
      </div>
    );
  }

  const editorTheme = theme === "dark" ? "vs-dark" : "vs-light";
  const isDark = theme === "dark";

  return (
    <div className="flex flex-col h-full overflow-hidden" style={{ background: "var(--color-bg-page)" }}>
      <div className="flex items-center gap-3 px-4" style={{ height: 44, borderBottom: "1px solid var(--color-border)" }}>
        <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => navigate("/history")} style={{ color: "var(--color-text-tertiary)" }} />
        <span style={{ fontSize: 14, fontWeight: 500, color: "var(--color-text-primary)" }}>回放：{historyEntry.name} #{id}</span>
        <Tag color={langColors[historyEntry.language]}>{historyEntry.language}</Tag>
        <div className="flex-1" />
        <Button
          type="text"
          icon={<CodeOutlined />}
          onClick={() => setShowCode(!showCode)}
          style={{ color: showCode ? "var(--color-brand-gold)" : "var(--color-text-tertiary)" }}
        >
          {showCode ? "隐藏代码" : "显示代码"}
        </Button>
      </div>
      <div className="flex flex-1 overflow-hidden">
        {showCode && (
          <div className="flex flex-col overflow-hidden" style={{ width: "35%", minWidth: 280, borderRight: "1px solid var(--color-border)" }}>
            <div
              className="flex items-center px-3"
              style={{
                height: 32,
                background: isDark ? "#111827" : "#F9FAFB",
                borderBottom: "1px solid var(--color-border)",
              }}
            >
              <span style={{ fontSize: 12, fontWeight: 600, color: "var(--color-text-tertiary)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                源代码
              </span>
            </div>
            <div className="flex-1 overflow-hidden">
              <Editor
                height="100%"
                language={historyEntry.language}
                value={historyEntry.code}
                theme={editorTheme}
                options={{
                  readOnly: true,
                  fontSize: 13,
                  fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
                  lineNumbers: "on",
                  lineNumbersMinChars: 3,
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  tabSize: 4,
                  padding: { top: 8 },
                }}
              />
            </div>
          </div>
        )}
        <div className="flex-1 p-2 overflow-hidden min-h-0">
          <TraceViewerCanvas currentStep={currentStep} allSteps={steps} currentStepIndex={currentStepIndex} />
        </div>
        <div className="flex flex-col overflow-auto p-2" style={{ width: 320, borderLeft: "1px solid var(--color-border)" }}>
          <CallStackPanel callStack={currentStep?.call_stack ?? []} />
          <div className="mt-2"><VariableTable locals={currentStep?.locals ?? {}} globals={currentStep?.globals ?? {}} /></div>
          <div className="mt-2"><AnalysisPanel report={null} streaming={false} /></div>
        </div>
      </div>
      <PlaybackControls currentStep={currentStepIndex} totalSteps={Math.max(steps.length, 1)} isPlaying={isPlaying} speed={speed} onStepChange={setCurrentStepIndex} onPlay={() => setIsPlaying(true)} onPause={() => setIsPlaying(false)} onStepForward={() => setCurrentStepIndex((s) => Math.min(s + 1, steps.length - 1))} onStepBackward={() => setCurrentStepIndex((s) => Math.max(s - 1, 0))} onSpeedChange={setSpeed} disabled={!hasData} />
    </div>
  );
};

export default HistoryDetailPage;
