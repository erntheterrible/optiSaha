import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeContext, createAppTheme } from './theme/ThemeContext';
import AppContent from './AppContent';

function App() {
  const [mode, setMode] = useState('light');
  
  // Initialize theme from localStorage or system preference
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (!savedTheme) {
      const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      const initialTheme = prefersDark ? 'dark' : 'light';
      setMode(initialTheme);
      localStorage.setItem('theme', initialTheme);
    } else {
      setMode(savedTheme);
    }
  }, []);

  // Toggle theme function
  const toggleTheme = useCallback(() => {
    setMode(prevMode => {
      const newMode = prevMode === 'light' ? 'dark' : 'light';
      localStorage.setItem('theme', newMode);
      return newMode;
    });
  }, [mode]);

  // Theme context value
  const themeContextValue = useMemo(() => ({
    mode,
    toggleTheme,
  }), [mode, toggleTheme]);

  // Create the theme based on the current mode
  const theme = useMemo(() => {
    return createAppTheme(mode);
  }, [mode]);

  // Apply theme class to the root element
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', mode);
  }, [mode]);

  return (
    <ThemeContext.Provider value={themeContextValue}>
      <ThemeProvider theme={theme}>
        <CssBaseline enableColorScheme />
        <AppContent />
      </ThemeProvider>
    </ThemeContext.Provider>
  );
}

export default App;
