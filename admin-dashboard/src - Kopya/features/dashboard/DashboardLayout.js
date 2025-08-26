import React, { useState, useEffect, useMemo } from 'react';
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
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Map as MapIcon,
  People as PeopleIcon,
  Assignment as AssignmentIcon,
  BarChart as BarChartIcon,
  Logout as LogoutIcon,
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
  Settings as SettingsIcon,
  Help as HelpIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  Note as NoteIcon,
  Widgets as WidgetsIcon,
  Email as EmailIcon,
  Chat as ChatIcon,
  CheckBox as CheckBoxIcon,
  FormatListBulleted as ListIcon,
  MenuBook as MenuBookIcon,
  Error as ErrorIcon,
  PersonAdd as PersonAddIcon,
  Lock as LockIcon,
  Description as DescriptionIcon,
  AccountBox as AccountBoxIcon,
  ExitToApp as ExitToAppIcon
} from '@mui/icons-material';
import { useThemeContext } from '../../theme/ThemeContext';
import LanguageSelector from '../../components/LanguageSelector';

const drawerWidth = 240;

const menuSections = [
  {
    title: 'sections.uiElements',
    items: [
      { text: 'dashboard', icon: <DashboardIcon />, path: '/' },
      { text: 'leads', icon: <PersonAddIcon />, path: '/leads' },
      { text: 'calendar', icon: <CalendarIcon />, path: '/calendar' },
      { text: 'notes', icon: <NoteIcon />, path: '/notes' },
      { text: 'regions', icon: <MapIcon />, path: '/regions' },
    ]
  },
  {
    title: 'sections.icons',
    items: [
      { text: 'users', icon: <PeopleIcon />, path: '/users' },
      { text: 'reports', icon: <AssignmentIcon />, path: '/reports' },
    ]
  },
  {
    title: 'sections.extras',
    items: [
      { text: 'settings', icon: <SettingsIcon />, path: '/settings' },
      { text: 'helpAndSupport', icon: <HelpIcon />, path: '/support' },
    ]
  }
];

