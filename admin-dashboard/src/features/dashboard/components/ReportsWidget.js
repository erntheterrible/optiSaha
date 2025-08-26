import React from 'react';
import { Box, Typography, List, ListItem, ListItemText, Divider, Chip } from '@mui/material';
import ChartCard from './ChartCard';

const ReportsWidget = ({ title, reports, height = 300 }) => {
  if (!reports || reports.length === 0) {
    return (
      <ChartCard title={title} height={height}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
          <Typography color="text.secondary">No reports available</Typography>
        </Box>
      </ChartCard>
    );
  }

  return (
    <ChartCard title={title} height={height}>
      <List sx={{ overflow: 'auto', maxHeight: '100%' }}>
        {reports.map((report, index) => (
          <React.Fragment key={report.id}>
            <ListItem alignItems="flex-start">
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                      {report.title}
                    </Typography>
                    <Chip 
                      label={report.status} 
                      size="small" 
                      color={
                        report.status === 'Completed' ? 'success' : 
                        report.status === 'In Progress' ? 'warning' : 
                        'default'
                      }
                    />
                  </Box>
                }
                secondary={
                  <React.Fragment>
                    <Typography
                      sx={{ display: 'inline' }}
                      component="span"
                      variant="body2"
                      color="text.primary"
                    >
                      {report.date}
                    </Typography>
                    {" — " + report.description}
                  </React.Fragment>
                }
              />
            </ListItem>
            {index < reports.length - 1 && <Divider component="li" />}
          </React.Fragment>
        ))}
      </List>
    </ChartCard>
  );
};

export default ReportsWidget;
