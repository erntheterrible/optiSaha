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
  Divider
} from '@mui/material';
import { useTranslation } from 'react-i18next';

const EditProjectDialog = ({ open, onClose, project, onSave }) => {
  const { t } = useTranslation();
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'new',
    priority: 'medium',
    project_type: 'residential',
    budget: '',
    start_date: '',
    end_date: '',
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    location: ''
  });
  
  const [errors, setErrors] = useState({});
  
  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name || '',
        description: project.description || '',
        status: project.status || 'new',
        priority: project.priority || 'medium',
        project_type: project.project_type || 'residential',
        budget: project.budget || '',
        start_date: project.start_date || '',
        end_date: project.end_date || '',
        customer_name: project.customer_name || '',
        customer_email: project.customer_email || '',
        customer_phone: project.customer_phone || '',
        location: project.location || ''
      });
    } else {
      setFormData({
        name: '',
        description: '',
        status: 'new',
        priority: 'medium',
        project_type: 'residential',
        budget: '',
        start_date: '',
        end_date: '',
        customer_name: '',
        customer_email: '',
        customer_phone: '',
        location: ''
      });
    }
    setErrors({});
  }, [project, open]);
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = t('projects.errors.nameRequired');
    }
    
    if (formData.customer_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.customer_email)) {
      newErrors.customer_email = t('projects.errors.invalidEmail');
    }
    
    if (formData.budget && isNaN(formData.budget)) {
      newErrors.budget = t('projects.errors.invalidBudget');
    }
    
    if (formData.start_date && formData.end_date && new Date(formData.end_date) < new Date(formData.start_date)) {
      newErrors.end_date = t('projects.errors.endDateBeforeStart');
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
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
  
  const handleSubmit = () => {
    if (validateForm()) {
      const projectData = {
        ...formData,
        budget: formData.budget ? parseFloat(formData.budget) : null,
        id: project?.id
      };
      
      onSave(projectData);
    }
  };
  
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {project ? t('projects.edit') : t('projects.add')}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 1 }}>
          <Grid container spacing={3}>
            {/* Basic Information */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                {t('projects.basicInfo')}
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label={t('projects.columns.name')}
                name="name"
                value={formData.name}
                onChange={handleChange}
                error={!!errors.name}
                helperText={errors.name}
                required
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label={t('projects.description')}
                name="description"
                value={formData.description}
                onChange={handleChange}
                error={!!errors.description}
                helperText={errors.description}
              />
            </Grid>
            
            {/* Status & Dates */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                {t('projects.statusAndDates')}
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>{t('projects.columns.status')}</InputLabel>
                <Select
                  label={t('projects.columns.status')}
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                >
                  <MenuItem value="new">{t('projects.status.new')}</MenuItem>
                  <MenuItem value="active">{t('projects.status.active')}</MenuItem>
                  <MenuItem value="in_progress">{t('projects.status.inProgress')}</MenuItem>
                  <MenuItem value="completed">{t('projects.status.completed')}</MenuItem>
                  <MenuItem value="on_hold">{t('projects.status.onHold')}</MenuItem>
                  <MenuItem value="cancelled">{t('projects.status.cancelled')}</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>{t('projects.columns.priority')}</InputLabel>
                <Select
                  label={t('projects.columns.priority')}
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                >
                  <MenuItem value="low">{t('projects.priority.low')}</MenuItem>
                  <MenuItem value="medium">{t('projects.priority.medium')}</MenuItem>
                  <MenuItem value="high">{t('projects.priority.high')}</MenuItem>
                  <MenuItem value="urgent">{t('projects.priority.urgent')}</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>{t('projects.columns.projectType')}</InputLabel>
                <Select
                  label={t('projects.columns.projectType')}
                  name="project_type"
                  value={formData.project_type}
                  onChange={handleChange}
                >
                  <MenuItem value="residential">{t('projects.types.residential')}</MenuItem>
                  <MenuItem value="commercial">{t('projects.types.commercial')}</MenuItem>
                  <MenuItem value="industrial">{t('projects.types.industrial')}</MenuItem>
                  <MenuItem value="infrastructure">{t('projects.types.infrastructure')}</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label={t('projects.columns.budget')}
                name="budget"
                type="number"
                value={formData.budget}
                onChange={handleChange}
                error={!!errors.budget}
                helperText={errors.budget}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label={t('projects.columns.startDate')}
                name="start_date"
                type="date"
                value={formData.start_date}
                onChange={handleChange}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label={t('projects.columns.endDate')}
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
            
            {/* Customer Information */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                {t('projects.customerInfo')}
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label={t('projects.columns.customer')}
                name="customer_name"
                value={formData.customer_name}
                onChange={handleChange}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label={t('projects.columns.customerEmail')}
                name="customer_email"
                value={formData.customer_email}
                onChange={handleChange}
                error={!!errors.customer_email}
                helperText={errors.customer_email}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label={t('projects.columns.customerPhone')}
                name="customer_phone"
                value={formData.customer_phone}
                onChange={handleChange}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label={t('projects.columns.location')}
                name="location"
                value={formData.location}
                onChange={handleChange}
              />
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">
          {t('common.cancel')}
        </Button>
        <Button onClick={handleSubmit} variant="contained" color="primary">
          {t('common.save')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditProjectDialog;
