import React from 'react';
import { Outlet, Route } from 'react-router-dom';
import { Box, Drawer, List, ListItemButton, ListItemIcon, ListItemText, AppBar, Toolbar, IconButton, Typography, useTheme, Collapse } from '@mui/material';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import HomeIcon from '@mui/icons-material/Home';
import PeopleIcon from '@mui/icons-material/People';
import FolderIcon from '@mui/icons-material/Folder';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import GroupIcon from '@mui/icons-material/Group';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import NotesIcon from '@mui/icons-material/Notes';
import SettingsIcon from '@mui/icons-material/Settings';
import MenuIcon from '@mui/icons-material/Menu';
import RegionsPage from '../features/regions/RegionsPage';

const drawerWidth = 240;

const navItems = [
  { label: 'Dashboard', icon: <HomeIcon />, path: '/' },
  { label: 'Regions', icon: <FolderIcon />, path: '/regions' },
  { label: 'Calendar', icon: <CalendarMonthIcon />, path: '/calendar' },
  { label: 'Customer Management', icon: <FolderIcon />, children: [
    { label: 'Customers', icon: <PeopleIcon />, path: '/customers' },
    { label: 'Deals', icon: <AssignmentTurnedInIcon />, path: '/deals' },
    { label: 'Leads', icon: <PeopleIcon />, path: '/leads' },
    { label: 'Projects', icon: <AccountTreeIcon />, path: '/projects' },
    { label: 'User Database', icon: <GroupIcon />, path: '/users' },
  ] },
  { label: 'Notes', icon: <NotesIcon />, path: '/notes' },
  { label: 'Settings', icon: <SettingsIcon />, path: '/settings' },

];

import { useNavigate, useLocation } from 'react-router-dom';
const AppLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const [openCM, setOpenCM] = React.useState(true);

  const handleNav = (path) => {
    navigate(path);
  };

  return (
    <Box sx={{ display: 'flex', height: '100vh', bgcolor: 'background.default' }}>
      {/* Sidebar */}
      <Drawer
        variant="permanent"
        PaperProps={{
          sx: {
            width: drawerWidth,
            bgcolor: '#fff',
            color: 'text.primary',
            borderRight: 'none',
            pt: 3,
            boxShadow: '2px 0 12px 0 rgba(25, 118, 210, 0.08)',
          },
        }}
      >
        {/* Profile/Logo Area */}
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
          <Box sx={{ bgcolor: '#fff', borderRadius: '50%', p: 0.5, mb: 1 }}>
            <img src="/logo192.png" alt="Logo" width={40} height={40} />
          </Box>
          <Box sx={{ bgcolor: 'primary.light', color: 'primary.contrastText', borderRadius: 2, px: 2, py: 0.5, fontWeight: 600, fontSize: 13 }}>
            Unity
          </Box>
        </Box>
        <List sx={{ width: '100%' }}>
          {navItems.map((item) => (
            item.children ? (
              <React.Fragment key={item.label}>
                <ListItemButton onClick={()=>setOpenCM(!openCM)}
                  sx={{ px:2, bgcolor: openCM ? 'primary.main' : 'transparent', color: openCM ? '#fff' : 'text.primary', '&:hover': { bgcolor: openCM ? 'primary.dark' : 'action.hover' } }}>
                  <ListItemIcon sx={{ color: openCM ? '#fff' : 'text.primary' }}>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.label} />
                  {openCM ? <ExpandLess sx={{ color:'#fff' }} /> : <ExpandMore />}
                </ListItemButton>
                <Collapse in={openCM} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding>
                    {item.children.map((sub)=> (
                      <ListItemButton key={sub.label} onClick={()=>handleNav(sub.path)} sx={{ pl:4 }} selected={location.pathname.startsWith(sub.path)}>
                        <ListItemIcon sx={{ color:'primary.main' }}>{sub.icon}</ListItemIcon>
                        <ListItemText primary={sub.label} />
                      </ListItemButton>
                    ))}
                  </List>
                </Collapse>
              </React.Fragment>
            ) : (
              <ListItemButton key={item.label} onClick={()=>handleNav(item.path)} selected={location.pathname===item.path} sx={{ px:2 }}>
                <ListItemIcon sx={{ color:'primary.main' }}>{item.icon}</ListItemIcon>
                <ListItemText primary={item.label} sx={{ color:'text.primary' }} />
              </ListItemButton>
            )
          ))}
        </List>
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1 }}>
        {/* Top Bar */}
        <AppBar
          elevation={0}
          position="sticky"
          sx={{ bgcolor: '#fff', color: 'text.primary', borderBottom: '1px solid #e3e8ee', boxShadow: 'none' }}
        >
          <Toolbar>
            <IconButton edge="start" color="primary" sx={{ mr: 2, display: { md: 'none' } }}>
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 700, color: 'primary.main', letterSpacing: 1 }}>
              Unity Dashboard
            </Typography>
            {/* Placeholder for user avatar and icons */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <IconButton color="primary">
                <img src="https://randomuser.me/api/portraits/men/75.jpg" alt="avatar" style={{ width: 36, height: 36, borderRadius: '50%' }} />
              </IconButton>
            </Box>
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
