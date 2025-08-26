import React, { useState, useMemo, createContext, useContext, useEffect, useCallback } from 'react';
import { I18nextProvider, useTranslation } from 'react-i18next';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';

// i18n Configuration
import i18n from './i18n/i18n';

// Theme
import { createAppTheme } from './theme';

// Auth
import { SupabaseProvider } from './contexts/SupabaseContext';

// Layout Components
import AppLayout from './layout/AppLayout';
import AuthLayout from './layouts/AuthLayout';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import UpdatePassword from './pages/UpdatePassword';
import Dashboard from './pages/Dashboard';
import Leads from './pages/Leads';
import Calendar from './pages/Calendar';
import Notes from './pages/Notes';
import Settings from './pages/Settings';
import Users from './pages/Users';
import Reports from './pages/Reports';
import Projects from './pages/Projects';
import Regions from './pages/Regions';
import HelpSupport from './pages/HelpSupport';
import TestAuth from './pages/TestAuth';
import NotFound from './pages/NotFound';

// Create a theme context for light/dark mode
export const ThemeContext = createContext({ toggleColorMode: () => {} });

// Custom hook to use theme
const useThemeContext = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useThemeContext must be used within a ThemeProvider');
  }
  return context;
};

/**
 * Main App component with theme and routing configuration
 */
function App() {
  const [mode, setMode] = useState('light');
  const { t } = useTranslation();

  // Toggle between light and dark mode
  const toggleColorMode = useCallback(() => {
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  }, []);

  // Create theme based on mode
  const theme = useMemo(
    () => createAppTheme(mode),
    [mode]
  );

  return (
    <I18nextProvider i18n={i18n}>
      <ThemeContext.Provider value={{ toggleColorMode }}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <SupabaseProvider>
            <Router>
              <AppRouter />
            </Router>
          </SupabaseProvider>
        </ThemeProvider>
      </ThemeContext.Provider>
    </I18nextProvider>
  );
}

/**
 * Main application router with protected and public routes
 */
const AppRouter = () => {
  const location = useLocation();
  const isAuthRoute = location.pathname.startsWith('/login') || location.pathname.startsWith('/signup') || location.pathname.startsWith('/forgot-password') || location.pathname.startsWith('/update-password');

  return (
    <Routes>
      {/* Public routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
<Route path="/register" element={<Register />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/update-password" element={<UpdatePassword />} />
        <Route path="/help" element={<HelpSupport />} />
      </Route>

      {/* Protected routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="leads" element={<Leads />} />
        <Route path="calendar" element={<Calendar />} />
        <Route path="notes" element={<Notes />} />
        <Route path="settings" element={<Settings />} />
        <Route path="users" element={<Users />} />
        <Route path="reports" element={<Reports />} />
        <Route path="projects" element={<Projects />} />
        <Route path="regions" element={<Regions />} />
        <Route path="help-support" element={<HelpSupport />} />
        <Route path="test-auth" element={<TestAuth />} />
        <Route path="*" element={<NotFound />} />
      </Route>

      {/* Fallback to login for any other route */}
      <Route path="*" element={
        <Navigate to="/login" state={{ from: location }} replace />
      } />
    </Routes>
  );
};

export default App;
