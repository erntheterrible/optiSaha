import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { SnackbarProvider } from 'notistack';
import unityTheme from './theme/unityTheme';
import AppContent from './AppContent';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

function App() {
  // Use Unity theme only
  const theme = unityTheme;

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <ThemeProvider theme={theme}>
        <SnackbarProvider maxSnack={3} autoHideDuration={3000}>
        <CssBaseline enableColorScheme />
        <AppContent />
      </SnackbarProvider>
      </ThemeProvider>
    </LocalizationProvider>
  );
}

export default App;
