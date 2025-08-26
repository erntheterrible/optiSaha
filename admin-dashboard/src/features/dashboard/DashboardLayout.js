import React, { useState, useEffect, useMemo } from 'react';
import Collapse from '@mui/material/Collapse';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Toolbar,
  AppBar,
  Typography,
  IconButton,
  Avatar,
  Tooltip,
  Divider,
  useTheme,
  useMediaQuery,
  Badge,
  Breadcrumbs,
  Link as MuiLink,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  BarChart as BarChartIcon,
  Logout as LogoutIcon,
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
  CalendarToday as CalendarIcon,
  Widgets as WidgetsIcon,
  Chat as ChatIcon,
  CheckBox as CheckBoxIcon,
  Description as DescriptionIcon,
  ExitToApp as ExitToAppIcon,
  Search as SearchIcon,
  Layers as LayersIcon,
  Receipt as ReceiptIcon,
  TableChart as TableChartIcon,
  Badge as BadgeIcon,
  ChevronRight as ChevronRightIcon,
  People as PeopleIcon,
  Assignment as AssignmentIcon,
  Settings as SettingsIcon,
  Help as HelpIcon,
  Home as HomeIcon,
  Apps as AppsIcon,
  MailOutline as MailOutlineIcon,
  ExpandMore as ExpandMoreIcon,
  BusinessCenter as BusinessCenterIcon,
  AttachMoney as AttachMoneyIcon,
  Group as GroupIcon,
  ExpandLess as ExpandLessIcon,
} from '@mui/icons-material';

import LanguageSelector from '../../components/LanguageSelector';
import { useSupabase } from '../../contexts/SupabaseContext';

const drawerWidth = 240;
const collapsedDrawerWidth = 60; // Thin sidebar for collapsed state
// (sidebarCollapsed state will be declared in the component body)

const menuItems = [
  { text: 'dashboard', icon: <DashboardIcon />, path: '/' },
  {
    text: 'customerManagement',
    icon: <BusinessCenterIcon />,
    children: [
      { text: 'customers', icon: <PeopleIcon />, path: '/customers' },
      { text: 'deals', icon: <AttachMoneyIcon />, path: '/deals' },
      { text: 'leads', icon: <PeopleIcon />, path: '/leads' },
      { text: 'projects', icon: <AssignmentIcon />, path: '/projects' },
      { text: 'userDatabase', icon: <GroupIcon />, path: '/user-database' },
    ],
  },
  { text: 'calendar', icon: <CalendarIcon />, path: '/calendar' },
  { text: 'notes', icon: <DescriptionIcon />, path: '/notes' },
  { text: 'users', icon: <PeopleIcon />, path: '/users' },
  { text: 'regions', icon: <LayersIcon />, path: '/regions' },
  { text: 'reports', icon: <BarChartIcon />, path: '/reports' },
  { text: 'settings', icon: <SettingsIcon />, path: '/settings' },
  { text: 'helpAndSupport', icon: <HelpIcon />, path: '/support' },
];

