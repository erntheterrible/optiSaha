import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Alert,
  Divider,
  IconButton,
  InputAdornment,
  FormControlLabel,
  Checkbox,
  Link as MuiLink,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Person as PersonIcon,
  Lock as LockIcon,
  Email as EmailIcon
} from '@mui/icons-material';
import { useSupabase } from '../contexts/SupabaseContext';
import { supabase } from '../lib/supabaseClient';
import { useSnackbar } from 'notistack';

const Register = () => {
  const { t } = useTranslation();
  const supabaseCtx = useSupabase();
console.log('Register useSupabase:', supabaseCtx);
const { signUp } = supabaseCtx;
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!acceptTerms) {
      setError(t('register.acceptTermsError', 'You must accept the terms and conditions.'));
      return;
    }
    if (password !== confirmPassword) {
      setError(t('register.passwordMismatch', 'Passwords do not match.'));
      return;
    }
    setLoading(true);
    try {
      const { error } = await signUp(email, password, { fullName });
      if (error) throw error;
      // Fetch the newly created user from Supabase Auth
      const { data: userData, error: userError } = await supabaseCtx.getCurrentUser();
      if (userError || !userData?.id) {
        setError(t('register.error', 'Failed to fetch user information after registration.'));
        enqueueSnackbar(t('register.error', 'Failed to fetch user information after registration.'), { variant: 'error' });
        return;
      }
      // Insert new user into users table
      // Use the supabase client imported at the top
      const { data: insertData, error: dbError } = await supabase
        .from('users')
        .insert([
          {
            id: userData.id,
            email: userData.email,
            username: fullName,
            full_name: fullName,
            // add other fields as needed
          }
        ]);
      console.log('Insert result:', insertData, dbError);
      if (dbError) {
        setError(t('register.error', 'Failed to save user profile.'));
        enqueueSnackbar(t('register.error', 'Failed to save user profile.'), { variant: 'error' });
        return;
      }
      enqueueSnackbar(t('register.success', 'Registration successful! Please check your email to verify your account.'), { variant: 'success' });
      navigate('/login');
    } catch (err) {
      setError(err.message || t('register.error', 'Failed to register.'));
      enqueueSnackbar(t('register.error', 'Failed to register.'), { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      bgcolor: '#fff',
      p: { xs: 2, md: 8 },
    }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'center' }}>
        <img src="/assets/logo.png" alt="OptiSaha" style={{ height: 56, objectFit: 'contain' }} />
      </Box>
      <Paper elevation={3} sx={{ width: '100%', maxWidth: 420, p: { xs: 3, md: 4 }, borderRadius: 3 }}>
        <Typography component="h2" variant="h5" align="center" fontWeight={700} sx={{ mb: 1 }}>
          {t('register.title', 'Create your account')}
        </Typography>
        <Typography variant="body2" align="center" color="text.secondary" sx={{ mb: 3 }}>
          {t('register.prompt', 'Fill out the form to get started.')}
        </Typography>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>
        )}
        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label={t('register.fullName', 'Full Name')}
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            fullWidth
            margin="normal"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PersonIcon color="action" />
                </InputAdornment>
              ),
            }}
          />
          <TextField
            label={t('register.email', 'Email')}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            fullWidth
            margin="normal"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <EmailIcon color="action" />
                </InputAdornment>
              ),
            }}
          />
          <TextField
            label={t('register.password', 'Password')}
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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
            label={t('register.confirmPassword', 'Confirm Password')}
            type={showConfirmPassword ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
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
                    aria-label="toggle confirm password visibility"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    edge="end"
                  >
                    {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <FormControlLabel
            control={<Checkbox checked={acceptTerms} onChange={(e) => setAcceptTerms(e.target.checked)} color="primary" />}
            label={t('register.acceptTerms', 'I accept the Terms and Conditions')}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            size="large"
            disabled={loading}
            sx={{ mt: 2, mb: 2, borderRadius: 2, fontWeight: 700, fontSize: 18 }}
          >
            {loading ? t('common.loading', 'Registering...') : t('register.button', 'Register')}
          </Button>
        </Box>
        <Divider sx={{ my: 2 }} />
        <Box sx={{ textAlign: 'center', mt: 2 }}>
          <Typography variant="body2" color="text.secondary">
            {t('register.haveAccount', 'Already have an account?')}{' '}
            <MuiLink component={Link} to="/login" variant="body2" sx={{ textDecoration: 'none', fontWeight: 600, color: 'primary.main' }}>
              {t('auth.signIn', 'Sign In')}
            </MuiLink>
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default Register;
