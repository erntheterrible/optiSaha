import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import analyticsService from '../../services/analyticsService';
import { useNavigate } from 'react-router-dom';
import { useSupabase } from '../../contexts/SupabaseContext';
import { supabase } from '../../lib/supabaseClient';
import VisibilityIcon from '@mui/icons-material/Visibility';
import GetAppIcon from '@mui/icons-material/GetApp';
import { 
  Box, 
  Typography, 
  useTheme, 
  IconButton, 
  Menu, 
  MenuItem, 
  Button,
  Stack,
  CircularProgress,
  Skeleton,
  Card,
  Paper,
  Alert,
  Snackbar
} from '@mui/material';
import { 
  ResponsiveContainer, 
  AreaChart, 
  BarChart, 
  LineChart, 
  CartesianGrid, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  Area, 
  Bar, 
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { Responsive, WidthProvider } from 'react-grid-layout';
import { colors } from '../../theme/designTokens';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { Icon } from '@iconify/react';
import Avatar from '@mui/material/Avatar';
import DashboardEditTransition from './components/DashboardEditTransition';
import WidgetSelectDialog from './components/WidgetSelectDialog';
import dashboardService from '../../services/dashboardService';
import { 
  People as PeopleIcon,
  Assignment as AssignmentIcon,
  BarChart as BarChartIcon,
  Equalizer as EqualizerIcon,
  Refresh as RefreshIcon,
  FilterList as FilterListIcon,
  MoreVert as MoreVertIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
  Settings as SettingsIcon,
  Help as HelpIcon,
  AttachMoney as AttachMoneyIcon,
  CheckCircle as CheckCircleIcon,
  AccessTime as AccessTimeIcon
} from '@mui/icons-material';

const ResponsiveGridLayout = WidthProvider(Responsive);

// Import components
// Assuming these components exist in the specified path
// import ChartCard from './components/ChartCard'; 
// import StatCard from './components/StatCard';

// Mock StatCard until the actual one is imported
const StatCard = ({ title, value, icon, color, trend, trendValue, trendLabel, loading, sx }) => (
    <Card sx={{ p: 2, display: 'flex', alignItems: 'center', ...sx }}>
        {loading ? <Skeleton variant="rectangular" width="100%" height={80} /> :
            <>
                <Box sx={{ mr: 2, color: `${color}.main` }}>{icon}</Box>
                <Box>
                    <Typography variant="body2" color="text.secondary">{title}</Typography>
                    <Typography variant="h5" fontWeight="bold">{value}</Typography>
                </Box>
            </>
        }
    </Card>
);

// Theme-based colors
const getChartColors = (theme) => ({
  primary: theme.palette.primary.main,
  secondary: theme.palette.secondary.main,
  success: theme.palette.success.main,
  warning: theme.palette.warning.main,
  error: theme.palette.error.main,
  info: theme.palette.info.main,
  text: theme.palette.text.primary,
  background: theme.palette.background.paper,
  grey: theme.palette.grey,
  // Add specific grey shades we need
  grey300: theme.palette.grey[300] || '#e0e0e0',
  grey500: theme.palette.grey[500] || '#9e9e9e'
});

// Custom tooltip component
const CustomTooltip = ({ active, payload, label, formatter }) => {
  if (active && payload && payload.length) {
    return (
      <Box 
        sx={{
          backgroundColor: 'background.paper',
          border: 'none',
          borderRadius: 2,
          p: 2,
          boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
          minWidth: 160,
        }}
      >
        <Typography 
          variant="subtitle2" 
          fontWeight={600} 
          color="text.primary" 
          gutterBottom
          sx={{ 
            fontSize: '0.75rem',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            opacity: 0.8
          }}
        >
          {label}
        </Typography>
        {payload.map((entry, index) => {
          const [displayValue, displayName] = formatter 
            ? formatter(entry.value, entry.name, entry.payload, entry.dataKey, index, payload) 
            : [
                typeof entry.value === 'number' 
                  ? entry.value.toLocaleString() + (entry.unit || '') 
                  : entry.value,
                entry.name
              ];
          
          return (
            <Box 
              key={`item-${index}`} 
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                mb: 1.5, 
                '&:last-child': { mb: 0 } 
              }}
            >
              <Box 
                sx={{ 
                  width: 10, 
                  height: 10, 
                  borderRadius: '2px',
                  bgcolor: entry.color,
                  mr: 1.5,
                  flexShrink: 0,
                }} 
              />
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography 
                  variant="caption" 
                  color="text.secondary"
                  sx={{
                    display: 'block',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    fontSize: '0.75rem',
                    lineHeight: 1.4
                  }}
                >
                  {displayName}
                </Typography>
                <Typography 
                  variant="subtitle2" 
                  sx={{ 
                    color: entry.color || 'text.primary', 
                    fontWeight: 600,
                    lineHeight: 1.4
                  }}
                >
                  {displayValue}
                </Typography>
              </Box>
            </Box>
          );
        })}
      </Box>
    );
  }
  return null;
};

