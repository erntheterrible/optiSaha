import React from 'react';
import { Box, Typography, Skeleton, useTheme } from '@mui/material';
import { styled } from '@mui/material/styles';
import { ArrowUpward, ArrowDownward } from '@mui/icons-material';

const StatCard = ({ title, value, icon, color = 'primary', trend, trendValue, trendLabel, loading = false }) => {
  const theme = useTheme();
  const isPositive = trend === 'up' || trend >= 0;

  const colors = {
    primary: theme.palette.primary.main,
    secondary: theme.palette.secondary.main,
    success: theme.palette.success.main,
    warning: theme.palette.warning.main,
    error: theme.palette.error.main,
    info: theme.palette.info.main,
  };

  const StyledIcon = styled(Box)(({ theme }) => ({
    width: 56,
    height: 56,
    borderRadius: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 'auto',
    backgroundColor: `${colors[color]}10`,
    '& svg': {
      fontSize: 28,
      color: colors[color],
    },
  }));

  return (
    <Box
      sx={{
        p: 3,
        height: '100%',
        borderRadius: 2.5,
        backgroundColor: theme.palette.background.paper,
        border: `1px solid ${theme.palette.divider}`,
        transition: 'all 0.3s ease',
        boxShadow: '0 4px 20px 0 rgba(0,0,0,0.02)',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: theme.shadows[10],
          borderColor: theme.palette.primary.light,
        },
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="subtitle1"
              color="text.secondary"
              sx={{ 
                mb: 1, 
                fontWeight: 500,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}
            >
              {title}
            </Typography>
            {loading ? (
              <Skeleton variant="text" width={100} height={40} />
            ) : (
              <Typography variant="h4" fontWeight={700} sx={{ lineHeight: 1.2 }}>
                {value}
              </Typography>
            )}
          </Box>
          <StyledIcon>{icon}</StyledIcon>
        </Box>
        
        {trend !== undefined && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              mt: 'auto',
              pt: 1,
              color: isPositive ? 'success.main' : 'error.main',
            }}
          >
            {isPositive ? (
              <ArrowUpward fontSize="small" sx={{ mr: 0.5 }} />
            ) : (
              <ArrowDownward fontSize="small" sx={{ mr: 0.5 }} />
            )}
            <Typography variant="body2" fontWeight={500}>
              {Math.abs(trendValue)}%
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
              {trendLabel}
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default StatCard;
