interface VariableTableProps {
  locals: Record<string, unknown>;
  globals: Record<string, unknown>;
}

const renderValue = (val: unknown): string => {
  if (val === null) return 'null';
  if (val === undefined) return 'undefined';
  if (typeof val === 'object') return JSON.stringify(val, null, 0);
  return String(val);
};

const VariableTable = ({ locals, globals }: VariableTableProps) => (
  <div className="p-3 overflow-auto" style={{ background: '#1F2937', borderRadius: 8 }}>
    <h4 style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-tertiary)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
      变量
    </h4>
    {Object.keys(locals).length === 0 && Object.keys(globals).length === 0 ? (
      <p style={{ fontSize: 13, color: 'var(--color-text-tertiary)' }}>无变量</p>
    ) : (
      <>
        {Object.entries(locals).map(([key, val]) => (
          <div key={'local-' + key} className="flex justify-between py-1 px-2 rounded" style={{ borderBottom: '1px solid var(--color-divider)' }}>
            <span className="truncate mr-2" style={{ fontSize: 13, color: '#F59E0B', fontFamily: 'var(--font-mono)' }}>{key}</span>
            <span className="truncate" style={{ fontSize: 13, color: 'var(--color-brand-gold)', fontFamily: 'var(--font-mono)' }}>{renderValue(val)}</span>
          </div>
        ))}
        {Object.entries(globals).map(([key, val]) => (
          <div key={'global-' + key} className="flex justify-between py-1 px-2 rounded" style={{ borderBottom: '1px solid var(--color-divider)' }}>
            <span className="truncate mr-2" style={{ fontSize: 13, color: '#3B82F6', fontFamily: 'var(--font-mono)' }}>{key}</span>
            <span className="truncate" style={{ fontSize: 13, color: 'var(--color-brand-gold)', fontFamily: 'var(--font-mono)' }}>{renderValue(val)}</span>
          </div>
        ))}
      </>
    )}
  </div>
);

export default VariableTable;
