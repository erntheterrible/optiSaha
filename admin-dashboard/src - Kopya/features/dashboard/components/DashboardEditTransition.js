import React from 'react';
import { Fade, Box } from '@mui/material';

/**
 * Wrapper for animated transitions when toggling edit mode.
 * Usage: <DashboardEditTransition in={editMode}><YourContent /></DashboardEditTransition>
 */
const DashboardEditTransition = ({ in: inProp, children, duration = 400, ...rest }) => (
  <Fade in={inProp} timeout={duration} {...rest}>
    <Box sx={{ width: '100%', height: '100%' }}>
      {children}
    </Box>
  </Fade>
);

export default DashboardEditTransition;
