import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import analyticsService from '../../services/analyticsService';
import { useNavigate } from 'react-router-dom';
import { useSupabase } from '../../contexts/SupabaseContext';
import { supabase } from '../../lib/supabaseClient';
import { 
  Box, 
  Typography, 
  useTheme, 
  IconButton, 
  Button,
  Card,
  Alert,
  Snackbar,
} from '@mui/material';
import { 
  ResponsiveContainer, 
  AreaChart, 
  BarChart, 
  PieChart,
  Pie,
  Cell,
  RadialBarChart,
  RadialBar,
  CartesianGrid, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  Area, 
  Bar, 
} from 'recharts';
import { Responsive, WidthProvider } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { Icon } from '@iconify/react';
import WidgetSelectDialog from './components/WidgetSelectDialog';
import dashboardService from '../../services/dashboardService';
import { 
  BarChart as BarChartIcon,
  ShoppingBag as ShoppingBagIcon,
  Description as DescriptionIcon,
} from '@mui/icons-material';

const ResponsiveGridLayout = WidthProvider(Responsive);

const KpiWidget = ({ title, value, icon, color }) => (
  <Box sx={{ textAlign: 'center', p: 2, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
    {icon}
    <Typography variant="h4" sx={{ color, fontWeight: 'bold', mt: 1 }}>{value}</Typography>
    <Typography variant="body1" color="text.secondary">{title}</Typography>
  </Box>
);

const PlaceholderWidget = ({ name }) => (
  <Box sx={{ p: 2, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', color: 'text.secondary' }}>
    <Icon icon="mdi:chart-box-outline" width={40} />
    <Typography variant="h6" sx={{ mt: 1 }}>{name}</Typography>
  </Box>
);

const getChartColors = (theme) => ({
  primary: theme.palette.primary.main,
  secondary: theme.palette.secondary.main,
  success: theme.palette.success.main,
  warning: theme.palette.warning.main,
  error: theme.palette.error.main,
  info: theme.palette.info.main,
});

const DashboardHome = () => {
  const { t } = useTranslation();
  const { user: currentUser } = useSupabase();
  const theme = useTheme();
  const colors = useMemo(() => getChartColors(theme), [theme]);
  const navigate = useNavigate();

  const [dashboardData, setDashboardData] = useState({ stats: {}, sales: [], activity: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [layoutDirty, setLayoutDirty] = useState(false);
  const [layouts, setLayouts] = useState({});
  const [addWidgetDialogOpen, setAddWidgetDialogOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [kpis, sales, activity, projectTypeDistribution, monthlyPerformance, targetMetrics, deviceDistribution] = await Promise.all([
          dashboardService.getKPIs(),
          analyticsService.getSalesTrends(12),
          analyticsService.getTeamPerformance(),
          analyticsService.getProjectTypeDistribution(),
          analyticsService.getMonthlyPerformance(),
          analyticsService.getTargetMetrics(),
          analyticsService.getDeviceDistribution(),
        ]);
        setDashboardData({ 
          stats: kpis || {}, 
          sales: sales || [], 
          activity: activity || [],
          projectTypeDistribution: projectTypeDistribution || [],
          monthlyPerformance: monthlyPerformance || [],
          targetMetrics: targetMetrics || {},
          deviceDistribution: deviceDistribution || [],
        });
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
        setError(t('dashboard.errors.loadFailed'));
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [t]);

  useEffect(() => {
    async function fetchUserLayout() {
      if (!currentUser) return;
      const userId = currentUser.id;
      const role = currentUser.user_metadata?.role || 'user';
      try {
        const userLayout = await dashboardService.getDashboardLayout(userId, role);
        if (userLayout && Object.keys(userLayout).length > 0 && userLayout.lg?.length > 0) {
          setLayouts(userLayout);
        } else {
          // Load a default layout if none exists
          setLayouts({
            lg: [
              { i: 'kpi-total-sales', x: 0, y: 0, w: 3, h: 1 },
              { i: 'kpi-total-projects', x: 3, y: 0, w: 3, h: 1 },
              { i: 'kpi-total-visits', x: 6, y: 0, w: 3, h: 1 },
              { i: 'kpi-success-rate', x: 9, y: 0, w: 3, h: 1 },
              { i: 'chart-comparison', x: 0, y: 1, w: 12, h: 3 },
            ]
          });
        }
      } catch (e) {
        console.error('Failed to load dashboard layout:', e);
      }
    }
    fetchUserLayout();
  }, [currentUser]);

  const onLayoutChange = (layout, newLayouts) => {
    setLayouts(newLayouts);
    setLayoutDirty(true);
  };

  const handleRemoveWidget = (keyToRemove) => {
    const newLayouts = {};
    for (const breakpoint in layouts) {
      newLayouts[breakpoint] = layouts[breakpoint].filter(widget => widget.i !== keyToRemove);
    }
    setLayouts(newLayouts);
  };

  const handleAddWidgets = (selectedKeys) => {
    const newWidgets = selectedKeys.map((key, index) => ({
      i: `${key}-${Date.now()}-${index}`,
      x: (layouts.lg.length * 3) % 12,
      y: Infinity, // This will cause the widget to be placed at the bottom
      w: 3,
      h: 1,
    }));
    const newLayouts = { ...layouts, lg: [...(layouts.lg || []), ...newWidgets] };
    setLayouts(newLayouts);
    setLayoutDirty(true);
    setAddWidgetDialogOpen(false);
  };

  // Persist layout when edit mode exits
  useEffect(() => {
    if (!editMode && layoutDirty && currentUser) {
      const userId = currentUser.id;
      const role = currentUser.user_metadata?.role || 'user';
      (async () => {
        try {
          await dashboardService.saveDashboardLayout(userId, role, layouts);
          setLayoutDirty(false);
        } catch (e) {
          console.error('Failed to save dashboard layout:', e);
        }
      })();
    }
  }, [editMode, layoutDirty, currentUser, layouts]);

  const widgetMap = useMemo(() => ({
    'kpi-total-sales': <KpiWidget title={t('dashboard.stats.totalSales', 'Total Sales')} value={dashboardData.stats.totalSales || '...'} icon={<ShoppingBagIcon sx={{ fontSize: 40, color: colors.primary }} />} />,
    'kpi-total-projects': <KpiWidget title={t('dashboard.stats.totalProjects', 'Total Projects')} value={dashboardData.stats.totalProjects || '...'} icon={<DescriptionIcon sx={{ fontSize: 40, color: colors.secondary }} />} />,
    'kpi-total-visits': <KpiWidget title={t('dashboard.stats.totalVisits', 'Total Visits')} value={dashboardData.stats.totalVisits || '...'} icon={<BarChartIcon sx={{ fontSize: 40, color: colors.success }} />} />,
    'kpi-avg-cost': <KpiWidget title={t('dashboard.stats.avgProjectCost', 'Avg. Cost')} value={`$${(dashboardData.stats.avgProjectCost || 0).toFixed(2)}`} icon={<Icon icon="mdi:currency-usd" width={40} color={colors.warning} />} />,
    'kpi-success-rate': <KpiWidget title={t('dashboard.stats.targetSuccessRate', 'Success Rate')} value={`${(dashboardData.stats.targetSuccessRate || 0)}%`} icon={<Icon icon="mdi:target-arrow" width={40} color={colors.info} />} />,
    'kpi-total-visits-2': <KpiWidget title={t('dashboard.stats.totalVisits', 'Total Visits')} value={dashboardData.stats.totalVisits || '...'} icon={<BarChartIcon sx={{ fontSize: 40, color: colors.success }} />} />,
    // Pie Chart for Project Type Distribution
    'chart-comparison': (
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={dashboardData.projectTypeDistribution || [
              { type: 'Residential', count: 30 },
              { type: 'Commercial', count: 25 },
              { type: 'Industrial', count: 15 },
              { type: 'Infrastructure', count: 10 }
            ]}
            cx="50%"
            cy="50%"
            labelLine={true}
            outerRadius={80}
            fill="#8884d8"
            dataKey="count"
            nameKey="type"
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
          >
            {(dashboardData.projectTypeDistribution || [
              { type: 'Residential', count: 30 },
              { type: 'Commercial', count: 25 },
              { type: 'Industrial', count: 15 },
              { type: 'Infrastructure', count: 10 }
            ]).map((entry, index) => (
              <Cell key={`cell-${index}`} fill={['#0088FE', '#00C49F', '#FFBB28', '#FF8042'][index % 4]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    ),
    // Gauge Chart for Target Metrics (Projects)
    'chart-annual-profits': (
      <ResponsiveContainer width="100%" height="100%">
        <RadialBarChart 
          innerRadius="20%" 
          outerRadius="90%" 
          barSize={15}
          data={[
            {
              name: 'Projects',
              value: dashboardData.targetMetrics?.projects?.current || 45,
              target: dashboardData.targetMetrics?.projects?.target || 100,
              fill: '#8884d8'
            }
          ]}
          startAngle={180} 
          endAngle={0}
        >
          <RadialBar
            minAngle={15}
            background
            clockWise={true}
            dataKey="value"
          />
          <Tooltip />
          <text 
            x="50%" 
            y="50%" 
            textAnchor="middle" 
            dominantBaseline="middle" 
            className="progress-label"
          >
            {`${dashboardData.targetMetrics?.projects?.current || 45}/${dashboardData.targetMetrics?.projects?.target || 100}`}
          </text>
        </RadialBarChart>
      </ResponsiveContainer>
    ),
    // Column Chart for Monthly Performance
    'chart-activity-manager': (
      <ResponsiveContainer width="100%" height="100%">
        <BarChart 
          data={dashboardData.monthlyPerformance || [
            { month: 'Jan 2024', total: 15, completed: 12, completionRate: 80 },
            { month: 'Feb 2024', total: 18, completed: 15, completionRate: 83 },
            { month: 'Mar 2024', total: 22, completed: 19, completionRate: 86 },
            { month: 'Apr 2024', total: 20, completed: 17, completionRate: 85 },
            { month: 'May 2024', total: 25, completed: 22, completionRate: 88 },
            { month: 'Jun 2024', total: 28, completed: 24, completionRate: 86 }
          ]}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="completionRate" name="Completion Rate" fill="#8884d8" />
        </BarChart>
      </ResponsiveContainer>
    ),
    // Quick Actions Wallet (using existing KPI widget as example)
    'quick-actions-wallet': (
      <Card sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <Typography variant="h6" gutterBottom>Wallet Verification</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Enable wallet verification to secure transactions
        </Typography>
        <Button variant="contained" color="primary" sx={{ alignSelf: 'flex-start' }}>
          Enable
        </Button>
      </Card>
    ),
    // Team Performance Chart
    'chart-team-performance': (
      <ResponsiveContainer width="100%" height="100%">
        <BarChart 
          data={dashboardData.team || [
            { name: 'John Doe', completed: 12, total: 15, performance: 80 },
            { name: 'Jane Smith', completed: 8, total: 10, performance: 80 },
            { name: 'Robert Johnson', completed: 5, total: 8, performance: 63 },
            { name: 'Emily Davis', completed: 10, total: 12, performance: 83 }
          ]}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="performance" name="Performance %" fill="#82ca9d" />
        </BarChart>
      </ResponsiveContainer>
    ),
    // Device Distribution Chart (Pie Chart)
    'chart-device-distribution': (
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={dashboardData.deviceDistribution || [
              { device: 'Mobile', count: 45 },
              { device: 'Desktop', count: 35 },
              { device: 'Tablet', count: 20 }
            ]}
            cx="50%"
            cy="50%"
            labelLine={true}
            outerRadius={80}
            fill="#8884d8"
            dataKey="count"
            nameKey="device"
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
          >
            {(dashboardData.deviceDistribution || [
              { device: 'Mobile', count: 45 },
              { device: 'Desktop', count: 35 },
              { device: 'Tablet', count: 20 }
            ]).map((entry, index) => (
              <Cell key={`cell-${index}`} fill={['#0088FE', '#00C49F', '#FFBB28'][index % 3]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    ),
    'sales-chart': (
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={dashboardData.sales}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Area type="monotone" dataKey="value" stroke={colors.primary} fillOpacity={0.3} fill={colors.primary} />
        </AreaChart>
      </ResponsiveContainer>
    ),
    'activity-chart': (
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={dashboardData.activity}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="completed" stackId="a" fill={colors.primary} />
          <Bar dataKey="total" stackId="a" fill={colors.secondary} />
        </BarChart>
      </ResponsiveContainer>
    ),
  }), [dashboardData, colors, t]);

  const renderWidget = (key) => {
    // Remove unique suffix like -timestamp-index to get base widget key
    const cleanKey = key.replace(/-\d{13}-\d+$/, '');
    const widget = widgetMap[key] || widgetMap[cleanKey];
    if (!widget) {
      return <PlaceholderWidget name={`Unknown: ${key}`} />;
    }
    return widget;
  };

  return (
    <Box sx={{ p: 2, m: 0, background: theme.palette.grey[50], minHeight: '100vh' }}>
      {/* Sub-Header with Filters and Edit Button */}
      <Box sx={{ backgroundColor: '#4A6DE3', p: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderRadius: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', gap: 1, ml: 1, flexShrink: 0 }}>
          <Button sx={{ backgroundColor: 'black', color: 'white', '&:hover': { backgroundColor: '#333' }, borderRadius: '8px', textTransform: 'none', fontSize: '0.875rem' }}>Today</Button>
          <Button sx={{ color: 'white', borderRadius: '8px', textTransform: 'none', fontSize: '0.875rem' }}>7 Days</Button>
          <Button sx={{ color: 'white', borderRadius: '8px', textTransform: 'none', fontSize: '0.875rem' }}>15 Days</Button>
          <Button sx={{ color: 'white', borderRadius: '8px', textTransform: 'none', fontSize: '0.875rem' }}>30 Days</Button>
          <Button sx={{ color: 'white', borderRadius: '8px', textTransform: 'none', fontSize: '0.875rem' }}>90 Days</Button>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Button variant="contained" color="primary" onClick={() => setAddWidgetDialogOpen(true)} startIcon={<Icon icon="mdi:plus" />}>
                {t('dashboard.actions.addWidget', 'Add Widget')}
            </Button>
            <IconButton onClick={() => setEditMode((prev) => !prev)} sx={{ color: 'white' }}>
              <Icon icon={editMode ? "mdi:check" : "mdi:pencil"} />
            </IconButton>
        </Box>
      </Box>

      <ResponsiveGridLayout
        className="layout"
        layouts={layouts}
        onLayoutChange={onLayoutChange}
        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
        cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
        rowHeight={120}
        isDraggable={editMode}
        isResizable={editMode}
        draggableHandle={editMode ? '.dashboard-drag-handle' : undefined}
      >
        {(layouts.lg || []).map(widget => (
          <div key={widget.i}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', background: theme.palette.background.paper, boxShadow: theme.shadows[2], position: 'relative', borderRadius: 2 }}>
              {editMode && (
                <>
                  <Box className="dashboard-drag-handle" sx={{ position: 'absolute', top: 8, right: 36, cursor: 'grab', zIndex: 10, bgcolor: 'rgba(255,255,255,0.7)', borderRadius: 2, p: 0.5, boxShadow: 1 }}>
                    <Icon icon="mdi:dots-grid" width={20} height={20} color={theme.palette.grey[600]} />
                  </Box>
                  <IconButton
                    size="small"
                    sx={{ position: 'absolute', top: 8, right: 8, zIndex: 11, bgcolor: 'rgba(255,255,255,0.7)', boxShadow: 1 }}
                    onClick={() => handleRemoveWidget(widget.i)}
                  >
                    <Icon icon="mdi:close" width={18} height={18} />
                  </IconButton>
                </>
              )}
              {renderWidget(widget.i)}
            </Card>
          </div>
        ))}
      </ResponsiveGridLayout>

      <WidgetSelectDialog
        open={addWidgetDialogOpen}
        onClose={() => setAddWidgetDialogOpen(false)}
        onSelect={handleAddWidgets}
        currentWidgets={(layouts.lg || []).map(w => w.i)}
      />

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={() => setError(null)} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default DashboardHome;
