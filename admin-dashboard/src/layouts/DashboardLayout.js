import React, { useState, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Collapse from '@mui/material/Collapse';
import { useTranslation } from 'react-i18next';
import { styled, useTheme } from '@mui/material/styles';
import {
  AppBar,
  Box,
  CssBaseline,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  useMediaQuery,
  Avatar,
  Menu,
  MenuItem,
  Tooltip,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Map as MapIcon,
  People as PeopleIcon,
  Assignment as AssignmentIcon,
  BarChart as BarChartIcon,
  InsertChart as InsertChartIcon,
  Settings as SettingsIcon,
  HelpOutline as HelpOutlineIcon,
  Logout as LogoutIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Notifications as NotificationsIcon,
  Mail as MailIcon,
  Apps as AppsIcon, // Grid icon
  BusinessCenter as BusinessCenterIcon,
  ExpandLess,
  ExpandMore,
  AttachMoney as AttachMoneyIcon,
  Group as GroupIcon,
} from '@mui/icons-material';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';

import { useSupabase } from '../contexts/SupabaseContext';

const drawerWidth = 240;

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
  justifyContent: 'flex-end',
}));

const Main = styled('main', {
  shouldForwardProp: (prop) => prop !== 'open',
})(({ theme, open }) => ({
  flexGrow: 1,
  padding: theme.spacing(3),
  transition: theme.transitions.create('margin', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  marginLeft: `-${drawerWidth}px`,
  ...(open && {
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    marginLeft: 0,
  }),
}));

const DashboardLayout = ({ children }) => {
  const { t } = useTranslation();
  const theme = useTheme();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [openCustomerManagement, setOpenCustomerManagement] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useSupabase();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  const menuItems = [
    { text: t('menu.dashboard'), icon: <DashboardIcon />, path: '/' },
    {
      text: t('menu.customerManagement'),
      icon: <BusinessCenterIcon />,
      children: [
        { text: t('menu.customers'), icon: <PeopleIcon />, path: '/customers' },
        { text: t('menu.deals'), icon: <AttachMoneyIcon />, path: '/deals' },
        { text: t('menu.leads'), icon: <PeopleIcon />, path: '/leads' },
        { text: t('menu.projects'), icon: <AssignmentIcon />, path: '/projects' },
        { text: t('menu.userDatabase'), icon: <GroupIcon />, path: '/user-database' },
      ],
    },
    { text: t('menu.calendar'), icon: <InsertChartIcon />, path: '/calendar' },
    { text: t('menu.notes'), icon: <AssignmentIcon />, path: '/notes' },
    { text: t('menu.regions'), icon: <MapIcon />, path: '/regions' },
    { text: t('menu.reports'), icon: <BarChartIcon />, path: '/reports' },
  ];

  const bottomMenuItems = [
    { text: t('menu.settings'), icon: <SettingsIcon />, path: '/settings' },
    { text: t('menu.helpSupport'), icon: <HelpOutlineIcon />, path: '/help' },
  ];

  const drawer = (
    <div>
      <DrawerHeader>
        <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, ml: 1 }}>
          {t('app.name')}
        </Typography>
        <IconButton onClick={handleDrawerToggle}>
          {theme.direction === 'ltr' ? <ChevronLeftIcon /> : <ChevronRightIcon />}
        </IconButton>
      </DrawerHeader>
      <Divider />
      <List>
        {menuItems.map((item) => {
          if (item.children) {
            return (
              <React.Fragment key={item.text}>
                <ListItemButton onClick={() => setOpenCustomerManagement(!openCustomerManagement)}>
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.text} />
                  {openCustomerManagement ? <ExpandLess /> : <ExpandMore />}
                </ListItemButton>
                <Collapse in={openCustomerManagement} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding>
                    {item.children.map((child) => (
                      <ListItemButton
                        key={child.text}
                        sx={{ pl: 4 }}
                        selected={location.pathname === child.path}
                        onClick={() => navigate(child.path)}
                      >
                        <ListItemIcon>{child.icon}</ListItemIcon>
                        <ListItemText primary={child.text} />
                      </ListItemButton>
                    ))}
                  </List>
                </Collapse>
              </React.Fragment>
            );
          }
          return (
            <ListItem key={item.text} disablePadding>
              <ListItemButton
                selected={location.pathname === item.path}
                onClick={() => navigate(item.path)}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
      <Divider />
      <List sx={{ mt: 'auto' }}>
        {bottomMenuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => navigate(item.path)}
              component="div"
              disableRipple
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </div>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          backgroundColor: 'background.paper',
          color: 'text.primary',
          boxShadow: '0 1px 4px 0 rgba(0,0,0,0.1)'
        }}
      >
        <Toolbar sx={{ paddingY: 2 }}>
          {/* Left Section: Mobile Menu + Breadcrumbs */}
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, display: { sm: 'none' } }}
            >
              <MenuIcon />
            </IconButton>
            <Breadcrumbs aria-label="breadcrumb" sx={{ display: { xs: 'none', sm: 'block' } }}>
              <Link underline="hover" color="inherit" href="/">
                {t('menu.dashboard')}
              </Link>
              <Typography color="text.primary">
                {menuItems.find(item => item.path === location.pathname)?.text || ''}
              </Typography>
            </Breadcrumbs>
          </Box>

          {/* Center Section: Logo */}
          <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center' }}>
            <Typography variant="h6" noWrap component="div">
              {t('app.name')}
            </Typography>
          </Box>

          {/* Right Section: Actions & Profile */}
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Tooltip title={t('common.grid')}>
              <IconButton color="inherit">
                <AppsIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title={t('common.notifications')}>
              <IconButton color="inherit">
                <NotificationsIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title={t('common.mail')}>
              <IconButton color="inherit">
                <MailIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title={t('common.profile')}>
              <IconButton
                size="large"
                edge="end"
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleProfileMenuOpen}
                color="inherit"
              >
                <Avatar
                  alt={user?.email || 'User'}
                  src={user?.user_metadata?.avatar_url}
                  sx={{ width: 32, height: 32 }}
                >
                  {user?.email?.[0]?.toUpperCase()}
                </Avatar>
              </IconButton>
            </Tooltip>
            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
            >
              <MenuItem onClick={() => navigate('/profile')}>
                {t('common.profile')}
              </MenuItem>
              <MenuItem onClick={handleLogout}>
                <ListItemIcon>
                  <LogoutIcon fontSize="small" />
                </ListItemIcon>
                {t('common.logout')}
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
        aria-label="mailbox folders"
      >
        <Drawer
          variant={isMobile ? 'temporary' : 'permanent'}
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              display: 'flex',
              flexDirection: 'column',
            },
          }}
        >
          {drawer}
        </Drawer>
      </Box>
      <Main open={mobileOpen}>
        <DrawerHeader />
        {children}
      </Main>
    </Box>
  );
};

export default DashboardLayout;
