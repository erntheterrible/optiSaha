import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Typography,
  Container,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Paper,
  Skeleton,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  Visibility as VisibilityIcon,
  ShoppingCart as ShoppingCartIcon,
  Star as StarIcon
} from '@mui/icons-material';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { getDealsPerformanceSummary, getTopPerformingDeals, getDealAnalytics } from '../../services/dealsAnalyticsService';

const DealsAnalytics = () => {
  const { t } = useTranslation();
  
  const [summary, setSummary] = useState(null);
  const [topDeals, setTopDeals] = useState([]);
  const [analytics, setAnalytics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');
  
  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);
  
  const loadAnalytics = async () => {
    try {
      setLoading(true);
      
      // Load all analytics data in parallel
      const [summaryData, topDealsData, analyticsData] = await Promise.all([
        getDealsPerformanceSummary(),
        getTopPerformingDeals(5),
        getDealAnalytics(null, timeRange)
      ]);
      
      setSummary(summaryData);
      setTopDeals(topDealsData);
      setAnalytics(analyticsData);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Chart data configurations
  const summaryChartData = summary ? [
    { name: t('deals.totalClicks'), value: summary.totalClicks },
    { name: t('deals.totalConversions'), value: summary.totalConversions }
  ] : [];
  
  const performanceChartData = analytics.map(deal => ({
    name: deal.title.substring(0, 20) + (deal.title.length > 20 ? '...' : ''),
    clicks: deal.click_count || 0,
    conversions: deal.conversion_count || 0
  }));
  
  const conversionRateChartData = analytics.map(deal => ({
    name: deal.title.substring(0, 15) + (deal.title.length > 15 ? '...' : ''),
    conversionRate: parseFloat(deal.conversion_rate) || 0
  }));
  
  const topDealsChartData = topDeals.map(deal => ({
    name: deal.title.substring(0, 15) + (deal.title.length > 15 ? '...' : ''),
    value: deal.conversion_count || 0
  }));
  
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];
  
  return (
    <Container maxWidth={false} sx={{ py: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">{t('deals.analytics')}</Typography>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>{t('deals.timeRange')}</InputLabel>
          <Select
            value={timeRange}
            label={t('deals.timeRange')}
            onChange={(e) => setTimeRange(e.target.value)}
          >
            <MenuItem value="7d">{t('deals.last7Days')}</MenuItem>
            <MenuItem value="30d">{t('deals.last30Days')}</MenuItem>
            <MenuItem value="90d">{t('deals.last90Days')}</MenuItem>
          </Select>
        </FormControl>
      </Box>
      
      {loading ? (
        <Grid container spacing={3}>
          {[...Array(4)].map((_, index) => (
            <Grid item xs={12} md={6} lg={3} key={index}>
              <Card>
                <Skeleton variant="rectangular" height={150} />
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <>
          {/* Summary Cards */}
          <Grid container spacing={3} mb={4}>
            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" mb={1}>
                    <VisibilityIcon sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography color="textSecondary" gutterBottom>
                      {t('deals.totalClicks')}
                    </Typography>
                  </Box>
                  <Typography variant="h4">
                    {summary?.totalClicks || 0}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" mb={1}>
                    <ShoppingCartIcon sx={{ mr: 1, color: 'success.main' }} />
                    <Typography color="textSecondary" gutterBottom>
                      {t('deals.totalConversions')}
                    </Typography>
                  </Box>
                  <Typography variant="h4">
                    {summary?.totalConversions || 0}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" mb={1}>
                    <TrendingUpIcon sx={{ mr: 1, color: 'secondary.main' }} />
                    <Typography color="textSecondary" gutterBottom>
                      {t('deals.avgConversionRate')}
                    </Typography>
                  </Box>
                  <Typography variant="h4">
                    {summary?.avgConversionRate || 0}%
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" mb={1}>
                    <StarIcon sx={{ mr: 1, color: 'warning.main' }} />
                    <Typography color="textSecondary" gutterBottom>
                      {t('deals.activeDeals')}
                    </Typography>
                  </Box>
                  <Typography variant="h4">
                    {summary?.totalDeals || 0}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
          
          {/* Charts */}
          <Grid container spacing={3} mb={4}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardHeader title={t('deals.performanceOverview')} />
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                      data={performanceChartData}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="clicks" fill="#8884d8" name={t('deals.clicks')} />
                      <Bar dataKey="conversions" fill="#82ca9d" name={t('deals.conversions')} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Card>
                <CardHeader title={t('deals.conversionTrend')} />
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart
                      data={conversionRateChartData}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="conversionRate" 
                        stroke="#8884d8" 
                        activeDot={{ r: 8 }} 
                        name={t('deals.conversionRate')} 
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
          
          {/* Top Performing Deals and Summary Chart */}
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardHeader title={t('deals.topPerforming')} />
                <CardContent>
                  {topDeals.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart
                        data={topDealsChartData}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="value" fill="#8884d8" name={t('deals.conversions')} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <Alert severity="info">{t('deals.noTopDeals')}</Alert>
                  )}
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Card>
                <CardHeader title={t('deals.metricsSummary')} />
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={summaryChartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {summaryChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
          
          {/* Top Deals List */}
          <Card sx={{ mt: 4 }}>
            <CardHeader title={t('deals.topDealsList')} />
            <CardContent>
              <Grid container spacing={2}>
                {topDeals.map((deal, index) => (
                  <Grid item xs={12} key={deal.id}>
                    <Paper sx={{ p: 2 }}>
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Box>
                          <Typography variant="h6">
                            {index + 1}. {deal.title}
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                            <Chip 
                              label={`${deal.click_count || 0} ${t('deals.clicks')}`} 
                              size="small" 
                              color="primary" 
                              variant="outlined" 
                            />
                            <Chip 
                              label={`${deal.conversion_count || 0} ${t('deals.conversions')}`} 
                              size="small" 
                              color="success" 
                              variant="outlined" 
                            />
                            <Chip 
                              label={`${deal.conversion_rate || 0}% ${t('deals.conversionRate')}`} 
                              size="small" 
                              color="secondary" 
                              variant="outlined" 
                            />
                          </Box>
                        </Box>
                      </Box>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </>
      )}
    </Container>
  );
};

export default DealsAnalytics;
