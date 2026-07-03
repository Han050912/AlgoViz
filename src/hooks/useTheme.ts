/**
 * Theme mode options
 */
export type ThemeMode = 'dark' | 'light' | 'system';

/**
 * Computed theme resolved from mode + system preference
 */
export type ComputedTheme = 'dark' | 'light';

const STORAGE_KEY = 'algoviz_theme_mode';

/**
 * Detect system color scheme preference
 */
function getSystemTheme(): ComputedTheme {
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return 'dark';
}

/**
 * Listen to system theme changes
 */
function listenSystemTheme(callback: (theme: ComputedTheme) => void): () => void {
  if (typeof window === 'undefined' || !window.matchMedia) return () => {};
  const mql = window.matchMedia('(prefers-color-scheme: dark)');
  const handler = (e: MediaQueryListEvent | MediaQueryList) => {
    callback(e.matches ? 'dark' : 'light');
  };
  mql.addEventListener?.('change', handler);
  // Fallback for older browsers
  if (mql.addListener) mql.addListener(handler as any);
  return () => {
    mql.removeEventListener?.('change', handler);
    if (mql.removeListener) mql.removeListener(handler as any);
  };
}

/**
 * Persist theme mode to localStorage
 */
function saveThemeMode(mode: ThemeMode): void {
  try {
    localStorage.setItem(STORAGE_KEY, mode);
  } catch { /* ignore */ }
}

/**
 * Read persisted theme mode from localStorage
 */
function loadThemeMode(): ThemeMode {
  try {
    return (localStorage.getItem(STORAGE_KEY) as ThemeMode) || 'system';
  } catch {
    return 'system';
  }
}

/**
 * Resolve the effective theme from mode + system preference
 */
export function resolveTheme(mode: ThemeMode): ComputedTheme {
  if (mode === 'system') return getSystemTheme();
  return mode;
}
