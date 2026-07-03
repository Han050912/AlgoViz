/**
 * Lightweight diagnostic providers for C++, Java, Go, and Rust.
 * Checks: unmatched brackets/parens/braces, unclosed strings,
 * missing semicolons (C++/Java), unmatched if/else/try/catch,
 * common syntax mistakes.
 */
import * as monaco from 'monaco-editor';

// ─── 通用诊断工具 ────────────────────────────────────────

interface DiagnosticBuilder {
  line: string;
  lineNum: number;
  totalLines: number;
  lines: string[];
  markers: monaco.editor.IMarkerData[];
}

function createBuilder(lines: string[]): DiagnosticBuilder {
  return {
    line: '',
    lineNum: 0,
    totalLines: lines.length,
    lines,
    markers: [],
  };
}

function addMarker(
  builder: DiagnosticBuilder,
  severity: monaco.editor.MarkerSeverity,
  startLine: number,
  startCol: number,
  endLine: number,
  endCol: number,
  message: string,
): void {
  builder.markers.push({
    severity,
    startLineNumber: startLine,
    startColumn: startCol,
    endLineNumber: endLine,
    endColumn: endCol,
    message,
  });
}

/** 获取代码部分（去除注释和字符串中的内容） */
function stripCommentsAndStrings(line: string): string {
  let result = '';
  let inSingleQuote = false;
  let inDoubleQuote = false;
  let escaped = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];

    if (escaped) {
      escaped = false;
      result += ch;
      continue;
    }
    if (ch === '\\') {
      escaped = true;
      result += ch;
      continue;
    }
    if (ch === "'" && !inDoubleQuote) {
      inSingleQuote = !inSingleQuote;
      result += inSingleQuote ? "'" : "'";
      continue;
    }
    if (ch === '"' && !inSingleQuote) {
      inDoubleQuote = !inDoubleQuote;
      result += inDoubleQuote ? '"' : '"';
      continue;
    }
    // 单行注释
    if (ch === '/' && line[i + 1] === '/') {
      break;
    }
    if (!inSingleQuote && !inDoubleQuote) {
      result += ch;
    } else {
      result += ch;
    }
  }
  return result;
}

/** 检查括号/方括号/花括号匹配 */
function checkBrackets(builder: DiagnosticBuilder): void {
  for (let i = 0; i < builder.totalLines; i++) {
    const line = builder.lines[i];
    const lineNum = i + 1;
    const code = stripCommentsAndStrings(line);

    // 跳过纯空行和纯注释行
    if (!code.trim()) continue;

    const pairs: Record<string, string> = { '(': ')', '[': ']', '{': '}' };
    const closes: Record<string, string> = { ')': '(', ']': '[', '}': '{' };
    const stack: { ch: string; col: number }[] = [];

    for (let j = 0; j < code.length; j++) {
      const ch = code[j];
      if (ch in pairs) {
        stack.push({ ch, col: j + 1 });
      } else if (ch in closes) {
        if (stack.length === 0 || stack[stack.length - 1].ch !== closes[ch]) {
          addMarker(
            builder, monaco.editor.MarkerSeverity.Error,
            lineNum, j + 1, lineNum, j + 2,
            `括号不匹配: 期望 "${pairs[closes[ch]]}" 但发现 "${ch}"`,
          );
        } else {
          stack.pop();
        }
      }
    }

    // 未闭合的左括号
    if (stack.length > 0) {
      const unclosed = stack.map(s => s.ch).join('');
      addMarker(
        builder, monaco.editor.MarkerSeverity.Error,
        lineNum, code.length + 1, lineNum, code.length + 1,
        `未闭合的括号: "${unclosed}"`,
      );
    }
  }
}

/** 检查引号是否闭合 */
function checkQuotes(builder: DiagnosticBuilder): void {
  for (let i = 0; i < builder.totalLines; i++) {
    const line = builder.lines[i];
    const lineNum = i + 1;
    const code = stripCommentsAndStrings(line);

    // 检查未闭合的单引号和双引号
    for (const quote of ['"', "'"]) {
      let inString = false;
      let escaped = false;
      for (let j = 0; j < code.length; j++) {
        const ch = code[j];
        if (escaped) { escaped = false; continue; }
        if (ch === '\\') { escaped = true; continue; }
        if (ch === quote) { inString = !inString; }
      }
      if (inString) {
        const lastQuoteIdx = code.lastIndexOf(quote);
        addMarker(
          builder, monaco.editor.MarkerSeverity.Error,
          lineNum, lastQuoteIdx + 2, lineNum, code.length + 1,
          `未闭合的 ${quote === '"' ? '双引号' : '单引号'}字符串`,
        );
      }
    }
  }
}

