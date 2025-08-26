import React, { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, Button, TextField, Select, MenuItem, FormControl,
  Box, Typography, IconButton, Chip, Stack, Grid, Autocomplete, AppBar, Tabs, Tab, DialogActions,
  InputLabel, FormHelperText
} from '@mui/material';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { Slide } from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import CloseIcon from '@mui/icons-material/Close';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

const statusOptions = {
  'new': { label: 'New', color: 'info.main' },
  'contacted': { label: 'Contacted', color: 'warning.main' },
  'qualified': { label: 'Qualified', color: 'success.main' },
  'proposal': { label: 'Proposal Sent', color: 'primary.main' },
  'negotiation': { label: 'Negotiation', color: 'secondary.main' },
  'closed_won': { label: 'Closed Won', color: 'success.dark' },
  'closed_lost': { label: 'Closed Lost', color: 'error.main' },
};

const LeadDialog = ({ open, onClose, onSave, lead }) => {
  const isEditing = !!lead;

  const [tabValue, setTabValue] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const validationSchema = Yup.object({
    name: Yup.string().max(255).required('Lead Name is required'),
    email: Yup.string().email('Invalid email address'),
    phone: Yup.string().matches(/^[0-9]{10}$/, 'Phone number is not valid'),
    status: Yup.string().oneOf(Object.keys(statusOptions)).required('Status is required'),
    contactPersonName: Yup.string().required('Contact Person Name is required'),
    address: Yup.string(),
    region: Yup.string(),
    industry: Yup.string(),
    estimatedValue: Yup.number().min(0, 'Estimated Value must be greater than 0'),
    website: Yup.string().url('Invalid website URL'),
    notes: Yup.string(),
    tags: Yup.string(),
  });

  const inputFieldStyle = {
    '& .MuiOutlinedInput-root': {
      borderRadius: '12px',
      backgroundColor: '#fff',
      minHeight: '44px',
      transition: 'box-shadow 0.3s ease-in-out, border-color 0.3s ease-in-out',
      '& fieldset': {
        borderColor: '#E0E0E0',
      },
      '&:hover fieldset': {
        borderColor: '#B0B0B0',
      },
      '&.Mui-focused fieldset': {
        borderColor: '#00BCD4', // Teal accent
        boxShadow: '0 0 0 3px rgba(0, 188, 212, 0.3)',
      },
    },
    '& .MuiInputLabel-root': {
      color: '#666',
      fontWeight: 500,
      '&.Mui-focused': {
        color: '#00BCD4',
      },
    },
    marginBottom: '16px', // Increased spacing
  };

  const { control, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      name: lead?.name || '',
      contactPersonName: lead?.contactPersonName || '',
      company: lead?.company || '',
      email: lead?.email || '',
      phone: lead?.phone || '',
      source: lead?.source || 'web_form',
      status: lead?.status || 'new',
      priority: lead?.priority || 'medium',
      address: lead?.address || '',
      region: lead?.region || '',
      industry: lead?.industry || 0,
      estimatedValue: lead?.estimatedValue || 0,
      website: lead?.website || '',
      notes: lead?.notes || '',
      tags: lead?.tags || '',
    },
  });

  const onSubmit = async (values) => {
    setIsSubmitting(true);
    try {
      await onSave(values);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const leadStatuses = [
    { value: 'new', label: 'New' },
    { value: 'contacted', label: 'Contacted' },
    { value: 'qualified', label: 'Qualified' },
    { value: 'proposal', label: 'Proposal Sent' },
    { value: 'negotiation', label: 'Negotiation' },
    { value: 'closed_won', label: 'Closed Won' },
    { value: 'closed_lost', label: 'Closed Lost' },
  ];

  const leadSources = [
    { value: 'web_form', label: 'Web Form' },
    { value: 'referral', label: 'Referral' },
    { value: 'event', label: 'Event' },
    { value: 'cold_call', label: 'Cold Call' },
    { value: 'other', label: 'Other' },
  ];

  const leadPriorities = [
    { value: 'high', label: 'High' },
    { value: 'medium', label: 'Medium' },
    { value: 'low', label: 'Low' },
  ];

  const renderField = (icon, label, control) => (
    <Box>
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
        {icon}
        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>{label}</Typography>
      </Stack>
      {control}
    </Box>
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="form-dialog-title"
      fullWidth
      maxWidth="md"
      PaperProps={{
        sx: {
          borderRadius: '20px',
          boxShadow: '0 8px 32px 0 rgba( 31, 38, 135, 0.37 )',
          backdropFilter: 'blur( 4px )',
          WebkitBackdropFilter: 'blur( 4px )',
          border: '1px solid rgba( 255, 255, 255, 0.18 )',
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0))',
          overflow: 'hidden', // Ensure content respects rounded corners
        },
      }}
      TransitionComponent={Slide}
      TransitionProps={{
        direction: 'up',
        timeout: 300,
      }}
    >
      <DialogTitle
        id="form-dialog-title"
        sx={{
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          color: '#333',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px 24px',
          fontSize: '1.5rem',
          fontWeight: 600,
        }}
      >
        {isEditing ? 'Edit Lead' : 'Create New Lead'}
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            color: '#666',
            '&:hover': { color: '#333' },
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ backgroundColor: '#F7F9FB', padding: '24px' }}>
        <AppBar position="static" color="transparent" elevation={0} sx={{ mb: 3 }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            aria-label="lead tabs"
            centered
            sx={{
              '.MuiTabs-indicator': { display: 'none' },
              '.MuiTab-root': {
                borderRadius: '20px',
                margin: '0 8px',
                minHeight: '40px',
                padding: '0 20px',
                color: '#666',
                fontWeight: 600,
                transition: 'all 0.3s ease-in-out',
                '&:hover': {
                  backgroundColor: 'rgba(0, 188, 212, 0.1)', // Teal hover
                  color: '#00BCD4',
                },
              },
              '.Mui-selected': {
                backgroundColor: '#00BCD4',
                color: '#fff !important',
                boxShadow: '0 2px 8px rgba(0, 188, 212, 0.2)',
                transition: 'background-color 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
              },
            }}
          >
            <Tab label="Core Fields" {...a11yProps(0)} />
            <Tab label="Location & Region" {...a11yProps(1)} />
            <Tab label="Additional Info" {...a11yProps(2)} />
          </Tabs>
        </AppBar>
        <form onSubmit={handleSubmit(onSubmit)}>
          <TabPanel value={tabValue} index={0}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="name"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      id="name"
                      label="Lead Name"
                      autoFocus
                      error={!!errors.name}
                      helperText={errors.name ? errors.name.message : ''}
                      sx={inputFieldStyle}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="contactPersonName"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      id="contactPersonName"
                      label="Contact Person Name"
                      error={!!errors.contactPersonName}
                      helperText={errors.contactPersonName ? errors.contactPersonName.message : ''}
                      sx={inputFieldStyle}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="company"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      id="company"
                      label="Company"
                      error={!!errors.company}
                      helperText={errors.company ? errors.company.message : ''}
                      sx={inputFieldStyle}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="email"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      id="email"
                      label="Email"
                      error={!!errors.email}
                      helperText={errors.email ? errors.email.message : ''}
                      sx={inputFieldStyle}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="phone"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      id="phone"
                      label="Phone"
                      error={!!errors.phone}
                      helperText={errors.phone ? errors.phone.message : ''}
                      sx={inputFieldStyle}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth sx={inputFieldStyle} error={!!errors.status}>
                      <InputLabel id="status-label">Status</InputLabel>
                      <Select
                        {...field}
                        labelId="status-label"
                        id="status"
                        label="Status"
                      >
                        {Object.entries(statusOptions).map(([key, { label, color }]) => (
                          <MenuItem key={key} value={key}>
                            <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: color, mr: 1.5 }} />
                            {label}
                          </MenuItem>
                        ))}
                      </Select>
                      {errors.status && <FormHelperText>{errors.status.message}</FormHelperText>}
                    </FormControl>
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="priority"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth sx={inputFieldStyle} error={!!errors.priority}>
                      <InputLabel id="priority-label">Priority</InputLabel>
                      <Select
                        {...field}
                        labelId="priority-label"
                        id="priority"
                        label="Priority"
                      >
                        {leadPriorities.map((option) => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))}
                      </Select>
                      {errors.priority && <FormHelperText>{errors.priority.message}</FormHelperText>}
                    </FormControl>
                  )}
                />
              </Grid>
            </Grid>
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="address"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      id="address"
                      label="Address"
                      error={!!errors.address}
                      helperText={errors.address ? errors.address.message : ''}
                      sx={inputFieldStyle}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="region"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      id="region"
                      label="Region"
                      error={!!errors.region}
                      helperText={errors.region ? errors.region.message : ''}
                      sx={inputFieldStyle}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12}>
                <Button variant="outlined" sx={{ mt: 2 }}>Pin on Map</Button>
                <Button variant="outlined" sx={{ mt: 2, ml: 2 }}>Auto Detect GPS</Button>
              </Grid>
            </Grid>
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="industry"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      id="industry"
                      label="Industry"
                      error={!!errors.industry}
                      helperText={errors.industry ? errors.industry.message : ''}
                      sx={inputFieldStyle}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="estimatedValue"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      id="estimatedValue"
                      label="Estimated Value"
                      type="number"
                      error={!!errors.estimatedValue}
                      helperText={errors.estimatedValue ? errors.estimatedValue.message : ''}
                      sx={inputFieldStyle}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12}>
                <Controller
                  name="website"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      id="website"
                      label="Website"
                      error={!!errors.website}
                      helperText={errors.website ? errors.website.message : ''}
                      sx={inputFieldStyle}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12}>
                <Controller
                  name="notes"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      id="notes"
                      label="Notes"
                      multiline
                      rows={3}
                      error={!!errors.notes}
                      helperText={errors.notes ? errors.notes.message : ''}
                      sx={inputFieldStyle}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12}>
                <Controller
                  name="tags"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      id="tags"
                      label="Tags (comma-separated)"
                      error={!!errors.tags}
                      helperText={errors.tags ? errors.tags.message : ''}
                      sx={inputFieldStyle}
                    />
                  )}
                />
              </Grid>
            </Grid>
          </TabPanel>
        </form>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isSubmitting}>Cancel</Button>
        <Button variant="contained" onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : (isEditing ? 'Save Changes' : 'Create Lead')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default LeadDialog;