import { useState } from "react";
import Editor, { loader } from "@monaco-editor/react";
import EditorToolbar from "./EditorToolbar";

interface MonacoEditorProps {
  code: string;
  language: string;
  currentLine: number | null;
  onCodeChange: (code: string) => void;
  onLanguageChange: (lang: string) => void;
  onAnalyze: () => void;
}

loader.config({
  paths: { vs: "/node_modules/monaco-editor/min/vs" },
});

const MonacoEditor = ({
  code,
  language,
  currentLine,
  onCodeChange,
  onLanguageChange,
  onAnalyze,
}: MonacoEditorProps) => {
  const [activeTemplateKey, setActiveTemplateKey] = useState<string | null>(null);

  const handleTemplateSelect = (templateCode: string, templateKey: string) => {
    onCodeChange(templateCode);
    setActiveTemplateKey(templateKey || null);
  };

  const handleFileUpload = (fileCode: string) => {
    onCodeChange(fileCode);
    setActiveTemplateKey(null);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden" style={{ background: "#1F2937", borderRadius: 8 }}>
      <EditorToolbar
        language={language}
        onLanguageChange={onLanguageChange}
        activeTemplateKey={activeTemplateKey}
        onTemplateSelect={handleTemplateSelect}
        onFileUpload={handleFileUpload}
      />

      <div className="flex-1 overflow-hidden">
        <Editor
          height="100%"
          language={language}
          value={code}
          theme="vs-dark"
          onChange={(val) => onCodeChange(val ?? "")}
          options={{
            fontSize: 14,
            fontFamily: "''JetBrains Mono'', ''Fira Code'', Consolas, monospace",
            lineNumbers: "on",
            lineNumbersMinChars: 3,
            glyphMargin: true,
            folding: true,
            lineDecorationsWidth: 0,
            renderLineHighlight: currentLine !== null ? "line" : "none",
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 4,
            padding: { top: 8 },
          }}
          loading={
            <div className="flex items-center justify-center h-full" style={{ color: "var(--color-text-tertiary)" }}>
              {"\u7f16\u8f91\u5668\u52a0\u8f7d\u4e2d..."}
            </div>
          }
        />
      </div>

      <div
        className="flex items-center justify-between px-4"
        style={{ height: 48, background: "#111827", borderTop: "1px solid var(--color-border)" }}
      >
        <button
          onClick={onAnalyze}
          className="flex items-center gap-2 px-5 rounded-md font-medium transition-colors"
          style={{
            height: 34,
            fontSize: 14,
            fontWeight: 500,
            background: "var(--color-brand-gold)",
            color: "#fff",
            border: "none",
            cursor: "pointer",
            borderRadius: 8,
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.background = "var(--color-brand-gold-hover)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.background = "var(--color-brand-gold)";
          }}
        >
          {"\u25b6 \u5f00\u59cb\u5206\u6790"}
        </button>
        <span style={{ fontSize: 12, color: "var(--color-text-tertiary)" }}>
          {language.charAt(0).toUpperCase() + language.slice(1)}
        </span>
      </div>
    </div>
  );
};

export default MonacoEditor;
