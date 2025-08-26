import React from 'react';
import { Box, Typography, CircularProgress, Stack } from '@mui/material';
import ChartCard from './ChartCard';

const RAGGaugeWidget = ({ title, value, target, height = 300 }) => {
  const percentage = target > 0 ? Math.min(100, Math.round((value / target) * 100)) : 0;
  
  // Determine color based on percentage
  let color = '#4CAF50'; // Green
  if (percentage < 70) color = '#FF9800'; // Amber
  if (percentage < 50) color = '#F44336'; // Red
  
  // Determine status text
  let status = 'Good';
  if (percentage < 70) status = 'Needs Attention';
  if (percentage < 50) status = 'Critical';
  
  return (
    <ChartCard title={title} height={height}>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
        <Box sx={{ position: 'relative', display: 'inline-flex' }}>
          <CircularProgress 
            variant="determinate" 
            value={100} 
            size={150} 
            thickness={4}
            sx={{ color: '#e0e0e0' }}
          />
          <CircularProgress
            variant="determinate"
            value={percentage}
            size={150}
            thickness={4}
            sx={{
              color: color,
              position: 'absolute',
              left: 0,
            }}
          />
          <Box
            sx={{
              top: 0,
              left: 0,
              bottom: 0,
              right: 0,
              position: 'absolute',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
              {`${percentage}%`}
            </Typography>
          </Box>
        </Box>
        <Stack spacing={1} sx={{ mt: 2, textAlign: 'center' }}>
          <Typography variant="h6" sx={{ color: color, fontWeight: 'bold' }}>
            {status}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {`${value} / ${target}`}
          </Typography>
        </Stack>
      </Box>
    </ChartCard>
  );
};

export default RAGGaugeWidget;
