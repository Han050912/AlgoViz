import ComplexityBadge from './ComplexityBadge';

interface AnalysisPanelProps {
  report: { time: string; space: string; summary: string; steps: { step: number; explanation: string }[] } | null;
  streaming: boolean;
}

const AnalysisPanel = ({ report, streaming }: AnalysisPanelProps) => (
  <div className="p-4 overflow-auto" style={{ background: '#1F2937', borderRadius: 8 }}>
    {streaming && (
      <div className="flex items-center gap-2 mb-4">
        <span className="inline-block rounded-full animate-pulse" style={{ width: 8, height: 8, background: 'var(--color-brand-gold)' }} />
        <span style={{ fontSize: 13, color: 'var(--color-text-tertiary)' }}>正在分析...</span>
      </div>
    )}

    {!report && !streaming && (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p style={{ fontSize: 24, color: 'var(--color-text-tertiary)', marginBottom: 4 }}>⏳</p>
        <p style={{ fontSize: 14, color: 'var(--color-text-tertiary)' }}>运行代码查看分析结果</p>
      </div>
    )}

    {report && (
      <>
        <h3 className="mb-3" style={{ fontSize: 16, fontWeight: 600, color: 'var(--color-text-primary)' }}>{report.summary || '分析报告'}</h3>
        <ComplexityBadge time={report.time} space={report.space} />
        <div className="space-y-3">
          {report.steps.map((s) => (
            <div key={s.step} className="flex gap-3 p-3 rounded" style={{ background: '#111827' }}>
              <span className="flex-shrink-0 flex items-center justify-center rounded-full" style={{ width: 24, height: 24, background: 'var(--color-brand-gold)', color: '#fff', fontSize: 12, fontWeight: 600 }}>{s.step + 1}</span>
              <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>{s.explanation}</p>
            </div>
          ))}
        </div>
      </>
    )}
  </div>
);

export default AnalysisPanel;
