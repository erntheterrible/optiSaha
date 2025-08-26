import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Button,
  TextField,
  Typography,
  Alert,
  InputAdornment,
  IconButton,
  CircularProgress,
} from '@mui/material';
import { 
  Lock as LockIcon, 
  Visibility, 
  VisibilityOff,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import { useSupabase } from '../contexts/SupabaseContext';

const UpdatePassword = () => {
  const { t } = useTranslation();
  const { updatePassword } = useSupabase();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [validLink, setValidLink] = useState(true);

  // Check if we have a valid password reset token in the URL
  useEffect(() => {
    const accessToken = searchParams.get('access_token');
    const tokenType = searchParams.get('token_type');
    const type = searchParams.get('type');
    
    if (type === 'recovery' && accessToken && tokenType === 'bearer') {
      // We have a valid password reset token
      setValidLink(true);
    } else {
      setValidLink(false);
      setError(t('auth.invalidOrExpiredLink'));
    }
  }, [searchParams, t]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const { password, confirmPassword } = formData;
    
    if (!password || !confirmPassword) {
      setError(t('auth.allFieldsRequired'));
      return;
    }
    
    if (password !== confirmPassword) {
      setError(t('auth.passwordsDontMatch'));
      return;
    }
    
    if (password.length < 8) {
      setError(t('auth.passwordTooShort'));
      return;
    }

    try {
      setError('');
      setMessage('');
      setLoading(true);
      
      const { error } = await updatePassword(password);
      
      if (error) throw error;
      
      setMessage(t('auth.passwordUpdatedSuccessfully'));
      
      // Redirect to login after a short delay
      setTimeout(() => {
        navigate('/login', { 
          state: { 
            message: t('auth.passwordUpdatedLogin') 
          },
          replace: true 
        });
      }, 2000);
      
    } catch (error) {
      console.error('Update password error:', error);
      setError(error.message || t('auth.failedToUpdatePassword'));
    } finally {
      setLoading(false);
    }
  };

  if (!validLink) {
    return (
      <Box
        sx={{
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 2,
          p: 2,
        }}
      >
        <Alert severity="error" sx={{ width: '100%', maxWidth: 500 }}>
          {error}
        </Alert>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/forgot-password')}
          sx={{ mt: 2 }}
        >
          {t('auth.backToForgotPassword')}
        </Button>
      </Box>
    );
  }

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
        {t('auth.setNewPassword')}
      </Typography>
      
      <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 2 }}>
        {t('auth.enterNewPasswordBelow')}
      </Typography>
      
      {error && (
        <Alert severity="error" onClose={() => setError('')}>
          {error}
        </Alert>
      )}
      
      {message && (
        <Alert severity="success">
          {message}
        </Alert>
      )}
      
      <TextField
        label={t('auth.newPassword')}
        type={showPassword ? 'text' : 'password'}
        name="password"
        value={formData.password}
        onChange={handleChange}
        required
        fullWidth
        margin="normal"
        autoComplete="new-password"
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <LockIcon color="action" />
            </InputAdornment>
          ),
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                aria-label="toggle password visibility"
                onClick={() => setShowPassword(!showPassword)}
                edge="end"
              >
                {showPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          ),
        }}
      />
      
      <TextField
        label={t('auth.confirmNewPassword')}
        type={showPassword ? 'text' : 'password'}
        name="confirmPassword"
        value={formData.confirmPassword}
        onChange={handleChange}
        required
        fullWidth
        margin="normal"
        autoComplete="new-password"
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <LockIcon color="action" />
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
          t('auth.updatePassword')
        )}
      </Button>
    </Box>
  );
};

export default UpdatePassword;
