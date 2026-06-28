import Editor, { loader } from '@monaco-editor/react';
import EditorToolbar from './EditorToolbar';

interface MonacoEditorProps {
  code: string;
  language: string;
  currentLine: number | null;
  onCodeChange: (code: string) => void;
  onLanguageChange: (lang: string) => void;
  onAnalyze: () => void;
}

// 使用本地 node_modules 中的 monaco，避免 CDN 请求
loader.config({
  paths: { vs: '/node_modules/monaco-editor/min/vs' },
});

/**
 * MonacoEditor — 代码编辑面板
 * 深色主题 + JetBrains Mono + 当前执行行高亮
 */
const MonacoEditor = ({
  code,
  language,
  currentLine,
  onCodeChange,
  onLanguageChange,
  onAnalyze,
}: MonacoEditorProps) => {
  const handleTemplateSelect = (templateCode: string) => {
    onCodeChange(templateCode);
  };

  const handleFileUpload = (fileCode: string) => {
    onCodeChange(fileCode);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden" style={{ background: '#1F2937', borderRadius: 8 }}>
      <EditorToolbar
        language={language}
        onLanguageChange={onLanguageChange}
        onTemplateSelect={handleTemplateSelect}
        onFileUpload={handleFileUpload}
      />

      <div className="flex-1 overflow-hidden">
        <Editor
          height="100%"
          language={language}
          value={code}
          theme="vs-dark"
          onChange={(val) => onCodeChange(val ?? '')}
          options={{
            fontSize: 14,
            fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
            lineNumbers: 'on',
            lineNumbersMinChars: 3,
            glyphMargin: true,
            folding: true,
            lineDecorationsWidth: 0,
            renderLineHighlight: currentLine !== null ? 'line' : 'none',
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 4,
            padding: { top: 8 },
          }}
          loading={
            <div className="flex items-center justify-center h-full" style={{ color: 'var(--color-text-tertiary)' }}>
              编辑器加载中...
            </div>
          }
        />
      </div>

      {/* 底部操作栏 */}
      <div
        className="flex items-center justify-between px-4"
        style={{ height: 48, background: '#111827', borderTop: '1px solid var(--color-border)' }}
      >
        <button
          onClick={onAnalyze}
          className="flex items-center gap-2 px-5 rounded-md font-medium transition-colors"
          style={{
            height: 34,
            fontSize: 14,
            fontWeight: 500,
            background: 'var(--color-brand-gold)',
            color: '#fff',
            border: 'none',
            cursor: 'pointer',
            borderRadius: 8,
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.background = 'var(--color-brand-gold-hover)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.background = 'var(--color-brand-gold)';
          }}
        >
          ▶ 开始分析
        </button>
        <span style={{ fontSize: 12, color: 'var(--color-text-tertiary)' }}>
          {language.charAt(0).toUpperCase() + language.slice(1)}
        </span>
      </div>
    </div>
  );
};

export default MonacoEditor;
