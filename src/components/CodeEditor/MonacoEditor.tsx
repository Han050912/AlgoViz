import { useMemo, useRef, useCallback, useEffect } from "react";
import Editor, { loader, OnMount } from "@monaco-editor/react";
import EditorToolbar from "./EditorToolbar";
import { useTheme } from "@/hooks/ThemeContext";
import type { MonacoEditorProps } from "./types";
import * as monaco from "monaco-editor";
import { providePythonDiagnostics } from "./pythonDiagnostics";

// ─── Monaco loader config ────────────────────────────────
loader.config({
  paths: { vs: "/node_modules/monaco-editor/min/vs" },
});

// ─── 编辑器选项（LeetCode 风格） ─────────────────────────
function getEditorOptions(theme: "dark" | "light") {
  const isDark = theme === "dark";
  return {
    // 字体
    fontSize: 14,
    fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, 'Courier New', monospace",
    fontWeight: "normal",
    lineHeight: 1.6,
    letterSpacing: 0.5,

    // 主题
    theme: isDark ? "algoviz-dark" : "algoviz-light",

    // 布局
    minimap: { enabled: true, scale: 1, size: "fit" },
    wordWrap: "on",
    wrappingIndent: "indent",
    scrollBeyondLastLine: false,
    renderWhitespace: "selection",
    scrollbar: {
      verticalScrollbarSize: 8,
      horizontalScrollbarSize: 8,
      useShadows: true,
      vertical: "auto",
      horizontal: "auto",
    },

    // 编辑行为
    automaticLayout: true,
    tabSize: 4,
    insertSpaces: true,
    detectIndentation: true,
    autoClosingBrackets: "always",
    autoClosingQuotes: "always",
    autoSurround: "languageDefined",
    bracketPairColorization: { enabled: true },
    guides: { bracketPairs: true, indentation: true, highlightActiveBracketPair: true },
    folding: true,
    foldingStrategy: "indentation",
    showFoldingControls: "mouseover",
    matchBrackets: "always",
    cursorStyle: isDark ? "line" : "block",
    cursorBlinking: "smooth",
    cursorSmoothCaretAnimation: "on",
    smoothScrolling: true,
    mouseWheelZoom: true,

    // 行号与高亮
    lineNumbers: "on",
    lineNumbersMinChars: 4,
    renderLineHighlight: "all",
    overviewRulerLanes: 10,

    // 提示与智能
    quickSuggestions: { other: true, comments: false, strings: false },
    suggestOnTriggerCharacters: true,
    acceptSuggestionOnEnter: "on",
    snippetSuggestions: "top",
    formatOnPaste: true,
    formatOnType: true,
    codeLens: false,
    inlayHints: { fontSize: 12 },

    // 括号匹配 & 悬停
    hover: { enabled: true },
    links: true,
    referencesCodeLens: false,

    // 括号 & 注释
    comments: { ignoreLeadingWhitespace: true, ignoreTrailingWhitespace: true },

    // 选择 & 多光标
    multiCursorModifier: "alt",
    selectionClipboard: true,
    selectionHighlight: true,
    "semanticHighlighting.enabled": true,

    // 颜色装饰器
    colorDecorators: true,
    colors: [],

    // 其他
    hideCursorInOverviewRuler: false,
    overviewRulerBorder: false,
    padding: { top: 8, bottom: 8 },
    stickyScroll: { enabled: false },
    stickyTabStops: false,
    unicodeHighlight: { ambiguousCharacters: false, invisibleCharacters: false },
    wordBasedSuggestions: "matchingDocuments",
  };
}

