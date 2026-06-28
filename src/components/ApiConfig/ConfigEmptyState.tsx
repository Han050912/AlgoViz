import { PlusOutlined } from '@ant-design/icons';

const presets = [
  { label: 'DeepSeek', baseUrl: 'https://api.deepseek.com/v1', model: 'deepseek-chat', desc: '高性价比' },
  { label: 'OpenAI', baseUrl: 'https://api.openai.com/v1', model: 'gpt-4o', desc: '旗舰模型' },
  { label: 'Ollama (Local)', baseUrl: 'http://localhost:11434/v1', model: 'llama3', desc: '完全本地，零成本' },
];

interface ConfigEmptyStateProps { onAdd: () => void; onPresetSelect: (preset: typeof presets[0]) => void; }

const ConfigEmptyState = ({ onAdd, onPresetSelect }: ConfigEmptyStateProps) => (
  <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
    <div style={{ fontSize: 48, color: 'var(--color-text-tertiary)', marginBottom: 16 }}><PlusOutlined /></div>
    <h3 style={{ fontSize: 18, fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 8 }}>未配置 AI 模型</h3>
    <p style={{ fontSize: 14, color: 'var(--color-text-tertiary)', maxWidth: 360, marginBottom: 24 }}>连接一个 AI 模型来分析算法。可以从下面选择一个提供商，或创建自定义配置。</p>
    <div className="flex flex-wrap gap-3 justify-center mb-8">
      {presets.map((p) => (
        <button key={p.label} onClick={() => onPresetSelect(p)} className="flex flex-col items-center p-4 rounded-lg transition-all" style={{ background: '#1F2937', border: '1px solid var(--color-border)', cursor: 'pointer', minWidth: 160 }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text-primary)' }}>{p.label}</span>
          <span className="mt-1" style={{ fontSize: 11, color: 'var(--color-text-tertiary)', fontFamily: 'var(--font-mono)' }}>{p.model}</span>
          <span className="mt-1" style={{ fontSize: 11, color: 'var(--color-text-tertiary)' }}>{p.desc}</span>
        </button>
      ))}
    </div>
    <button onClick={onAdd} className="px-5 py-2 rounded-md font-medium transition-colors" style={{ fontSize: 14, background: 'var(--color-brand-gold)', color: '#fff', border: 'none', cursor: 'pointer', borderRadius: 8 }}>
      创建自定义配置
    </button>
  </div>
);

export default ConfigEmptyState;
