import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Box, 
  CircularProgress, 
  Tabs, 
  Tab, 
  Button, 
  TextField, 
  Select, 
  MenuItem, 
  Stack,
  Typography,
  Card,
  CardContent,
  Grid,
  FormControl,
  InputLabel,
  OutlinedInput,
  Chip,
  Avatar,
  IconButton
} from '@mui/material';
import { 
  NoteAdd as NoteAddIcon,
  ArrowBack as ArrowBackIcon,
  Business as BusinessIcon,
  LocationOn as LocationOnIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Public as PublicIcon,
  Web as WebIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import customerService from '../../services/customerService';
import dealService from '../../services/dealService';
import customerNoteService from '../../services/customerNoteService';

function DealsTab({ customerId }) {
  const [deals, setDeals] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const { enqueueSnackbar } = useSnackbar();

  // Fetch deals on mount
  React.useEffect(() => {
    const fetchDeals = async () => {
      try {
        const data = await dealService.getCustomerDeals(customerId);
        setDeals(data || []);
      } catch (err) {
        console.error('Failed to load deals:', err);
        enqueueSnackbar('Failed to load deals', { variant: 'error' });
      } finally {
        setLoading(false);
      }
    };
    fetchDeals();
  }, [customerId]);
  
  const stageColors = {
    'Prospecting': 'info',
    'Proposal': 'warning',
    'Negotiation': 'primary',
    'Closed Won': 'success',
    'Closed Lost': 'error'
  };
  
  // Format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };
  
  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h6">
          Deals ({deals.length})
        </Typography>
        <Button
          variant="contained"
          onClick={() => {/* TODO: Add create deal dialog */}}
          startIcon={<AddIcon />}
        >
          Add Deal
        </Button>
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" py={4}>
          <CircularProgress />
        </Box>
      ) : deals.length === 0 ? (
        <Box textAlign="center" py={4}>
          <Typography color="text.secondary">
            No deals found for this customer.
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={2}>
          {deals.map(deal => (
            <Grid item xs={12} key={deal.id}>
              <Card 
                sx={{ 
                  boxShadow: 2,
                  borderRadius: 2,
                  transition: '0.3s',
                  '&:hover': {
                    boxShadow: 4,
                    transform: 'translateY(-2px)'
                  }
                }}
              >
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                    <Typography variant="h6" component="h3">
                      {deal.name}
                    </Typography>
                    <Chip 
                      label={deal.stage}
                      color={stageColors[deal.stage] || 'default'}
                      size="small"
                    />
                  </Box>
                  
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6} md={3}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Value
                      </Typography>
                      <Typography variant="h6">
                        {formatCurrency(deal.value)}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Probability
                      </Typography>
                      <Typography variant="h6">
                        {deal.probability}%
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Close Date
                      </Typography>
                      <Typography variant="h6">
                        {new Date(deal.closeDate).toLocaleDateString()}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Expected Revenue
                      </Typography>
                      <Typography variant="h6">
                        {formatCurrency(deal.value * deal.probability / 100)}
                      </Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}

function NotesTab({ customerId }) {
  const { enqueueSnackbar } = useSnackbar();
  const [notes, setNotes] = React.useState([]);
  const [text, setText] = React.useState('');
  const [loading, setLoading] = React.useState(true);

  // Fetch notes on mount
  React.useEffect(() => {
    const fetchNotes = async () => {
      try {
        const data = await customerNoteService.getCustomerNotes(customerId);
        setNotes(data || []);
      } catch (err) {
        console.error('Failed to load notes:', err);
        enqueueSnackbar('Failed to load notes', { variant: 'error' });
      } finally {
        setLoading(false);
      }
    };
    fetchNotes();
  }, [customerId]);

  const handleAdd = async () => {
    if (!text) return;
    try {
      const newNote = await customerNoteService.createNote({
        customer_id: customerId,
        text
      });
      setNotes([newNote, ...notes]);
      setText('');
      enqueueSnackbar('Note added successfully', { variant: 'success' });
    } catch (err) {
      console.error('Failed to add note:', err);
      enqueueSnackbar('Failed to add note', { variant: 'error' });
    }
  };

  return (
    <Box>
      {/* Add new note form */}
      <Card sx={{ mb: 3, boxShadow: 2 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Add New Note
          </Typography>
          <TextField
            fullWidth
            label="Note"
            multiline
            rows={3}
            value={text}
            onChange={(e)=>setText(e.target.value)}
            variant="outlined"
            sx={{ mb: 2 }}
          />
          <Button 
            variant="contained" 
            startIcon={<NoteAddIcon />} 
            onClick={handleAdd}
            disabled={!text.trim()}
          >
            Add Note
          </Button>
        </CardContent>
      </Card>
      
      {/* Notes list */}
      <Typography variant="h6" gutterBottom>
        Notes ({notes.length})
      </Typography>
      
      {loading ? (
        <Box display="flex" justifyContent="center" py={4}>
          <CircularProgress />
        </Box>
      ) : notes.length === 0 ? (
        <Box textAlign="center" py={4}>
          <Typography color="text.secondary">
            No notes found. Add a new note above.
          </Typography>
        </Box>
      ) : (
        <Stack spacing={2}>
          {notes.map(n => (
            <Card key={n.id} sx={{ boxShadow: 1 }}>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                  <Typography variant="subtitle2">
                    {n.user?.full_name || 'Unknown User'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {new Date(n.created_at).toLocaleString()}
                  </Typography>
                </Box>
                <Typography variant="body2">
                  {n.text}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}
    </Box>
  );
}

function ContactsTab({ customerId }) {
  const { enqueueSnackbar } = useSnackbar();
  const [contacts, setContacts] = React.useState([]);
  const [newContact, setNewContact] = React.useState({ name: '', email: '', phone: '', position: '' });
  const [loading, setLoading] = React.useState(true);

  const fetchContacts = React.useCallback(async () => {
    try {
      setLoading(true);
      const data = await customerService.getContacts(customerId);
      setContacts(data);
    } catch (err) {
      console.error(err);
      enqueueSnackbar('Failed to load contacts', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  }, [customerId]);

  React.useEffect(() => { fetchContacts(); }, [fetchContacts]);

  const handleAdd = async () => {
    try {
      const created = await customerService.addContact(customerId, newContact);
      enqueueSnackbar('Contact added successfully', { variant: 'success' });
      setNewContact({ name: '', email: '', phone: '', position: '' });
      fetchContacts(); // Refresh the list
    } catch (err) {
      console.error(err);
      enqueueSnackbar('Failed to add contact', { variant: 'error' });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this contact?')) return;
    try {
      await customerService.deleteContact(id);
      enqueueSnackbar('Contact deleted successfully', { variant: 'success' });
      fetchContacts(); // Refresh the list
    } catch (err) {
      console.error(err);
      enqueueSnackbar('Failed to delete contact', { variant: 'error' });
    }
  };

  // Generate avatar initials from contact name
  const getInitials = (name) => {
    if (!name) return '';
    const names = name.split(' ');
    let initials = names[0].substring(0, 1).toUpperCase();
    
    if (names.length > 1) {
      initials += names[names.length - 1].substring(0, 1).toUpperCase();
    }
    
    return initials;
  };

  // Get avatar color based on contact name
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

  return (
    <Box>
      {/* Add new contact form */}
      <Card sx={{ mb: 3, boxShadow: 2, borderRadius: 2 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Add New Contact
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Name"
                value={newContact.name}
                onChange={(e)=>setNewContact({...newContact,name:e.target.value})}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Position"
                value={newContact.position}
                onChange={(e)=>setNewContact({...newContact,position:e.target.value})}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                value={newContact.email}
                onChange={(e)=>setNewContact({...newContact,email:e.target.value})}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone"
                value={newContact.phone}
                onChange={(e)=>setNewContact({...newContact,phone:e.target.value})}
                variant="outlined"
              />
            </Grid>
          </Grid>
          <Button 
            variant="contained" 
            onClick={handleAdd}
            disabled={!newContact.name.trim()}
            sx={{ mt: 2 }}
          >
            Add Contact
          </Button>
        </CardContent>
      </Card>
      
      {/* Contacts list */}
      <Typography variant="h6" gutterBottom>
        Contacts ({contacts.length})
      </Typography>
      
      {loading ? (
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress />
        </Box>
      ) : contacts.length === 0 ? (
        <Box textAlign="center" py={4}>
          <Typography color="text.secondary">
            No contacts found. Add a new contact above.
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={2}>
          {contacts.map(contact => (
            <Grid item xs={12} sm={6} md={4} key={contact.id}>
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
                  <Box display="flex" alignItems="center" gap={2} mb={2}>
                    <Avatar 
                      sx={{ 
                        bgcolor: stringToColor(contact.name),
                        width: 56, 
                        height: 56 
                      }}
                    >
                      {getInitials(contact.name)}
                    </Avatar>
                    <Box>
                      <Typography variant="h6" component="h3" gutterBottom>
                        {contact.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {contact.position}
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Box display="flex" flexDirection="column" gap={1}>
                    {contact.email && (
                      <Box display="flex" alignItems="center" gap={1}>
                        <EmailIcon fontSize="small" color="action" />
                        <Typography variant="body2">
                          {contact.email}
                        </Typography>
                      </Box>
                    )}
                    {contact.phone && (
                      <Box display="flex" alignItems="center" gap={1}>
                        <PhoneIcon fontSize="small" color="action" />
                        <Typography variant="body2">
                          {contact.phone}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                  {contact.is_primary && (
                    <Chip 
                      label="Primary Contact" 
                      size="small" 
                      color="primary" 
                      variant="outlined" 
                      sx={{ mt: 1 }}
                    />
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}


function TabPanel({ value, index, children }) {
  if (value !== index) return null;
  return <Box mt={2}>{children}</Box>;
}

export default function CustomerDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(id !== 'new');
  const [customer, setCustomer] = useState(id === 'new' ? { name: '', industry: '', tier: '', status: '' } : null);
  const [tab, setTab] = useState(0);
  const [saving, setSaving] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const TIERS = ['A', 'B', 'C'];
  const SEGMENTS = ['Enterprise', 'SMB', 'Individual'];
  const STATUSES = ['Active', 'Inactive', 'Prospect'];

  useEffect(() => {
    if (id === 'new') return; // creation mode
    const fetchCustomer = async () => {
      try {
        const data = await customerService.getCustomerById(id);
        setCustomer(data);
      } catch (err) {
        console.error('Failed to load customer', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCustomer();
  }, [id]);

  const handleSave = async () => {
    try {
      setSaving(true);
      console.log('Saving customer:', { id, customer });
      
      if (id === 'new') {
        const created = await customerService.createCustomer(customer);
        console.log('Created new customer:', created);
        enqueueSnackbar('Customer created', { variant: 'success' });
        navigate(`/customers/${created.id}`);
      } else {
        // Make sure we have all required fields
        const updatePayload = {
          ...customer,
          name: customer.name || '',
          industry: customer.industry || '',
          tier: customer.tier || '',
          status: customer.status || ''
        };
        console.log('Updating customer with payload:', updatePayload);
        
        await customerService.updateCustomer(id, updatePayload);
        enqueueSnackbar('Customer updated', { variant: 'success' });
      }
    } catch (err) {
      console.error('Save failed:', err);
      enqueueSnackbar(err.message || 'Failed to save customer', { variant: 'error' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <CircularProgress />;

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

  return (
    <Box sx={{ p: 3 }}>
      {/* Header with back button */}
      <Box display="flex" alignItems="center" mb={3}>
        <IconButton onClick={() => navigate('/customers')}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" sx={{ ml: 1 }}>
          {id === 'new' ? 'New Customer' : customer.name}
        </Typography>
      </Box>
      
      {/* Customer header card */}
      {id !== 'new' && (
        <Card sx={{ mb: 3, boxShadow: 3 }}>
          <CardContent>
            <Box display="flex" alignItems="center" mb={2}>
              <Avatar 
                sx={{ 
                  bgcolor: stringToColor(customer.name),
                  width: 80, 
                  height: 80,
                  mr: 2
                }}
              >
                {getInitials(customer.name)}
              </Avatar>
              <Box>
                <Typography variant="h5" gutterBottom>
                  {customer.name}
                </Typography>
                <Box display="flex" alignItems="center" gap={2}>
                  <Box display="flex" alignItems="center" gap={0.5}>
                    <BusinessIcon fontSize="small" color="action" />
                    <Typography variant="body2" color="text.secondary">
                      {customer.industry || 'Industry not specified'}
                    </Typography>
                  </Box>
                  <Box display="flex" alignItems="center" gap={0.5}>
                    <LocationOnIcon fontSize="small" color="action" />
                    <Typography variant="body2" color="text.secondary">
                      {customer.city || 'Location not specified'}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Box>
            
            <Box display="flex" gap={1}>
              <Chip 
                label={customer.status || 'Status not set'}
                color={customer.status === 'Active' ? 'success' : customer.status === 'Inactive' ? 'error' : 'default'}
                size="small"
                variant="outlined"
              />
              <Chip 
                label={customer.tier || 'Tier not set'}
                color={customer.tier === 'A' ? 'success' : customer.tier === 'B' ? 'primary' : customer.tier === 'C' ? 'warning' : 'default'}
                size="small"
              />
              <Chip 
                label={customer.segment || 'Segment not set'}
                size="small"
                variant="outlined"
              />
            </Box>
          </CardContent>
        </Card>
      )}
      
      {/* Tabs */}
      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
        <Tab label="Profile" />
        {id !== 'new' && <Tab label="Contacts" />}
        {id !== 'new' && <Tab label="Deals" />}
        {id !== 'new' && <Tab label="Notes" />}
      </Tabs>
      
      {/* Profile Tab */}
      <TabPanel value={tab} index={0}>
        <Card sx={{ boxShadow: 2 }}>
          <CardContent>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField 
                  fullWidth 
                  label="Name" 
                  value={customer.name} 
                  onChange={(e)=>setCustomer({...customer,name:e.target.value})} 
                  margin="normal"
                />
                <TextField 
                  fullWidth 
                  label="Email" 
                  value={customer.email||''} 
                  onChange={(e)=>setCustomer({...customer,email:e.target.value})} 
                  margin="normal"
                />
                <TextField 
                  fullWidth 
                  label="Phone" 
                  value={customer.phone||''} 
                  onChange={(e)=>setCustomer({...customer,phone:e.target.value})} 
                  margin="normal"
                />
                <TextField 
                  fullWidth 
                  label="Industry" 
                  value={customer.industry||''} 
                  onChange={(e)=>setCustomer({...customer,industry:e.target.value})} 
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField 
                  fullWidth 
                  label="Address" 
                  value={customer.address||''} 
                  onChange={(e)=>setCustomer({...customer,address:e.target.value})} 
                  margin="normal"
                />
                <TextField 
                  fullWidth 
                  label="City" 
                  value={customer.city||''} 
                  onChange={(e)=>setCustomer({...customer,city:e.target.value})} 
                  margin="normal"
                />
                <TextField 
                  fullWidth 
                  label="Country" 
                  value={customer.country||''} 
                  onChange={(e)=>setCustomer({...customer,country:e.target.value})} 
                  margin="normal"
                />
                <TextField 
                  fullWidth 
                  label="Website" 
                  value={customer.website||''} 
                  onChange={(e)=>setCustomer({...customer,website:e.target.value})} 
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Segment</InputLabel>
                  <Select 
                    value={customer.segment||''} 
                    onChange={(e)=>setCustomer({...customer,segment:e.target.value})} 
                    input={<OutlinedInput label="Segment" />}
                  >
                    <MenuItem value=""><em>Select Segment</em></MenuItem>
                    {SEGMENTS.map(seg=>(<MenuItem key={seg} value={seg}>{seg}</MenuItem>))}
                  </Select>
                </FormControl>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Tier</InputLabel>
                  <Select 
                    value={customer.tier||''} 
                    onChange={(e)=>setCustomer({...customer,tier:e.target.value})} 
                    input={<OutlinedInput label="Tier" />}
                  >
                    <MenuItem value=""><em>Select Tier</em></MenuItem>
                    {TIERS.map(t=>(<MenuItem key={t} value={t}>{t}</MenuItem>))}
                  </Select>
                </FormControl>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Status</InputLabel>
                  <Select 
                    value={customer.status||''} 
                    onChange={(e)=>setCustomer({...customer,status:e.target.value})} 
                    input={<OutlinedInput label="Status" />}
                  >
                    <MenuItem value=""><em>Select Status</em></MenuItem>
                    {STATUSES.map(s=>(<MenuItem key={s} value={s}>{s}</MenuItem>))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Notes"
                  multiline
                  rows={4}
                  value={customer.notes||''}
                  onChange={(e)=>setCustomer({...customer,notes:e.target.value})}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12}>
                <Button 
                  variant="contained" 
                  onClick={handleSave} 
                  disabled={saving}
                  sx={{ mt: 2 }}
                >
                  {id === 'new' ? 'Create Customer' : 'Save Changes'}
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </TabPanel>
      
      {/* Contacts Tab */}
      {id !== 'new' && (
        <TabPanel value={tab} index={1}>
          <ContactsTab customerId={id} />
        </TabPanel>
      )}
      
      {/* Deals Tab */}
      {id !== 'new' && (
        <TabPanel value={tab} index={2}>
          <DealsTab customerId={id} />
        </TabPanel>
      )}
      
      {/* Notes Tab */}
      {id !== 'new' && (
        <TabPanel value={tab} index={3}>
          <NotesTab customerId={id} />
        </TabPanel>
      )}
    </Box>
  );
}