// ─── 自定义主题 ──────────────────────────────────────────
function registerCustomThemes(monacoInstance: typeof monaco) {
  monacoInstance.editor.defineTheme("algoviz-dark", {
    base: "vs-dark",
    inherit: true,
    rules: [
      { token: "", foreground: "D4D4D4", background: "0D1117" },
      { token: "keyword", foreground: "FF7B72" },
      { token: "string", foreground: "A5D6FF" },
      { token: "number", foreground: "79C0FF" },
      { token: "comment", foreground: "8B949E", fontStyle: "italic" },
      { token: "type", foreground: "FFA657" },
      { token: "function", foreground: "D2A8FF" },
      { token: "variable", foreground: "FFA657" },
      { token: "constant", foreground: "79C0FF" },
      { token: "operator", foreground: "FF7B72" },
    ],
    colors: {
      "editor.background": "#0D1117",
      "editor.foreground": "#E6EDF3",
      "editor.lineHighlightBackground": "#161B22",
      "editorLineNumber.foreground": "#484F58",
      "editorLineNumber.activeForeground": "#E6EDF3",
      "editor.selectionBackground": "#264F78",
      "editor.inactiveSelectionBackground": "#1C2128",
      "editor.findMatchBackground": "#F2CC4044",
      "editor.findMatchHighlightBackground": "#F2CC4022",
      "editorCursor.foreground": "#E6EDF3",
      "editorBracketMatch.background": "#1F6FEB33",
      "editorBracketMatch.border": "#1F6FEB",
      "editorIndentGuide.background": "#30363D",
      "editorIndentGuide.activeBackground": "#58A6FF",
      "editorWidget.background": "#161B22",
      "editorWidget.border": "#30363D",
      "input.background": "#0D1117",
      "input.border": "#30363D",
    },
  });

  monacoInstance.editor.defineTheme("algoviz-light", {
    base: "vs",
    inherit: true,
    rules: [
      { token: "", foreground: "24292F", background: "FFFFFF" },
      { token: "keyword", foreground: "CF222E" },
      { token: "string", foreground: "0A3069" },
      { token: "number", foreground: "0550AE" },
      { token: "comment", foreground: "6E7781", fontStyle: "italic" },
      { token: "type", foreground: "953800" },
      { token: "function", foreground: "8250DF" },
      { token: "variable", foreground: "953800" },
      { token: "constant", foreground: "0550AE" },
      { token: "operator", foreground: "CF222E" },
    ],
    colors: {
      "editor.background": "#FFFFFF",
      "editor.foreground": "#24292F",
      "editor.lineHighlightBackground": "#F6F8FA",
      "editorLineNumber.foreground": "#B0B8C4",
      "editorLineNumber.activeForeground": "#24292F",
      "editor.selectionBackground": "#56C1FF44",
      "editor.inactiveSelectionBackground": "#E8ECF0",
      "editor.findMatchBackground": "#FFD33D44",
      "editor.findMatchHighlightBackground": "#FFD33D22",
      "editorCursor.foreground": "#24292F",
      "editorBracketMatch.background": "#0969DD33",
      "editorBracketMatch.border": "#0969DD",
      "editorIndentGuide.background": "#D0D7DE",
      "editorIndentGuide.activeBackground": "#0969DD",
      "editorWidget.background": "#F6F8FA",
      "editorWidget.border": "#D0D7DE",
      "input.background": "#FFFFFF",
      "input.border": "#D0D7DE",
    },
  });
}

// ─── 诊断提供者注册 ──────────────────────────────────────
const PYTHON_DIAGNOSTIC_COLLECTION = monaco.editor.createModel(
  "",
  "python"
);

function registerDiagnosticProviders(monacoInstance: typeof monaco) {
  // 1. Python 自定义诊断
  monacoInstance.languages.registerDiagnosticsAdapter("python", {
    getDiagnostics: () => {
      return []; // Monaco 内置的 Python 诊断为空，我们手动触发
    },
  });

  // 2. JS/TS 内置诊断（通过 TypeScript 语言服务）
  // Monaco 已自动为 JS/TS 提供类型检查和语法错误

  // 3. 所有语言的括号匹配诊断
  // Monaco 内置的 bracketMatching 已在编辑器选项中启用
}

// ─── 实时诊断触发（防抖 300ms） ─────────────────────────
function setupRealtimeDiagnostics(
  monacoInstance: typeof monaco,
  editor: monaco.editor.IStandaloneCodeEditor,
  language: string,
  model: monaco.editor.ITextModel
) {
  // 清除旧标记
  monacoInstance.editor.setModelMarkers(model, "_owner", []);

  if (language !== "python") return;

  // 防抖定时器
  let timer: ReturnType<typeof setTimeout> | null = null;

  const scheduleDiagnostics = () => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      const diagnostics = providePythonDiagnostics(model.uri, model);
      monacoInstance.editor.setModelMarkers(model, "_owner", diagnostics);
      timer = null;
    }, 300);
  };

  // 监听代码变化
  const listener = model.onDidChangeContent(() => {
    scheduleDiagnostics();
  });

  // 初始诊断
  scheduleDiagnostics();

  // 返回清理函数
  return () => {
    if (timer) clearTimeout(timer);
    listener.dispose();
  };
}

