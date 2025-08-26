import React, { useEffect, useState } from 'react';
import { 
  Box, 
  Button, 
  CircularProgress, 
  TextField, 
  IconButton, 
  Grid, 
  Card, 
  CardContent, 
  CardActions, 
  Typography, 
  Chip, 
  Avatar, 
  Tooltip, 
  Menu, 
  MenuItem, 
  InputAdornment,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  ListItemIcon,
  ListItemText,
  Link,
  ToggleButton,
  ToggleButtonGroup,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination
} from '@mui/material';
import { 
  Search as SearchIcon, 
  Edit as EditIcon, 
  Delete as DeleteIcon, 
  MoreVert as MoreVertIcon, 
  Add as AddIcon,
  Business as BusinessIcon,
  LocationOn as LocationOnIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  ViewModule as GridIcon,
  ViewList as ListIcon
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { useNavigate } from 'react-router-dom';
import customerService from '../../services/customerService';

// Status chip component with appropriate colors
const StatusChip = ({ status }) => {
  const statusColors = {
    'Active': 'success',
    'Inactive': 'error',
    'Pending': 'warning'
  };
  
  return (
    <Chip 
      label={status}
      color={statusColors[status] || 'default'}
      size="small"
      variant="outlined"
    />
  );
};

// Tier chip component
const TierChip = ({ tier }) => {
  const tierColors = {
    'A': 'success',
    'B': 'primary',
    'C': 'warning'
  };
  
  return (
    <Chip 
      label={tier}
      color={tierColors[tier] || 'default'}
      size="small"
    />
  );
};

// Customer card component
const CustomerCard = ({ customer, onEdit, onDelete, onView }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  
  // Generate avatar initials from customer name
  const getInitials = (name) => {
    if (!name) return '';
    const names = name.split(' ');
    let initials = names[0].substring(0, 1).toUpperCase();
    
    if (names.length > 1) {
      initials += names[names.length - 1].substring(0, 1).toUpperCase();
    }
    
    return initials;
  };
  
  // Get avatar color based on customer name
  const stringToColor = (string) => {
    let hash = 0;
    let i;
    
    for (i = 0; i < string.length; i += 1) {
      hash = string.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    let color = '#';
    
    for (i = 0; i < 3; i += 1) {
      const value = (hash >> (i * 8)) & 0xff;
      color += `00${value.toString(16)}`.substr(-2);
    }
    
    return color;
  };
  
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleClose = () => {
    setAnchorEl(null);
  };
  
  return (
    <Card 
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        boxShadow: 2,
        borderRadius: 2,
        transition: '0.3s',
        '&:hover': {
          boxShadow: 4,
          transform: 'translateY(-2px)'
        }
      }}
    >
      <CardContent sx={{ flexGrow: 1 }}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
          <Box display="flex" alignItems="center" gap={2}>
            <Avatar 
              sx={{ 
                bgcolor: stringToColor(customer.name),
                width: 56, 
                height: 56 
              }}
            >
              {getInitials(customer.name)}
            </Avatar>
            <Box>
              <Typography variant="h6" component="h3" gutterBottom>
                {customer.name}
              </Typography>
              <Box display="flex" alignItems="center" gap={1}>
                <BusinessIcon fontSize="small" color="action" />
                <Typography variant="body2" color="text.secondary">
                  {customer.industry || 'Industry not specified'}
                </Typography>
              </Box>
              <Box display="flex" alignItems="center" gap={1} mt={0.5}>
                <LocationOnIcon fontSize="small" color="action" />
                <Typography variant="body2" color="text.secondary">
                  {customer.city || 'Location not specified'}
                </Typography>
              </Box>
            </Box>
          </Box>
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
            onView(customer);
            handleClose();
          }}>
            <ListItemIcon>
              <SearchIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>View Details</ListItemText>
          </MenuItem>
          <MenuItem onClick={() => {
            onEdit(customer);
            handleClose();
          }}>
            <ListItemIcon>
              <EditIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Edit</ListItemText>
          </MenuItem>
          <MenuItem onClick={() => {
            onDelete(customer.id);
            handleClose();
          }}>
            <ListItemIcon>
              <DeleteIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Delete</ListItemText>
          </MenuItem>
        </Menu>
        
        <Box display="flex" gap={1} mt={2}>
          <StatusChip status={customer.status} />
          <TierChip tier={customer.tier} />
        </Box>
        
        <Box mt={2}>
          <Box display="flex" alignItems="center" gap={1} mb={1}>
            <EmailIcon fontSize="small" color="action" />
            <Typography variant="body2">
              {customer.email || 'Email not provided'}
            </Typography>
          </Box>
          <Box display="flex" alignItems="center" gap={1}>
            <PhoneIcon fontSize="small" color="action" />
            <Typography variant="body2">
              {customer.phone || 'Phone not provided'}
            </Typography>
          </Box>
        </Box>
      </CardContent>
      
      <CardActions sx={{ justifyContent: 'flex-end', p: 2, pt: 0 }}>
        <Button 
          size="small" 
          startIcon={<SearchIcon />} 
          onClick={() => onView(customer)}
        >
          View Details
        </Button>
      </CardActions>
    </Card>
  );
};

