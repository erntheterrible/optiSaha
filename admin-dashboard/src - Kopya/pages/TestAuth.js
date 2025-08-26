import React, { useEffect, useState } from 'react';
import { useSupabase } from '../contexts/SupabaseContext';
import { 
  Box, 
  Typography, 
  Button, 
  Paper, 
  List, 
  ListItem, 
  ListItemText, 
  Divider,
  Alert,
  CircularProgress
} from '@mui/material';
import { useTranslation } from 'react-i18next';

const TestAuth = () => {
  const { t } = useTranslation();
  const { 
    user, 
    session, 
    loading, 
    signIn, 
    signUp, 
    signOut, 
    resetPassword, 
    updatePassword, 
    signInWithProvider,
    hasRole,
    isAuthenticated 
  } = useSupabase();
  
  const [testResults, setTestResults] = useState([]);
  const [error, setError] = useState(null);
  const [testEmail, setTestEmail] = useState('test@example.com');
  const [testPassword, setTestPassword] = useState('Test123!');

  const addTestResult = (testName, result, details = '') => {
    setTestResults(prev => [
      ...prev,
      { testName, result, details, timestamp: new Date().toISOString() }
    ]);
  };

  const runAuthTests = async () => {
    setTestResults([]);
    setError(null);

    try {
      // Test 1: Check initial auth state
      addTestResult(
        'Initial Auth State', 
        'info',
        loading ? 'Loading...' : `Authenticated: ${isAuthenticated}`
      );

      // Test 2: Email/Password Sign In
      try {
        addTestResult('Email/Password Sign In', 'pending', 'Attempting to sign in...');
        const { error: signInError } = await signIn(testEmail, testPassword);
        
        if (signInError) throw signInError;
        
        addTestResult(
          'Email/Password Sign In', 
          'success',
          'Successfully signed in with email/password'
        );
      } catch (err) {
        addTestResult(
          'Email/Password Sign In', 
          'error',
          err.message || 'Failed to sign in with email/password'
        );
      }

      // Test 3: Check User Info
      if (user) {
        addTestResult(
          'User Information', 
          'success',
          `ID: ${user.id}, Email: ${user.email}`
        );

        // Test 4: Check Session
        if (session) {
          addTestResult(
            'Session Information', 
            'success',
            `Access Token: ${session.access_token ? 'Present' : 'Missing'}`
          );
        } else {
          addTestResult('Session Information', 'error', 'No active session found');
        }

        // Test 5: Check Roles
        const roles = ['admin', 'manager', 'user'];
        roles.forEach(role => {
          const hasAccess = hasRole(role);
          addTestResult(
            `Role Check: ${role}`, 
            hasAccess ? 'success' : 'warning',
            hasAccess ? 'Has access' : 'No access'
          );
        });
      }

      // Test 6: Sign Out
      try {
        addTestResult('Sign Out', 'pending', 'Attempting to sign out...');
        const { error: signOutError } = await signOut();
        
        if (signOutError) throw signOutError;
        
        addTestResult('Sign Out', 'success', 'Successfully signed out');
      } catch (err) {
        addTestResult('Sign Out', 'error', err.message || 'Failed to sign out');
      }

    } catch (err) {
      setError(err.message || 'An error occurred during testing');
      console.error('Auth test error:', err);
    }
  };

  const getResultColor = (result) => {
    switch (result) {
      case 'success': return 'success.main';
      case 'error': return 'error.main';
      case 'warning': return 'warning.main';
      case 'info': 
      default: 
        return 'text.primary';
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        {t('auth.testAuth')}
      </Typography>
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          {t('auth.testConfiguration')}
        </Typography>
        
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            {t('auth.testEmail')}
          </Typography>
          <input 
            type="email" 
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
            style={{ width: '100%', padding: '8px', marginBottom: '16px' }}
          />
          
          <Typography variant="subtitle2" gutterBottom>
            {t('auth.testPassword')}
          </Typography>
          <input 
            type="password" 
            value={testPassword}
            onChange={(e) => setTestPassword(e.target.value)}
            style={{ width: '100%', padding: '8px', marginBottom: '16px' }}
          />
        </Box>
        
        <Button 
          variant="contained" 
          color="primary" 
          onClick={runAuthTests}
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : null}
        >
          {loading ? t('common.runningTests') : t('common.runTests')}
        </Button>
        
        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
      </Paper>
      
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          {t('auth.testResults')}
        </Typography>
        
        {testResults.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            {t('auth.noTestsRun')}
          </Typography>
        ) : (
          <List dense>
            {testResults.map((test, index) => (
              <React.Fragment key={index}>
                <ListItem>
                  <ListItemText
                    primary={test.testName}
                    secondary={test.details}
                    primaryTypographyProps={{
                      color: getResultColor(test.result),
                      fontWeight: 'medium'
                    }}
                    secondaryTypographyProps={{
                      color: 'text.secondary'
                    }}
                  />
                </ListItem>
                {index < testResults.length - 1 && <Divider component="li" />}
              </React.Fragment>
            ))}
          </List>
        )}
      </Paper>
    </Box>
  );
};

export default TestAuth;