const DashboardLayout = ({ onLogout }) => {
  const { user, signOut } = useSupabase();
  const [loggingOut, setLoggingOut] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const openUserMenu = Boolean(anchorEl);

  const handleUserMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      if (signOut) {
        await signOut();
      }
      if (onLogout) onLogout();
      navigate('/login');
    } catch (err) {
      // Optionally show error
      setLoggingOut(false);
    }
  };

  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [selectedTab, setSelectedTab] = useState(0);
  const [openCustomerManagement, setOpenCustomerManagement] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  

  // Update selected tab based on current route
    useEffect(() => {
    const path = location.pathname;
    const tabIndex = menuItems.findIndex(item => item.path === path);
    setSelectedTab(tabIndex > -1 ? tabIndex : 0);
  }, [location.pathname]);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleListItemClick = (index, path) => {
    setSelectedTab(index);
    navigate(path);
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  const drawerContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', bgcolor: '#FFFFFF' }}>
      {/* Hamburger Icon Top Bar */}
      <Box sx={{ height: 56, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <IconButton size="large" onClick={() => setSidebarCollapsed(!sidebarCollapsed)}>
          <MenuIcon />
        </IconButton>
      </Box>
      {/* Top User Section */}
      <Box sx={{ p: 2, textAlign: 'center', borderTop: '1px solid #F0F0F0', order: 2 }}>
        <Avatar
          alt={user?.user_metadata?.full_name || 'User'}
          src={user?.user_metadata?.avatar_url || '/static/images/avatar/1.jpg'}
          sx={{ width: sidebarCollapsed ? 48 : 80, height: sidebarCollapsed ? 48 : 80, margin: '0 auto 16px' }}
        />
        <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#333333' }}>
          {user?.user_metadata?.full_name || 'User'}
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mt: 2 }}>
          <IconButton
            sx={{ bgcolor: '#E0F2F1', color: '#00796B', '&:hover': { bgcolor: '#B2DFDB' } }}
            onClick={() => navigate('/calendar')}
          >
            <CalendarIcon fontSize="small" />
          </IconButton>
          <IconButton
            sx={{ bgcolor: '#E3F2FD', color: '#1E88E5', '&:hover': { bgcolor: '#BBDEFB' } }}
            onClick={() => navigate('/notes')}
          >
            <DescriptionIcon fontSize="small" />
          </IconButton>
          <IconButton
            sx={{ bgcolor: '#FCE4EC', color: '#D81B60', '&:hover': { bgcolor: '#F8BBD0' } }}
            onClick={() => navigate('/settings')}
          >
            <SettingsIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>

      <Box sx={{ flex: 1, overflow: 'auto', p: 1, order: 1, 
              '&::-webkit-scrollbar': { width: 6 },
              '&::-webkit-scrollbar-track': { backgroundColor: 'transparent' },
              '&::-webkit-scrollbar-thumb': { backgroundColor: '#c1c1c1', borderRadius: 3 },
            }}>
        <List sx={{ p: 1 }}>
          {menuItems.map((item, index) => {
            // Handle nested menu items (Customer Management group)
            if (item.children) {
              const isGroupSelected = item.children.some(child => child.path === location.pathname);
              return (
                <React.Fragment key={item.text}>
                  <ListItem
                    button
                    onClick={() => setOpenCustomerManagement(!openCustomerManagement)}
                    sx={{
                      py: 1.5,
                      justifyContent: 'center',
                      my: 0.5,
                      borderRadius: '8px',
                      backgroundColor: isGroupSelected ? '#305CDE' : 'transparent',
                      '&:hover': {
                        backgroundColor: isGroupSelected ? '#305CDE' : '#F0F0F0',
                      },
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: '40px', color: isGroupSelected ? '#FFFFFF' : theme.palette.text.secondary, justifyContent: 'center' }}>
                      {item.icon}
                    </ListItemIcon>
                    {!sidebarCollapsed && (
                      <ListItemText 
                        primary={t(`menu.${item.text}`)} 
                        primaryTypographyProps={{
                          sx: { 
                            fontWeight: isGroupSelected ? 600 : 500,
                            color: isGroupSelected ? '#FFFFFF' : theme.palette.text.primary,
                          }
                        }}
                      />
                    )}
                    {!sidebarCollapsed && (openCustomerManagement ? <ExpandLessIcon sx={{ color: isGroupSelected ? '#FFFFFF' : theme.palette.text.secondary }} /> : <ExpandMoreIcon sx={{ color: isGroupSelected ? '#FFFFFF' : theme.palette.text.secondary }} />)}
                  </ListItem>
                  <Collapse in={openCustomerManagement} timeout="auto" unmountOnExit>
                    <List component="div" disablePadding>
                      {item.children.map((child, childIndex) => {
                        const isChildSelected = location.pathname === child.path;
                        return (
                          <ListItem
                            button
                            key={child.text}
                            selected={isChildSelected}
                            onClick={() => handleListItemClick(null, child.path)}
                            sx={{
                              py: 1,
                              justifyContent: 'center',
                              my: 0.25,
                              borderRadius: '6px',
                              backgroundColor: isChildSelected ? '#305CDE' : 'transparent',
                              '&:hover': {
                                backgroundColor: isChildSelected ? '#305CDE' : '#F0F0F0',
                              },
                              pl: sidebarCollapsed ? 0 : 4,
                            }}
                          >
                            <ListItemIcon sx={{ minWidth: '40px', color: isChildSelected ? '#FFFFFF' : theme.palette.text.secondary, justifyContent: 'center' }}>
                              {child.icon}
                            </ListItemIcon>
                            {!sidebarCollapsed && (
                              <ListItemText 
                                primary={t(`menu.${child.text}`)} 
                                primaryTypographyProps={{
                                  sx: { 
                                    fontWeight: isChildSelected ? 600 : 500,
                                    color: isChildSelected ? '#FFFFFF' : theme.palette.text.primary,
                                  }
                                }}
                              />
                            )}
                          </ListItem>
                        );
                      })}
                    </List>
                  </Collapse>
                </React.Fragment>
              );
            }
            
            // Handle regular menu items
            const isSelected = selectedTab === index;
            return (
              <ListItem
                button
                key={item.text}
                selected={isSelected}
                onClick={() => handleListItemClick(index, item.path)}
                sx={{
                  py: 1.5,
                  justifyContent: 'center',
                  my: 0.5,
                  borderRadius: '8px',
                  backgroundColor: isSelected ? '#305CDE' : 'transparent',
                  '&:hover': {
                    backgroundColor: isSelected ? '#305CDE' : '#F0F0F0',
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: '40px', color: isSelected ? '#FFFFFF' : theme.palette.text.secondary, justifyContent: 'center' }}>
                  {item.icon}
                </ListItemIcon>
                {!sidebarCollapsed && (
                  <ListItemText 
                    primary={t(`menu.${item.text}`)} 
                    primaryTypographyProps={{
                      sx: { 
                        fontWeight: isSelected ? 600 : 500,
                        color: isSelected ? '#FFFFFF' : theme.palette.text.primary,
                      }
                    }}
                  />
                )}
                {item.hasSubmenu && <ChevronRightIcon sx={{ color: isSelected ? '#FFFFFF' : theme.palette.text.secondary }} />}
              </ListItem>
            );
          })}
        </List>
      </Box>
      
      
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      {/* App Bar */}
      <AppBar 
        position="fixed" 
        sx={{
          backgroundColor: '#305CDE', // Royal blue
          zIndex: (theme) => theme.zIndex.drawer + 1,
          boxShadow: 'none',
          height: '112px', // Increased height for two rows
          justifyContent: 'center',
          p: 1,
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          {/* Left: Breadcrumbs */}
          <Breadcrumbs aria-label="breadcrumb" sx={{ color: 'white', display: { xs: 'none', md: 'block' }, ml: 4, mt: 1 }}>
            <MuiLink component="button" underline="hover" color="inherit" onClick={() => navigate('/')} sx={{ display: 'flex', alignItems: 'center' }}>
              <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
              Home
            </MuiLink>
            <Typography color="white">Dashboard</Typography>
          </Breadcrumbs>

          {/* Center: Logo */}
          <Box sx={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', display: { xs: 'none', md: 'flex' }, alignItems: 'center' }}>
            <img src="/logo192.png" alt="OptiField Logo" style={{ height: '40px' }} />
            <Typography variant="h5" sx={{ ml: 1, fontWeight: 'bold', color: 'white' }}>OptiField</Typography>
          </Box>

          {/* Right: Actions & User Profile */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Tooltip title={t('menu.dashboard', 'Dashboard')}>
              <IconButton sx={{ color: 'white', border: '1px solid rgba(255,255,255,0.5)', borderRadius: '50%' }} onClick={() => navigate('/')}>
                <HomeIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title={t('menu.notifications', 'Notifications')}>
              <IconButton sx={{ color: 'white', border: '1px solid rgba(255,255,255,0.5)', borderRadius: '50%' }} onClick={() => navigate('/notifications')}>
                <Badge badgeContent={7} color="error"><NotificationsIcon /></Badge>
              </IconButton>
            </Tooltip>
            <Tooltip title={t('menu.mail', 'Mail')}>
              <IconButton sx={{ color: 'white', border: '1px solid rgba(255,255,255,0.5)', borderRadius: '50%' }} onClick={() => navigate('/mail')}>
                <MailOutlineIcon />
              </IconButton>
            </Tooltip>
            
            <Box sx={{ display: 'flex', alignItems: 'center', ml: 2 }}>
              <IconButton onClick={handleUserMenuOpen} sx={{ p: 0 }}>
                <Avatar 
                  alt={user?.user_metadata?.full_name || 'User'} 
                  src={user?.user_metadata?.avatar_url || '/static/images/avatar/1.jpg'} 
                  sx={{ width: 40, height: 40 }} 
                />
              </IconButton>
              <Box sx={{ ml: 1, display: { xs: 'none', md: 'block' } }}>
                <Typography variant="body2" sx={{ color: 'white', fontWeight: 'bold' }}>
                  {user?.user_metadata?.full_name || 'User'}
                </Typography>
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)' }}>Admin</Typography>
              </Box>
              <IconButton sx={{ color: 'white' }} onClick={handleUserMenuOpen}>
                <ExpandMoreIcon />
              </IconButton>
            </Box>
            
            <Menu
              anchorEl={anchorEl}
              open={openUserMenu}
              onClose={handleUserMenuClose}
              onClick={handleUserMenuClose}
              PaperProps={{
                elevation: 0,
                sx: {
                  overflow: 'visible',
                  filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                  mt: 1.5,
                  '& .MuiAvatar-root': {
                    width: 32,
                    height: 32,
                    ml: -0.5,
                    mr: 1,
                  },
                  '&:before': {
                    content: '""',
                    display: 'block',
                    position: 'absolute',
                    top: 0,
                    right: 14,
                    width: 10,
                    height: 10,
                    bgcolor: 'background.paper',
                    transform: 'translateY(-50%) rotate(45deg)',
                    zIndex: 0,
                  },
                },
              }}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
              <MenuItem onClick={() => {
                handleUserMenuClose();
                navigate('/profile');
              }}>
                <Avatar /> {t('menu.profile', 'Profile')}
              </MenuItem>
              <Divider />
              <MenuItem onClick={() => {
                handleUserMenuClose();
                navigate('/settings');
              }}>
                <SettingsIcon fontSize="small" /> {t('menu.settings', 'Settings')}
              </MenuItem>
              <MenuItem onClick={() => {
                handleUserMenuClose();
                handleLogout();
              }}>
                <LogoutIcon fontSize="small" /> {t('menu.logout', 'Logout')}
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Sidebar Drawer */}
      <Drawer
          ModalProps={{
            keepMounted: true, // Better open performance on mobile
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              marginTop: '56px',
              height: 'calc(100% - 56px)',
              backgroundColor: theme.palette.background.sidebar,
            },
          }}
        >
          {drawerContent}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            position: 'fixed',
            top: 0,
            left: 0,
            zIndex: (theme) => theme.zIndex.drawer + 2,
            '& .MuiDrawer-paper': {
              position: 'fixed',
              top: 0,
              left: 0,
              height: '100vh',
              boxSizing: 'border-box',
              width: sidebarCollapsed ? collapsedDrawerWidth : drawerWidth,
              transition: theme.transitions.create('width', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
              }),
              overflowX: 'hidden',
              borderRight: 'none',
            },
          }}
          open
          onMouseEnter={() => setSidebarCollapsed(false)}
          onMouseLeave={() => setSidebarCollapsed(true)}
        >
          {drawerContent}
        </Drawer>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 0,
          mt: '112px', // Height of AppBar
          minHeight: 'calc(100vh - 112px)',
          backgroundColor: theme.palette.background.default,
          ml: { md: sidebarCollapsed ? `${collapsedDrawerWidth}px` : `${drawerWidth}px` },
          width: { md: `calc(100% - ${sidebarCollapsed ? collapsedDrawerWidth : drawerWidth}px)` },
          transition: theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
          overflowX: 'hidden',
          overflowY: 'auto',
          '&::-webkit-scrollbar': {
            width: '8px',
            backgroundColor: '#f1f1f1',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: '#c1c1c1',
            borderRadius: '4px',
          },
          '&::-webkit-scrollbar-thumb:hover': {
            backgroundColor: '#a8a8a8',
          },
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default DashboardLayout;