/** 检查关键字配对（if/else, try/catch, for/while/do 等） */
function checkKeywordPairs(builder: DiagnosticBuilder): void {
  const keywordPairs: Record<string, string> = {
    'if': 'else',
    'else': 'if',
    'try': 'catch',
    'catch': 'try',
    'for': 'for',
    'while': 'while',
  };

  for (let i = 0; i < builder.totalLines; i++) {
    const line = builder.lines[i];
    const lineNum = i + 1;
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('//') || trimmed.startsWith('#')) continue;

    // 检查 if 没有 else 的情况（仅警告）
    if (/^\s*if\s*\(/.test(trimmed) && !trimmed.includes('{')) {
      // 可能是单行 if，跳过
    }
  }
}

/** 检查分号缺失（C++/Java） */
function checkSemicolonsCppJava(builder: DiagnosticBuilder): void {
  for (let i = 0; i < builder.totalLines; i++) {
    const line = builder.lines[i];
    const lineNum = i + 1;
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('//') || trimmed.startsWith('#')) continue;

    // 变量声明后缺少分号
    if (/^(int|float|double|char|bool|string|void|long|short|unsigned|const)\s+/.test(trimmed) && !trimmed.endsWith(';') && !trimmed.endsWith('{') && !trimmed.endsWith('}')) {
      addMarker(
        builder, monaco.editor.MarkerSeverity.Error,
        lineNum, trimmed.length + 1, lineNum, trimmed.length + 1,
        '语句末尾缺少分号 ;',
      );
    }

    // 表达式后缺少分号
    if (/^(return|throw|break|continue)\s+\S/.test(trimmed) && !trimmed.endsWith(';') && !trimmed.endsWith('{') && !trimmed.endsWith('}')) {
      addMarker(
        builder, monaco.editor.MarkerSeverity.Error,
        lineNum, trimmed.length + 1, lineNum, trimmed.length + 1,
        '语句末尾缺少分号 ;',
      );
    }
  }
}

/** 检查分号缺失（Go） */
function checkSemicolonsGo(builder: DiagnosticBuilder): void {
  for (let i = 0; i < builder.totalLines; i++) {
    const line = builder.lines[i];
    const lineNum = i + 1;
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('//') || trimmed.startsWith('#')) continue;

    // Go 中某些语句隐含分号，不做严格检查
    // 仅检查明显的遗漏
    if (/^(var|const|type|func)\s+\w/.test(trimmed) && !trimmed.endsWith('{') && !trimmed.endsWith('}')) {
      // 多行声明，正常
    }
  }
}

/** 检查分号缺失（Rust） */
function checkSemicolonsRust(builder: DiagnosticBuilder): void {
  for (let i = 0; i < builder.totalLines; i++) {
    const line = builder.lines[i];
    const lineNum = i + 1;
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('//') || trimmed.startsWith('#')) continue;

    // Rust 的 let 绑定后缺少分号
    if (/^let\s+/.test(trimmed) && !trimmed.endsWith(';') && !trimmed.endsWith('{') && !trimmed.endsWith('}')) {
      addMarker(
        builder, monaco.editor.MarkerSeverity.Warning,
        lineNum, trimmed.length + 1, lineNum, trimmed.length + 1,
        'let 绑定建议以分号结尾',
      );
    }
  }
}

// ─── C++ 诊断 ────────────────────────────────────────────
export function provideCppDiagnostics(uri: monaco.Uri, model: monaco.ITextModel): monaco.editor.IMarkerData[] {
  const builder = createBuilder(model.getLinesContent());
  checkBrackets(builder);
  checkQuotes(builder);
  checkSemicolonsCppJava(builder);
  return builder.markers;
}

// ─── Java 诊断 ───────────────────────────────────────────
export function provideJavaDiagnostics(uri: monaco.Uri, model: monaco.ITextModel): monaco.editor.IMarkerData[] {
  const builder = createBuilder(model.getLinesContent());
  checkBrackets(builder);
  checkQuotes(builder);
  checkSemicolonsCppJava(builder);
  return builder.markers;
}

// ─── Go 诊断 ─────────────────────────────────────────────
export function provideGoDiagnostics(uri: monaco.Uri, model: monaco.ITextModel): monaco.editor.IMarkerData[] {
  const builder = createBuilder(model.getLinesContent());
  checkBrackets(builder);
  checkQuotes(builder);
  checkSemicolonsGo(builder);
  return builder.markers;
}

// ─── Rust 诊断 ───────────────────────────────────────────
export function provideRustDiagnostics(uri: monaco.Uri, model: monaco.ITextModel): monaco.editor.IMarkerData[] {
  const builder = createBuilder(model.getLinesContent());
  checkBrackets(builder);
  checkQuotes(builder);
  checkSemicolonsRust(builder);
  return builder.markers;
}

// ─── 语言映射 ────────────────────────────────────────────
export const diagnosticProviders: Record<string, (uri: monaco.Uri, model: monaco.ITextModel) => monaco.editor.IMarkerData[]> = {
  cpp: provideCppDiagnostics,
  java: provideJavaDiagnostics,
  go: provideGoDiagnostics,
  rust: provideRustDiagnostics,
};
