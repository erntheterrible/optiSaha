import React from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Tooltip,
  CircularProgress
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

const DealTableView = ({ deals, loading, onUpdateDeal, onDeleteDeal }) => {
  const { t } = useTranslation();
  
  // Stage colors for chips
  const stageColors = {
    'prospecting': 'info',
    'qualification': 'warning',
    'proposal': 'success',
    'negotiation': 'error',
    'won': 'secondary',
    'lost': 'default'
  };
  
  // Format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>{t('deals.columns.title')}</TableCell>
            <TableCell>{t('deals.columns.customer')}</TableCell>
            <TableCell>{t('deals.columns.value')}</TableCell>
            <TableCell>{t('deals.columns.stage')}</TableCell>
            <TableCell>{t('deals.columns.closeDate')}</TableCell>
            <TableCell>{t('deals.columns.owner')}</TableCell>
            <TableCell>{t('deals.columns.probability')}</TableCell>
            <TableCell>{t('common.actions')}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {deals.map((deal) => (
            <TableRow key={deal.id}>
              <TableCell>
                <Typography variant="subtitle2">{deal.title}</Typography>
              </TableCell>
              <TableCell>
                {deal.customer?.name || t('deals.noCustomer')}
              </TableCell>
              <TableCell>
                {deal.value ? formatCurrency(deal.value) : t('deals.noValue')}
              </TableCell>
              <TableCell>
                <Chip 
                  label={deal.stageLabel}
                  color={stageColors[deal.stage] || 'default'}
                  size="small"
                />
              </TableCell>
              <TableCell>
                {deal.close_date ? new Date(deal.close_date).toLocaleDateString() : t('deals.noCloseDate')}
              </TableCell>
              <TableCell>
                {deal.owner?.name || t('deals.noOwner')}
              </TableCell>
              <TableCell>
                {deal.probability ? `${deal.probability}%` : '0%'}
              </TableCell>
              <TableCell>
                <Tooltip title={t('common.edit')}>
                  <IconButton size="small" onClick={() => {
                    // Pass the deal data to be edited
                    onUpdateDeal(deal.id, deal);
                  }}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title={t('common.delete')}>
                  <IconButton size="small" onClick={() => onDeleteDeal(deal.id)}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </TableCell>
            </TableRow>
          ))}
          
          {deals.length === 0 && (
            <TableRow>
              <TableCell colSpan={8} align="center">
                <Typography variant="body2" color="text.secondary" sx={{ py: 4 }}>
                  {t('deals.noDealsFound')}
                </Typography>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default DealTableView;
