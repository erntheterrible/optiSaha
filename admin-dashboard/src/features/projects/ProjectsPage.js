import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Container, 
  Chip,
  TextField,
  InputAdornment,
  IconButton,
  Tooltip,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Avatar,
  Divider,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  OutlinedInput,
  Checkbox,
  ListItem,
  List,
  ListItemAvatar,
  ListItemText as MuiListItemText,
  LinearProgress,
  Snackbar,
  Alert
} from '@mui/material';
import { 
  Search as SearchIcon, 
  Edit as EditIcon, 
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
  Add as AddIcon,
  CalendarToday as CalendarIcon,
  Person as PersonIcon,
  AttachMoney as MoneyIcon,
  PriorityHigh as PriorityIcon,
  CheckCircle as CheckCircleIcon,
  AccessTime as AccessTimeIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import databaseService from '../../services/databaseService';
import EditProjectDialog from './EditProjectDialog';

// Status chip component with appropriate colors
const StatusChip = ({ status }) => {
  const { t } = useTranslation();
  
  const statusColors = {
    'new': 'info',
    'active': 'success',
    'in_progress': 'primary',
    'completed': 'secondary'
  };
  
  const statusLabels = {
    'new': t('projects.status.new'),
    'active': t('projects.status.active'),
    'in_progress': t('projects.status.inProgress'),
  'completed': t('projects.status.completed')
  };
  
  return (
    <Chip 
      label={statusLabels[status] || status}
      color={statusColors[status] || 'default'}
      variant="outlined"
      size="small"
      icon={status === 'completed' ? <CheckCircleIcon /> : status === 'in_progress' ? <AccessTimeIcon /> : <WarningIcon />}
    />
  );
};

// Priority chip component
const PriorityChip = ({ priority }) => {
  const { t } = useTranslation();
  
  const priorityColors = {
    'low': 'success',
    'medium': 'warning',
    'high': 'error'
  };
  
  const priorityLabels = {
    'low': t('projects.priority.low'),
    'medium': t('projects.priority.medium'),
    'high': t('projects.priority.high')
  };
  
  return (
    <Chip 
      label={priorityLabels[priority] || priority}
      color={priorityColors[priority] || 'default'}
      size="small"
      icon={<PriorityIcon />}
    />
  );
};

// Project card component
const ProjectCard = ({ project, onEdit, onDelete, onView }) => {
  const { t } = useTranslation();
  
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleClose = () => {
    setAnchorEl(null);
  };
  
  // Calculate progress percentage based on status
  const calculateProgress = (status) => {
    switch(status) {
      case 'new': return 0;
      case 'active': return 25;
      case 'in_progress': return 50;
      case 'completed': return 100;
      default: return 0;
    }
  };
  
  const progress = calculateProgress(project.status);
  
  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flexGrow: 1 }}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
          <Typography variant="h6" component="h3" gutterBottom>
            {project.name}
          </Typography>
          <IconButton
            aria-label="settings"
            onClick={handleClick}
            size="small"
          >
            <MoreVertIcon />
          </IconButton>
        </Box>
        
        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
        >
          <MenuItem onClick={() => {
            onView(project);
            handleClose();
          }}>
            <ListItemIcon>
              <SearchIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>{t('actions.view')}</ListItemText>
          </MenuItem>
          <MenuItem onClick={() => {
            onEdit(project);
            handleClose();
          }}>
            <ListItemIcon>
              <EditIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>{t('actions.edit')}</ListItemText>
          </MenuItem>
          <MenuItem onClick={() => {
            onDelete(project.id);
            handleClose();
          }}>
            <ListItemIcon>
              <DeleteIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>{t('actions.delete')}</ListItemText>
          </MenuItem>
        </Menu>
        
        <Typography variant="body2" color="text.secondary" paragraph>
          {project.description || t('projects.noDescription')}
        </Typography>
        
        <Divider sx={{ my: 1 }} />
        
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
          <Box display="flex" alignItems="center" gap={1}>
            <CalendarIcon fontSize="small" />
            <Typography variant="body2">
              {project.start_date ? new Date(project.start_date).toLocaleDateString() : t('common.none')}
            </Typography>
          </Box>
          <Box display="flex" alignItems="center" gap={1}>
            <MoneyIcon fontSize="small" />
            <Typography variant="body2">
              {project.budget ? `${project.budget.toLocaleString()} ₺` : t('common.none')}
            </Typography>
          </Box>
        </Box>
        
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
          <Box display="flex" alignItems="center" gap={1}>
            <PersonIcon fontSize="small" />
            <Typography variant="body2">
              {project.customer_name || t('common.none')}
            </Typography>
          </Box>
          <PriorityChip priority={project.priority} />
        </Box>
        
        <Box mt={1} mb={2}>
          <Box display="flex" justifyContent="space-between" mb={0.5}>
            <Typography variant="body2" color="text.secondary">
              {t('projects.progress')}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {progress}%
            </Typography>
          </Box>
          <LinearProgress variant="determinate" value={progress} />
        </Box>
        
        <Box mt={1}>
          <StatusChip status={project.status} />
        </Box>
      </CardContent>
      
      <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
        <Button 
          size="small" 
          startIcon={<SearchIcon />} 
          onClick={() => onView(project)}
        >
          {t('actions.view')}
        </Button>
        <Button 
          size="small" 
          startIcon={<EditIcon />} 
          onClick={() => onEdit(project)}
        >
          {t('actions.edit')}
        </Button>
      </CardActions>
    </Card>
  );
};