// Customer detail view dialog
const CustomerViewDialog = ({ open, onClose, customer }) => {
  if (!customer) return null;
  
  // Get avatar color based on customer name
  const stringToColor = (string) => {
    let hash = 0;
    let i;
    
    for (i = 0; i < string.length; i += 1) {
      hash = string.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    let color = '#';
    
    for (i = 0; i < 3; i += 1) {
      const value = (hash >> (i * 8)) & 0xff;
      color += `00${value.toString(16)}`.substr(-2);
    }
    
    return color;
  };

  // Generate avatar initials from customer name
  const getInitials = (name) => {
    if (!name) return '';
    const names = name.split(' ');
    let initials = names[0].substring(0, 1).toUpperCase();
    
    if (names.length > 1) {
      initials += names[names.length - 1].substring(0, 1).toUpperCase();
    }
    
    return initials;
  };
  
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={2}>
          <Avatar 
            sx={{ 
              width: 56, 
              height: 56,
              bgcolor: stringToColor(customer.name)
            }}
          >
            {getInitials(customer.name)}
          </Avatar>
          <Box>
            <Typography variant="h5">{customer.name}</Typography>
            <Typography variant="body2" color="text.secondary">
              {customer.industry || 'Industry not specified'}
            </Typography>
          </Box>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>Contact Information</Typography>
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <EmailIcon fontSize="small" color="action" />
                <Typography variant="body2">{customer.email || 'Not provided'}</Typography>
              </Box>
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <PhoneIcon fontSize="small" color="action" />
                <Typography variant="body2">{customer.phone || 'Not provided'}</Typography>
              </Box>
              <Box display="flex" alignItems="center" gap={1}>
                <LocationOnIcon fontSize="small" color="action" />
                <Typography variant="body2">
                  {customer.address || ''} {customer.city || ''} {customer.country || ''}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>Business Details</Typography>
              <Box display="flex" justifyContent="space-between" mb={1}>
                <Typography variant="body2" color="text.secondary">Tier:</Typography>
                <TierChip tier={customer.tier} />
              </Box>
              <Box display="flex" justifyContent="space-between" mb={1}>
                <Typography variant="body2" color="text.secondary">Status:</Typography>
                <StatusChip status={customer.status} />
              </Box>
              <Box display="flex" justifyContent="space-between" mb={1}>
                <Typography variant="body2" color="text.secondary">Segment:</Typography>
                <Chip 
                  label={customer.segment || 'Not specified'}
                  size="small"
                  variant="outlined"
                />
              </Box>
              <Box display="flex" justifyContent="space-between" mb={1}>
                <Typography variant="body2" color="text.secondary">Website:</Typography>
                <Typography variant="body2">
                  {customer.website ? (
                    <Link href={customer.website} target="_blank" rel="noopener">
                      Visit Website
                    </Link>
                  ) : 'Not provided'}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>Notes</Typography>
              <Typography variant="body2">
                {customer.notes || 'No notes available'}
              </Typography>
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default function CustomerListPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'table'
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();

  // Get avatar color based on customer name (for table view)
  const stringToColor = (string) => {
    let hash = 0;
    let i;
    
    for (i = 0; i < string.length; i += 1) {
      hash = string.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    let color = '#';
    
    for (i = 0; i < 3; i += 1) {
      const value = (hash >> (i * 8)) & 0xff;
      color += `00${value.toString(16)}`.substr(-2);
    }
    
    return color;
  };

  // Generate avatar initials from customer name (for table view)
  const getInitials = (name) => {
    if (!name) return '';
    const names = name.split(' ');
    let initials = names[0].substring(0, 1).toUpperCase();
    
    if (names.length > 1) {
      initials += names[names.length - 1].substring(0, 1).toUpperCase();
    }
    
    return initials;
  };

  const fetchData = async (keyword = '') => {
    try {
      setLoading(true);
      const result = await customerService.getCustomers({ search: keyword });
      console.log('Fetched customers:', result.data);
      setRows(result.data);
    } catch (err) {
      console.error('Failed to fetch customers', err);
      enqueueSnackbar('Failed to load customers', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this customer?')) return;
    try {
      await customerService.deleteCustomer(id);
      enqueueSnackbar('Customer deleted successfully', { variant: 'success' });
      fetchData(search);
    } catch (err) {
      console.error(err);
      enqueueSnackbar('Failed to delete customer', { variant: 'error' });
    }
  };

  const handleViewCustomer = (customer) => {
    setSelectedCustomer(customer);
    setViewOpen(true);
  };

  const handleEditCustomer = (customer) => {
    navigate(`/customers/${customer.id}`);
  };

  const handleSearch = (event) => {
    if (event.key === 'Enter') {
      fetchData(event.target.value);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header with search, view toggle, and add button */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Customers</Typography>
        <Box display="flex" alignItems="center" gap={2}>
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={(event, newViewMode) => newViewMode && setViewMode(newViewMode)}
            aria-label="view mode"
          >
            <ToggleButton value="grid" aria-label="grid view">
              <GridIcon />
            </ToggleButton>
            <ToggleButton value="table" aria-label="table view">
              <ListIcon />
            </ToggleButton>
          </ToggleButtonGroup>
          <Fab 
            color="primary" 
            aria-label="add customer" 
            onClick={() => navigate('/customers/new')}
            sx={{ boxShadow: 3 }}
          >
            <AddIcon />
          </Fab>
        </Box>
      </Box>
      
      {/* Search bar */}
      <Box display="flex" mb={3}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search customers by name, industry, or city..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={handleSearch}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Box>
      
      {/* Loading state */}
      {loading ? (
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress />
        </Box>
      ) : rows.length === 0 ? (
        <Box textAlign="center" py={8}>
          <Typography variant="h6" gutterBottom>
            No customers found
          </Typography>
          <Typography variant="body1" color="text.secondary" mb={2}>
            Try adjusting your search or add a new customer
          </Typography>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />} 
            onClick={() => navigate('/customers/new')}
          >
            Add Customer
          </Button>
        </Box>
      ) : viewMode === 'grid' ? (
        <>
          {/* Customer cards grid */}
          <Grid container spacing={3}>
            {rows
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((customer) => (
                <Grid item xs={12} sm={6} md={4} key={customer.id}>
                  <CustomerCard 
                    customer={customer}
                    onEdit={handleEditCustomer}
                    onDelete={handleDelete}
                    onView={handleViewCustomer}
                  />
                </Grid>
              ))}
          </Grid>
          
          {/* Pagination */}
          <TablePagination
            component="div"
            count={rows.length}
            page={page}
            onPageChange={(event, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(event) => {
              setRowsPerPage(parseInt(event.target.value, 10));
              setPage(0);
            }}
            rowsPerPageOptions={[5, 10, 25, 50]}
          />
        </>
      ) : (
        <>
          {/* Customer table */}
          <TableContainer component={Paper} sx={{ boxShadow: 2, borderRadius: 2 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Industry</TableCell>
                  <TableCell>Segment</TableCell>
                  <TableCell>Tier</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>City</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((customer) => (
                    <TableRow 
                      key={customer.id}
                      sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                      hover
                    >
                      <TableCell component="th" scope="row">
                        <Box display="flex" alignItems="center" gap={2}>
                          <Avatar 
                            sx={{ 
                              width: 32, 
                              height: 32,
                              bgcolor: stringToColor(customer.name)
                            }}
                          >
                            {getInitials(customer.name)}
                          </Avatar>
                          <Typography variant="body2">{customer.name}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>{customer.industry || '-'}</TableCell>
                      <TableCell>{customer.segment || '-'}</TableCell>
                      <TableCell>
                        <TierChip tier={customer.tier} />
                      </TableCell>
                      <TableCell>
                        <StatusChip status={customer.status} />
                      </TableCell>
                      <TableCell>{customer.city || '-'}</TableCell>
                      <TableCell>
                        <IconButton 
                          size="small" 
                          onClick={() => handleViewCustomer(customer)}
                          aria-label="view"
                        >
                          <SearchIcon fontSize="small" />
                        </IconButton>
                        <IconButton 
                          size="small" 
                          onClick={() => handleEditCustomer(customer)}
                          aria-label="edit"
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton 
                          size="small" 
                          onClick={() => handleDelete(customer.id)}
                          aria-label="delete"
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
          
          {/* Pagination */}
          <TablePagination
            component="div"
            count={rows.length}
            page={page}
            onPageChange={(event, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(event) => {
              setRowsPerPage(parseInt(event.target.value, 10));
              setPage(0);
            }}
            rowsPerPageOptions={[5, 10, 25, 50]}
          />
        </>
      )}
      
      {/* Customer view dialog */}
      <CustomerViewDialog 
        open={viewOpen} 
        onClose={() => setViewOpen(false)} 
        customer={selectedCustomer} 
      />
    </Box>
  );
}
