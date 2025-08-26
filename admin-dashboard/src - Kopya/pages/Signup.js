import React, { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Button,
  TextField,
  Typography,
  Link,
  Alert,
  Divider,
  InputAdornment,
  IconButton,
  FormControlLabel,
  Checkbox,
  Grid,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Person as PersonIcon,
  Email as EmailIcon,
  Lock as LockIcon,
  Phone as PhoneIcon,
} from '@mui/icons-material';
import { useSupabase } from '../contexts/SupabaseContext';

const Signup = () => {
  const { t } = useTranslation();
  const supabaseCtx = useSupabase();
console.log('Signup/Register useSupabase:', supabaseCtx);
const { signUp } = supabaseCtx;
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false,
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const { fullName, email, password, confirmPassword, acceptTerms } = formData;
    
    // Form validation
    if (!fullName || !email || !password || !confirmPassword) {
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
    
    if (!acceptTerms) {
      setError(t('auth.mustAcceptTerms'));
      return;
    }

    try {
      setError('');
      setLoading(true);
      
      const { error } = await signUp(email, password, { 
        fullName,
        phone: formData.phone 
      });
      
      if (error) throw error;
      
      // Redirect to verification page or dashboard
      navigate('/verify-email', { 
        state: { email }, 
        replace: true 
      });
      
    } catch (error) {
      console.error('Signup error:', error);
      setError(error.message || t('auth.signupFailed'));
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
        {t('auth.createAccount')}
      </Typography>
      
      {error && (
        <Alert severity="error" onClose={() => setError('')}>
          {error}
        </Alert>
      )}
      
      <TextField
        label={t('auth.fullName')}
        name="fullName"
        value={formData.fullName}
        onChange={handleChange}
        required
        fullWidth
        margin="normal"
        autoComplete="name"
        autoFocus
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <PersonIcon color="action" />
            </InputAdornment>
          ),
        }}
      />
      
      <TextField
        label={t('auth.email')}
        type="email"
        name="email"
        value={formData.email}
        onChange={handleChange}
        required
        fullWidth
        margin="normal"
        autoComplete="email"
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <EmailIcon color="action" />
            </InputAdornment>
          ),
        }}
      />
      
      <TextField
        label={t('auth.phone')}
        type="tel"
        name="phone"
        value={formData.phone}
        onChange={handleChange}
        fullWidth
        margin="normal"
        autoComplete="tel"
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <PhoneIcon color="action" />
            </InputAdornment>
          ),
        }}
      />
      
      <TextField
        label={t('auth.password')}
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
        label={t('auth.confirmPassword')}
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
      
      <FormControlLabel
        control={
          <Checkbox
            name="acceptTerms"
            checked={formData.acceptTerms}
            onChange={handleChange}
            color="primary"
          />
        }
        label={
          <Typography variant="body2">
            {t('auth.iAgreeTo')}{' '}
            <Link component={RouterLink} to="/terms" color="primary">
              {t('auth.termsOfService')}
            </Link>{' '}
            {t('common.and')}{' '}
            <Link component={RouterLink} to="/privacy" color="primary">
              {t('auth.privacyPolicy')}
            </Link>
          </Typography>
        }
        sx={{ mt: 1, mb: 2 }}
      />
      
      <Button
        type="submit"
        fullWidth
        variant="contained"
        color="primary"
        size="large"
        disabled={loading}
      >
        {loading ? t('common.loading') : t('auth.signUp')}
      </Button>
      
      <Divider sx={{ my: 2 }} />
      
      <Grid container justifyContent="center">
        <Grid item>
          <Typography variant="body2" color="text.secondary">
            {t('auth.alreadyHaveAnAccount')}{' '}
            <Link component={RouterLink} to="/login" variant="body2">
              {t('auth.signIn')}
            </Link>
          </Typography>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Signup;
