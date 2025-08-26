import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Button,
  TextField,
  InputAdornment,
  Chip,
  Tooltip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  FormControl,
  InputLabel,
  Select,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  useTheme,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterListIcon,
  MoreVert as MoreVertIcon,
  Visibility as VisibilityIcon,
  Download as DownloadIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  PictureAsPdf as PdfIcon,
  InsertDriveFile as CsvIcon,
  Image as ImageIcon,
} from '@mui/icons-material';
// Date picker components are commented out as they require additional dependencies
// Uncomment these lines after installing @mui/x-date-pickers and date-fns
// import { DatePicker } from '@mui/x-date-pickers/DatePicker';
// import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
// import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import activityService from '../../services/activityService';

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleString();
};

const getStatusColor = (status) => {
  switch (status) {
    case 'completed':
      return 'success';
    case 'processing':
      return 'info';
    case 'failed':
      return 'error';
    default:
      return 'default';
  }
};

const getTypeColor = (type) => {
  const colors = {
    sales: 'primary',
    activity: 'secondary',
    analytics: 'info',
    system: 'warning',
    feedback: 'success',
  };
  return colors[type] || 'default';
};

const getFormatIcon = (format) => {
  switch (format) {
    case 'pdf':
      return <PdfIcon />;
    case 'csv':
      return <CsvIcon />;
    case 'png':
    case 'jpg':
      return <ImageIcon />;
    default:
      // Using CsvIcon as fallback for unknown formats
      return <CsvIcon />;
  }
};

