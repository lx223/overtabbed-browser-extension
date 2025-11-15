import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material/styles';

export type ThemeMode = 'light' | 'dark' | 'auto';

interface ThemeContextValue {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  resolvedMode: 'light' | 'dark';
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const STORAGE_KEY = 'overtabbed-theme-mode';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setModeState] = useState<ThemeMode>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return (stored as ThemeMode) || 'dark';
  });

  const [systemPrefersDark, setSystemPrefersDark] = useState(() =>
    window.matchMedia('(prefers-color-scheme: dark)').matches
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => setSystemPrefersDark(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  const setMode = useCallback((newMode: ThemeMode) => {
    setModeState(newMode);
    localStorage.setItem(STORAGE_KEY, newMode);
  }, []);

  const resolvedMode = useMemo((): 'light' | 'dark' => {
    if (mode === 'auto') return systemPrefersDark ? 'dark' : 'light';
    return mode;
  }, [mode, systemPrefersDark]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', resolvedMode);
  }, [resolvedMode]);

  const muiTheme = useMemo(() => createTheme({
    palette: {
      mode: resolvedMode,
      primary: { main: '#3b82f6' },
      secondary: { main: '#8b5cf6' },
      error: { main: '#ef4444' },
      background: {
        default: resolvedMode === 'dark' ? '#0f172a' : '#f8fafc',
        paper: resolvedMode === 'dark' ? '#1e293b' : '#ffffff',
      },
      text: {
        primary: resolvedMode === 'dark' ? '#f1f5f9' : '#0f172a',
        secondary: resolvedMode === 'dark' ? 'rgba(241,245,249,0.7)' : 'rgba(15,23,42,0.7)',
      },
    },
    typography: {
      fontFamily: '"IBM Plex Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    },
    shape: { borderRadius: 8 },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            backgroundColor: 'var(--bg-base)',
            color: 'var(--text-primary)',
          },
        },
      },
    },
  }), [resolvedMode]);

  const value = useMemo(() => ({ mode, setMode, resolvedMode }), [mode, setMode, resolvedMode]);

  return (
    <ThemeContext.Provider value={value}>
      <MuiThemeProvider theme={muiTheme}>
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useTheme = (): ThemeContextValue => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
};


