import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSupabase } from '../../contexts/SupabaseContext';
import { Box, CircularProgress } from '@mui/material';

/**
 * A protected route component that checks for authentication status
 * and redirects to login if not authenticated
 */
const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { user, loading } = useSupabase();
  const location = useLocation();
  
  // Check if user has the required role
  const hasRole = (requiredRole) => {
    if (!user || !requiredRole) return true; // No role required or user not loaded yet
    // Implement role checking logic here if needed
    // For now, just return true
    return true;
  };

  // Show loading spinner while checking auth state
  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // If user is not authenticated, redirect to login
  if (!user) {
    return <Navigate to="/auth/signin" state={{ from: location }} replace />;
  }

  // If role is required but user doesn't have it, redirect to home
  if (requiredRole && !hasRole(requiredRole)) {
    return <Navigate to="/" replace />;
  }

  // User is authenticated and has required role (if any)
  return children;
};

export default ProtectedRoute;
