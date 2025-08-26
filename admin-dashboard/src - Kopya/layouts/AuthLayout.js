import React from 'react';
import { Box, Container, CssBaseline, Paper, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';

const AuthLayout = ({ children }) => {
  const theme = useTheme();
  const { t } = useTranslation();
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        alignItems: 'stretch',
        background: 'linear-gradient(90deg, #f7fafd 60%, #ffe5e0 100%)',
      }}
    >
      {/* Left: Form Panel */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'white',
          boxShadow: { md: '0 6px 32px 0 rgba(60,60,120,0.12)' },
          borderRadius: { xs: 0, md: 4 },
          minWidth: { xs: '100%', md: 420 },
          maxWidth: 480,
          mx: { xs: 0, md: 8 },
          px: { xs: 3, md: 6 },
          py: { xs: 6, md: 8 },
        }}
      >
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'center' }}>
          <img src="/logo.svg" alt="OptiSaha" style={{ height: 48, objectFit: 'contain' }} />
        </Box>
        {children}
      </Box>
      {/* Right: Info Panel */}
      <Box
        sx={{
          flex: 2,
          display: { xs: 'none', md: 'flex' },
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #ffe5e0 0%, #f7fafd 100%)',
          borderTopRightRadius: 32,
          borderBottomRightRadius: 32,
          p: 8,
        }}
      >
        <Typography variant="h3" fontWeight={700} color="primary.main" gutterBottom sx={{ textShadow: '0 2px 12px #fff6' }}>
          OptiSaha
        </Typography>
        <Typography variant="h5" color="text.secondary" sx={{ mb: 4, maxWidth: 400, textAlign: 'center' }}>
          {t('auth.slogan', 'Saha yönetiminde yeni nesil deneyim!')}
        </Typography>
        <Box sx={{ mt: 2 }}>
          <img src="/illustration-login.svg" alt="Field Management" style={{ maxHeight: 240, maxWidth: 320 }} />
        </Box>
      </Box>
    </Box>
  );
};

export default AuthLayout;
