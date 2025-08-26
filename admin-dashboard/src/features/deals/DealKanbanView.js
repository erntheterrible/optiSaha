import React from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  IconButton,
  Tooltip,
  CircularProgress,
  Avatar
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  AttachMoney as MoneyIcon,
  CalendarToday as CalendarIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@mui/material/styles';

const DealKanbanView = ({ deals, loading, onMoveDeal, onUpdateDeal, onDeleteDeal }) => {
  const { t } = useTranslation();
  const theme = useTheme();
  
  // Stage definitions with colors - using lighter, desaturated versions
  const stages = [
    { 
      id: 'prospecting', 
      title: t('deals.stages.prospecting'), 
      color: '#2196f3',
      bgColor: '#E8F4FD',
      borderColor: '#2196f3'
    },
    { 
      id: 'qualification', 
      title: t('deals.stages.qualification'), 
      color: '#ff9800',
      bgColor: '#FFF4E1',
      borderColor: '#ff9800'
    },
    { 
      id: 'proposal', 
      title: t('deals.stages.proposal'), 
      color: '#4caf50',
      bgColor: '#EAF9EA',
      borderColor: '#4caf50'
    },
    { 
      id: 'negotiation', 
      title: t('deals.stages.negotiation'), 
      color: '#ff5722',
      bgColor: '#FFE9E3',
      borderColor: '#ff5722'
    },
    { 
      id: 'won', 
      title: t('deals.stages.won'), 
      color: '#9c27b0',
      bgColor: '#F5EAFB',
      borderColor: '#9c27b0'
    },
    { 
      id: 'lost', 
      title: t('deals.stages.lost'), 
      color: '#f44336',
      bgColor: '#FCEAEA',
      borderColor: '#f44336'
    }
  ];
  
  // Group deals by stage
  const groupedDeals = stages.map(stage => ({
    ...stage,
    deals: deals.filter(deal => deal.stage === stage.id)
  }));
  
  // Handle drag and drop
  const handleDragStart = (e, deal) => {
    e.dataTransfer.setData('deal', JSON.stringify(deal));
  };
  
  const handleDragOver = (e) => {
    e.preventDefault();
  };
  
  const handleDrop = (e, stageId) => {
    e.preventDefault();
    const dealData = JSON.parse(e.dataTransfer.getData('deal'));
    if (dealData.stage !== stageId) {
      onMoveDeal(dealData.id, stageId);
    }
  };
  
  // Format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };
  
  // Get stage color
  const getStageColor = (stageId) => {
    const stage = stages.find(s => s.id === stageId);
    return stage ? stage.color : '#9e9e9e';
  };
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Box sx={{ overflowX: 'auto', pb: 2 }}>
      <Grid container spacing={2} sx={{ minWidth: '1200px' }}>
        {groupedDeals.map((stage) => (
          <Grid item xs key={stage.id}>
            <Paper 
              sx={{ 
                height: '100%',
                backgroundColor: '#f5f5f5',
                border: '1px solid #e0e0e0',
                borderRadius: 2,
                p: 2
              }}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, stage.id)}
            >
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                mb: 2,
                pb: 1,
                borderBottom: `2px solid ${stage.borderColor}`
              }}>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    fontWeight: 'bold',
                    color: stage.color
                  }}
                >
                  {stage.title}
                </Typography>
                <Chip 
                  label={stage.deals.length} 
                  size="small" 
                  sx={{ 
                    backgroundColor: stage.color,
                    color: 'white',
                    fontWeight: 'bold'
                  }} 
                />
              </Box>
              
              <Box sx={{ p: 1, minHeight: 400 }}>
                {stage.deals.map((deal) => (
                  <Card 
                    key={deal.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, deal)}
                    sx={{ 
                      mb: 2, 
                      cursor: 'grab',
                      borderRadius: 2,
                      boxShadow: 1,
                      '&:hover': {
                        boxShadow: 4
                      }
                    }}
                  >
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                          {deal.title}
                        </Typography>
                        <Chip 
                          label={`${deal.probability || 0}%`}
                          size="small"
                          sx={{ 
                            backgroundColor: getStageColor(deal.stage),
                            color: 'white',
                            fontWeight: 'bold'
                          }}
                        />
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <PersonIcon sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                          {deal.customer?.name || t('deals.noCustomer')}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <MoneyIcon sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                          {deal.value ? formatCurrency(deal.value) : t('deals.noValue')}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <CalendarIcon sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                          {deal.close_date ? new Date(deal.close_date).toLocaleDateString() : t('deals.noCloseDate')}
                        </Typography>
                      </Box>
                    </CardContent>
                    
                    <CardActions sx={{ justifyContent: 'flex-end', pt: 0 }}>
                      <Tooltip title={t('common.edit')}>
                        <IconButton 
                          size="small" 
                          onClick={() => {
                            // Pass the deal data to be edited
                            onUpdateDeal(deal.id, deal);
                          }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={t('common.delete')}>
                        <IconButton 
                          size="small" 
                          onClick={() => onDeleteDeal(deal.id)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </CardActions>
                  </Card>
                ))}
                
                {stage.deals.length === 0 && (
                  <Box sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
                    <Typography variant="body2">
                      {t('deals.noDealsInStage')}
                    </Typography>
                  </Box>
                )}
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default DealKanbanView;
