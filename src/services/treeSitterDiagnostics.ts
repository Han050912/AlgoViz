import Parser from "web-tree-sitter";

// ─── WASM 资源（通过 Vite ?url 导入，构建时产出带 hash 的静态资源） ──
// 这样在 dev 与生产环境下都能拿到正确的可访问 URL，
// 不依赖 dev server 对 node_modules 的代理。
import coreWasmUrl from "web-tree-sitter/tree-sitter.wasm?url";
import pythonWasmUrl from "tree-sitter-wasms/out/tree-sitter-python.wasm?url";
import javascriptWasmUrl from "tree-sitter-wasms/out/tree-sitter-javascript.wasm?url";
import typescriptWasmUrl from "tree-sitter-wasms/out/tree-sitter-typescript.wasm?url";
import tsxWasmUrl from "tree-sitter-wasms/out/tree-sitter-tsx.wasm?url";
import javaWasmUrl from "tree-sitter-wasms/out/tree-sitter-java.wasm?url";
import cppWasmUrl from "tree-sitter-wasms/out/tree-sitter-cpp.wasm?url";
import goWasmUrl from "tree-sitter-wasms/out/tree-sitter-go.wasm?url";
import rustWasmUrl from "tree-sitter-wasms/out/tree-sitter-rust.wasm?url";
import cWasmUrl from "tree-sitter-wasms/out/tree-sitter-c.wasm?url";

// ─── Monaco IMarkerData 轻量接口 ───────────────────────────
export interface MarkerData {
  severity: number;
  startLineNumber: number;
  startColumn: number;
  endLineNumber: number;
  endColumn: number;
  message: string;
}

// ─── 解析器单例 ───────────────────────────────────────────
let parser: Parser | null = null;
let languageReady = false;
let initPromise: Promise<void> | null = null;
// 当前已加载到 parser 上的语法名（web-tree-sitter 0.20.x 的 Language 不暴露名称，需自行记录）
let currentGrammar: string | null = null;

// ─── 语言 → 语法文件 URL（由 Vite 在构建时解析为静态资源地址） ──
const GRAMMAR_WASM_PATHS: Record<string, string> = {
  python: pythonWasmUrl,
  javascript: javascriptWasmUrl,
  typescript: typescriptWasmUrl,
  tsx: tsxWasmUrl,
  java: javaWasmUrl,
  cpp: cppWasmUrl,
  go: goWasmUrl,
  rust: rustWasmUrl,
  c: cWasmUrl,
};

// Monaco 语言名 → tree-sitter 内部语言名映射
const LANG_NAME_MAP: Record<string, string> = {
  python: "python",
  javascript: "javascript",
  typescript: "typescript",
  tsx: "tsx",
  java: "java",
  cpp: "cpp",
  go: "go",
  rust: "rust",
  c: "c",
};

// ─── 初始化 Tree-Sitter WASM ──────────────────────────────
export async function initTreeSitter(): Promise<void> {
  if (initPromise) return initPromise;
  if (languageReady) return;

  initPromise = (async () => {
    try {
      // 加载核心 WASM（URL 由 Vite 在构建时注入）
      const wasmResp = await fetch(coreWasmUrl);
      if (!wasmResp.ok) throw new Error(`Core WASM fetch failed: ${wasmResp.status}`);
      const wasmArrayBuffer = await wasmResp.arrayBuffer();

      await Parser.init({ wasmBinary: wasmArrayBuffer });
      parser = new Parser();

      // 默认加载 Python 语法
      await _loadGrammar("python");
      languageReady = true;
    } catch (e) {
      console.error("[TreeSitter] WASM 初始化失败:", e);
      languageReady = false;
    }
    initPromise = null;
  })();

  return initPromise;
}

// ─── 按语言加载语法（懒加载） ──────────────────────────────
async function _loadGrammar(internalName: string): Promise<boolean> {
  // 注意：此函数会在 languageReady 置为 true 之前被初始化流程调用，
  // 因此这里只校验 parser 是否已创建。
  if (!parser) return false;
  if (currentGrammar === internalName) return true;

  const wasmPath = GRAMMAR_WASM_PATHS[internalName];
  if (!wasmPath) return false;

  try {
    const resp = await fetch(wasmPath);
    if (!resp.ok) return false;
    const buf = new Uint8Array(await resp.arrayBuffer());
    const language = await Parser.Language.load(buf);
    parser.setLanguage(language);
    currentGrammar = internalName;
    return true;
  } catch {
    return false;
  }
}

async function loadLanguageForLang(langName: string): Promise<boolean> {
  if (!parser || !languageReady) return false;

  const internalName = LANG_NAME_MAP[langName];
  if (!internalName) return false;

  // _loadGrammar 内部已做「是否已加载」的短路判断
  return _loadGrammar(internalName);
}

// ─── 偏移量 → 行列坐标 ────────────────────────────────────
// Tree-Sitter 使用 0-based (row, column)，Monaco 使用 1-based (lineNumber, column)
function offsetToLineCol(source: string, offset: number): { line: number; column: number } {
  if (offset <= 0) return { line: 1, column: 1 };
  const lines = source.split("\n");
  let pos = 0;
  for (let i = 0; i < lines.length; i++) {
    const lineLen = lines[i].length + 1; // +1 for newline
    if (pos + lineLen > offset) {
      return { line: i + 1, column: offset - pos + 1 };
    }
    pos += lineLen;
  }
  return { line: lines.length, column: lines[lines.length - 1].length + 1 };
}

// ─── 节点坐标转 Monaco IMarkerData ────────────────────────
function nodeToMarker(node: any): MarkerData {
  const startPos = node.startPosition;
  const endPos = node.endPosition;
  const message = node.isError ? "语法错误" : node.isMissing ? "缺少语法元素" : `语法异常: ${node.type}`;

  return {
    severity: node.isError ? 2 : 4, // MarkerSeverity.Error / Info
    startLineNumber: startPos.row + 1,
    startColumn: startPos.column + 1,
    endLineNumber: endPos.row + 1,
    endColumn: endPos.column + 1,
    message,
  };
}

// ─── 收集所有错误节点 ─────────────────────────────────────
function collectErrors(root: any): any[] {
  const errors: any[] = [];

  function walk(node: any) {
    if (node.isError || node.isMissing) {
      errors.push(node);
    }
    for (let i = 0; i < node.childCount; i++) {
      const child = node.child(i);
      if (child) walk(child);
    }
  }

  walk(root);
  return errors;
}

// ─── 主诊断函数 ───────────────────────────────────────────
const TREESITTER_MARKER_OWNER = "treesitter-check";

export async function treesitterDiagnostics(
  language: string,
  source: string
): Promise<MarkerData[]> {
  // 空代码直接返回空
  if (!source || source.trim().length === 0) {
    return [];
  }

  // 等待 WASM 初始化完成
  if (!parser || !languageReady) {
    await initTreeSitter();
  }

  if (!parser || !languageReady) {
    return [];
  }

  try {
    // 按语言加载对应的语法（首次需要）
    const mappedLang = language === "javascript" ? "javascript" : language;
    await loadLanguageForLang(mappedLang);

    const tree = parser.parse(source);
    if (!tree || !tree.rootNode) return [];
    const errors = collectErrors(tree.rootNode);
    return errors.map((node) => nodeToMarker(node));
  } catch {
    return [];
  }
}

// ─── 清理资源 ─────────────────────────────────────────────
export function disposeTreeSitter() {
  if (parser) {
    parser.delete();
    parser = null;
  }
  languageReady = false;
  currentGrammar = null;
  initPromise = null;
}
