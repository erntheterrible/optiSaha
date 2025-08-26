import React from 'react';
import { Box, Typography } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import ChartCard from './ChartCard';

const ColumnChartWidget = ({ title, data, dataKey, nameKey, height = 300 }) => {
  if (!data || data.length === 0) {
    return (
      <ChartCard title={title} height={height}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
          <Typography color="text.secondary">No data available</Typography>
        </Box>
      </ChartCard>
    );
  }

  return (
    <ChartCard title={title} height={height}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey={nameKey} />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey={dataKey} fill="#8884d8" name={title} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
};

export default ColumnChartWidget;
