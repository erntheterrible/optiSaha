import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
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
  useMediaQuery,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Google as GoogleIcon,
  Facebook as FacebookIcon,
  GitHub as GitHubIcon,
  CheckCircle as CheckCircleIcon,
  Lock as LockIcon,
  Person as PersonIcon,
  Dashboard as DashboardIcon,
  Storage as StorageIcon,
  Map as MapIcon
} from '@mui/icons-material';
import { useSupabase } from '../contexts/SupabaseContext';
import { useSnackbar } from 'notistack';


const Login = () => {
  const { t } = useTranslation();
  const { signIn, signInWithProvider } = useSupabase();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { error } = await signIn(email, password);
      if (error) throw error;
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Failed to sign in');
      enqueueSnackbar(t('login.error'), { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider) => {
    try {
      setError('');
      setLoading(true);
      const { error } = await signInWithProvider(provider);
      if (error) throw error;
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Failed to sign in with provider');
      enqueueSnackbar(t('login.socialError'), { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Features for the branding panel
  const features = [
    {
      icon: <DashboardIcon color="inherit" sx={{ fontSize: 28, color: '#fff' }} />,
      label: t('features.dashboard', 'Real-time Dashboard & Analytics')
    },
    {
      icon: <MapIcon color="inherit" sx={{ fontSize: 28, color: '#fff' }} />,
      label: t('features.mapping', 'Field Mapping & Visualization')
    },
    {
      icon: <StorageIcon color="inherit" sx={{ fontSize: 28, color: '#fff' }} />,
      label: t('features.data', 'Secure Cloud Data Storage')
    },
    {
      icon: <CheckCircleIcon color="inherit" sx={{ fontSize: 28, color: '#fff' }} />,
      label: t('features.tasks', 'Task Management & Automation')
    }
  ];

  return (
    <Box sx={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: isMobile ? 'column' : 'row',
      bgcolor: isMobile ? '#fff' : 'background.default',
    }}>
      {/* Left: Login Form */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          p: { xs: 2, md: 8 },
          bgcolor: '#fff',
          minHeight: isMobile ? 'auto' : '100vh',
        }}
      >
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'center' }}>
          <img src="/assets/logo.png" alt="OptiSaha" style={{ height: 56, objectFit: 'contain' }} />
        </Box>
        <Paper elevation={3} sx={{ width: '100%', maxWidth: 400, p: { xs: 3, md: 4 }, borderRadius: 3 }}>
          <Typography component="h2" variant="h5" align="center" fontWeight={700} sx={{ mb: 1 }}>
            {t('auth.signInToAccount', 'Sign in to your account')}
          </Typography>
          <Typography variant="body2" align="center" color="text.secondary" sx={{ mb: 3 }}>
            {t('auth.welcomeBackPrompt', 'Welcome back! Please enter your details.')}
          </Typography>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>
          )}
          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label={t('auth.email', 'Email')}
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
                    <PersonIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              label={t('auth.password', 'Password')}
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              fullWidth
              margin="normal"
              autoComplete="current-password"
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
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
              <FormControlLabel
                control={<Checkbox checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} color="primary" />}
                label={t('auth.rememberMe', 'Remember me')}
              />
              <MuiLink component={Link} to="/forgot-password" variant="body2" sx={{ textDecoration: 'none' }}>
                {t('auth.forgotPassword', 'Forgot password?')}
              </MuiLink>
            </Box>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              size="large"
              disabled={loading}
              sx={{ mt: 2, mb: 2, borderRadius: 2, fontWeight: 700, fontSize: 18 }}
            >
              {loading ? t('common.loading', 'Signing in...') : t('auth.signIn', 'Sign In')}
            </Button>
          </Box>
          <Divider sx={{ my: 2 }}>
            <Typography variant="body2" color="text.secondary">{t('common.orContinueWith', 'Or continue with')}</Typography>
          </Divider>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', width: '100%', mb: 2 }}>
            <IconButton onClick={() => handleSocialLogin('google')} color="primary" disabled={loading} sx={{ border: '1px solid', borderColor: 'divider', '&:hover': { bgcolor: 'action.hover' } }}>
              <GoogleIcon />
            </IconButton>
            <IconButton onClick={() => handleSocialLogin('facebook')} color="primary" disabled={loading} sx={{ border: '1px solid', borderColor: 'divider', '&:hover': { bgcolor: 'action.hover' } }}>
              <FacebookIcon />
            </IconButton>
            <IconButton onClick={() => handleSocialLogin('github')} color="primary" disabled={loading} sx={{ border: '1px solid', borderColor: 'divider', '&:hover': { bgcolor: 'action.hover' } }}>
              <GitHubIcon />
            </IconButton>
          </Box>
          <Button
  fullWidth
  variant="outlined"
  color="primary"
  size="large"
  sx={{ mt: 1, borderRadius: 2, fontWeight: 700, fontSize: 18 }}
  component={Link}
  to="/register"
>
  {t('auth.register', 'Register')}
</Button>
        </Paper>
      </Box>
      {/* Right: Branding Panel */}
      {!isMobile && (
        <Box
          sx={{
            flex: 1.1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            color: '#fff',
            p: 8,
            background: 'linear-gradient(120deg, #ff512f 0%, #dd2476 100%)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <Box sx={{ mb: 4 }}>
            <img src="/assets/logo.png" alt="OptiSaha" style={{ height: 64, filter: 'brightness(0) invert(1)' }} />
          </Box>
          <Typography variant="h3" fontWeight={800} sx={{ mb: 2, letterSpacing: 1, textShadow: '0 2px 12px #0003' }}>
            {t('app.brand', 'OptiSaha')}
          </Typography>
          <Typography variant="h5" sx={{ mb: 4, opacity: 0.95, maxWidth: 460, textAlign: 'center' }}>
            {t('app.slogan', 'Modern Field Management Experience')}
          </Typography>
          <Typography variant="body1" sx={{ mb: 4, opacity: 0.85, maxWidth: 480, textAlign: 'center', fontSize: 18 }}>
            {t('app.description', 'OptiSaha helps you manage your field operations, teams, and data with powerful analytics, mapping, and automation tools—all in one place.')}
          </Typography>
          <List sx={{ width: '100%', maxWidth: 420, color: '#fff', mb: 4 }}>
            {features.map((feature, idx) => (
              <ListItem key={idx} sx={{ py: 1, px: 0 }}>
                <ListItemIcon sx={{ color: '#fff', minWidth: 40 }}>
                  {feature.icon}
                </ListItemIcon>
                <ListItemText primary={feature.label} primaryTypographyProps={{ fontWeight: 600, fontSize: 17 }} />
              </ListItem>
            ))}
          </List>
          <Box sx={{ mt: 6, opacity: 0.5, fontSize: 14 }}>
            &copy; {new Date().getFullYear()} OptiSaha. All rights reserved.
          </Box>
        </Box>
      )}
    </Box>
  );
};



export default Login;

