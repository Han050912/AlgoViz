interface OutputConsoleProps { output: string[]; }

const OutputConsole = ({ output }: OutputConsoleProps) => (
  <div className="p-3 overflow-auto" style={{ background: '#1F2937', borderRadius: 8, maxHeight: 120 }}>
    <h4 style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-tertiary)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>输出</h4>
    {output.length === 0 ? (
      <p style={{ fontSize: 13, color: 'var(--color-text-tertiary)' }}>无输出</p>
    ) : (
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--color-text-secondary)' }}>
        {output.map((line, i) => <div key={i} className="py-0.5">{line}</div>)}
      </div>
    )}
  </div>
);

export default OutputConsole;
