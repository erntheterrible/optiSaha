import React from 'react';
import { Outlet } from 'react-router-dom';
import { Box, Drawer, List, ListItemButton, ListItemIcon, ListItemText, AppBar, Toolbar, IconButton, Typography, useTheme } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import PeopleIcon from '@mui/icons-material/People';
import FolderIcon from '@mui/icons-material/Folder';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import NotesIcon from '@mui/icons-material/Notes';
import SettingsIcon from '@mui/icons-material/Settings';
import MenuIcon from '@mui/icons-material/Menu';

const drawerWidth = 80;

const navItems = [
  { label: 'Dashboard', icon: <HomeIcon />, path: '/' },
  { label: 'Leads', icon: <PeopleIcon />, path: '/leads' },
  { label: 'Projects', icon: <FolderIcon />, path: '/projects' },
  { label: 'Calendar', icon: <CalendarMonthIcon />, path: '/calendar' },
  { label: 'Notes', icon: <NotesIcon />, path: '/notes' },
  { label: 'Settings', icon: <SettingsIcon />, path: '/settings' },
];

const AppLayout = () => {
  const theme = useTheme();

  return (
    <Box sx={{ display: 'flex', height: '100vh', bgcolor: 'background.default' }}>
      {/* Sidebar */}
      <Drawer
        variant="permanent"
        PaperProps={{
          sx: {
            width: drawerWidth,
            bgcolor: '#0F172A',
            color: '#fff',
            borderRight: 'none',
            pt: 1,
          },
        }}
      >
        <List sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {navItems.map((item) => (
            <ListItemButton key={item.label} sx={{ my: 1, borderRadius: 2, width: '64px', justifyContent: 'center' }}>
              <ListItemIcon sx={{ color: 'inherit', minWidth: 0 }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} sx={{ display: 'none' }} />
            </ListItemButton>
          ))}
        </List>
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1 }}>
        {/* Top Bar */}
        <AppBar
          elevation={0}
          position="sticky"
          sx={{ bgcolor: 'background.paper', color: 'text.primary', boxShadow: theme.shadows[1] }}
        >
          <Toolbar>
            <IconButton edge="start" color="inherit" sx={{ mr: 1, display: { md: 'none' } }}>
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              OptiSaha Admin
            </Typography>
          </Toolbar>
        </AppBar>

        {/* Page Content */}
        <Box sx={{ p: { xs: 2, md: 3 } }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default AppLayout;
