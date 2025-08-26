import React, { useState, Suspense, useEffect } from 'react';
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n/i18n';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import { supabase } from './lib/supabaseClient';

// Lazy load components for better performance
const DashboardLayout = React.lazy(() => import('./features/dashboard/DashboardLayout'));
const DashboardHome = React.lazy(() => import('./features/dashboard/DashboardHome'));
const UsersPage = React.lazy(() => import('./features/users/UsersPage'));
const RegionsPage = React.lazy(() => import('./features/regions/RegionsPage'));
const ReportsPage = React.lazy(() => import('./features/reports/ReportsPage'));
const ProjectsPage = React.lazy(() => import('./features/projects/ProjectsPage'));
const SettingsPage = React.lazy(() => import('./features/settings/SettingsPage'));
const SupportPage = React.lazy(() => import('./features/support/SupportPage'));
const Login = React.lazy(() => import('./features/auth/Login'));
const Register = React.lazy(() => import('./pages/Register'));
const LeadsPage = React.lazy(() => import('./features/leads/LeadsPage'));
const CalendarPage = React.lazy(() => import('./features/calendar/CalendarPage'));
const NotesPage = React.lazy(() => import('./features/notes/NotesPage'));

// Loading component for Suspense fallback
const Loader = () => (
  <Box 
    display="flex" 
    justifyContent="center" 
    alignItems="center" 
    minHeight="100vh"
  >
    <CircularProgress />
  </Box>
);

// A wrapper component to handle authentication and lazy loading
const ProtectedRoute = ({ children, isAuthenticated, redirectTo = "/login" }) => {
  if (!isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }
  return children;
};

function AppContent() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Check for existing session on initial load
  useEffect(() => {
    let mounted = true;
    
    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (mounted) {
          if (error) throw error;
          
          const isAuthenticated = !!session;
          setIsAuthenticated(isAuthenticated);
          
          if (isAuthenticated) {
            console.log('Initial session found:', session);
            // Store the token for API requests
            if (session.access_token) {
              localStorage.setItem('token', session.access_token);
            }
            
            // If on login page, redirect to home
            if (window.location.pathname === '/login') {
              navigate('/');
            }
          } else if (!['/login', '/register'].includes(window.location.pathname)) {
            // If no session and not on a public page, redirect to login
            navigate('/login');
          }
        }
      } catch (error) {
        console.error('Error checking session:', error);
        if (mounted) {
          setIsAuthenticated(false);
          if (window.location.pathname !== '/login') {
            navigate('/login');
          }
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session);
        
        if (mounted) {
          const isAuthenticated = !!session;
          setIsAuthenticated(isAuthenticated);
          
          // Handle different auth events
          if (event === 'SIGNED_OUT' || event === 'USER_DELETED') {
            // Clear stored data on sign out
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            
            // Only redirect if not already on login page
            if (window.location.pathname !== '/login') {
              navigate('/login');
            }
          } else if (session) {
            // Update stored session data
            if (session.access_token) {
              localStorage.setItem('token', session.access_token);
            }
            
            // Redirect to dashboard if on login page
            if (window.location.pathname === '/login') {
              navigate('/');
            }
          }
        }
      }
    );

    // Initial session check
    checkSession();

    // Cleanup function
    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, [navigate]);

  const handleLogin = () => {
    setIsAuthenticated(true);
    navigate('/');
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setIsAuthenticated(false);
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (isLoading) {
    return <Loader />;
  }

  return (
    <I18nextProvider i18n={i18n}>
      <Suspense fallback={<Loader />}>
        <Routes>
        {/* Public Routes */}
        <Route 
          path="/login" 
          element={
            isAuthenticated ? 
            <Navigate to="/" replace /> : 
            <Login onLogin={handleLogin} />
          } 
        />
        <Route 
          path="/register" 
          element={
            isAuthenticated ? 
            <Navigate to="/" replace /> : 
            <Register />
          } 
        />
        
        {/* Protected Routes */}
        <Route 
          path="/" 
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <DashboardLayout onLogout={handleLogout} />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardHome />} />
          <Route path="leads" element={<LeadsPage />} />
          <Route path="calendar" element={<CalendarPage />} />
          <Route path="notes" element={<NotesPage />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="regions" element={<RegionsPage />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="projects" element={<ProjectsPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="support" element={<SupportPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
      </Suspense>
    </I18nextProvider>
  );
}

export default AppContent;