const DashboardLayout = ({ onLogout }) => {
  const { signOut } = require('../../contexts/SupabaseContext').useSupabase?.() || {};
  const [loggingOut, setLoggingOut] = useState(false);

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
  const [selectedTab, setSelectedTab] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();
  const { mode, toggleTheme } = useThemeContext();

  // Update selected tab based on current route
  useEffect(() => {
    const path = location.pathname;
    let tabIndex = 0;
    let currentIndex = 0;
    
    menuSections.forEach(section => {
      section.items.forEach(item => {
        if (item.path === path) {
          tabIndex = currentIndex;
        }
        currentIndex++;
      });
    });
    
    setSelectedTab(tabIndex);
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

  const drawer = (
    <Box sx={{
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  bgcolor: 'rgba(255,255,255,0.72)',
  backdropFilter: 'blur(14px)',
  border: '1.5px solid rgba(200,200,220,0.25)',
  borderRadius: 0,
  boxShadow: '0 8px 32px 0 rgba(60,60,120,0.10)',
  mx: 0,
  my: 0,
  overflow: 'hidden',
  minWidth: 90,
  maxWidth: 270,
  fontFamily: 'Inter, Rubik, Arial, sans-serif',
  transition: 'box-shadow 0.2s',
}}>
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 600, color: 'primary.main' }}>
          {t('app.name')}
        </Typography>
      </Box>
      
      <Box sx={{ overflowY: 'auto', flex: 1, '&::-webkit-scrollbar': { width: '0.4em' }, '&::-webkit-scrollbar-thumb': { backgroundColor: 'rgba(0,0,0,.1)' } }}>
        {menuSections.map((section, sectionIndex) => (
          <Box key={section.title} sx={{ mt: sectionIndex > 0 ? 2 : 0 }}>
            <Typography 
  variant="caption" 
  sx={{
    px: 2.5,
    pt: 3,
    pb: 1,
    display: 'block',
    color: 'text.secondary',
    fontWeight: 400,
    textTransform: 'uppercase',
    letterSpacing: '0.12em',
    fontSize: '0.67rem',
    opacity: 0.68,
    fontFamily: 'inherit',
  }}
>
  {t(section.title)}
</Typography>
            <List dense disablePadding>
              {section.items.map((item, itemIndex) => {
                const absoluteIndex = menuSections
                  .slice(0, sectionIndex)
                  .reduce((acc, curr) => acc + curr.items.length, 0) + itemIndex;
                
                return (
                  <ListItem 
  key={item.text}
  button
  selected={selectedTab === absoluteIndex}
  onClick={() => handleListItemClick(absoluteIndex, item.path)}
  sx={{
    position: 'relative',
    px: 3.2,
    py: 1.1,
    mb: 1.4,
    borderRadius: 5,
    minHeight: 52,
    fontFamily: 'inherit',
    fontSize: '0.95rem',
    overflow: 'visible',
    transition: 'box-shadow 0.16s, transform 0.16s',
    '&:hover': {
      background: 'rgba(245,245,255,0.65)',
      transform: 'scale(1.03)',
      boxShadow: '0 2px 16px 0 rgba(120,120,180,0.12)',
      zIndex: 2,
    },
    ...(selectedTab === absoluteIndex && {
  background: 'rgba(255,255,255,0.92)',
  color: '#ff9800', // vibrant orange
  fontWeight: 700,
  zIndex: 3,
  boxShadow: '0 4px 24px 0 rgba(255, 102, 153, 0.18)',
  borderRadius: 7,
  minHeight: 58,
  '&::before': {
    content: '""',
    position: 'absolute',
    left: 0,
    top: 7,
    bottom: 7,
    width: 7,
    borderRadius: '8px',
    background: 'linear-gradient(180deg, #ff7eb3 0%, #ff758c 100%)',
    boxShadow: '0 2px 12px 0 rgba(255, 117, 140, 0.15)',
  },
  '& .MuiListItemIcon-root, & .MuiListItemText-primary': {
    color: '#ff9800',
    textShadow: '0 2px 8px rgba(255, 152, 0, 0.10)',
  },
}),
  }}
>
                    <ListItemIcon sx={{ 
  minWidth: 30,
  color: selectedTab === absoluteIndex ? 'primary.contrastText' : 'text.secondary',
  '& svg': { fontSize: 22 },
}}>

                      {item.icon}
                    </ListItemIcon>
                    <ListItemText 
  primary={t(`menu.${item.text}`)} 
  primaryTypographyProps={{
    variant: 'body2',
    sx: { 
      fontWeight: selectedTab === absoluteIndex ? 600 : 400,
      color: selectedTab === absoluteIndex ? 'primary.contrastText' : 'text.primary',
      fontSize: '0.92rem',
    }
  }}
/>
                  </ListItem>
                );
              })}
            </List>
          </Box>
        ))}
      </Box>
      
      {/* User profile at bottom */}
      <Box sx={{ 
        p: 2, 
        borderTop: 1, 
        borderColor: 'divider',
        display: 'flex',
        alignItems: 'center',
        bgcolor: 'background.paper',
        zIndex: 1
      }}>
        <Avatar sx={{ width: 40, height: 40, mr: 1.5 }}>U</Avatar>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="subtitle2" noWrap>User Name</Typography>
          <Typography variant="caption" color="text.secondary" noWrap>Admin</Typography>
        </Box>
        <IconButton size="small" color="inherit" onClick={handleLogout} disabled={loggingOut}>
          <ExitToAppIcon fontSize="small" />
        </IconButton>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      {/* App Bar */}
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            {(() => {
              // Flatten all menu items from all sections
              const allMenuItems = menuSections.flatMap(section => section.items);
              const currentItem = allMenuItems[selectedTab] || { text: 'dashboard' };
              return t(`menu.${currentItem.text}`);
            })()}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <LanguageSelector />
            <IconButton color="inherit" onClick={toggleTheme}>
              {mode === 'dark' ? '🌞' : '🌙'}
            </IconButton>
            <IconButton color="inherit">
              <NotificationsIcon />
            </IconButton>
            <Tooltip title="Account settings">
              <IconButton color="inherit">
                <Avatar sx={{ width: 32, height: 32 }}>U</Avatar>
              </IconButton>
            </Tooltip>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Sidebar Drawer */}
      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
        aria-label="mailbox folders"
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          mt: '64px', // Height of AppBar
          minHeight: 'calc(100vh - 64px)',
          backgroundColor: theme.palette.background.default,
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default DashboardLayout;
