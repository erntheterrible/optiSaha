import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Typography,
  Paper,
  Button,
  Chip,
  IconButton,
  Tooltip,
  TextField,
  InputAdornment,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  Grid,
  Avatar,
  Badge,
  Divider,
  Tabs,
  Tab,
  CircularProgress
} from '@mui/material';
import LeadDialog from './LeadDialog';
import LeadImportDialog from './LeadImportDialog'; // Import the new component
import {
  Add as AddIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  PersonAdd as PersonAddIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  Description as DescriptionIcon,
  UploadFile as UploadFileIcon // Import for import button
} from '@mui/icons-material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { format, isValid } from 'date-fns';
import databaseService from '../../services/databaseService';
import { tr, enUS } from 'date-fns/locale';

// Format date helper
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return isValid(date) ? format(date, 'dd MMM yyyy', { locale: enUS }) : '';
};

// Lead statuses



const LeadsPage = () => {
  const [tabValue, setTabValue] = useState(0);
  const [leadsByStatus, setLeadsByStatus] = useState({});

    const { t, i18n } = useTranslation();

  const statuses = useMemo(() => [
    { id: 'new', label: t('leads.status.new'), color: 'primary.main' },
    { id: 'contacted', label: t('leads.status.contacted'), color: 'info.main' },
    { id: 'qualified', label: t('leads.status.qualified'), color: 'success.main' },
    { id: 'proposal', label: t('leads.status.proposal'), color: 'warning.main' },
    { id: 'negotiation', label: t('leads.status.negotiation'), color: 'secondary.main' },
    { id: 'closed_won', label: t('leads.status.closed_won'), color: 'success.dark' },
    { id: 'closed_lost', label: t('leads.status.closed_lost'), color: 'error.main' },
  ], [t]);

  const fetchLeads = useCallback(async () => {
    try {
      setLoading(true);
      const data = await databaseService.getLeads();
      setRows(data);
      // group by status for any tabs that rely on it
      const grouped = {};
      statuses.forEach(s => { grouped[s.id] = data.filter(l => l.status === s.id); });
      setLeadsByStatus(grouped);
    } catch (err) {
      console.error(err);
      setError('Failed to load leads');
    } finally {
      setLoading(false);
    }
  }, [statuses]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const handleOpenImportDialog = () => {
    setOpenImportDialog(true);
  };

  const handleCloseImportDialog = () => {
    setOpenImportDialog(false);
    // Optionally refresh leads after import
    fetchLeads();
  };

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedLead, setSelectedLead] = useState(null);
  const [openLeadDialog, setOpenLeadDialog] = useState(false);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openImportDialog, setOpenImportDialog] = useState(false); // New state for import dialog
  
  // Get status color
  const getStatusColor = (status) => {
    const colors = {
      new: 'primary',
      contacted: 'info',
      qualified: 'success',
      proposal: 'warning',
      negotiation: 'secondary',
      closed_won: 'success',
      closed_lost: 'error'
    };
    return colors[status] || 'default';
  };

  // Filter leads based on search term and status
  const filteredLeads = useMemo(() => {
    if (loading) return [];
    return rows.filter(lead => {
      const matchesSearch = 
        lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.phone.includes(searchTerm);
      
      const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [rows, searchTerm, statusFilter]);

  // Handle menu actions
  const handleMenuOpen = (event, lead) => {
    setAnchorEl(event.currentTarget);
    setSelectedLead(lead);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedLead(null);
  };

  // Handle dialog actions
  const handleOpenLeadDialog = (lead = null) => {
    setSelectedLead(lead);
    setOpenLeadDialog(true);
  };

  const handleCloseLeadDialog = () => {
    setOpenLeadDialog(false);
    setSelectedLead(null);
  };

  // Handle lead actions
  const handleDeleteLead = async () => {
    if (window.confirm(t('leads.deleteConfirm'))) {
      try {
        await databaseService.deleteLead(selectedLead.id);
        setRows(rows.filter(lead => lead.id !== selectedLead.id));
        handleMenuClose();
        alert(t('leads.deleteSuccess'));
      } catch (error) {
        console.error('Failed to delete lead:', error);
        alert('Failed to delete lead. Please try again.');
      }
    }
  };

  const handleEditLead = () => {
    handleOpenLeadDialog(selectedLead);
  };

  const handleViewDetails = () => {
    // In a real app, this would navigate to a details page
    handleOpenLeadDialog();
  };

  const handleConvertToCustomer = () => {
    // In a real app, this would convert the lead to a customer
    alert(`Lead "${selectedLead.name}" converted to customer`);
    handleMenuClose();
  };

  const handleSaveLead = async (leadData) => {
    try {
      if (leadData.id) {
        await databaseService.updateLead(leadData.id, leadData);
        alert('Lead updated successfully!');
      } else {
        await databaseService.createLead(leadData);
        alert('Lead created successfully!');
      }
      fetchLeads(); // Refresh leads after save
      handleCloseLeadDialog(); // Close the dialog after saving
    } catch (error) {
      console.error('Failed to save lead:', error);
      alert('Failed to save lead. Please try again.');
    }
  };



  // Define columns for the DataGrid
  const columns = [
    { 
      field: 'name', 
      headerName: t('leads.columns.name'), 
      flex: 1,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Avatar sx={{ width: 32, height: 32, mr: 2, bgcolor: 'primary.main' }}>
            {params.row.name.charAt(0)}
          </Avatar>
          <Box>
            <Typography variant="body2" fontWeight={500}>{params.row.name}</Typography>
            <Typography variant="caption" color="text.secondary">{params.row.company}</Typography>
          </Box>
        </Box>
      )
    },
    { 
      field: 'email', 
      headerName: t('leads.columns.email'), 
      flex: 1,
      renderCell: (params) => (
        <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>{params.value}</Typography>
      )
    },
    { 
      field: 'phone', 
      headerName: t('leads.columns.phone'), 
      width: 150 
    },
    { 
      field: 'status', 
      headerName: t('leads.columns.status'), 
      width: 160,
      renderCell: (params) => (
        <Chip 
          label={t(`leads.status.${params.value}`)}
          color={getStatusColor(params.value)}
          size="small"
          variant="outlined"
          sx={{ 
            minWidth: 100,
            fontWeight: 500,
            borderWidth: '1.5px',
            '& .MuiChip-label': { px: 1.5 }
          }}
        />
      )
    },
    { 
      field: 'source', 
      headerName: t('leads.columns.source'), 
      width: 140,
      renderCell: (params) => t(`leads.sources.${params.value}`)
    },
    { 
      field: 'value', 
      headerName: t('leads.columns.value'), 
      width: 120,
      renderCell: (params) => `$${params.value.toLocaleString()}`
    },
    { 
      field: 'createdAt', 
      headerName: t('leads.columns.createdAt'), 
      width: 140,
      valueFormatter: (params) => {
        try {
          const date = new Date(params.value);
          return isValid(date) 
            ? format(date, 'dd MMM yyyy', { locale: i18n.language === 'tr' ? tr : enUS })
            : '';
        } catch (e) {
          console.error('Error formatting date:', e);
          return '';
        }
      }
    },
    { 
      field: 'assignedTo', 
      headerName: t('leads.columns.assignedTo'), 
      width: 140,
      renderCell: (params) => (
        <Chip 
          avatar={
            <Avatar sx={{ width: 24, height: 24, fontSize: '0.75rem' }}>
              {params.value.split(' ').map(n => n[0]).join('')}
            </Avatar>
          }
          label={params.value}
          size="small"
          variant="outlined"
        />
      )
    },
    { 
      field: 'actions', 
      headerName: t('leads.columns.actions'), 
      width: 60,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <IconButton
          size="small"
          onClick={(e) => handleMenuOpen(e, params.row)}
        >
          <MoreVertIcon fontSize="small" />
        </IconButton>
      )
    },
  ];

  if (loading) {
    return <Box py={5} textAlign="center"><CircularProgress /></Box>;
  }
  if (error) {
    return <Typography color="error" align="center" sx={{ mt: 4 }}>{error}</Typography>;
  }

  return (
    <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box>
            <Typography variant="h4" fontWeight={600} gutterBottom>
              {t('leads.title')}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t('leads.subtitle', { count: filteredLeads.length })}
            </Typography>
          </Box>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => handleOpenLeadDialog()}
            sx={{ height: 40 }}
          >
            {t('leads.addLead')}
          </Button>
        </Box>
        
        {/* Tabs */}
        <Tabs
          value={tabValue}
          onChange={(e, newValue) => setTabValue(newValue)}
          sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab label={t('leads.tabs.all', 'All')} />
          <Tab label={t('leads.tabs.active', 'Active')} />
          <Tab label={t('leads.tabs.highPriority', 'High Priority')} />
          <Tab label={t('leads.tabs.topRated', 'Top Rated')} />
        </Tabs>
        
        {/* Search and Filter */}
        <Box sx={{ display: 'flex', mb: 3, gap: 2 }}>
          <TextField
            fullWidth
            variant="outlined"
            size="small"
            placeholder={t('leads.searchPlaceholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
              sx: { 
                borderRadius: 2, 
                bgcolor: 'background.paper',
                '&:hover': {
                  bgcolor: 'background.default'
                }
              }
            }}
          />
          <Button
            variant="outlined"
            startIcon={<FilterListIcon />}
            sx={{ 
              minWidth: 120, 
              borderRadius: 2,
              borderColor: 'divider',
              '&:hover': {
                borderColor: 'text.primary'
              }
            }}
          >
            {t('common.filters')}
          </Button>
        </Box>
      </Box>

      {/* Kanban Board */}
      <Box sx={{ 
        display: 'flex', 
        gap: 2, 
        overflowX: 'auto', 
        pb: 2, 
        flex: 1,
        '&::-webkit-scrollbar': {
          height: '8px',
        },
        '&::-webkit-scrollbar-track': {
          background: 'rgba(0, 0, 0, 0.05)',
          borderRadius: '4px',
        },
        '&::-webkit-scrollbar-thumb': {
          background: 'rgba(0, 0, 0, 0.2)',
          borderRadius: '4px',
          '&:hover': {
            background: 'rgba(0, 0, 0, 0.3)',
          },
        },
      }}>
        {statuses.map((status) => (
          <Box 
            key={status.id} 
            sx={{ 
              minWidth: 300, 
              maxWidth: 350, 
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* Column Header */}
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              mb: 2,
              p: 1.5,
              borderRadius: 1,
              bgcolor: 'rgba(0, 0, 0, 0.02)',
              border: '1px solid',
              borderColor: 'divider',
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ 
                  width: 8, 
                  height: 8, 
                  borderRadius: '50%', 
                  bgcolor: `${status.color}.main` 
                }} />
                <Typography variant="subtitle2" fontWeight={600}>
                  {status.label}
                </Typography>
                <Chip 
                  label={leadsByStatus[status.id]?.length || 0} 
                  size="small" 
                  sx={{ 
                    height: 20, 
                    minWidth: 24, 
                    fontSize: '0.7rem',
                    bgcolor: 'background.default',
                    '& .MuiChip-label': { px: 0.75 }
                  }} 
                />
              </Box>
              <IconButton size="small" sx={{ color: 'text.secondary' }}>
                <MoreVertIcon fontSize="small" />
              </IconButton>
            </Box>
            
            {/* Lead Cards Container */}
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: 2,
              flex: 1,
              overflowY: 'auto',
              pr: 1,
              '&::-webkit-scrollbar': {
                width: '6px',
              },
              '&::-webkit-scrollbar-track': {
                background: 'transparent',
              },
              '&::-webkit-scrollbar-thumb': {
                background: 'rgba(0, 0, 0, 0.1)',
                borderRadius: '3px',
              },
            }}>
              {leadsByStatus[status.id]?.map((lead) => (
                <Paper 
                  key={lead.id}
                  elevation={0}
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    '&:hover': {
                      boxShadow: 1,
                      borderColor: 'transparent',
                      transform: 'translateY(-2px)',
                    }
                  }}
                  onClick={() => handleViewDetails(lead)}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Avatar 
                        sx={{ 
                          width: 36, 
                          height: 36, 
                          bgcolor: 'primary.light',
                          color: 'primary.contrastText',
                          fontSize: '0.875rem',
                          fontWeight: 600
                        }}
                      >
                        {lead.name.split(' ').map(n => n[0]).join('')}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle2" fontWeight={600} noWrap>
                          {lead.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" noWrap>
                          {lead.company}
                        </Typography>
                      </Box>
                    </Box>
                    <IconButton 
                      size="small" 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMenuOpen(e, lead);
                      }}
                      sx={{ color: 'text.secondary' }}
                    >
                      <MoreVertIcon fontSize="small" />
                    </IconButton>
                  </Box>
                  
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      mb: 2, 
                      WebkitLineClamp: 2, 
                      display: '-webkit-box', 
                      WebkitBoxOrient: 'vertical', 
                      overflow: 'hidden',
                      color: 'text.secondary',
                      fontSize: '0.8125rem',
                      lineHeight: 1.5,
                      minHeight: 42
                    }}
                  >
                    {lead.notes || t('leads.noNotes')}
                  </Typography>
                  

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ 
                        width: 8, 
                        height: 8, 
                        borderRadius: '50%', 
                        bgcolor: lead.priority === 'high' ? 'error.main' : lead.priority === 'medium' ? 'warning.main' : 'success.main' 
                      }} />
                      <Typography variant="caption" color="text.secondary">
                        {t(`leads.priority.${lead.priority}`)}
                      </Typography>
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      {formatDate(lead.createdAt)}
                    </Typography>
                  </Box>
                </Paper>
              ))}
              
              {/* Add Lead Card */}
              <Button 
                fullWidth 
                startIcon={<AddIcon />}
                onClick={() => {
                  setSelectedLead({ status: status.id });
                  handleOpenLeadDialog();
                }}
                sx={{ 
                  mt: 1, 
                  justifyContent: 'flex-start',
                  color: 'text.secondary',
                  '&:hover': {
                    color: 'primary.main',
                    bgcolor: 'action.hover'
                  }
                }}
              >
                {t('leads.addCard')}
              </Button>
            </Box>
          </Box>
        ))}
      </Box>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        onClick={handleMenuClose}
        PaperProps={{
          elevation: 1,
          sx: {
            minWidth: 180,
            '& .MuiMenuItem-root': {
              typography: 'body2',
              '& .MuiSvgIcon-root': {
                fontSize: 20,
                color: 'text.secondary',
                mr: 1.5,
              },
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={handleViewDetails}>
          <DescriptionIcon />
          {t('actions.view')}
        </MenuItem>
        <MenuItem onClick={handleEditLead}>
          <EditIcon />
          {t('actions.edit')}
        </MenuItem>
        <MenuItem onClick={handleConvertToCustomer}>
          <PersonAddIcon />
          {t('actions.convert')}
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleDeleteLead} sx={{ color: 'error.main' }}>
          <DeleteIcon />
          {t('actions.delete')}
        </MenuItem>
      </Menu>



      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        onClick={handleMenuClose}
        PaperProps={{
          elevation: 0,
          sx: {
            overflow: 'visible',
            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.1))',
            mt: 1.5,
            '& .MuiAvatar-root': {
              width: 32,
              height: 32,
              ml: -0.5,
              mr: 1,
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={handleViewDetails}>
          <VisibilityIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
          {t('actions.view')}
        </MenuItem>
        <MenuItem onClick={handleEditLead}>
          <EditIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
          {t('actions.edit')}
        </MenuItem>
        <MenuItem onClick={handleConvertToCustomer}>
          <PersonAddIcon fontSize="small" sx={{ mr: 1, color: 'success.main' }} />
          {t('actions.convert')}
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleDeleteLead} sx={{ color: 'error.main' }}>
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          {t('actions.delete')}
        </MenuItem>
      </Menu>

      {/* Lead Dialog */}
      <LeadDialog
        open={openLeadDialog}
        onClose={handleCloseLeadDialog}
        lead={selectedLead}
        onSave={handleSaveLead}
      />

      {/* Lead Import Dialog */}
      <LeadImportDialog
        open={openImportDialog}
        onClose={handleCloseImportDialog}
      />
    </Box>
  );
};



export default LeadsPage;
