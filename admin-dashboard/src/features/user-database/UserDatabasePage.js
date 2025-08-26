import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Button,
  TextField,
  InputAdornment,
  Chip,
  Tooltip,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  FormHelperText,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import databaseService from '../../services/databaseService';

const UserDatabasePage = () => {
  const { t } = useTranslation();
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await databaseService.getUsers();
        setUsers(data);
      } catch (err) {
        console.error(err);
        setError(t('userDatabase.errors.loadFailed'));
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  const handleOpenDialog = (user = null) => {
    setSelectedUser(user);
    setIsEditMode(!!user);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedUser(null);
  };

  const handleSaveUser = async (userData) => {
    try {
      if (isEditMode) {
        const updatedUser = await databaseService.updateUser(selectedUser.id, userData);
        setUsers(users.map(u => u.id === updatedUser.id ? updatedUser : u));
      } else {
        const newUser = await databaseService.createUser(userData);
        setUsers([...users, newUser]);
      }
      handleCloseDialog();
    } catch (error) {
      console.error('Failed to save user:', error);
      alert(t('userDatabase.errors.saveFailed'));
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm(t('common.confirmDelete'))) {
      try {
        await databaseService.deleteUser(userId);
        setUsers(users.filter(user => user.id !== userId));
      } catch (error) {
        console.error('Failed to delete user:', error);
        alert(t('userDatabase.errors.deleteFailed'));
      }
    }
  };

  const handleToggleStatus = (userId) => {
    setUsers(users.map(user => 
      user.id === userId 
        ? { 
            ...user, 
            status: user.status === 'active' ? 'inactive' : 'active' 
          } 
        : user
    ));
  };

  // Filter users based on search term
  const filteredUsers = users.filter(user =>
    (user.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.email || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <Box py={5} textAlign="center"><CircularProgress /></Box>;
  }
  if (error) {
    return <Typography color="error" align="center" sx={{ mt: 4 }}>{error}</Typography>;
  }

  // Pagination
  const paginatedUsers = filteredUsers.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          {t('menu.userDatabase')}
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          {t('common.add')}
        </Button>
      </Box>

      <Paper sx={{ p: 2, mb: 3 }}>
        <TextField
          fullWidth
          placeholder={t('common.search')}
          value={searchTerm}
          onChange={handleSearch}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Paper>

      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>{t('userDatabase.table.name')}</TableCell>
                <TableCell>{t('userDatabase.table.email')}</TableCell>
                <TableCell>{t('userDatabase.table.role')}</TableCell>
                <TableCell>{t('userDatabase.table.status')}</TableCell>
                <TableCell align="right">{t('common.actions')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedUsers.map((user) => (
                <TableRow key={user.id} hover>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Chip 
                      label={user.role} 
                      size="small" 
                      color={user.role === 'admin' ? 'error' : user.role === 'manager' ? 'warning' : 'default'}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={user.status === 'active' ? t('userDatabase.status.active') : t('userDatabase.status.inactive')} 
                      size="small" 
                      color={user.status === 'active' ? 'success' : 'default'}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title={t('common.edit')}>
                      <IconButton onClick={() => handleOpenDialog(user)} size="small">
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title={user.status === 'active' ? t('userDatabase.actions.deactivate') : t('userDatabase.actions.activate')}>
                      <IconButton 
                        onClick={() => handleToggleStatus(user.id)} 
                        size="small"
                        color={user.status === 'active' ? 'success' : 'default'}
                      >
                        {user.status === 'active' ? <CheckCircleIcon /> : <CancelIcon />}
                      </IconButton>
                    </Tooltip>
                    <Tooltip title={t('common.delete')}>
                      <IconButton 
                        onClick={() => handleDeleteUser(user.id)} 
                        size="small"
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
              {paginatedUsers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    {t('userDatabase.noUsersFound')}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredUsers.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage={t('userDatabase.table.rowsPerPage')}
        />
      </Paper>

      <UserDialog
        open={openDialog}
        onClose={handleCloseDialog}
        onSave={handleSaveUser}
        user={selectedUser}
        isEditMode={isEditMode}
      />
    </Box>
  );
};

// User Dialog Component
const UserDialog = ({ open, onClose, onSave, user, isEditMode }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'user',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        role: user.role,
      });
    } else {
      setFormData({
        name: '',
        email: '',
        role: 'user',
      });
    }
    setErrors({});
  }, [user]);

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = t('userDatabase.errors.nameRequired');
    if (!formData.email.trim()) {
      newErrors.email = t('userDatabase.errors.emailRequired');
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = t('common.invalidEmail');
    }
    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    onSave(formData);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {isEditMode ? t('userDatabase.editUser') : t('userDatabase.addUser')}
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="name"
            label={t('userDatabase.form.name')}
            type="text"
            fullWidth
            variant="outlined"
            value={formData.name}
            onChange={handleChange}
            error={!!errors.name}
            helperText={errors.name}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            name="email"
            label={t('userDatabase.form.email')}
            type="email"
            fullWidth
            variant="outlined"
            value={formData.email}
            onChange={handleChange}
            error={!!errors.email}
            helperText={errors.email}
            disabled={isEditMode}
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth variant="outlined" margin="dense">
            <InputLabel id="role-label">{t('userDatabase.form.role')}</InputLabel>
            <Select
              labelId="role-label"
              name="role"
              value={formData.role}
              onChange={handleChange}
              label={t('userDatabase.form.role')}
            >
              <MenuItem value="admin">{t('userDatabase.roles.admin')}</MenuItem>
              <MenuItem value="manager">{t('userDatabase.roles.manager')}</MenuItem>
              <MenuItem value="user">{t('userDatabase.roles.user')}</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} color="inherit">
            {t('common.cancel')}
          </Button>
          <Button type="submit" color="primary" variant="contained">
            {isEditMode ? t('common.save') : t('common.add')}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default UserDatabasePage;
