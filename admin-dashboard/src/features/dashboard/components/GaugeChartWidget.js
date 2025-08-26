import React from 'react';
import { Box, Typography } from '@mui/material';
import { RadialBarChart, RadialBar, ResponsiveContainer, PolarAngleAxis } from 'recharts';
import ChartCard from './ChartCard';

const GaugeChartWidget = ({ title, value, target, height = 300 }) => {
  const percentage = target > 0 ? Math.min(100, Math.round((value / target) * 100)) : 0;
  
  const data = [
    { name: 'Achieved', value: percentage, fill: percentage >= 90 ? '#00C49F' : percentage >= 70 ? '#FFBB28' : '#FF8042' },
    { name: 'Remaining', value: 100 - percentage, fill: '#e0e0e0' }
  ];

  return (
    <ChartCard title={title} height={height}>
      <ResponsiveContainer width="100%" height="100%">
        <RadialBarChart 
          innerRadius="20%" 
          outerRadius="100%" 
          barSize={10} 
          data={data}
          startAngle={180} 
          endAngle={0}
        >
          <PolarAngleAxis 
            type="number" 
            domain={[0, 100]} 
            angleAxisId={0} 
            tick={false} 
          />
          <RadialBar
            background
            dataKey="value"
            cornerRadius={10}
          />
          <text 
            x="50%" 
            y="50%" 
            textAnchor="middle" 
            dominantBaseline="middle" 
            className="progress-label"
            style={{ fontSize: '24px', fontWeight: 'bold' }}
          >
            {`${percentage}%`}
          </text>
          <text 
            x="50%" 
            y="70%" 
            textAnchor="middle" 
            dominantBaseline="middle" 
            className="value-label"
            style={{ fontSize: '14px', color: '#666' }}
          >
            {`${value} / ${target}`}
          </text>
        </RadialBarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
};

export default GaugeChartWidget;
