import React, { useState, useMemo, createContext, useContext, useEffect } from 'react';
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
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Layout Components
import DashboardLayout from './layouts/DashboardLayout';
import AuthLayout from './layouts/AuthLayout';

// Pages
import Login from './pages/Login';
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
import NotFound from './pages/NotFound';

// Create a theme context for light/dark mode
export const ThemeContext = createContext({ toggleColorMode: () => {} });

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
          <AuthProvider>
            <Router>
              <AppContent />
            </Router>
          </AuthProvider>
        </ThemeProvider>
      </ThemeContext.Provider>
    </I18nextProvider>
  );
}

/**
 * Component to handle routing and layout based on authentication status
 */
function AppContent() {
  const { currentUser, loading } = useAuth();
  const location = useLocation();
  const { t } = useTranslation();

  // Show loading spinner while checking auth state
  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  // If user is not logged in and not on the login page, redirect to login
  if (!currentUser && location.pathname !== '/login') {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If user is logged in and on the login page, redirect to dashboard
  if (currentUser && location.pathname === '/login') {
    return <Navigate to="/" replace />;
  }

  // Render the appropriate layout based on authentication status
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={
        <AuthLayout>
          <Login />
        </AuthLayout>
      } />

      {/* Protected routes */}
      <Route path="/" element={
        <DashboardLayout>
          <Dashboard />
        </DashboardLayout>
      } />
      
      <Route path="/leads" element={
        <DashboardLayout>
          <Leads />
        </DashboardLayout>
      } />
      
      <Route path="/calendar" element={
        <DashboardLayout>
          <Calendar />
        </DashboardLayout>
      } />
      
      <Route path="/notes" element={
        <DashboardLayout>
          <Notes />
        </DashboardLayout>
      } />
      
      <Route path="/users" element={
        <DashboardLayout>
          <Users />
        </DashboardLayout>
      } />
      
      <Route path="/reports" element={
        <DashboardLayout>
          <Reports />
        </DashboardLayout>
      } />
      
      <Route path="/projects" element={
        <DashboardLayout>
          <Projects />
        </DashboardLayout>
      } />
      
      <Route path="/regions" element={
        <DashboardLayout>
          <Regions />
        </DashboardLayout>
      } />
      
      <Route path="/settings" element={
        <DashboardLayout>
          <Settings />
        </DashboardLayout>
      } />
      
      <Route path="/help" element={
        <DashboardLayout>
          <HelpSupport />
        </DashboardLayout>
      } />

      {/* 404 - Not Found */}
      <Route path="*" element={
        <DashboardLayout>
          <NotFound />
        </DashboardLayout>
      } />
    </Routes>
  );
}

export default App;
