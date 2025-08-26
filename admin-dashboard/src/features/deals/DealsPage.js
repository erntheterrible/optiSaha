import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Button,
  Grid,
  Paper,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  ToggleButtonGroup,
  ToggleButton,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Add as AddIcon,
  ViewColumn as ColumnViewIcon,
  ViewWeek as KanbanViewIcon,
  Search as SearchIcon,
  FilterList as FilterIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { getDeals, createDeal, updateDeal, deleteDeal } from '../../services/dealsService';
import CreateDealDialog from './CreateDealDialog';
import DealKanbanView from './DealKanbanView';
import DealTableView from './DealTableView';

const DealsPage = () => {
  const { t } = useTranslation();
  
  const [viewMode, setViewMode] = useState('kanban'); // 'kanban' or 'table'
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [editingDeal, setEditingDeal] = useState(null);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [stageFilter, setStageFilter] = useState('');
  const [customerFilter, setCustomerFilter] = useState('');
  
  // Load deals
  useEffect(() => {
    loadDeals();
  }, [searchTerm, stageFilter, customerFilter]);
  
  const loadDeals = async () => {
    try {
      setLoading(true);
      const filters = {};
      
      if (searchTerm) filters.search = searchTerm;
      if (stageFilter) filters.stage = stageFilter;
      if (customerFilter) filters.customerId = customerFilter;
      
      const data = await getDeals(filters);
      setDeals(data);
    } catch (error) {
      console.error('Error loading deals:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleCreateDeal = async (dealData) => {
    try {
      const newDeal = await createDeal(dealData);
      setDeals(prev => [...prev, newDeal]);
      setOpenCreateDialog(false);
    } catch (error) {
      console.error('Error creating deal:', error);
    }
  };
  
  const handleUpdateDeal = async (id, dealData) => {
    try {
      const updatedDeal = await updateDeal(id, dealData);
      setDeals(prev => prev.map(deal => deal.id === id ? updatedDeal : deal));
      setOpenCreateDialog(false);
      setEditingDeal(null);
    } catch (error) {
      console.error('Error updating deal:', error);
    }
  };
  
  const handleDeleteDeal = async (id) => {
    try {
      await deleteDeal(id);
      setDeals(prev => prev.filter(deal => deal.id !== id));
    } catch (error) {
      console.error('Error deleting deal:', error);
    }
  };
  
  const handleMoveDeal = async (dealId, newStage) => {
    try {
      const updatedDeal = await updateDeal(dealId, { stage: newStage });
      setDeals(prev => prev.map(deal => deal.id === dealId ? updatedDeal : deal));
    } catch (error) {
      console.error('Error moving deal:', error);
    }
  };
  
  // Stage options for filtering
  const stageOptions = [
    { value: 'prospecting', label: t('deals.stages.prospecting') },
    { value: 'qualification', label: t('deals.stages.qualification') },
    { value: 'proposal', label: t('deals.stages.proposal') },
    { value: 'negotiation', label: t('deals.stages.negotiation') },
    { value: 'won', label: t('deals.stages.won') },
    { value: 'lost', label: t('deals.stages.lost') }
  ];
  
  return (
    <Box sx={{ p: 3 }}>
      <Grid container spacing={3} alignItems="center" sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <Typography variant="h4" component="h1" gutterBottom>
            {t('menu.deals')}
          </Typography>
        </Grid>
        <Grid item xs={12} md={6} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenCreateDialog(true)}
          >
            {t('deals.createDeal')}
          </Button>
        </Grid>
      </Grid>
      
      {/* Filters and Search */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              placeholder={t('deals.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
              }}
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>{t('deals.columns.stage')}</InputLabel>
              <Select
                value={stageFilter}
                onChange={(e) => setStageFilter(e.target.value)}
                label={t('deals.columns.stage')}
              >
                <MenuItem value="">{t('deals.allStages')}</MenuItem>
                {stageOptions.map((stage) => (
                  <MenuItem key={stage.value} value={stage.value}>
                    {stage.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              placeholder={t('deals.customerFilter')}
              value={customerFilter}
              onChange={(e) => setCustomerFilter(e.target.value)}
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<FilterIcon />}
            >
              {t('common.filters')}
            </Button>
          </Grid>
        </Grid>
      </Paper>
      
      {/* View Toggle */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <ToggleButtonGroup
          value={viewMode}
          exclusive
          onChange={(e, newValue) => newValue && setViewMode(newValue)}
          aria-label="view mode"
        >
          <ToggleButton value="kanban" aria-label="kanban view">
            <KanbanViewIcon />
            <Typography sx={{ ml: 1 }}>{t('deals.kanbanView')}</Typography>
          </ToggleButton>
          <ToggleButton value="table" aria-label="table view">
            <ColumnViewIcon />
            <Typography sx={{ ml: 1 }}>{t('deals.tableView')}</Typography>
          </ToggleButton>
        </ToggleButtonGroup>
        
        {/* Summary Stats */}
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Chip 
            label={`${t('deals.totalDeals')}: ${deals.length}`} 
            color="primary" 
            variant="outlined" 
          />
          <Chip 
            label={`${t('deals.totalValue')}: $${deals.reduce((sum, deal) => sum + (deal.value || 0), 0).toLocaleString()}`} 
            color="secondary" 
            variant="outlined" 
          />
        </Box>
      </Box>
      
      {/* Main Content */}
      {viewMode === 'kanban' ? (
        <DealKanbanView 
          deals={deals} 
          loading={loading}
          onMoveDeal={handleMoveDeal}
          onUpdateDeal={(id, deal) => {
            setEditingDeal(deal);
            setOpenCreateDialog(true);
          }}
          onDeleteDeal={handleDeleteDeal}
        />
      ) : (
        <DealTableView 
          deals={deals} 
          loading={loading}
          onUpdateDeal={(id, deal) => {
            setEditingDeal(deal);
            setOpenCreateDialog(true);
          }}
          onDeleteDeal={handleDeleteDeal}
        />
      )}
      
      {/* Create Deal Dialog */}
      <CreateDealDialog
        open={openCreateDialog}
        onClose={() => {
          setOpenCreateDialog(false);
          setEditingDeal(null);
        }}
        onSave={editingDeal ? (dealData) => handleUpdateDeal(editingDeal.id, dealData) : handleCreateDeal}
        dealData={editingDeal}
      />
    </Box>
  );
};

export default DealsPage;
