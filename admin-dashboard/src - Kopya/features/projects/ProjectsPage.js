import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Container, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Chip,
  TablePagination,
  TextField,
  InputAdornment,
  IconButton,
  Tooltip,
  CircularProgress
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { Search as SearchIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import databaseService from '../../services/databaseService';

// Status chip component with appropriate colors
const StatusChip = ({ status }) => {
  const { t } = useTranslation();
  
  const statusColors = {
    'active': 'success',
    'in_progress': 'primary',
    'completed': 'secondary'
  };
  
  const statusLabels = {
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
    />
  );
};

const ProjectsPage = () => {
  const { t } = useTranslation();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  // Filter projects based on search term
  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (project.manager || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination
  const paginatedProjects = filteredProjects.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  if (loading) {
    return <Box py={5} textAlign="center"><CircularProgress /></Box>;
  }
  if (error) {
    return <Typography color="error" align="center" sx={{ mt: 4 }}>{error}</Typography>;
  }

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
  


  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Container maxWidth="xl">
        <Paper sx={{ p: 3, mb: 3 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <div>
              <Typography variant="h4" component="h1" gutterBottom>
                {t('menu.projects')}
              </Typography>
              <Typography variant="body1">
                {t('projects.pageDescription')}
              </Typography>
            </div>
            <Box>
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
              />
            </Box>
          </Box>
        </Paper>
        
        <Paper sx={{ overflow: 'hidden' }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>{t('projects.columns.name')}</TableCell>
                  <TableCell>{t('projects.columns.status')}</TableCell>
                  <TableCell>{t('projects.columns.startDate')}</TableCell>
                  <TableCell>{t('projects.columns.endDate')}</TableCell>
                  <TableCell>{t('projects.columns.manager')}</TableCell>
                  <TableCell align="right">{t('actions.title')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedProjects.map((project) => (
                  <TableRow key={project.id} hover>
                    <TableCell>{project.name}</TableCell>
                    <TableCell>
                      <StatusChip status={project.status} />
                    </TableCell>
                    <TableCell>{new Date(project.startDate).toLocaleDateString()}</TableCell>
                    <TableCell>{new Date(project.endDate).toLocaleDateString()}</TableCell>
                    <TableCell>{project.manager}</TableCell>
                    <TableCell align="right">
                      <Tooltip title={t('actions.edit')}>
                        <IconButton size="small">
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={t('actions.delete')}>
                        <IconButton size="small" color="error" onClick={() => handleDelete(project.id)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
                {paginatedProjects.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      {t('projects.noProjectsFound')}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={filteredProjects.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage={t('common.rowsPerPage')}
            labelDisplayedRows={({ from, to, count }) => 
              `${from}-${to} ${t('common.of')} ${count !== -1 ? count : `more than ${to}`}`
            }
          />
        </Paper>
      </Container>
    </Box>
  );
};

export default ProjectsPage;