const MonacoEditorComponent = ({
  code,
  language,
  currentLine,
  onCodeChange,
  onLanguageChange,
  onAnalyze,
  onResetCode,
  onRun,
  isRunning,
}: MonacoEditorProps) => {
  const { theme } = useTheme();
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const monacoRef = useRef<typeof monaco | null>(null);
  const disposeDiagRef = useRef<(() => void) | null>(null);

  // 编辑器挂载回调
  const handleEditorDidMount: OnMount = useCallback((editor, monacoInstance) => {
    editorRef.current = editor;
    monacoRef.current = monacoInstance;

    // 注册自定义主题
    registerCustomThemes(monacoInstance);

    // 注册诊断提供者
    registerDiagnosticProviders(monacoInstance);

    // 设置主题
    editor.updateOptions({
      theme: theme === "dark" ? "algoviz-dark" : "algoviz-light",
    });

    // 快捷键绑定（LeetCode 风格）
    editor.addCommand(monacoInstance.KeyMod.CtrlCmd | monacoInstance.KeyCode.Enter, () => {
      onRun?.();
    });

    editor.addCommand(monacoInstance.KeyMod.CtrlCmd | monacoInstance.KeyCode.KeyF, () => {
      editor.getAction("editor.action.formatDocument")?.run();
    });

    editor.addCommand(monacoInstance.KeyMod.CtrlCmd | monacoInstance.KeyCode.KeyH, () => {
      editor.getAction("editor.action.startFindReplaceAction")?.run();
    });

    // 实时诊断
    if (editor.getModel()) {
      disposeDiagRef.current = setupRealtimeDiagnostics(
        monacoInstance,
        editor,
        language,
        editor.getModel()
      );
    }
  }, [theme, language, onRun]);

  // 主题切换时实时更新编辑器主题
  const editorOptions = useMemo(() => getEditorOptions(theme), [theme]);

  // 语言切换时重新注册诊断
  useEffect(() => {
    if (!editorRef.current || !monacoRef.current) return;
    const model = editorRef.current.getModel();
    if (!model) return;

    // 清理旧的诊断
    if (disposeDiagRef.current) {
      disposeDiagRef.current();
      disposeDiagRef.current = null;
    }

    // 清除旧标记
    monacoRef.current.editor.setModelMarkers(model, "_owner", []);

    // 重新注册诊断
    disposeDiagRef.current = setupRealtimeDiagnostics(
      monacoRef.current,
      editorRef.current,
      language,
      model
    );
  }, [language]);

  // 代码变化时更新诊断
  useEffect(() => {
    if (!editorRef.current || !monacoRef.current) return;
    const model = editorRef.current.getModel();
    if (!model) return;

    // 如果语言是 python，触发诊断
    if (language === "python") {
      const diag = providePythonDiagnostics(model.uri, model);
      monacoRef.current.editor.setModelMarkers(model, "_owner", diag);
    } else {
      monacoRef.current.editor.setModelMarkers(model, "_owner", []);
    }
  }, [code, language]);

  // 组件卸载时清理
  useEffect(() => {
    return () => {
      if (disposeDiagRef.current) {
        disposeDiagRef.current();
        disposeDiagRef.current = null;
      }
    };
  }, []);

  return (
    <div className="flex flex-col h-full overflow-hidden rounded-lg" style={{ background: "var(--color-bg-surface)", borderRadius: 8, border: "1px solid var(--color-border)" }}>
      {/* 工具栏 */}
      <EditorToolbar
        language={language}
        onLanguageChange={onLanguageChange}
        activeTemplateKey={null}
        onTemplateSelect={() => {}}
        onFileUpload={() => {}}
      />

      {/* 编辑器主体 */}
      <div className="flex-1 overflow-hidden">
        <Editor
          height="100%"
          language={language}
          value={code}
          onChange={(val) => onCodeChange(val ?? "")}
          options={editorOptions}
          onMount={handleEditorDidMount}
          loading={
            <div className="flex items-center justify-center h-full" style={{ color: "var(--color-text-tertiary)" }}>
              编辑器加载中...
            </div>
          }
        />
      </div>

      {/* 底部状态栏 */}
      <div
        className="flex items-center justify-between px-4"
        style={{
          height: 32,
          background: "var(--color-bg-elevated)",
          borderTop: "1px solid var(--color-border)",
          fontSize: 11,
          color: "var(--color-text-tertiary)",
        }}
      >
        <div className="flex items-center gap-4">
          {/* 开始分析按钮 */}
          <button
            onClick={onAnalyze}
            className="flex items-center gap-1.5 px-3 py-0.5 rounded transition-colors"
            style={{
              fontSize: 12,
              fontWeight: 500,
              background: "var(--color-brand-gold)",
              color: "#fff",
              border: "none",
              cursor: "pointer",
              borderRadius: 4,
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background = "var(--color-brand-gold-hover)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = "var(--color-brand-gold)";
            }}
          >
            ▶ 开始分析
          </button>
          {/* 运行按钮 */}
          <button
            onClick={onRun}
            disabled={isRunning}
            className="flex items-center gap-1.5 px-3 py-0.5 rounded transition-colors"
            style={{
              fontSize: 12,
              fontWeight: 500,
              background: isRunning ? "#9CA3AF" : "var(--color-brand-violet)",
              color: "#fff",
              border: "none",
              cursor: isRunning ? "not-allowed" : "pointer",
              borderRadius: 4,
            }}
          >
            {isRunning ? "运行中..." : "▶ 运行"}
          </button>
          {/* 重置按钮 */}
          <button
            onClick={onResetCode}
            className="flex items-center gap-1.5 px-3 py-0.5 rounded transition-colors"
            style={{
              fontSize: 12,
              background: "transparent",
              color: "var(--color-text-tertiary)",
              border: "1px solid var(--color-border)",
              cursor: "pointer",
              borderRadius: 4,
            }}
          >
            ↺ 重置
          </button>
        </div>
        <div className="flex items-center gap-3">
          <span>{language === "python" ? "Python" : language === "javascript" ? "JavaScript" : language === "java" ? "Java" : language === "cpp" ? "C++" : language === "go" ? "Go" : language === "rust" ? "Rust" : language}</span>
          <span>Ln 1, Col 1</span>
        </div>
      </div>
    </div>
  );
};

export default MonacoEditorComponent;