const ReportsPage = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [dateRange, setDateRange] = useState([null, null]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedReport, setSelectedReport] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        const data = await activityService.getActivities();
        setReports(data || []);
        setError(null);
      } catch (err) {
        setError(t('reports.errors.loadFailed', 'Failed to load reports. Please try again.'));
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, [t]);
  const [openFilterMenu, setOpenFilterMenu] = useState(false);
  const [anchorFilterEl, setAnchorFilterEl] = useState(null);

  // Filter reports based on search and filters
  const filteredReports = useMemo(() => reports.filter((report) => {
    const matchesSearch = report.title.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === 'all' || report.type === filterType;
    const matchesStatus = filterStatus === 'all' || report.status === filterStatus;
    
    const [startDate, endDate] = dateRange;
    const reportDate = new Date(report.createdAt);
    const matchesDate = (!startDate || reportDate >= startDate) && 
                       (!endDate || reportDate <= new Date(endDate.getTime() + 24 * 60 * 60 * 1000));
    
    return matchesSearch && matchesType && matchesStatus && matchesDate;
  }), [reports, searchTerm, filterType, filterStatus, dateRange]);

  // Pagination
  const paginatedReports = filteredReports.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  const handleMenuClick = (event, report) => {
    setAnchorEl(event.currentTarget);
    setSelectedReport(report);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedReport(null);
  };

  const handleFilterMenuOpen = (event) => {
    setAnchorFilterEl(event.currentTarget);
    setOpenFilterMenu(true);
  };

  const handleFilterMenuClose = () => {
    setOpenFilterMenu(false);
    setAnchorFilterEl(null);
  };

  const handleViewReport = () => {
    setOpenDialog(true);
    handleMenuClose();
  };

  const handleDownloadReport = () => {
    // In a real app, this would trigger a download
    console.log('Downloading report:', selectedReport);
    handleMenuClose();
  };

  const handleDeleteReport = () => {
    if (window.confirm('Are you sure you want to delete this report?')) {
      setReports(reports.filter(report => report.id !== selectedReport.id));
      handleMenuClose();
    }
  };

  const handleRefresh = () => {
    // In a real app, this would refresh the reports list
    console.log('Refreshing reports...');
  };

  const handleGenerateReport = () => {
    // In a real app, this would open a dialog to configure a new report
    console.log('Generating new report...');
  };

  const handleDateChange = (newValue, index) => {
    const newDateRange = [...dateRange];
    newDateRange[index] = newValue;
    setDateRange(newDateRange);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilterType('all');
    setFilterStatus('all');
    setDateRange([null, null]);
    handleFilterMenuClose();
  };

  const reportTypes = useMemo(() => [...new Set(reports.map(report => report.type))], [reports]);
  const reportStatuses = useMemo(() => [...new Set(reports.map(report => report.status))], [reports]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 'calc(100vh - 200px)' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          {t('reports.title')}
        </Typography>
        <Box>
          <Tooltip title={t('reports.refreshTooltip')}>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={handleRefresh}
              sx={{ mr: 1 }}
            >
              {t('reports.refresh')}
            </Button>
          </Tooltip>
          <Button
            variant="contained"
            color="primary"
            onClick={handleGenerateReport}
          >
            {t('reports.generateReport')}
          </Button>
        </Box>
      </Box>

      <Paper sx={{ mb: 3 }}>
        <Box p={2} display="flex" alignItems="center" flexWrap="wrap" gap={2}>
          <TextField
            variant="outlined"
            placeholder={t('reports.searchPlaceholder')}
            size="small"
            value={searchTerm}
            onChange={handleSearch}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ flex: 1, minWidth: 250 }}
          />
          
          <Box display="flex" gap={1} flexWrap="wrap">
            <Tooltip title={t('reports.filterTooltip')}>
              <Button
                variant="outlined"
                startIcon={<FilterListIcon />}
                onClick={handleFilterMenuOpen}
              >
                {t('reports.filters')}
              </Button>
            </Tooltip>
            
            {(searchTerm || filterType !== 'all' || filterStatus !== 'all' || dateRange.some(Boolean)) && (
              <Button
                variant="text"
                color="inherit"
                onClick={clearFilters}
              >
                {t('reports.clearFilters')}
              </Button>
            )}
          </Box>
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>{t('reports.title')}</TableCell>
                <TableCell>{t('reports.type')}</TableCell>
                <TableCell>{t('reports.status')}</TableCell>
                <TableCell>{t('reports.createdBy')}</TableCell>
                <TableCell>{t('reports.createdAt')}</TableCell>
                <TableCell>{t('reports.size')}</TableCell>
                <TableCell align="right">{t('reports.actions')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedReports.length > 0 ? (
                paginatedReports.map((report) => (
                  <TableRow key={report.id} hover>
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        <Box sx={{ color: 'text.secondary', mr: 1 }}>
                          {getFormatIcon(report.format)}
                        </Box>
                        <Box>
                          <Typography variant="body2" noWrap>
                            {report.title}
                          </Typography>
                          <Typography variant="caption" color="textSecondary" noWrap>
                            {report.description}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={t(`reports.types.${report.type}`)} 
                        color={getTypeColor(report.type)}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={t(`reports.statuses.${report.status}`)} 
                        color={getStatusColor(report.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{report.createdBy}</TableCell>
                    <TableCell>{formatDate(report.createdAt)}</TableCell>
                    <TableCell>{report.size}</TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        onClick={(e) => handleMenuClick(e, report)}
                      >
                        <MoreVertIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <Typography color="textSecondary">
                      {t('reports.noReportsFound')}
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredReports.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

      {/* Report Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        onClick={handleMenuClose}
      >
        <MenuItem onClick={handleViewReport}>
          <ListItemIcon>
            <VisibilityIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary={t('reports.viewReport')} />
        </MenuItem>
        <MenuItem onClick={handleDownloadReport}>
          <ListItemIcon>
            <DownloadIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary={t('reports.download')} />
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleDeleteReport}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText primary={t('reports.delete')} primaryTypographyProps={{ color: 'error' }} />
        </MenuItem>
      </Menu>

      {/* Filter Menu */}
      <Menu
        anchorEl={anchorFilterEl}
        open={openFilterMenu}
        onClose={handleFilterMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <Box sx={{ p: 2, width: 300 }}>
          <Typography variant="subtitle2" gutterBottom>
            {t('reports.filters')}
          </Typography>
          
          <FormControl fullWidth size="small" sx={{ mb: 2 }}>
            <InputLabel>{t('reports.type')}</InputLabel>
            <Select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              label={t('reports.type')}
            >
              <MenuItem value="all">{t('reports.allTypes')}</MenuItem>
              {reportTypes.map((type) => (
                <MenuItem key={type} value={type}>
                  {t(`reports.types.${type}`)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <FormControl fullWidth size="small" sx={{ mb: 2 }}>
            <InputLabel>{t('reports.status')}</InputLabel>
            <Select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              label={t('reports.status')}
            >
              <MenuItem value="all">{t('reports.allStatuses')}</MenuItem>
              {reportStatuses.map((status) => (
                <MenuItem key={status} value={status}>
                  <Chip 
                    label={t(`reports.statuses.${status}`)} 
                    size="small" 
                    color={getStatusColor(status)}
                  /> 
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          {/* Date Range Picker - Requires @mui/x-date-pickers and date-fns
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label="From Date"
              value={dateRange[0]}
              onChange={(newValue) => handleDateChange(newValue, 0)}
              renderInput={(params) => (
                <TextField 
                  {...params} 
                  fullWidth 
                  size="small" 
                  sx={{ mb: 2 }} 
                />
              )}
            />
            <DatePicker
              label="To Date"
              value={dateRange[1]}
              onChange={(newValue) => handleDateChange(newValue, 1)}
              renderInput={(params) => (
                <TextField 
                  {...params} 
                  fullWidth 
                  size="small" 
                  sx={{ mb: 2 }} 
                />
              )}
            />
          </LocalizationProvider>
          */}
          
          {/* Simple date inputs as fallback */}
          <TextField
            label={t('reports.fromDate')}
            type="date"
            size="small"
            fullWidth
            sx={{ mb: 2 }}
            InputLabelProps={{
              shrink: true,
            }}
            value={dateRange[0]?.toISOString().split('T')[0] || ''}
            onChange={(e) => handleDateChange(e.target.value ? new Date(e.target.value) : null, 0)}
          />
          <TextField
            label={t('reports.toDate')}
            type="date"
            size="small"
            fullWidth
            sx={{ mb: 2 }}
            InputLabelProps={{
              shrink: true,
            }}
            value={dateRange[1]?.toISOString().split('T')[0] || ''}
            onChange={(e) => handleDateChange(e.target.value ? new Date(e.target.value) : null, 1)}
          />
          
          <Button
            fullWidth
            variant="contained"
            onClick={handleFilterMenuClose}
            size="small"
          >
            {t('reports.applyFilters')}
          </Button>
        </Box>
      </Menu>

      {/* Report View Dialog */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {selectedReport?.title}
          <Chip 
            label={t(`reports.statuses.${selectedReport?.status}`)} 
            size="small" 
            color={getStatusColor(selectedReport?.status)}
            sx={{ ml: 2 }}
          />
        </DialogTitle>
        <DialogContent>
          <Box mb={2}>
            <Typography variant="subtitle2" color="textSecondary" gutterBottom>
              {t('reports.reportDetails')}
            </Typography>
            <Box display="flex" flexWrap="wrap" gap={4}>
              <Box>
                <Typography variant="caption" color="textSecondary">{t('reports.type')}</Typography>
                <Typography>
                  <Chip 
                    label={t(`reports.types.${selectedReport?.type}`)} 
                    size="small" 
                    color={getTypeColor(selectedReport?.type)}
                    variant="outlined"
                  />
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="textSecondary">{t('reports.format')}</Typography>
                <Typography>{selectedReport?.format?.toUpperCase()}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="textSecondary">{t('reports.size')}</Typography>
                <Typography>{selectedReport?.size}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="textSecondary">{t('reports.createdBy')}</Typography>
                <Typography>{selectedReport?.createdBy}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="textSecondary">{t('reports.createdAt')}</Typography>
                <Typography>{selectedReport?.createdAt ? formatDate(selectedReport.createdAt) : ''}</Typography>
              </Box>
            </Box>
          </Box>
          
          <Box mt={3}>
            <Typography variant="subtitle2" color="textSecondary" gutterBottom>
              {t('reports.description')}
            </Typography>
            <Typography paragraph>{selectedReport?.description}</Typography>
          </Box>
          
          <Box 
            mt={3} 
            p={3} 
            bgcolor="action.hover" 
            borderRadius={1}
            textAlign="center"
            minHeight={300}
            display="flex"
            alignItems="center"
            justifyContent="center"
            flexDirection="column"
          >
            <Box mb={2} fontSize={48} color="text.secondary">
              {getFormatIcon(selectedReport?.format)}
            </Box>
            <Typography variant="h6" color="textSecondary">
              {t('reports.previewOf', { title: selectedReport?.title })}
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mt: 1, maxWidth: 400 }}>
              {t('reports.previewDescription')}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} color="inherit">
            Close
          </Button>
          <Button 
            onClick={handleDownloadReport} 
            color="primary"
            variant="contained"
            startIcon={<DownloadIcon />}
          >
            Download
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ReportsPage;
