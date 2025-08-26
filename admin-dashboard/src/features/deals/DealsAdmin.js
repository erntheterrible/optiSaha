import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Typography,
  Container,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Chip,
  Paper,
  Alert,
  Snackbar,
  Switch,
  FormControlLabel,
  Avatar
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Close as CloseIcon,
  BarChart as BarChartIcon
} from '@mui/icons-material';
import { createDeal, updateDeal, deleteDeal, getDeals } from '../../services/dealsService';

const DealsAdmin = () => {
  const { t } = useTranslation();
  
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentDeal, setCurrentDeal] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image_url: '',
    deal_type: 'percentage_off',
    discount_value: '',
    start_date: '',
    end_date: '',
    is_active: true,
    is_featured: false,
    category: '',
    tags: '',
    terms: ''
  });
  
  // Load deals
  useEffect(() => {
    loadDeals();
  }, []);
  
  const loadDeals = async () => {
    try {
      setLoading(true);
      const data = await getDeals();
      setDeals(data);
    } catch (error) {
      console.error('Error loading deals:', error);
      showSnackbar(t('deals.errorLoading'), 'error');
    } finally {
      setLoading(false);
    }
  };
  
  const handleOpenDialog = (deal = null) => {
    if (deal) {
      setCurrentDeal(deal);
      setFormData({
        title: deal.title || '',
        description: deal.description || '',
        image_url: deal.image_url || '',
        deal_type: deal.deal_type || 'percentage_off',
        discount_value: deal.discount_value || '',
        start_date: deal.start_date || '',
        end_date: deal.end_date || '',
        is_active: deal.is_active !== undefined ? deal.is_active : true,
        is_featured: deal.is_featured || false,
        category: deal.category || '',
        tags: deal.tags ? deal.tags.join(', ') : '',
        terms: deal.terms || ''
      });
    } else {
      setCurrentDeal(null);
      setFormData({
        title: '',
        description: '',
        image_url: '',
        deal_type: 'percentage_off',
        discount_value: '',
        start_date: '',
        end_date: '',
        is_active: true,
        is_featured: false,
        category: '',
        tags: '',
        terms: ''
      });
    }
    setOpenDialog(true);
  };
  
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCurrentDeal(null);
  };
  
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const dealData = {
        ...formData,
        discount_value: formData.discount_value ? parseFloat(formData.discount_value) : null,
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : []
      };
      
      if (currentDeal) {
        // Update existing deal
        await updateDeal(currentDeal.id, dealData);
        showSnackbar(t('deals.saveSuccess'), 'success');
      } else {
        // Create new deal
        await createDeal(dealData);
        showSnackbar(t('deals.saveSuccess'), 'success');
      }
      
      handleCloseDialog();
      loadDeals();
    } catch (error) {
      console.error('Error saving deal:', error);
      showSnackbar(t('common.errorSaving'), 'error');
    }
  };
  
  const handleDelete = async (id) => {
    if (window.confirm(t('deals.deleteConfirm'))) {
      try {
        await deleteDeal(id);
        showSnackbar(t('deals.deleteSuccess'), 'success');
        loadDeals();
      } catch (error) {
        console.error('Error deleting deal:', error);
        showSnackbar(t('common.errorDeleting'), 'error');
      }
    }
  };
  
  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };
  
  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };
  
  const getDealTypeLabel = (type) => {
    const typeLabels = {
      'percentage_off': t('deals.percentageOff'),
      'fixed_price': t('deals.fixedPrice'),
      'buy_one_get_one': t('deals.buyOneGetOne'),
      'free_trial': t('deals.freeTrial')
    };
    return typeLabels[type] || type;
  };
  
  return (
    <Container maxWidth={false} sx={{ py: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">{t('deals.management')}</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          {t('deals.addDeal')}
        </Button>
      </Box>
      
      {loading ? (
        <Typography>{t('common.loading')}</Typography>
      ) : (
        <Grid container spacing={3}>
          {deals.map(deal => (
            <Grid item xs={12} md={6} lg={4} key={deal.id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Typography variant="h6" component="div">
                      {deal.title}
                    </Typography>
                    <Chip 
                      label={getDealTypeLabel(deal.deal_type)} 
                      size="small" 
                      color={deal.is_featured ? "secondary" : "default"}
                    />
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {deal.description?.substring(0, 100)}...
                  </Typography>
                  
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                    {deal.category && (
                      <Chip label={deal.category} size="small" />
                    )}
                    {deal.is_featured && (
                      <Chip label={t('deals.featured')} icon={<BarChartIcon />} size="small" color="secondary" />
                    )}
                    <Chip 
                      label={deal.is_active ? t('common.active') : t('common.inactive')} 
                      size="small" 
                      color={deal.is_active ? "success" : "default"} 
                    />
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      {new Date(deal.start_date).toLocaleDateString()} - {new Date(deal.end_date).toLocaleDateString()}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {deal.click_count || 0} {t('deals.views')}
                    </Typography>
                  </Box>
                </CardContent>
                
                <CardActions sx={{ justifyContent: 'flex-end' }}>
                  <IconButton size="small" onClick={() => handleOpenDialog(deal)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton size="small" onClick={() => handleDelete(deal.id)}>
                    <DeleteIcon />
                  </IconButton>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
      
      {/* Deal Form Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {currentDeal ? t('deals.editDeal') : t('deals.addDeal')}
          <IconButton
            aria-label="close"
            onClick={handleCloseDialog}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        
        <DialogContent dividers>
          <Box component="form" onSubmit={handleSubmit} sx={{ pt: 1 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label={t('deals.title')}
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label={t('deals.description')}
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  multiline
                  rows={3}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label={t('deals.image')}
                  name="image_url"
                  value={formData.image_url}
                  onChange={handleInputChange}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>{t('deals.dealType')}</InputLabel>
                  <Select
                    name="deal_type"
                    value={formData.deal_type}
                    label={t('deals.dealType')}
                    onChange={handleInputChange}
                  >
                    <MenuItem value="percentage_off">{t('deals.percentageOff')}</MenuItem>
                    <MenuItem value="fixed_price">{t('deals.fixedPrice')}</MenuItem>
                    <MenuItem value="buy_one_get_one">{t('deals.buyOneGetOne')}</MenuItem>
                    <MenuItem value="free_trial">{t('deals.freeTrial')}</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label={t('deals.discount')}
                  name="discount_value"
                  type="number"
                  value={formData.discount_value}
                  onChange={handleInputChange}
                  helperText={t('deals.discountHelper')}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label={t('deals.startDate')}
                  name="start_date"
                  type="date"
                  value={formData.start_date}
                  onChange={handleInputChange}
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label={t('deals.endDate')}
                  name="end_date"
                  type="date"
                  value={formData.end_date}
                  onChange={handleInputChange}
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label={t('deals.category')}
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label={t('deals.tags')}
                  name="tags"
                  value={formData.tags}
                  onChange={handleInputChange}
                  helperText={t('deals.tagsHelper')}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label={t('deals.termsAndConditions')}
                  name="terms"
                  value={formData.terms}
                  onChange={handleInputChange}
                  multiline
                  rows={2}
                />
              </Grid>
              
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.is_active}
                      onChange={handleInputChange}
                      name="is_active"
                      color="primary"
                    />
                  }
                  label={t('deals.active')}
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.is_featured}
                      onChange={handleInputChange}
                      name="is_featured"
                      color="secondary"
                    />
                  }
                  label={t('deals.featured')}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={handleCloseDialog}>{t('common.cancel')}</Button>
          <Button type="submit" variant="contained" onClick={handleSubmit}>
            {currentDeal ? t('common.save') : t('common.add')}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        message={snackbar.message}
      />
    </Container>
  );
};

export default DealsAdmin;
