import React, { createContext, useContext, useCallback, useMemo } from 'react';
import { createTheme } from '@mui/material/styles';
import { colors as tokenColors, gradients, shadows } from './designTokens';
// Pastel/coral/peach theme for modern dashboard UI

export const ThemeContext = createContext();

export const useThemeContext = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeContext must be used within a ThemeProvider');
  }
  return context;
};

// Design tokens for light and dark themes
export const getDesignTokens = (mode) => ({
  palette: {
    gradients,
    mode,
    ...(mode === 'light' ? {
      // Light theme colors
      primary: {
        main: tokenColors.primary[500],
        light: '#3B82F6',
        dark: '#1D4ED8',
        contrastText: '#FFFFFF',
      },
      secondary: {
        main: tokenColors.secondary[500],
        light: '#8B5CF6',
        dark: '#6D28D9',
        contrastText: '#FFFFFF',
      },
      background: {
        default: '#F9FAFB',
        paper: '#FFFFFF',
      },
      text: {
        primary: '#111827',
        secondary: '#4B5563',
        disabled: '#9CA3AF',
      },
      divider: 'rgba(0, 0, 0, 0.12)',
    } : {
      // Dark theme colors
      primary: {
        main: '#60A5FA',
        light: '#93C5FD',
        dark: '#3B82F6',
        contrastText: '#111827',
      },
      secondary: {
        main: '#A78BFA',
        light: '#C4B5FD',
        dark: '#8B5CF6',
        contrastText: '#111827',
      },
      background: {
        default: '#0F172A',
        paper: '#1E293B',
      },
      text: {
        primary: '#F8FAFC',
        secondary: '#E2E8F0',
        disabled: '#94A3B8',
      },
      divider: 'rgba(255, 255, 255, 0.12)',
    }),
    // Common colors for both themes & token greys
    grey: tokenColors.grey,
    // Common colors
    success: {
      main: '#10B981',
      light: '#34D399',
      dark: '#059669',
      contrastText: '#FFFFFF',
    },
    error: {
      main: '#EF4444',
      light: '#F87171',
      dark: '#DC2626',
      contrastText: '#FFFFFF',
    },
    warning: {
      main: '#F59E0B',
      light: '#FBBF24',
      dark: '#D97706',
      contrastText: '#111827',
    },
    info: {
      main: '#3B82F6',
      light: '#60A5FA',
      dark: '#2563EB',
      contrastText: '#FFFFFF',
    },
  },
  typography: {
    fontFamily: 'Inter, Poppins, Roboto, Helvetica, Arial, sans-serif',
    h1: { fontSize: '2.5rem', fontWeight: 700, letterSpacing: '-0.5px' },
    h2: { fontSize: '2rem', fontWeight: 700, letterSpacing: '-0.5px' },
    h3: { fontSize: '1.75rem', fontWeight: 600 },
    h4: { fontSize: '1.5rem', fontWeight: 600 },
    h5: { fontSize: '1.25rem', fontWeight: 600 },
    h6: { fontSize: '1.125rem', fontWeight: 600 },
    subtitle1: { fontSize: '1rem', fontWeight: 500 },
    subtitle2: { fontSize: '0.875rem', fontWeight: 500 },
    body1: { fontSize: '1rem', fontWeight: 400 },
    body2: { fontSize: '0.9375rem', fontWeight: 400 },
    button: { textTransform: 'none', fontWeight: 600, borderRadius: 24 },
    caption: { fontSize: '0.8rem', fontWeight: 400 },
    overline: { 
      fontSize: '0.75rem', 
      fontWeight: 500, 
      textTransform: 'uppercase', 
      letterSpacing: '0.05em' 
    },
  },
  shape: {
    borderRadius: 20,
  },
  shadows: ["none", shadows.card, shadows.card, shadows.nav, ...Array(22).fill(shadows.card)],
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 24,
          fontWeight: 600,
          padding: '10px 24px',
          textTransform: 'none',
          boxShadow: 'none',
          transition: 'all 0.2s',
          '&:hover': { boxShadow: '0 2px 8px rgba(255, 123, 71, 0.13)' },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 24,
          boxShadow: shadows.card,
          transition: 'all 0.3s',
          background: '#fff',
          '&:hover': {
            boxShadow: '0 12px 32px rgba(255, 123, 71, 0.13)',
            transform: 'translateY(-2px)',
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: shadows.nav,
          background: gradients.coralPeach,
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderRadius: '0 24px 24px 0',
          boxShadow: shadows.nav,
        },
      },
    },
  },
  shape: {
    borderRadius: 12,
  },
  shadows: ["none", shadows.card, shadows.card, shadows.nav, ...Array(22).fill(shadows.card)],
  components: {
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderRight: 'none',
          boxShadow: '1px 0 3px 0 rgb(0 0 0 / 0.1)',
        },
      },
    },
    MuiListItem: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          margin: '4px 8px',
          '&.Mui-selected': {
            backgroundColor: 'rgba(37, 99, 235, 0.08)',
            '&:hover': {
              backgroundColor: 'rgba(37, 99, 235, 0.12)',
            },
          },
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          minWidth: 0,
          minHeight: 48,
          '&.Mui-selected': {
            color: mode === 'light' ? '#2563EB' : '#60A5FA',
          },
        },
      },
    },
  },
});

export const createAppTheme = (mode) => {
  return createTheme(getDesignTokens(mode));
};