const DashboardHome = () => {
  const { t } = useTranslation();
  const { user: currentUser } = useSupabase();
  const camelCaseKey = key => key.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
  const theme = useTheme();
  const colors = useMemo(() => getChartColors(theme), [theme]);
  const navigate = useNavigate();
  // simple passthrough helper – adjust transform later if needed
  const getChartData = (data) => data;

  const [dashboardData, setDashboardData] = useState({
    stats: {},
    sales: [],
    activity: [],
    projectStatus: [],
    devices: [], // Keep mock data for now
    traffic: [], // Keep mock data for now
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('year'); // Default to a wider range
  const [anchorEl, setAnchorEl] = useState(null);
const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          navigate('/login');
          return;
        }

        const timeRangeToMonths = { day: 1, week: 3, month: 6, year: 12 };
        const monthsForTrend = timeRangeToMonths[timeRange] || 12;

        const [kpis, sales, activity, projectStatus] = await Promise.all([
          dashboardService.getKPIs(),
          analyticsService.getSalesTrends(monthsForTrend),
          analyticsService.getTeamPerformance(),
          analyticsService.getProjectStatusDistribution(),
        ]);

        // Mock data for charts not yet connected to backend
        const mockDevices = [
    { name: 'Desktop', value: 65 },
    { name: 'Mobile', value: 30 },
    { name: 'Tablet', value: 5 },
  ];

        setDashboardData({
          stats: kpis || {},
          sales: sales || [],
          activity: activity || [],
          projectStatus: projectStatus || [],
          devices: mockDevices, // Using mock data
        });

      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
        setError(t('dashboard.errors.loadFailed'));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [timeRange, currentUser, navigate, t]);

  const handleTimeRangeChange = useCallback((range) => {
    setTimeRange(range);
    handleMenuClose();
  }, []);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // The refresh is now handled by the useEffect dependency array change
  const refreshData = () => {
    // Re-trigger the fetch by changing the dependency, e.g., by updating a counter state
    // For now, a simple reload or letting the timeRange change handle it is sufficient.
    setTimeRange(current => current); // This might not be enough, might need a dedicated refresh state
  };

  const statCards = [
    { key: 'totalProjects', title: t('dashboard.stats.totalProjects'), value: dashboardData.stats.total_projects, icon: <AssignmentIcon fontSize="large" />, color: 'primary' },
    { key: 'completedProjects', title: t('dashboard.stats.completedProjects'), value: dashboardData.stats.completed_projects, icon: <CheckCircleIcon fontSize="large" />, color: 'success' },
    { key: 'activeVisits', title: t('dashboard.stats.activeVisits'), value: dashboardData.stats.active_visits, icon: <PeopleIcon fontSize="large" />, color: 'info' },
    { key: 'totalRevenue', title: t('dashboard.stats.totalRevenue'), value: dashboardData.stats.total_revenue, icon: <AttachMoneyIcon fontSize="large" />, color: 'warning', format: 'currency' },
    { key: 'avgVisitDuration', title: t('dashboard.stats.avgVisitDuration'), value: dashboardData.stats.avg_visit_duration, icon: <AccessTimeIcon fontSize="large" />, color: 'secondary', suffix: ` ${t('common.min')}` },
  ];

  const initialLayout = {
    lg: [
      { i: 'kpi-total-sales', x: 0, y: 0, w: 2, h: 1 },
      { i: 'kpi-total-projects', x: 2, y: 0, w: 2, h: 1 },
      { i: 'kpi-total-visits', x: 4, y: 0, w: 2, h: 1 },
      { i: 'kpi-avg-cost', x: 6, y: 0, w: 2, h: 1 },
      { i: 'kpi-success-rate', x: 8, y: 0, w: 2, h: 1 },
      { i: 'chart-comparison', x: 0, y: 1, w: 12, h: 3 },
      { i: 'chart-annual-profits', x: 0, y: 4, w: 4, h: 3 },
      { i: 'chart-activity-manager', x: 4, y: 4, w: 5, h: 3 },
      { i: 'quick-actions-wallet', x: 9, y: 4, w: 3, h: 3 },
      { i: 'chart-team-performance', x: 0, y: 7, w: 8, h: 3 },
      { i: 'chart-device-distribution', x: 8, y: 7, w: 4, h: 3 },
    ],
  };

  const [layouts, setLayouts] = useState(initialLayout);
  const [layoutLoaded, setLayoutLoaded] = useState(false);
  const [addWidgetDialogOpen, setAddWidgetDialogOpen] = useState(false);

  // Fetch and apply user layout on mount
  useEffect(() => {
    async function fetchUserLayout() {
      if (!currentUser) return;
      const userId = currentUser.id;
      const role = currentUser.user_metadata?.role || 'user';
      try {
        const userLayout = await dashboardService.getDashboardLayout(userId, role);
        if (userLayout) {
          setLayouts(userLayout);
        }
      } catch (e) {
        console.error('Failed to load dashboard layout:', e);
      } finally {
        setLayoutLoaded(true);
      }
    }
    fetchUserLayout();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]);

  const onLayoutChange = (layout, newLayouts) => {
    setLayouts(newLayouts);
  };

  // Render widget content by key
  const renderWidget = (key) => {
    // Support unique IDs by stripping only trailing numeric suffix (e.g., -2, -3)
    const baseKey = key.replace(/-\d+$/, '');
    switch (baseKey) {
      case 'kpi-total-sales':
        return (
          <>
            <Box sx={{ mb: 1, color: theme.palette.success.main }}><AttachMoneyIcon fontSize="large" /></Box>
            <Typography variant="h5" fontWeight={700} sx={{ mb: 0.5 }}>{dashboardData.stats.total_sales ?? '-'}</Typography>
            <Typography variant="body2" color="text.secondary">{t('dashboard.stats.totalSales')}</Typography>
          </>
        );
      case 'kpi-total-projects':
        return (
          <>
            <Box sx={{ mb: 1, color: theme.palette.primary.main }}><AssignmentIcon fontSize="large" /></Box>
            <Typography variant="h5" fontWeight={700} sx={{ mb: 0.5 }}>{dashboardData.stats.total_projects ?? '-'}</Typography>
            <Typography variant="body2" color="text.secondary">{t('dashboard.stats.totalProjects')}</Typography>
          </>
        );
      case 'kpi-total-visits':
        return (
          <>
            <Box sx={{ mb: 1, color: theme.palette.info.main }}><PeopleIcon fontSize="large" /></Box>
            <Typography variant="h5" fontWeight={700} sx={{ mb: 0.5 }}>{dashboardData.stats.total_visits ?? '-'}</Typography>
            <Typography variant="body2" color="text.secondary">{t('dashboard.stats.totalVisits')}</Typography>
          </>
        );
      case 'kpi-avg-cost':
        return (
          <>
            <Box sx={{ mb: 1, color: theme.palette.warning.main }}><BarChartIcon fontSize="large" /></Box>
            <Typography variant="h5" fontWeight={700} sx={{ mb: 0.5 }}>{dashboardData.stats.avg_project_cost ?? '-'}</Typography>
            <Typography variant="body2" color="text.secondary">{t('dashboard.stats.avgProjectCost')}</Typography>
          </>
        );
      case 'kpi-success-rate':
        return (
          <>
            <Box sx={{ mb: 1, color: theme.palette.secondary.main }}><EqualizerIcon fontSize="large" /></Box>
            <Typography variant="h5" fontWeight={700} sx={{ mb: 0.5 }}>{dashboardData.stats.target_success_rate ? `${dashboardData.stats.target_success_rate}%` : '-'}</Typography>
            <Typography variant="body2" color="text.secondary">{t('dashboard.stats.targetSuccessRate')}</Typography>
          </>
        );
      case 'chart-comparison':
        return (
          <>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" fontWeight={600}>{t('dashboard.comparison.title')}</Typography>
            </Box>
            <Box sx={{ flexGrow: 1, width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dashboardData.comparison || []} margin={{ top: 10, right: 20, bottom: 0, left: 0 }}>
                  <defs>
                    <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={theme.palette.primary.main} stopOpacity={0.8} />
                      <stop offset="95%" stopColor={theme.palette.primary.main} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="uv" stroke={theme.palette.primary.main} fillOpacity={1} fill="url(#colorUv)" />
                </AreaChart>
              </ResponsiveContainer>
            </Box>
          </>
        );
      case 'chart-annual-profits':
        return (
          <>
            <Typography variant="h6" fontWeight={600}>{t('dashboard.kpi.annualProfits')}</Typography>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={dashboardData.annualProfits || []} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={60} fill={theme.palette.primary.main} label />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </>
        );
      case 'chart-activity-manager':
        return (
          <>
            <Typography variant="h6" fontWeight={600}>{t('dashboard.charts.activityManager')}</Typography>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={dashboardData.activityManager || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="pv" fill={theme.palette.primary.main} />
                <Bar dataKey="uv" fill={theme.palette.secondary.main} />
              </BarChart>
            </ResponsiveContainer>
          </>
        );
      case 'quick-actions-wallet':
        return (
          <>
            <Box sx={{ fontSize: 40, color: theme.palette.warning.main, mb: 2 }}>☀️</Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2, textAlign: 'center' }}>{t('dashboard.actions.walletVerificationDesc')}</Typography>
            <Button variant="contained" size="large" sx={{ borderRadius: 20, background: theme.palette.gradients.coralPeach, color: theme.palette.white, fontWeight: 600, px: 4 }}>{t('dashboard.actions.enable')}</Button>
          </>
        );
      case 'chart-team-performance':
        return (
          <>
            <Typography variant="h6" fontWeight={600}>{t('dashboard.charts.teamPerformance')}</Typography>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={dashboardData.teamPerformance || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="pv" stroke={theme.palette.primary.main} />
                <Line type="monotone" dataKey="uv" stroke={theme.palette.secondary.main} />
              </LineChart>
            </ResponsiveContainer>
          </>
        );
      case 'chart-device-distribution':
        return (
          <>
            <Typography variant="h6" fontWeight={600}>{t('dashboard.charts.deviceDistribution')}</Typography>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={dashboardData.deviceDistribution || []} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={60} fill={theme.palette.primary.main} label />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </>
        );
      default:
        return <Typography color="text.secondary">Unknown widget: {key}</Typography>;
    }
  };


  // Remove widget from all layouts
  const handleRemoveWidget = (key) => {
    const newLayouts = { ...layouts };
    Object.keys(newLayouts).forEach(bp => {
      newLayouts[bp] = (newLayouts[bp] || []).filter(w => w.i !== key);
    });
    setLayouts(newLayouts);
  };

// Add selected widgets to the dashboard layout
  const handleAddWidgets = (selectedKeys) => {
    if (!selectedKeys || selectedKeys.length === 0) return;

    // Deep copy layouts to prevent state mutation issues
    const newLayouts = JSON.parse(JSON.stringify(layouts));
    const breakpoints = Object.keys(newLayouts);
    const defaultW = 3, defaultH = 3;

    breakpoints.forEach(bp => {
      if (!newLayouts[bp]) newLayouts[bp] = [];
      const usedKeys = new Set(newLayouts[bp].map(w => w.i));
      let y = Math.max(0, ...newLayouts[bp].map(w => w.y + w.h));

      selectedKeys.forEach(key => {
        // Generate a unique ID for this widget instance
        let base = key;
        let suffix = 1;
        let newId = base;
        // Find a unique id
        while (usedKeys.has(newId)) {
          suffix += 1;
          newId = `${base}-${suffix}`;
        }
        newLayouts[bp].push({ i: newId, x: 0, y, w: defaultW, h: defaultH });
        y += defaultH;
        usedKeys.add(newId);
      });
    });

    setLayouts(newLayouts);
  };


  // Save layout to Supabase when exiting edit mode
  useEffect(() => {
    if (!editMode && layoutLoaded && currentUser) {
      const userId = currentUser.id;
      const role = currentUser.user_metadata?.role || 'user';
      dashboardService.saveDashboardLayout(userId, role, layouts)
        .then(success => {
          if (!success) {
            // Optionally show error snackbar
            setError('Failed to save dashboard layout');
          }
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editMode]);

  return (
    <Box sx={{ p: { xs: 1, md: 3 }, background: theme.palette.grey[50], minHeight: '100vh' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: { md: 'center' }, justifyContent: 'space-between', mb: 4 }}>
        <Box>
          <Typography variant="h3" fontWeight={700} sx={{ letterSpacing: '-1px', mb: 1 }}>
            {t('dashboard.welcome', { name: currentUser?.user_metadata?.full_name || 'User' })} <span role="img" aria-label="wave">👋</span>
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 2 }}>
            {t('dashboard.subtitle')}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2, mt: { xs: 2, md: 0 }, alignItems: 'center' }}>
          <Button variant="contained" size="large" sx={{ borderRadius: 24, background: theme.palette.gradients.coralPeach, color: theme.palette.white, fontWeight: 600, px: 4, boxShadow: theme.shadows[2] }}>
            {t('dashboard.actions.showTasks', 'Show my Tasks')}
            <Icon icon="eva:arrow-ios-forward-fill" width={22} height={22} style={{ marginLeft: 8 }} />
          </Button>
          <Button
            variant={editMode ? 'outlined' : 'contained'}
            color={editMode ? 'secondary' : 'primary'}
            onClick={() => setEditMode((prev) => !prev)}
            sx={{ borderRadius: 24, fontWeight: 600, px: 3 }}
          >
            {editMode ? t('dashboard.actions.done', 'Done') : t('dashboard.actions.editLayout', 'Edit Layout')}
          </Button>
          <IconButton onClick={handleMenuOpen} size="large">
            <MoreVertIcon />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            MenuListProps={{
              'aria-labelledby': 'basic-button',
            }}
          >
            <MenuItem onClick={() => handleTimeRangeChange('day')}>{t('dashboard.time.thisWeek')}</MenuItem>
            <MenuItem onClick={() => handleTimeRangeChange('week')}>{t('dashboard.time.thisMonth')}</MenuItem>
            <MenuItem onClick={() => handleTimeRangeChange('month')}>{t('dashboard.time.thisYear')}</MenuItem>
          </Menu>
        </Box>
      </Box>

      {editMode && (
        <Button
          variant="contained"
          color="primary"
          sx={{ mb: 2, borderRadius: 20, fontWeight: 600 }}
          onClick={() => setAddWidgetDialogOpen(true)}
        >
          {t('dashboard.actions.addWidget', 'Add Widget')}
        </Button>
      )}
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
        {layouts.lg && layouts.lg.map(widget => (
          <div key={widget.i}>
            <Card sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', borderRadius: 4, background: theme.palette.white, boxShadow: theme.shadows[2], position: 'relative' }}>
              {editMode && (
                <>
                  <Box className="dashboard-drag-handle" sx={{ position: 'absolute', top: 8, right: 36, cursor: 'grab', zIndex: 10, bgcolor: 'background.paper', borderRadius: 2, p: 0.5, boxShadow: 1 }}>
                    <Icon icon="mdi:dots-grid" width={20} height={20} color={theme.palette.grey[600]} />
                  </Box>
                  <IconButton
                    size="small"
                    sx={{ position: 'absolute', top: 8, right: 8, zIndex: 11, bgcolor: 'background.paper', boxShadow: 1 }}
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

      {/* Error Snackbar */}
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
