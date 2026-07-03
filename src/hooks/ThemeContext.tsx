import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { resolveTheme, type ThemeMode, type ComputedTheme, loadThemeMode, saveThemeMode, listenSystemTheme } from './useTheme';

interface ThemeContextValue {
  mode: ThemeMode;
  theme: ComputedTheme;
  setMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  mode: 'system',
  theme: 'dark',
  setMode: () => {},
  toggleTheme: () => {},
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>(() => loadThemeMode());
  const [theme, setTheme] = useState<ComputedTheme>(() => resolveTheme(mode));

  // Apply data-theme to <html> for CSS variable switching
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Watch for mode changes
  useEffect(() => {
    setTheme(resolveTheme(mode));
  }, [mode]);

  // Listen to system theme changes when in system mode
  useEffect(() => {
    if (mode !== 'system') return;
    return listenSystemTheme((systemTheme) => {
      setTheme(systemTheme);
    });
  }, [mode]);

  const setMode = useCallback((newMode: ThemeMode) => {
    setModeState(newMode);
    saveThemeMode(newMode);
  }, []);

  const toggleTheme = useCallback(() => {
    setMode(theme === 'dark' ? 'light' : 'dark');
  }, [theme, setMode]);

  return (
    <ThemeContext.Provider value={{ mode, theme, setMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
