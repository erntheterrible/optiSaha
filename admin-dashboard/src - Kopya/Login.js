import React from 'react';
import { Box, Card, CardContent, Typography, TextField, Button, InputAdornment, IconButton, Alert, useTheme } from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import PersonIcon from '@mui/icons-material/Person';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { useNavigate } from 'react-router-dom';
import { authAPI } from './api';

const Login = ({ onLogin }) => {
  const theme = useTheme();
  const isLight = theme.palette.mode === 'light';
  const [showPassword, setShowPassword] = React.useState(false);
  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const navigate = useNavigate();

  const handleShowPassword = () => setShowPassword((show) => !show);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await authAPI.login(username, password);
      if (response.data && response.data.access_token) {
        localStorage.setItem('token', response.data.access_token);
        setLoading(false);
        onLogin();
        navigate('/');
      } else {
        setError('Beklenmeyen sunucu yanıtı.');
        setLoading(false);
      }
    } catch (err) {
      setError('Kullanıcı adı veya şifre hatalı.');
      setLoading(false);
    }
  };

  return (
    <Box sx={{ 
      minHeight: '100vh',
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden',
      backgroundColor: isLight ? '#F9FAFB' : '#0F172A',
      backgroundImage: isLight 
        ? 'radial-gradient(circle at 10% 20%, rgba(248, 250, 252, 0.9) 0%, rgba(241, 245, 249, 0.8) 100%)'
        : 'radial-gradient(circle at 10% 20%, rgba(15, 23, 42, 0.9) 0%, rgba(2, 6, 23, 0.95) 100%)',
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '50vh',
        background: isLight 
          ? 'linear-gradient(135deg, rgba(37, 99, 235, 0.1) 0%, rgba(124, 58, 237, 0.1) 100%)' 
          : 'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(139, 92, 246, 0.15) 100%)',
        borderBottomLeftRadius: '50% 20%',
        borderBottomRightRadius: '50% 20%',
        zIndex: 0
      }
    }}>
      {/* Decorative elements */}
      <Box sx={{
        position: 'absolute',
        top: '10%',
        left: '10%',
        width: '200px',
        height: '200px',
        borderRadius: '50%',
        background: isLight 
          ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(37, 99, 235, 0.1) 100%)' 
          : 'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(37, 99, 235, 0.15) 100%)',
        filter: 'blur(40px)',
        zIndex: 0
      }} />
      <Box sx={{
        position: 'absolute',
        bottom: '10%',
        right: '10%',
        width: '300px',
        height: '300px',
        borderRadius: '50%',
        background: isLight 
          ? 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(124, 58, 237, 0.1) 100%)' 
          : 'linear-gradient(135deg, rgba(167, 139, 250, 0.15) 0%, rgba(139, 92, 246, 0.15) 100%)',
        filter: 'blur(40px)',
        zIndex: 0
      }} />
      
      <Card sx={{ 
        width: '100%',
        maxWidth: 440, 
        bgcolor: isLight ? 'rgba(255, 255, 255, 0.9)' : 'rgba(30, 41, 59, 0.9)',
        backdropFilter: 'blur(20px)',
        boxShadow: isLight 
          ? '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
          : '0 10px 25px -5px rgba(0, 0, 0, 0.25), 0 10px 10px -5px rgba(0, 0, 0, 0.1)',
        borderRadius: 3,
        border: isLight 
          ? '1px solid rgba(203, 213, 225, 0.3)' 
          : '1px solid rgba(51, 65, 85, 0.5)',
        overflow: 'hidden',
        position: 'relative',
        zIndex: 1,
        mx: 2
      }}>
        <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            mb: 4 
          }}>
            {/* Logo */}
            <Box sx={{ 
              width: 80, 
              height: 80, 
              mb: 3,
              '& img': {
                width: '100%',
                height: '100%',
                objectFit: 'contain'
              }
            }}>
              <img 
                src={
                  isLight 
                    ? "/assets/logo.png" 
                    : "/assets/logo-dark.png"
                } 
                alt="OptiSaha Logo" 
              />
            </Box>
            
            <Typography 
              variant="h4" 
              sx={{ 
                color: isLight ? '#111827' : '#F8FAFC', 
                fontWeight: 700, 
                mb: 1,
                textAlign: 'center',
                lineHeight: 1.2
              }}
            >
              OptiSaha
              <Box component="span" sx={{ display: 'block', fontSize: '1.25rem', color: isLight ? '#4B5563' : '#E2E8F0', fontWeight: 500, mt: 0.5 }}>
                Yönetim Paneli
              </Box>
            </Typography>
            
            <Typography 
              variant="body1" 
              sx={{ 
                color: isLight ? '#4B5563' : '#94A3B8', 
                textAlign: 'center',
                mt: 1,
                maxWidth: '80%'
              }}
            >
              Lütfen hesap bilgilerinizle giriş yapın
            </Typography>
          </Box>
          {error && (
            <Alert 
              severity="error" 
              sx={{ 
                mb: 3, 
                borderRadius: 2,
                bgcolor: isLight ? '#FEF2F2' : '#462222',
                color: isLight ? '#B91C1C' : '#FCA5A5',
                '& .MuiAlert-icon': {
                  color: isLight ? '#DC2626' : '#F87171'
                }
              }}
            >
              {error}
            </Alert>
          )}
          
          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              margin="normal"
              variant="outlined"
              placeholder="Kullanıcı Adı"
              value={username}
              onChange={e => setUsername(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start" sx={{ color: isLight ? '#6B7280' : '#94A3B8' }}>
                    <PersonIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ 
                mb: 2,
                '& .MuiOutlinedInput-root': {
                  bgcolor: isLight ? 'rgba(241, 245, 249, 0.5)' : 'rgba(30, 41, 59, 0.5)',
                  borderRadius: 2,
                  border: 'none',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    bgcolor: isLight ? 'rgba(241, 245, 249, 0.8)' : 'rgba(30, 41, 59, 0.7)',
                  },
                  '&.Mui-focused': {
                    bgcolor: isLight ? 'white' : 'rgba(30, 41, 59, 0.8)',
                    boxShadow: isLight 
                      ? '0 0 0 3px rgba(59, 130, 246, 0.2)'
                      : '0 0 0 3px rgba(59, 130, 246, 0.3)',
                  },
                  '& fieldset': {
                    border: isLight 
                      ? '1px solid rgba(203, 213, 225, 0.5)' 
                      : '1px solid rgba(51, 65, 85, 0.5)',
                  },
                  '&:hover fieldset': {
                    borderColor: isLight ? '#94A3B8' : '#64748B',
                  },
                  '&.Mui-focused fieldset': {
                    border: `2px solid ${theme.palette.primary.main}`,
                  },
                },
                '& .MuiInputBase-input': {
                  color: isLight ? '#111827' : '#F8FAFC',
                  fontSize: '0.9375rem',
                  py: 1.75,
                  '&::placeholder': {
                    color: isLight ? '#94A3B8' : '#64748B',
                    opacity: 1,
                  },
                },
              }}
            />
            
            <TextField
              fullWidth
              margin="normal"
              variant="outlined"
              placeholder="Şifre"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start" sx={{ color: isLight ? '#6B7280' : '#94A3B8' }}>
                    <LockIcon />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton 
                      onClick={handleShowPassword} 
                      edge="end" 
                      tabIndex={-1}
                      sx={{ 
                        color: isLight ? '#6B7280' : '#94A3B8',
                        '&:hover': {
                          color: isLight ? '#4B5563' : '#E2E8F0',
                          backgroundColor: isLight ? 'rgba(0, 0, 0, 0.04)' : 'rgba(255, 255, 255, 0.08)'
                        }
                      }}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{ 
                mb: 3,
                '& .MuiOutlinedInput-root': {
                  bgcolor: isLight ? 'rgba(241, 245, 249, 0.5)' : 'rgba(30, 41, 59, 0.5)',
                  borderRadius: 2,
                  border: 'none',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    bgcolor: isLight ? 'rgba(241, 245, 249, 0.8)' : 'rgba(30, 41, 59, 0.7)',
                  },
                  '&.Mui-focused': {
                    bgcolor: isLight ? 'white' : 'rgba(30, 41, 59, 0.8)',
                    boxShadow: isLight 
                      ? '0 0 0 3px rgba(59, 130, 246, 0.2)'
                      : '0 0 0 3px rgba(59, 130, 246, 0.3)',
                  },
                  '& fieldset': {
                    border: isLight 
                      ? '1px solid rgba(203, 213, 225, 0.5)' 
                      : '1px solid rgba(51, 65, 85, 0.5)',
                  },
                  '&:hover fieldset': {
                    borderColor: isLight ? '#94A3B8' : '#64748B',
                  },
                  '&.Mui-focused fieldset': {
                    border: `2px solid ${theme.palette.primary.main}`,
                  },
                },
                '& .MuiInputBase-input': {
                  color: isLight ? '#111827' : '#F8FAFC',
                  fontSize: '0.9375rem',
                  py: 1.75,
                  '&::placeholder': {
                    color: isLight ? '#94A3B8' : '#64748B',
                    opacity: 1,
                  },
                },
              }}
            />
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              size="large"
              sx={{ 
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                color: 'white',
                fontWeight: 600,
                fontSize: '1rem',
                textTransform: 'none',
                letterSpacing: '0.01em',
                py: 1.5,
                borderRadius: 2,
                boxShadow: '0 8px 25px rgba(102, 126, 234, 0.3)',
                border: 'none',
                transition: 'all 0.2s ease',
                position: 'relative',
                overflow: 'hidden',
                '&:hover': { 
                  background: 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)',
                  boxShadow: '0 12px 35px rgba(102, 126, 234, 0.4)',
                  transform: 'translateY(-2px)',
                  '&::before': {
                    opacity: 0.1,
                  }
                },
                '&:active': {
                  transform: 'translateY(0)',
                  boxShadow: isLight 
                    ? '0 2px 4px -1px rgba(37, 99, 235, 0.2), 0 1px 2px 0 rgba(37, 99, 235, 0.1)'
                    : '0 2px 4px -1px rgba(0, 0, 0, 0.2), 0 1px 2px 0 rgba(0, 0, 0, 0.1)',
                },
                '&:disabled': {
                  background: isLight ? '#E2E8F0' : '#334155',
                  color: isLight ? '#94A3B8' : '#64748B',
                  boxShadow: 'none',
                  transform: 'none',
                },
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'white',
                  opacity: 0,
                  transition: 'opacity 0.3s ease',
                }
              }}
            >
              {loading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
            </Button>
            <Box sx={{ mt: 2, textAlign: 'right' }}>
              <Button variant="text" sx={{ color: '#A0A0A0', fontSize: 13, textTransform: 'none' }}>
                Şifremi Unuttum
              </Button>
            </Box>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Login; 