import { useParams, useNavigate } from 'react-router-dom';
import { Button, Tag } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import TraceViewerCanvas from '@/components/TraceViewer/TraceViewerCanvas';
import PlaybackControls from '@/components/TraceViewer/PlaybackControls';
import CallStackPanel from '@/components/TraceViewer/CallStackPanel';
import VariableTable from '@/components/TraceViewer/VariableTable';
import AnalysisPanel from '@/components/AnalysisPanel/AnalysisPanel';
import EmptyState from '@/components/common/EmptyState';
import { useState } from 'react';
import type { TraceStep } from '@/types/trace';

const HistoryDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);

  const steps: TraceStep[] = [];
  const currentStep = steps.length > 0 ? steps[currentStepIndex] : null;

  return (
    <div className="flex flex-col h-full overflow-hidden" style={{ background: 'var(--color-bg-page)' }}>
      <div className="flex items-center gap-3 px-4" style={{ height: 44, borderBottom: '1px solid var(--color-border)' }}>
        <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => navigate('/history')} style={{ color: 'var(--color-text-tertiary)' }} />
        <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-text-primary)' }}>回放：分析 #{id}</span>
        <Tag color="#3B82F6">python</Tag>
      </div>
      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 p-2 overflow-hidden min-h-0">
          <TraceViewerCanvas currentStep={currentStep} allSteps={steps} currentStepIndex={currentStepIndex} />
        </div>
        <div className="flex flex-col overflow-auto p-2" style={{ width: 320, borderLeft: '1px solid var(--color-border)' }}>
          <CallStackPanel callStack={currentStep?.call_stack ?? []} />
          <div className="mt-2"><VariableTable locals={currentStep?.locals ?? {}} globals={currentStep?.globals ?? {}} /></div>
          <div className="mt-2"><AnalysisPanel report={null} streaming={false} /></div>
        </div>
      </div>
      <PlaybackControls currentStep={currentStepIndex} totalSteps={Math.max(steps.length, 1)} isPlaying={isPlaying} speed={speed} onStepChange={setCurrentStepIndex} onPlay={() => setIsPlaying(true)} onPause={() => setIsPlaying(false)} onStepForward={() => setCurrentStepIndex((s) => Math.min(s + 1, steps.length - 1))} onStepBackward={() => setCurrentStepIndex((s) => Math.max(s - 1, 0))} onSpeedChange={setSpeed} />
    </div>
  );
};

export default HistoryDetailPage;
