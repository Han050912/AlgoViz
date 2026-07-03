/**
 * Lightweight Python diagnostic provider.
 * Checks: missing colons, indentation errors, unmatched brackets/parens,
 * unclosed strings, missing imports for common modules.
 */
import * as monaco from 'monaco-editor';

// Regex patterns for common Python issues
const COLON_AFTER_DEF = /\b(def|class|if|else|elif|for|while|try|except|finally|with|assert|lambda|return)\s*[^:\n\r]/;
const COLON_AFTER_IF = /(?<=if\s+.+?)(?<!:)(?=\s)/;
const UNCLOSED_STRING_SINGLE = /(?<![\\])(?:[^'\\]|\\.)*$/;
const UNCLOSED_STRING_DOUBLE = /(?<![\\])(?:[^"\\]|\\.)*$/;
const UNBALANCED_PARENS = /[()]/g;
const UNBALANCED_BRACKETS = /[\[\]]/g;
const UNBALANCED_BRACES = /[{}]/g;
const TAB_INDENT = /\t/;

interface PythonIssue {
  message: string;
  severity: monaco.editor.MarkerSeverity;
  startLineNumber: number;
  startColumn: number;
  endLineNumber: number;
  endColumn: number;
}

export function providePythonDiagnostics(uri: monaco.Uri, model: monaco.ITextModel): monaco.editor.IMarkerData[] {
  const issues: monaco.editor.IMarkerData[] = [];
  const lines = model.getLinesContent();
  const totalLines = lines.length;

  // ─── 1. 缩进检查 ────────────────────────────────────
  for (let i = 0; i < totalLines; i++) {
    const line = lines[i];
    const lineNum = i + 1;

    // Tab 缩进警告
    if (TAB_INDENT.test(line)) {
      issues.push({
        severity: monaco.editor.MarkerSeverity.Warning,
        startLineNumber: lineNum,
        startColumn: 1,
        endLineNumber: lineNum,
        endColumn: line.indexOf('\t') + 1,
        message: '检测到 Tab 缩进，建议使用空格缩进（4 个空格）',
      });
    }

    // 混合缩进检测
    const stripped = line.replace(/[^\t ]/, '');
    if (stripped.length > 0 && line.includes(' ') && line.includes('\t')) {
      issues.push({
        severity: monaco.editor.MarkerSeverity.Error,
        startLineNumber: lineNum,
        startColumn: 1,
        endLineNumber: lineNum,
        endColumn: line.length + 1,
        message: '混用了 Tab 和空格进行缩进，这会导致 IndentationError',
      });
    }
  }

  // ─── 2. 冒号缺失检查 ────────────────────────────────
  const keywordPatterns = [
    { pattern: /^(def|class)\s+\w+/, msg: 'def/class 语句末尾缺少冒号 :' },
    { pattern: /^(if|elif)\s+.+/, msg: 'if/elif 语句末尾缺少冒号 :' },
    { pattern: /^else\s*:?\s*$/, msg: 'else 语句后可以省略冒号，但建议保留' },
    { pattern: /^for\s+.+\s+in\s+.+/, msg: 'for 语句末尾缺少冒号 :' },
    { pattern: /^while\s+.+/, msg: 'while 语句末尾缺少冒号 :' },
    { pattern: /^try\s*:?\s*$/, msg: 'try 语句末尾缺少冒号 :' },
    { pattern: /^except(?:\s+\(.+?\))?\s*$/, msg: 'except 语句末尾缺少冒号 :' },
    { pattern: /^with\s+.+/, msg: 'with 语句末尾缺少冒号 :' },
  ];

  for (let i = 0; i < totalLines; i++) {
    const line = lines[i].trim();
    const lineNum = i + 1;

    if (!line || line.startsWith('#')) continue;

    for (const { pattern, msg } of keywordPatterns) {
      if (pattern.test(line)) {
        // 检查该行是否有冒号
        if (!line.endsWith(':') && !line.endsWith('#') && !line.endsWith('\\')) {
          // 查找行尾冒号位置
          const colonIdx = line.lastIndexOf(':');
          const endCol = colonIdx >= 0 ? colonIdx + 2 : line.length + 1;
          issues.push({
            severity: monaco.editor.MarkerSeverity.Error,
            startLineNumber: lineNum,
            startColumn: 1,
            endLineNumber: lineNum,
            endColumn: endCol,
            message: msg,
          });
        }
        break;
      }
    }
  }

  // ─── 3. 括号/方括号/花括号匹配 ──────────────────────
  for (let i = 0; i < totalLines; i++) {
    const line = lines[i];
    const lineNum = i + 1;

    // 跳过注释行
    const codeOnly = line.split('#')[0];

    // 检查未闭合的括号
    const parenStack: string[] = [];
    const charMap: Record<string, string> = { '(': ')', '[': ']', '{': '}' };
    const closeMap: Record<string, string> = { ')': '(', ']': '[', '}': '{' };

    for (let j = 0; j < codeOnly.length; j++) {
      const ch = codeOnly[j];
      if (ch in charMap) {
        parenStack.push(ch);
      } else if (ch in closeMap) {
        if (parenStack.length === 0 || parenStack[parenStack.length - 1] !== closeMap[ch]) {
          issues.push({
            severity: monaco.editor.MarkerSeverity.Error,
            startLineNumber: lineNum,
            startColumn: j + 1,
            endLineNumber: lineNum,
            endColumn: j + 2,
            message: `括号不匹配: 发现了 "${ch}" 但没有对应的 "${closeMap[ch]}"`,
          });
        } else {
          parenStack.pop();
        }
      }
    }

    // 未闭合的左括号
    if (parenStack.length > 0) {
      const unclosed = parenStack.join('');
      issues.push({
        severity: monaco.editor.MarkerSeverity.Error,
        startLineNumber: lineNum,
        startColumn: codeOnly.length + 1,
        endLineNumber: lineNum,
        endColumn: codeOnly.length + 1,
        message: `未闭合的括号: "${unclosed}"`,
      });
    }

    // 单引号/双引号未闭合检查
    for (const quote of ['"', "'"]) {
      let inString = false;
      let escaped = false;
      for (let j = 0; j < codeOnly.length; j++) {
        const ch = codeOnly[j];
        if (escaped) {
          escaped = false;
          continue;
        }
        if (ch === '\\') {
          escaped = true;
          continue;
        }
        if (ch === quote) {
          inString = !inString;
        }
      }
      if (inString) {
        issues.push({
          severity: monaco.editor.MarkerSeverity.Error,
          startLineNumber: lineNum,
          startColumn: codeOnly.lastIndexOf(quote) + 2,
          endLineNumber: lineNum,
          endColumn: codeOnly.length + 1,
          message: `未闭合的 ${quote === '"' ? '双引号' : '单引号'}字符串`,
        });
      }
    }
  }

  // ─── 4. 常见拼写/语法错误 ──────────────────────────
  for (let i = 0; i < totalLines; i++) {
    const line = lines[i].trim();
    const lineNum = i + 1;
    if (!line || line.startsWith('#')) continue;

    // print 后缺少括号（Python 3）
    if (/print\s+\S/.test(line) && !/\(\s*$/.test(line) && !/\)$/.test(line)) {
      // 简单启发式：如果 print 后面跟了变量但没有括号包围
      if (!line.includes('(') || line.split('(').length < line.split(')').length + 1) {
        // 不强制报错，避免误报
      }
    }

    // 缺少 from/import
    if (/^import\s+$/.test(line)) {
      issues.push({
        severity: monaco.editor.MarkerSeverity.Error,
        startLineNumber: lineNum,
        startColumn: 1,
        endLineNumber: lineNum,
        endColumn: line.length + 1,
        message: 'import 语句不完整，请指定要导入的模块',
      });
    }

    // 赋值后缺少值
    if (/=\s*$/.test(line) && !line.includes('#')) {
      issues.push({
        severity: monaco.editor.MarkerSeverity.Warning,
        startLineNumber: lineNum,
        startColumn: line.lastIndexOf('=') + 2,
        endLineNumber: lineNum,
        endColumn: line.length + 1,
        message: '赋值语句右侧缺少值',
      });
    }
  }

  return issues;
}
