import React from 'react';
import { Box, Typography, IconButton, Card, CircularProgress } from '@mui/material';
import { MoreVert as MoreVertIcon } from '@mui/icons-material';

const ChartCard = ({ 
  title, 
  children, 
  action = null, 
  loading = false,
  height = 300,
  sx = {}
}) => {
  return (
    <Card 
      elevation={0}
      sx={{
        p: 0,
        borderRadius: 2.5,
        border: (theme) => `1px solid ${theme.palette.divider}`,
        backgroundColor: 'background.paper',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        ...sx,
      }}
    >
      <Box 
        sx={{ 
          p: 2.5, 
          pb: 0, 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center' 
        }}
      >
        <Typography variant="h6" fontWeight={600}>
          {title}
        </Typography>
        <Box>
          {action}
          <IconButton size="small" sx={{ ml: 1 }}>
            <MoreVertIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>
      
      <Box 
        sx={{ 
          p: 2.5, 
          pt: 2, 
          flex: 1,
          minHeight: height,
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {loading ? (
          <Box 
            sx={{ 
              flex: 1, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center' 
            }}
          >
            <CircularProgress size={24} />
          </Box>
        ) : (
          <Box sx={{ flex: 1 }}>
            {children}
          </Box>
        )}
      </Box>
    </Card>
  );
};

export default ChartCard;
