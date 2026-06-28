import type { TraceStep } from '@/types/trace';

interface CallStackPanelProps {
  callStack: string[];
}

const CallStackPanel = ({ callStack }: CallStackPanelProps) => (
  <div className="p-3 overflow-auto" style={{ background: '#1F2937', borderRadius: 8 }}>
    <h4 style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-tertiary)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
      调用栈
    </h4>
    {callStack.length === 0 ? (
      <p style={{ fontSize: 13, color: 'var(--color-text-tertiary)' }}>无活跃调用</p>
    ) : (
      <div className="space-y-1">
        {[...callStack].reverse().map((frame, i) => (
          <div key={i} className="flex items-center gap-2 py-1.5 px-2 rounded" style={{ background: i === callStack.length - 1 ? 'rgba(212, 154, 32, 0.1)' : 'transparent', borderLeft: i === callStack.length - 1 ? '2px solid var(--color-brand-gold)' : '2px solid transparent' }}>
            <span style={{ fontSize: 11, color: 'var(--color-text-tertiary)', minWidth: 16 }}>{i + 1}</span>
            <span style={{ fontSize: 13, color: 'var(--color-text-secondary)', fontFamily: 'var(--font-mono)' }}>{frame}</span>
          </div>
        ))}
      </div>
    )}
  </div>
);

export default CallStackPanel;
