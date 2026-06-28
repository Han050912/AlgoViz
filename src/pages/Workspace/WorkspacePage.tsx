import { useState, useCallback } from 'react';
import MonacoEditor from '@/components/CodeEditor/MonacoEditor';
import TraceViewerCanvas from '@/components/TraceViewer/TraceViewerCanvas';
import PlaybackControls from '@/components/TraceViewer/PlaybackControls';
import CallStackPanel from '@/components/TraceViewer/CallStackPanel';
import VariableTable from '@/components/TraceViewer/VariableTable';
import OutputConsole from '@/components/TraceViewer/OutputConsole';
import DataStructureView from '@/components/TraceViewer/DataStructureView';
import AnalysisPanel from '@/components/AnalysisPanel/AnalysisPanel';
import type { TraceStep } from '@/types/trace';

const WorkspacePage = () => {
  const [code, setCode] = useState('def bubble_sort(arr):\n    n = len(arr)\n    for i in range(n):\n        for j in range(0, n - i - 1):\n            if arr[j] > arr[j + 1]:\n                arr[j], arr[j + 1] = arr[j + 1], arr[j]\n    return arr\n\narr = [64, 34, 25, 12, 22, 11, 90]\nprint(bubble_sort(arr))');
  const [language, setLanguage] = useState('python');
  const [currentLine] = useState<number | null>(null);
  const [steps] = useState<TraceStep[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [output] = useState<string[]>([]);
  const [report] = useState<{ time: string; space: string; summary: string; steps: { step: number; explanation: string }[] } | null>(null);
  const [streaming] = useState(false);

  const handleAnalyze = useCallback(() => {}, []);

  const currentStep = steps.length > 0 ? steps[currentStepIndex] : null;

  return (
    <div className="flex h-full overflow-hidden" style={{ background: 'var(--color-bg-page)' }}>
      <div className="flex flex-col overflow-hidden" style={{ width: '35%', minWidth: 280 }}>
        <div className="flex-1 p-2">
          <MonacoEditor code={code} language={language} currentLine={currentLine} onCodeChange={setCode} onLanguageChange={setLanguage} onAnalyze={handleAnalyze} />
        </div>
      </div>
      <div className="flex flex-col overflow-hidden" style={{ width: '40%', minWidth: 320, borderLeft: '1px solid var(--color-border)', borderRight: '1px solid var(--color-border)' }}>
        <div className="flex-1 p-2 overflow-hidden min-h-0">
          <TraceViewerCanvas currentStep={currentStep} allSteps={steps} currentStepIndex={currentStepIndex} />
        </div>
        <PlaybackControls currentStep={currentStepIndex} totalSteps={Math.max(steps.length, 1)} isPlaying={isPlaying} speed={speed} onStepChange={setCurrentStepIndex} onPlay={() => setIsPlaying(true)} onPause={() => setIsPlaying(false)} onStepForward={() => setCurrentStepIndex((s) => Math.min(s + 1, steps.length - 1))} onStepBackward={() => setCurrentStepIndex((s) => Math.max(s - 1, 0))} onSpeedChange={setSpeed} />
      </div>
      <div className="flex flex-col overflow-auto" style={{ width: '25%', minWidth: 240 }}>
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