// Enhanced Project View Details Dialog
const ProjectViewDialog = ({ open, onClose, project }) => {
  const { t } = useTranslation();
  
  if (!project) return null;
  
  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return t('common.none');
    return new Date(dateString).toLocaleDateString();
  };
  
  // Format currency
  const formatCurrency = (amount) => {
    if (!amount) return t('common.none');
    return `${amount.toLocaleString()} ₺`;
  };
  
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={2}>
          <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56 }}>
            <PersonIcon />
          </Avatar>
          <Box>
            <Typography variant="h5" component="div">
              {project.name}
            </Typography>
            <Box display="flex" alignItems="center" gap={1} mt={0.5}>
              <StatusChip status={project.status} />
              <PriorityChip priority={project.priority} />
            </Box>
          </Box>
        </Box>
      </DialogTitle>
      
      <DialogContent dividers>
        <Grid container spacing={3}>
          {/* Project Description */}
          <Grid item xs={12}>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom color="primary">
                {t('projects.description')}
              </Typography>
              <Typography variant="body1">
                {project.description || t('projects.noDescription')}
              </Typography>
            </Paper>
          </Grid>
          
          {/* Project Details */}
          <Grid item xs={12} md={6}>
            <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
              <Typography variant="h6" gutterBottom color="primary">
                {t('projects.details')}
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    {t('projects.columns.startDate')}
                  </Typography>
                  <Typography variant="body1">
                    {formatDate(project.start_date)}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    {t('projects.columns.endDate')}
                  </Typography>
                  <Typography variant="body1">
                    {formatDate(project.end_date)}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    {t('projects.columns.budget')}
                  </Typography>
                  <Typography variant="body1">
                    {formatCurrency(project.budget)}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    {t('projects.columns.manager')}
                  </Typography>
                  <Typography variant="body1">
                    {project.assigned_to || t('common.none')}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    {t('projects.columns.priority')}
                  </Typography>
                  <PriorityChip priority={project.priority} />
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    {t('projects.columns.status')}
                  </Typography>
                  <StatusChip status={project.status} />
                </Grid>
              </Grid>
            </Paper>
          </Grid>
          
          {/* Customer Information */}
          <Grid item xs={12} md={6}>
            <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
              <Typography variant="h6" gutterBottom color="primary">
                {t('projects.customerInfo')}
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    {t('projects.columns.customer')}
                  </Typography>
                  <Typography variant="body1">
                    {project.customer_name || t('common.none')}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    {t('projects.columns.customerEmail')}
                  </Typography>
                  <Typography variant="body1">
                    {project.customer_email || t('common.none')}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    {t('projects.columns.customerPhone')}
                  </Typography>
                  <Typography variant="body1">
                    {project.customer_phone || t('common.none')}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    {t('projects.columns.location')}
                  </Typography>
                  <Typography variant="body1">
                    {project.location_address || t('common.none')}
                  </Typography>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
          
          {/* Additional Information */}
          <Grid item xs={12}>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom color="primary">
                {t('projects.additionalInfo')}
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    {t('projects.columns.createdBy')}
                  </Typography>
                  <Typography variant="body1">
                    {project.created_by || t('common.none')}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    {t('projects.columns.createdAt')}
                  </Typography>
                  <Typography variant="body1">
                    {formatDate(project.created_at)}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    {t('projects.columns.updatedAt')}
                  </Typography>
                  <Typography variant="body1">
                    {formatDate(project.updated_at)}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    {t('projects.columns.projectType')}
                  </Typography>
                  <Typography variant="body1">
                    {project.project_type || t('common.none')}
                  </Typography>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        </Grid>
      </DialogContent>
      
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} variant="outlined" color="primary">
          {t('common.close')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Status filter component
const StatusFilter = ({ selectedStatuses, onStatusChange }) => {
  const { t } = useTranslation();
  
  const statusOptions = [
    { value: 'new', label: t('projects.status.new') },
    { value: 'active', label: t('projects.status.active') },
    { value: 'in_progress', label: t('projects.status.inProgress') },
    { value: 'completed', label: t('projects.status.completed') }
  ];
  
  const handleChange = (event) => {
    const value = event.target.value;
    onStatusChange(value);
  };
  
  return (
    <FormControl sx={{ minWidth: 200 }} size="small">
      <InputLabel id="status-filter-label">{t('projects.columns.status')}</InputLabel>
      <Select
        labelId="status-filter-label"
        id="status-filter"
        multiple
        value={selectedStatuses}
        onChange={handleChange}
        input={<OutlinedInput label={t('projects.columns.status')} />}
        renderValue={(selected) => selected.join(', ')}
      >
        {statusOptions.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            <Checkbox checked={selectedStatuses.indexOf(option.value) > -1} />
            <MuiListItemText primary={option.label} />
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

// Priority filter component
const PriorityFilter = ({ selectedPriorities, onPriorityChange }) => {
  const { t } = useTranslation();
  
  const priorityOptions = [
    { value: 'low', label: t('projects.priority.low') },
    { value: 'medium', label: t('projects.priority.medium') },
    { value: 'high', label: t('projects.priority.high') }
  ];
  
  const handleChange = (event) => {
    const value = event.target.value;
    onPriorityChange(value);
  };
  
  return (
    <FormControl sx={{ minWidth: 200 }} size="small">
      <InputLabel id="priority-filter-label">{t('projects.columns.priority')}</InputLabel>
      <Select
        labelId="priority-filter-label"
        id="priority-filter"
        multiple
        value={selectedPriorities}
        onChange={handleChange}
        input={<OutlinedInput label={t('projects.columns.priority')} />}
        renderValue={(selected) => selected.join(', ')}
      >
        {priorityOptions.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            <Checkbox checked={selectedPriorities.indexOf(option.value) > -1} />
            <MuiListItemText primary={option.label} />
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

const ProjectsPage = () => {
  const { t } = useTranslation();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(12); // Changed to 12 for grid layout
  const [searchTerm, setSearchTerm] = useState('');
  
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filter states
  const [selectedStatuses, setSelectedStatuses] = useState([]);
  const [selectedPriorities, setSelectedPriorities] = useState([]);
  
  // Quick view dialog state
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  // Edit dialog state
  const [editOpen, setEditOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const data = await databaseService.getProjects();
        setProjects(data);
      } catch (err) {
        console.error(err);
        setError(t('projects.errors.loadFailed'));
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, [t]);

  // Filter projects based on search term and filters
  const filteredProjects = projects.filter(project => {
    const matchesSearch = 
      project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (project.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (project.customer_name || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = selectedStatuses.length === 0 || selectedStatuses.includes(project.status);
    const matchesPriority = selectedPriorities.length === 0 || selectedPriorities.includes(project.priority);
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  // Pagination
  const paginatedProjects = filteredProjects.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

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

  const handleDelete = async (projectId) => {
    if (window.confirm(t('projects.deleteConfirm'))) {
      try {
        await databaseService.deleteProject(projectId);
        setProjects(projects.filter(p => p.id !== projectId));
      } catch (err) {
        console.error('Failed to delete project', err);
        setError(t('projects.errors.deleteFailed'));
      }
    }
  };
  
  const handleViewProject = (project) => {
    setSelectedProject(project);
    setQuickViewOpen(true);
  };
  
  const handleEditProject = (project) => {
    setSelectedProject(project);
    setEditOpen(true);
  };
  
  const handleAddProject = () => {
    setSelectedProject(null);
    setEditOpen(true);
  };
  
  const handleSaveProject = async (projectData) => {
    try {
      if (projectData.id) {
        // Update existing project
        await databaseService.updateProject(projectData);
        setProjects(prev => prev.map(p => p.id === projectData.id ? { ...p, ...projectData } : p));
        setSnackbar({ open: true, message: t('projects.success.updated'), severity: 'success' });
      } else {
        // Add new project
        const newProject = await databaseService.createProject(projectData);
        setProjects(prev => [...prev, newProject]);
        setSnackbar({ open: true, message: t('projects.success.created'), severity: 'success' });
      }
      setEditOpen(false);
    } catch (error) {
      console.error('Error saving project:', error);
      setSnackbar({ open: true, message: t('projects.errors.saveFailed'), severity: 'error' });
    }
  };
  
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  const handleSnackbarClose = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };
  
  const handleStatusFilterChange = (statuses) => {
    setSelectedStatuses(statuses);
    setPage(0);
  };
  
  const handlePriorityFilterChange = (priorities) => {
    setSelectedPriorities(priorities);
    setPage(0);
  };
  
  const clearFilters = () => {
    setSearchTerm('');
    setSelectedStatuses([]);
    setSelectedPriorities([]);
    setPage(0);
  };

  if (loading) {
    return <Box py={5} textAlign="center"><CircularProgress /></Box>;
  }
  
  if (error) {
    return <Typography color="error" align="center" sx={{ mt: 4 }}>{error}</Typography>;
  }

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Container maxWidth="xl">
        <Paper sx={{ p: 3, mb: 3 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <div>
              <Typography variant="h4" component="h1" gutterBottom>
                {t('menu.projects')}
              </Typography>
              <Typography variant="body1">
                {t('projects.pageDescription')}
              </Typography>
            </div>
            <Button 
              variant="contained" 
              startIcon={<AddIcon />} 
              onClick={handleAddProject}
            >
              {t('projects.addProject')}
            </Button>
          </Box>
          
          <Box display="flex" flexWrap="wrap" gap={2} mb={2}>
            <TextField
              variant="outlined"
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
              size="small"
              sx={{ minWidth: 250 }}
            />
            
            <StatusFilter 
              selectedStatuses={selectedStatuses} 
              onStatusChange={handleStatusFilterChange} 
            />
            
            <PriorityFilter 
              selectedPriorities={selectedPriorities} 
              onPriorityChange={handlePriorityFilterChange} 
            />
            
            {(searchTerm || selectedStatuses.length > 0 || selectedPriorities.length > 0) && (
              <Button 
                variant="outlined" 
                onClick={clearFilters}
                size="small"
              >
                {t('common.clearFilters')}
              </Button>
            )}
          </Box>
        </Paper>
        
        {paginatedProjects.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h6" gutterBottom>
              {t('projects.noProjectsFound')}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {t('projects.tryAdjustingFilters')}
            </Typography>
          </Paper>
        ) : (
          <>
            <Grid container spacing={3}>
              {paginatedProjects.map((project) => (
                <Grid item xs={12} sm={6} md={4} key={project.id}>
                  <ProjectCard 
                    project={project}
                    onEdit={handleEditProject}
                    onDelete={handleDelete}
                    onView={handleViewProject}
                  />
                </Grid>
              ))}
            </Grid>
            
            {/* Pagination */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 3 }}>
              <Typography variant="body2" color="text.secondary">
                {t('common.showing')} {page * rowsPerPage + 1}-{Math.min((page + 1) * rowsPerPage, filteredProjects.length)} {t('common.of')} {filteredProjects.length} {t('projects.projects')}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button 
                  onClick={() => handleChangePage(null, page - 1)} 
                  disabled={page === 0}
                >
                  {t('common.previous')}
                </Button>
                <Button 
                  onClick={() => handleChangePage(null, page + 1)} 
                  disabled={(page + 1) * rowsPerPage >= filteredProjects.length}
                >
                  {t('common.next')}
                </Button>
              </Box>
            </Box>
          </>
        )}
      </Container>
      
      <ProjectViewDialog 
        open={quickViewOpen} 
        onClose={() => setQuickViewOpen(false)} 
        project={selectedProject} 
      />
      
      <EditProjectDialog 
        open={editOpen} 
        onClose={() => setEditOpen(false)} 
        project={selectedProject} 
        onSave={handleSaveProject} 
      />
      
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ProjectsPage;
