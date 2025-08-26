import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Box,
  Typography,
  Divider,
  Chip,
  Autocomplete,
  Switch,
  FormControlLabel,
  InputAdornment,
  Paper,
  CircularProgress
} from '@mui/material';
import {
  Info as InfoIcon,
  Business as BusinessIcon,
  AttachMoney as MoneyIcon,
  AccessTime as TimeIcon,
  Settings as SettingsIcon,
  Gavel as LegalIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';
import customerService from '../../services/customerService';

const CreateDealDialog = ({ open, onClose, onSave, dealData = null }) => {
  const { t } = useTranslation();
  const [customers, setCustomers] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { enqueueSnackbar } = useSnackbar();
  
  useEffect(() => {
    const fetchCustomers = async () => {
      if (!open) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const { data } = await customerService.getCustomers();
        setCustomers(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Failed to fetch customers:', error);
        setError(error);
        enqueueSnackbar(t('deals.errors.failedToLoadCustomers'), { variant: 'error' });
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, [open, t, enqueueSnackbar]);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    customer_id: '',
    value: '',
    stage: 'prospecting',
    close_date: '',
    probability: 0,
    owner_id: '',
    notes: '',
    deal_type: 'percentage_off',
    discount_value: '',
    start_date: '',
    end_date: '',
    is_active: true,
    is_featured: false,
    category: '',
    tags: [],
    terms: ''
  });
  
  const [errors, setErrors] = useState({});
  const [tagInput, setTagInput] = useState('');
  
  useEffect(() => {
    if (open) {
      if (dealData) {
        // Editing existing deal
        setFormData({
          title: dealData.title || '',
          description: dealData.description || '',
          customer_id: dealData.customer_id || '',
          value: dealData.value || '',
          stage: dealData.stage || 'prospecting',
          close_date: dealData.close_date || '',
          probability: dealData.probability || 0,
          owner_id: dealData.owner_id || '',
          notes: dealData.notes || '',
          deal_type: dealData.deal_type || 'percentage_off',
          discount_value: dealData.discount_value || '',
          start_date: dealData.start_date || '',
          end_date: dealData.end_date || '',
          is_active: dealData.is_active !== undefined ? dealData.is_active : true,
          is_featured: dealData.is_featured !== undefined ? dealData.is_featured : false,
          category: dealData.category || '',
          tags: dealData.tags || [],
          terms: dealData.terms || ''
        });
        setTagInput('');
      } else {
        // Creating new deal
        setFormData({
          title: '',
          description: '',
          customer_id: '',
          value: '',
          stage: 'prospecting',
          close_date: '',
          probability: 0,
          owner_id: '',
          notes: '',
          deal_type: 'percentage_off',
          discount_value: '',
          start_date: '',
          end_date: '',
          is_active: true,
          is_featured: false,
          category: '',
          tags: [],
          terms: ''
        });
        setErrors({});
        setTagInput('');
      }
    }
  }, [open, dealData]);
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = t('deals.errors.titleRequired');
    }
    
    if (!formData.customer_id) {
      newErrors.customer_id = t('deals.errors.customerRequired');
    }
    
    if (formData.value && isNaN(formData.value)) {
      newErrors.value = t('deals.errors.invalidValue');
    }
    
    if (formData.probability && (isNaN(formData.probability) || formData.probability < 0 || formData.probability > 100)) {
      newErrors.probability = t('deals.errors.invalidProbability');
    }
    
    if (formData.start_date && formData.end_date && new Date(formData.end_date) < new Date(formData.start_date)) {
      newErrors.end_date = t('deals.errors.endDateBeforeStart');
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };
  
  const handleAddTag = (e) => {
    if (e.key === 'Enter' && tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };
  
  const handleDeleteTag = (tagToDelete) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToDelete)
    }));
  };
  
  const handleSubmit = () => {
    if (validateForm()) {
      const dealData = {
        ...formData,
        value: formData.value ? parseFloat(formData.value) : null,
        probability: formData.probability ? parseInt(formData.probability) : null,
        discount_value: formData.discount_value ? parseFloat(formData.discount_value) : null
      };
      
      onSave(dealData);
    }
  };
  
  const dealTypes = [
    { value: 'percentage_off', label: t('deals.percentageOff') },
    { value: 'fixed_price', label: t('deals.fixedPrice') },
    { value: 'buy_one_get_one', label: t('deals.buyOneGetOne') },
    { value: 'free_trial', label: t('deals.freeTrial') }
  ];
  
  const stages = [
    { value: 'prospecting', label: t('deals.stages.prospecting') },
    { value: 'qualification', label: t('deals.stages.qualification') },
    { value: 'proposal', label: t('deals.stages.proposal') },
    { value: 'negotiation', label: t('deals.stages.negotiation') },
    { value: 'won', label: t('deals.stages.won') },
    { value: 'lost', label: t('deals.stages.lost') }
  ];
  
  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: '0 8px 24px 0 rgba(0,0,0,0.1)',
          '& .MuiDialogTitle-root': {
            px: 3,
            py: 2,
            background: 'linear-gradient(45deg, #2196F3 30%, #1976D2 90%)',
            color: 'white',
          },
          '& .MuiDialogContent-root': {
            px: 3,
            py: 2,
          },
          '& .MuiDialogActions-root': {
            px: 3,
            py: 2,
          }
        }
      }}
    >
      <DialogTitle>
        {dealData ? t('deals.editDeal') : t('deals.createDeal')}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 2 }}>
          <Grid container spacing={3}>
            {/* Deal Details Section */}
            <Grid item xs={12}>
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 3, 
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 2,
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    boxShadow: '0 4px 12px 0 rgba(0,0,0,0.05)',
                    borderColor: 'primary.main',
                  }
                }}
              >
                <Typography 
                  variant="h6" 
                  gutterBottom 
                  sx={{ 
                    fontWeight: 600,
                    color: 'text.primary',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    mb: 2
                  }}
                >
                  <InfoIcon sx={{ color: 'primary.main' }} />
                  {t('deals.dealDetails')}
                </Typography>

                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label={t('deals.columns.title')}
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      error={!!errors.title}
                      helperText={errors.title}
                      required
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 1.5,
                          backgroundColor: 'background.paper',
                          transition: 'all 0.2s',
                          '&:hover': {
                            backgroundColor: 'action.hover',
                          },
                          '&.Mui-focused': {
                            backgroundColor: 'background.paper',
                            boxShadow: '0 0 0 2px rgba(25, 118, 210, 0.2)',
                          },
                        },
                        '& .MuiInputLabel-root': {
                          fontSize: '0.95rem',
                        },
                        '& .MuiOutlinedInput-input': {
                          fontSize: '0.95rem',
                          padding: '12px 14px',
                        },
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label={t('deals.columns.description')}
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      multiline
                      rows={3}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Autocomplete
                      fullWidth
                      options={Array.isArray(customers) ? customers : []}
                      loading={loading}
                      getOptionLabel={(option) => option?.name || ''}
                      value={Array.isArray(customers) ? customers.find(c => c.id === formData.customer_id) || null : null}
                      onChange={(event, newValue) => {
                        setFormData(prev => ({
                          ...prev,
                          customer_id: newValue?.id || ''
                        }));
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label={t('deals.columns.customer')}
                          error={!!errors.customer_id}
                          helperText={errors.customer_id}
                          required
                          InputProps={{
                            ...params.InputProps,
                            endAdornment: (
                              <React.Fragment>
                                {loading ? <CircularProgress color="inherit" size={20} /> : null}
                                {params.InputProps.endAdornment}
                              </React.Fragment>
                            ),
                          }}
                        />
                      )}
                      renderOption={(props, option) => (
                        <Box component="li" {...props}>
                          <Box>
                            <Typography variant="subtitle1">{option.name}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              {option.industry} • {option.email}
                            </Typography>
                          </Box>
                        </Box>
                      )}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label={t('deals.columns.owner')}
                      name="owner_id"
                      value={formData.owner_id}
                      onChange={handleChange}
                    />
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
            
            {/* CRM Information Section */}
            <Grid item xs={12}>
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 3, 
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 2,
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    boxShadow: '0 4px 12px 0 rgba(0,0,0,0.05)',
                    borderColor: 'primary.main',
                  }
                }}
              >
                <Typography 
                  variant="h6" 
                  gutterBottom 
                  sx={{ 
                    fontWeight: 600,
                    color: 'text.primary',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    mb: 2
                  }}
                >
                  <BusinessIcon sx={{ color: 'primary.main' }} />
                  {t('deals.crmInformation')}
                </Typography>

                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label={t('deals.columns.value')}
                      name="value"
                      type="number"
                      value={formData.value}
                      onChange={handleChange}
                      error={!!errors.value}
                      helperText={errors.value}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth error={!!errors.stage}>
                      <InputLabel>{t('deals.columns.stage')}</InputLabel>
                      <Select
                        name="stage"
                        value={formData.stage}
                        onChange={handleChange}
                        label={t('deals.columns.stage')}
                      >
                        {stages.map((stage) => (
                          <MenuItem key={stage.value} value={stage.value}>
                            {stage.label}
                          </MenuItem>
                        ))}
                      </Select>
                      {errors.stage && <Typography color="error" variant="caption">{errors.stage}</Typography>}
                    </FormControl>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label={t('deals.columns.closeDate')}
                      name="close_date"
                      type="date"
                      value={formData.close_date}
                      onChange={handleChange}
                      InputLabelProps={{
                        shrink: true,
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label={t('deals.columns.probability')}
                      name="probability"
                      type="number"
                      value={formData.probability}
                      onChange={handleChange}
                      error={!!errors.probability}
                      helperText={errors.probability}
                      InputProps={{
                        endAdornment: <InputAdornment position="end">%</InputAdornment>,
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label={t('deals.columns.notes')}
                      name="notes"
                      value={formData.notes}
                      onChange={handleChange}
                      multiline
                      rows={3}
                    />
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
            
            {/* Pricing & Timing Section */}
            <Grid item xs={12}>
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 3, 
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 2,
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    boxShadow: '0 4px 12px 0 rgba(0,0,0,0.05)',
                    borderColor: 'primary.main',
                  }
                }}
              >
                <Typography 
                  variant="h6" 
                  gutterBottom 
                  sx={{ 
                    fontWeight: 600,
                    color: 'text.primary',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    mb: 2
                  }}
                >
                  <MoneyIcon sx={{ color: 'primary.main' }} />
                  {t('deals.pricingAndTiming')}
                </Typography>

                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>{t('deals.columns.dealType')}</InputLabel>
                      <Select
                        name="deal_type"
                        value={formData.deal_type}
                        onChange={handleChange}
                        label={t('deals.columns.dealType')}
                      >
                        {dealTypes.map((type) => (
                          <MenuItem key={type.value} value={type.value}>
                            {type.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label={t('deals.columns.discountValue')}
                      name="discount_value"
                      type="number"
                      value={formData.discount_value}
                      onChange={handleChange}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label={t('deals.columns.startDate')}
                      name="start_date"
                      type="date"
                      value={formData.start_date}
                      onChange={handleChange}
                      error={!!errors.start_date}
                      helperText={errors.start_date}
                      InputLabelProps={{
                        shrink: true,
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label={t('deals.columns.endDate')}
                      name="end_date"
                      type="date"
                      value={formData.end_date}
                      onChange={handleChange}
                      error={!!errors.end_date}
                      helperText={errors.end_date}
                      InputLabelProps={{
                        shrink: true,
                      }}
                    />
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
            
            {/* Availability & Targeting Section */}
            <Grid item xs={12}>
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 3, 
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 2,
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    boxShadow: '0 4px 12px 0 rgba(0,0,0,0.05)',
                    borderColor: 'primary.main',
                  }
                }}
              >
                <Typography 
                  variant="h6" 
                  gutterBottom 
                  sx={{ 
                    fontWeight: 600,
                    color: 'text.primary',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    mb: 2
                  }}
                >
                  <SettingsIcon sx={{ color: 'primary.main' }} />
                  {t('deals.availabilityAndTargeting')}
                </Typography>

                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={formData.is_active}
                          onChange={handleChange}
                          name="is_active"
                          color="primary"
                        />
                      }
                      label={t('deals.columns.isActive')}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={formData.is_featured}
                          onChange={handleChange}
                          name="is_featured"
                          color="primary"
                        />
                      }
                      label={t('deals.columns.isFeatured')}
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label={t('deals.columns.category')}
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label={t('deals.columns.tags')}
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={handleAddTag}
                      helperText={t('deals.tagsHelperText')}
                    />
                    <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {formData.tags.map((tag) => (
                        <Chip
                          key={tag}
                          label={tag}
                          onDelete={() => handleDeleteTag(tag)}
                          color="primary"
                          variant="outlined"
                        />
                      ))}
                    </Box>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
            
            {/* Legal & Conditions Section */}
            <Grid item xs={12}>
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 3, 
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 2,
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    boxShadow: '0 4px 12px 0 rgba(0,0,0,0.05)',
                    borderColor: 'primary.main',
                  }
                }}
              >
                <Typography 
                  variant="h6" 
                  gutterBottom 
                  sx={{ 
                    fontWeight: 600,
                    color: 'text.primary',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    mb: 2
                  }}
                >
                  <LegalIcon sx={{ color: 'primary.main' }} />
                  {t('deals.legalAndConditions')}
                </Typography>

                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label={t('deals.columns.terms')}
                      name="terms"
                      value={formData.terms}
                      onChange={handleChange}
                      multiline
                      rows={4}
                    />
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions sx={{ 
        p: 3,
        gap: 2,
        bgcolor: 'background.default'
      }}>
        <Button 
          onClick={onClose} 
          color="inherit"
          variant="outlined"
          sx={{ 
            minWidth: 120,
            borderRadius: 2,
            textTransform: 'none',
            fontSize: '1rem',
          }}
        >
          {t('common.cancel')}
        </Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          color="primary"
          sx={{ 
            minWidth: 120,
            borderRadius: 2,
            textTransform: 'none',
            fontSize: '1rem',
            boxShadow: 2,
            '&:hover': {
              boxShadow: 4
            }
          }}
        >
          {t('common.save')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateDealDialog;
