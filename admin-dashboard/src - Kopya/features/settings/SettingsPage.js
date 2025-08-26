import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Switch,
  FormControlLabel,
  TextField,
  Button,
  Divider,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Avatar,
  InputAdornment,
  Snackbar,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  DarkMode as DarkModeIcon,
  Notifications as NotificationsIcon,
  Language as LanguageIcon,
  Email as EmailIcon,
  Lock as LockIcon,
  Person as PersonIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { useThemeContext } from '../../theme/ThemeContext';
import userService from '../../services/userService';

const SettingsPage = () => {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const { mode, toggleTheme } = useThemeContext();

  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    weeklyDigest: true,
  });
  const [language, setLanguage] = useState(i18n.language);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleNotificationChange = (event) => {
    setNotifications({
      ...notifications,
      [event.target.name]: event.target.checked,
    });
  };

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        const profile = await userService.getCurrentUserProfile();
        setUserProfile(profile);
        // Assuming notification and language settings are stored in user metadata/profile
        // If not, you might need a separate settings table
        setNotifications(profile.notifications_preferences || { email: true, push: true, weeklyDigest: true });
        setLanguage(profile.language_preference || i18n.language);
      } catch (err) {
        setError(t('settings.errors.loadProfileFailed'));
        setSnackbar({ open: true, message: t('settings.errors.loadProfileFailed'), severity: 'error' });
      } finally {
        setLoading(false);
      }
    };
    fetchUserProfile();
  }, [t, i18n.language]);

  const handleLanguageChange = (event) => {
    const newLang = event.target.value;
    setLanguage(newLang);
    i18n.changeLanguage(newLang);
  };

  const handleSaveChanges = async () => {
    try {
      const updates = {
        full_name: userProfile.full_name,
        phone: userProfile.phone,
        // Add other updatable fields here
        notifications_preferences: notifications,
        language_preference: language,
      };
      await userService.updateUserProfile(userProfile.id, updates);
      setSnackbar({ open: true, message: t('settings.success.profileUpdated'), severity: 'success' });
    } catch (err) {
      setSnackbar({ open: true, message: t('settings.errors.updateProfileFailed'), severity: 'error' });
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setSnackbar({ open: true, message: t('settings.errors.passwordsDoNotMatch'), severity: 'error' });
      return;
    }
    if (!newPassword) {
        setSnackbar({ open: true, message: t('settings.errors.passwordRequired'), severity: 'error' });
        return;
    }
    try {
      await userService.updateUserPassword(newPassword);
      setSnackbar({ open: true, message: t('settings.success.passwordUpdated'), severity: 'success' });
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setSnackbar({ open: true, message: t('settings.errors.updatePasswordFailed'), severity: 'error' });
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm(t('settings.account.deleteConfirmation'))) {
      try {
        await userService.deleteUserAccount(userProfile.id);
        setSnackbar({ open: true, message: t('settings.success.accountDeleted'), severity: 'info' });
        // Here you would typically log the user out and redirect
      } catch (err) {
        setSnackbar({ open: true, message: t('settings.errors.deleteAccountFailed'), severity: 'error' });
      }
    }
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar({ ...snackbar, open: false });
  };

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}><CircularProgress /></Box>;
  }

  if (error && !userProfile) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: { xs: 2, md: 3 } }}>
      <Typography variant="h4" component="h1" gutterBottom>
        {t('settings.title')}
      </Typography>

      {/* User Profile Section */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Avatar sx={{ width: 64, height: 64, mr: 2, bgcolor: 'primary.main' }}>
              {userProfile?.full_name?.charAt(0)}
            </Avatar>
            <Box>
              <Typography variant="h6">{userProfile?.full_name}</Typography>
              <Typography variant="body2" color="text.secondary">{userProfile?.email}</Typography>
            </Box>
          </Box>
          <TextField
            fullWidth
            margin="normal"
            label={t('settings.account.fullName')}
            value={userProfile?.full_name || ''}
            onChange={(e) => setUserProfile({ ...userProfile, full_name: e.target.value })}
            InputProps={{
              startAdornment: <InputAdornment position="start"><PersonIcon color="action" /></InputAdornment>,
            }}
          />
          <TextField
            fullWidth
            margin="normal"
            label={t('settings.account.phone')}
            value={userProfile?.phone || ''}
            onChange={(e) => setUserProfile({ ...userProfile, phone: e.target.value })}
            InputProps={{
              startAdornment: <InputAdornment position="start"><EmailIcon color="action" /></InputAdornment>,
            }}
          />
        </CardContent>
      </Card>
      
      {/* Theme Settings */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Box display="flex" alignItems="center">
              <DarkModeIcon color="primary" sx={{ mr: 1.5 }} />
              <Typography variant="h6">{t('settings.appearance.title')}</Typography>
            </Box>
            <FormControlLabel
              control={
                <Switch
                  checked={mode === 'dark'}
                  onChange={toggleTheme}
                  name="darkMode"
                  color="primary"
                />
              }
              label={t(mode === 'dark' ? 'settings.appearance.darkMode' : 'settings.appearance.lightMode')}
            />
          </Box>
          <Typography variant="body2" color="text.secondary">
            {t('settings.appearance.description')}
          </Typography>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            <NotificationsIcon color="primary" sx={{ mr: 1, verticalAlign: 'middle' }} />
            {t('settings.notifications.title')}
          </Typography>
          <List>
            <ListItem>
              <ListItemText 
                primary={t('settings.notifications.email')} 
                secondary={t('settings.notifications.emailDescription')} 
              />
              <ListItemSecondaryAction>
                <Switch
                  edge="end"
                  checked={notifications.email}
                  onChange={handleNotificationChange}
                  name="email"
                />
              </ListItemSecondaryAction>
            </ListItem>
            <Divider component="li" />
            <ListItem>
              <ListItemText 
                primary={t('settings.notifications.push')} 
                secondary={t('settings.notifications.pushDescription')} 
              />
              <ListItemSecondaryAction>
                <Switch
                  edge="end"
                  checked={notifications.push}
                  onChange={handleNotificationChange}
                  name="push"
                />
              </ListItemSecondaryAction>
            </ListItem>
            <Divider component="li" />
            <ListItem>
              <ListItemText 
                primary={t('settings.notifications.weeklyDigest')} 
                secondary={t('settings.notifications.weeklyDigestDescription')} 
              />
              <ListItemSecondaryAction>
                <Switch
                  edge="end"
                  checked={notifications.weeklyDigest}
                  onChange={handleNotificationChange}
                  name="weeklyDigest"
                />
              </ListItemSecondaryAction>
            </ListItem>
          </List>
        </CardContent>
      </Card>

      {/* Language */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            <LanguageIcon color="primary" sx={{ mr: 1, verticalAlign: 'middle' }} />
            {t('settings.language.title')}
          </Typography>
          <TextField
            select
            fullWidth
            label={t('settings.language.label')}
            value={language}
            onChange={handleLanguageChange}
            variant="outlined"
            margin="normal"
            SelectProps={{
              native: true,
            }}
          >
            <option value="en">English</option>
            <option value="tr">Türkçe</option>
            <option value="de">Deutsch</option>
            <option value="es">Español</option>
            <option value="fr">Français</option>
          </TextField>
        </CardContent>
      </Card>

      {/* Account Settings */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            <PersonIcon color="primary" sx={{ mr: 1, verticalAlign: 'middle' }} />
            {t('settings.account.title')}
          </Typography>
          
          <Box component="form" onSubmit={handlePasswordChange} sx={{ mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
              {t('settings.account.changePassword')}
            </Typography>


            <TextField
              fullWidth
              margin="normal"
              label={t('settings.account.newPassword')}
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              fullWidth
              margin="normal"
              label={t('settings.account.confirmNewPassword')}
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
              <Button type="submit" variant="contained" color="primary">
                {t('settings.account.updatePassword')}
              </Button>
            </Box>
          </Box>
          
          <Divider sx={{ my: 3 }} />
          
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              {t('settings.account.deleteAccount')}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {t('settings.account.deleteWarning')}
            </Typography>
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={handleDeleteAccount}
              sx={{ mt: 1 }}
            >
              {t('settings.account.deleteAccount')}
            </Button>
          </Box>
        </CardContent>
      </Card>
      
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={handleSaveChanges}
          size="large"
        >
          {t('settings.saveChanges')}
        </Button>
      </Box>

      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleSnackbarClose}>
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default SettingsPage;
