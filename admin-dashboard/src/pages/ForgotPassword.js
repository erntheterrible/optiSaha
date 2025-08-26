import React, { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Button,
  TextField,
  Typography,
  Link,
  Alert,
  Paper,
  InputAdornment,
  CircularProgress,
} from '@mui/material';
import { Email as EmailIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { useSupabase } from '../contexts/SupabaseContext';

const ForgotPassword = () => {
  const { t } = useTranslation();
  const { resetPassword } = useSupabase();
  
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      setError(t('auth.emailRequired'));
      return;
    }

    try {
      setError('');
      setMessage('');
      setLoading(true);
      
      const { error } = await resetPassword(email);
      
      if (error) throw error;
      
      setMessage(t('auth.resetPasswordEmailSent'));
    } catch (error) {
      console.error('Password reset error:', error);
      setError(error.message || t('auth.failedToResetPassword'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
      }}
    >
      <Typography component="h2" variant="h5" align="center" gutterBottom>
        {t('auth.resetPassword')}
      </Typography>
      
      <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 2 }}>
        {t('auth.enterEmailToResetPassword')}
      </Typography>
      
      {error && (
        <Alert severity="error" onClose={() => setError('')} sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}
      
      {message && (
        <Alert severity="success" sx={{ mt: 2 }}>
          {message}
        </Alert>
      )}
      
      <TextField
        label={t('auth.email')}
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        fullWidth
        margin="normal"
        autoComplete="email"
        autoFocus
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <EmailIcon color="action" />
            </InputAdornment>
          ),
        }}
      />
      
      <Button
        type="submit"
        fullWidth
        variant="contained"
        color="primary"
        size="large"
        disabled={loading}
        sx={{ mt: 2 }}
      >
        {loading ? (
          <CircularProgress size={24} color="inherit" />
        ) : (
          t('auth.sendResetLink')
        )}
      </Button>
      
      <Box sx={{ textAlign: 'center', mt: 2 }}>
        <Link 
          component={RouterLink} 
          to="/login" 
          variant="body2"
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            textDecoration: 'none',
          }}
        >
          <ArrowBackIcon fontSize="small" sx={{ mr: 0.5 }} />
          {t('auth.backToSignIn')}
        </Link>
      </Box>
    </Box>
  );
};

export default ForgotPassword;
