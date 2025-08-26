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
  Switch,
  FormControlLabel,
  Autocomplete,
  Snackbar,
  Alert as MuiAlert,
  OutlinedInput,
  FormHelperText,
  Stack,
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterListIcon,
  MoreVert as MoreVertIcon,
  Add as AddIcon,
  PlayArrow as PlayIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Pause as PauseIcon,
  PictureAsPdf as PdfIcon,
  CloudDownload as CsvIcon,
  Image as ImageIcon,
  Refresh as RefreshIcon,
  Visibility as VisibilityIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import reportService from '../../services/reportService';

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
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedReport, setSelectedReport] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [openFilterMenu, setOpenFilterMenu] = useState(false);
  const [anchorFilterEl, setAnchorFilterEl] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [openScheduleDialog, setOpenScheduleDialog] = useState(false);
  const [editingReport, setEditingReport] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'sales',
    frequency: 'daily',
    delivery_time: '09:00',
    recipients: [],
    pdf_template: '',
    is_active: true
  });
  const [recipientInput, setRecipientInput] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const [dateRange, setDateRange] = useState([null, null]);
  // State for instant report generation
  const [openInstantReportDialog, setOpenInstantReportDialog] = useState(false);
  const [instantReportParams, setInstantReportParams] = useState({
    type: 'sales',
    format: 'pdf',
    dateRangeStart: null,
    dateRangeEnd: null
  });
  const [generatingReport, setGeneratingReport] = useState(false);
  const [generatedReport, setGeneratedReport] = useState(null);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const data = await reportService.getReportSchedules();
      setReports(data || []);
      setError(null);
    } catch (err) {
      setError(t('reports.errors.loadFailed', 'Failed to load reports. Please try again.'));
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleFormChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error for this field when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleAddRecipient = () => {
    if (recipientInput && recipientInput.includes('@')) {
      if (!formData.recipients.includes(recipientInput)) {
        setFormData(prev => ({
          ...prev,
          recipients: [...prev.recipients, recipientInput]
        }));
        setRecipientInput('');
        
        // Clear recipient error
        if (formErrors.recipients) {
          setFormErrors(prev => ({
            ...prev,
            recipients: ''
          }));
        }
      }
    }
  };

  const handleRemoveRecipient = (recipientToRemove) => {
    setFormData(prev => ({
      ...prev,
      recipients: prev.recipients.filter(r => r !== recipientToRemove)
    }));
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const handleSaveSchedule = async () => {
    // Validate form
    const errors = {};
    
    if (!formData.name.trim()) {
      errors.name = t('reports.errors.nameRequired');
    }
    
    if (formData.recipients.length === 0) {
      errors.recipients = t('reports.errors.recipientsRequired');
    }
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    
    try {
      if (editingReport) {
        // Update existing schedule
        await reportService.updateReportSchedule(editingReport.id, formData);
        setSnackbar({
          open: true,
          message: t('reports.scheduleUpdated'),
          severity: 'success'
        });
      } else {
        // Create new schedule
        await reportService.createReportSchedule(formData);
        setSnackbar({
          open: true,
          message: t('reports.scheduleCreated'),
          severity: 'success'
        });
      }
      
      // Refresh reports list
      const data = await reportService.getReportSchedules();
      setReports(data || []);
      
      // Close dialog
      setOpenScheduleDialog(false);
      
      // Reset form
      setFormData({
        name: '',
        type: 'sales',
        frequency: 'daily',
        delivery_time: '09:00',
        recipients: [],
        pdf_template: '',
        is_active: true
      });
      setEditingReport(null);
    } catch (error) {
      console.error('Error saving schedule:', error);
      setSnackbar({
        open: true,
        message: t('reports.errors.saveFailed'),
        severity: 'error'
      });
    }
  };

  const handleDateChange = (newValue, index) => {
    const newDateRange = [...dateRange];
    newDateRange[index] = newValue;
    setDateRange(newDateRange);
  };

  const handleRunNow = async (reportId) => {
    try {
      await reportService.runReportNow(reportId);
      setSnackbar({
        open: true,
        message: t('reports.runNowSuccess'),
        severity: 'success'
      });
      
      // Refresh reports list
      const data = await reportService.getReportSchedules();
      setReports(data || []);
    } catch (error) {
      console.error('Error running report:', error);
      setSnackbar({
        open: true,
        message: t('reports.errors.runFailed'),
        severity: 'error'
      });
    }
  };

  const handlePause = async (reportId) => {
    try {
      await reportService.pauseReportSchedule(reportId);
      setSnackbar({
        open: true,
        message: t('reports.pauseSuccess'),
        severity: 'success'
      });
      
      // Refresh reports list
      const data = await reportService.getReportSchedules();
      setReports(data || []);
    } catch (error) {
      console.error('Error pausing report:', error);
      setSnackbar({
        open: true,
        message: t('reports.errors.pauseFailed'),
        severity: 'error'
      });
    }
  };

  const handleDelete = async (reportId) => {
    try {
      await reportService.deleteReportSchedule(reportId);
      setSnackbar({
        open: true,
        message: t('reports.deleteSuccess'),
        severity: 'success'
      });
      
      // Refresh reports list
      const data = await reportService.getReportSchedules();
      setReports(data || []);
    } catch (error) {
      console.error('Error deleting report:', error);
      setSnackbar({
        open: true,
        message: t('reports.errors.deleteFailed'),
        severity: 'error'
      });
    }
  };

  const handleEdit = (report) => {
    setEditingReport(report);
    setFormData({
      name: report.name,
      type: report.type,
      frequency: report.frequency,
      delivery_time: report.delivery_time,
      recipients: report.recipients || [],
      pdf_template: report.pdf_template || '',
      is_active: report.is_active
    });
    setOpenScheduleDialog(true);
  };

  const handleOpenScheduleDialog = () => {
    setEditingReport(null);
    setFormData({
      name: '',
      type: 'sales',
      frequency: 'daily',
      delivery_time: '09:00',
      recipients: [],
      pdf_template: '',
      is_active: true
    });
    setFormErrors({});
    setOpenScheduleDialog(true);
  };

  const handleCloseScheduleDialog = () => {
    setOpenScheduleDialog(false);
    setEditingReport(null);
    setFormErrors({});
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedReport(null);
  };

  const handleOpenFilterMenu = (event) => {
    setAnchorFilterEl(event.currentTarget);
    setOpenFilterMenu(true);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setPage(0); // Reset to first page when searching
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Filter reports based on search and filters
  const filteredReports = useMemo(() => reports.filter((report) => {
    const matchesSearch = report.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || report.type === filterType;
    const matchesStatus = filterStatus === 'all' || (report.is_active ? 'active' : 'inactive') === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  }), [reports, searchTerm, filterType, filterStatus]);

  const paginatedReports = useMemo(() => {
    return filteredReports.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [filteredReports, page, rowsPerPage]);

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
    fetchReports();
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setFilterType('all');
    setFilterStatus('all');
    setPage(0);
  };

  const handleGenerateReport = () => {
    setOpenInstantReportDialog(true);
  };

  const handleCloseInstantReportDialog = () => {
    setOpenInstantReportDialog(false);
    setInstantReportParams({
      type: 'sales',
      format: 'pdf',
      dateRangeStart: null,
      dateRangeEnd: null
    });
    setGeneratedReport(null);
  };

  const handleInstantReportParamChange = (field, value) => {
    setInstantReportParams(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleGenerateInstantReport = async () => {
    try {
      setGeneratingReport(true);
      const reportData = await reportService.generateReportInstantly(instantReportParams);
      setGeneratedReport(reportData);
      setSnackbar({
        open: true,
        message: t('reports.success.reportGenerated', 'Report generated successfully!'),
        severity: 'success'
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: t('reports.errors.generateFailed', 'Failed to generate report. Please try again.'),
        severity: 'error'
      });
      console.error('Error generating report:', error);
    } finally {
      setGeneratingReport(false);
    }
  };

  const handleDownloadInstantReport = () => {
    if (!generatedReport) return;
    
    try {
      let blob;
      let filename;
      
      switch (generatedReport.format) {
        case 'csv':
          // Convert report data to CSV
          let csvContent = 'Report:,' + generatedReport.name + '\n';
          csvContent += 'Generated:,' + new Date(generatedReport.generated_at).toLocaleString() + '\n\n';
          
          // Add metrics
          csvContent += 'Metrics:\n';
          csvContent += 'Name,Value\n';
          generatedReport.data.metrics.forEach(metric => {
            csvContent += `${metric.name},${metric.value}\n`;
          });
          
          // Add data section based on report type
          if (generatedReport.data.projects) {
            csvContent += '\nProjects:\n';
            csvContent += 'ID,Name,Created,Revenue,Status\n';
            generatedReport.data.projects.forEach(project => {
              csvContent += `${project.id},${project.name},${project.created_at},${project.revenue || 0},${project.status}\n`;
            });
          } else if (generatedReport.data.leads) {
            csvContent += '\nLeads:\n';
            csvContent += 'ID,Name,Email,Phone,Status,Source,Created\n';
            generatedReport.data.leads.forEach(lead => {
              csvContent += `${lead.id},${lead.name},${lead.email || ''},${lead.phone || ''},${lead.status},${lead.source || ''},${lead.created_at}\n`;
            });
          } else if (generatedReport.data.visits) {
            csvContent += '\nVisits:\n';
            csvContent += 'ID,Project ID,User ID,Type,Status,Scheduled,Duration\n';
            generatedReport.data.visits.forEach(visit => {
              csvContent += `${visit.id},${visit.project_id},${visit.user_id},${visit.visit_type},${visit.status},${visit.scheduled_date},${visit.duration_minutes || 0}\n`;
            });
          }
          
          blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
          filename = `${generatedReport.name.replace(/[^a-zA-Z0-9]/g, '_')}.csv`;
          break;
          
        case 'pdf':
          // Create a visually appealing PDF using jsPDF
          const doc = new jsPDF();
          const pageWidth = doc.internal.pageSize.width;
          
          // Add company header
          doc.setFillColor(22, 160, 133); // Dark teal color
          doc.rect(0, 0, pageWidth, 25, 'F');
          
          // Add title with white color
          doc.setTextColor(255, 255, 255); // White color
          doc.setFontSize(20);
          doc.setFont('helvetica', 'bold');
          doc.text(generatedReport.name, pageWidth / 2, 17, { align: 'center' });
          
          // Reset text color
          doc.setTextColor(0, 0, 0); // Black color
          
          // Add report info box
          doc.setFontSize(10);
          doc.setFont('helvetica', 'normal');
          const generatedDate = new Date(generatedReport.generated_at).toLocaleString();
          const dateRange = `Date Range: ${generatedReport.date_range_start} to ${generatedReport.date_range_end || 'now'}`;
          
          doc.setFillColor(245, 245, 245); // Light gray
          doc.rect(14, 35, pageWidth - 28, 15, 'F');
          doc.text(`Generated: ${generatedDate}`, 17, 43);
          doc.text(dateRange, 17, 50);
          
          // Add metrics section with enhanced styling
          let yPos = 65;
          doc.setFontSize(16);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(22, 160, 133); // Dark teal color
          doc.text('Key Metrics', 14, yPos);
          
          // Reset text color
          doc.setTextColor(0, 0, 0);
          yPos += 8;
          
          // Create metrics table
          const metricHeaders = [['Metric', 'Value']];
          const metricRows = generatedReport.data.metrics.map(metric => [
            metric.name,
            typeof metric.value === 'number' ? metric.value.toLocaleString() : metric.value
          ]);
          
          autoTable(doc, {
            head: metricHeaders,
            body: metricRows,
            startY: yPos,
            styles: { 
              fontSize: 10,
              cellPadding: 3
            },
            headStyles: { 
              fillColor: [22, 160, 133],
              textColor: [255, 255, 255]
            },
            bodyStyles: { 
              textColor: [0, 0, 0]
            },
            alternateRowStyles: { 
              fillColor: [245, 245, 245]
            },
            columnStyles: {
              0: { cellWidth: 60 },
              1: { cellWidth: 40 }
            }
          });
          
          yPos = doc.lastAutoTable.finalY + 15;
          
          // Add data section based on report type
          if (generatedReport.data.projects) {
            doc.setFontSize(16);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(22, 160, 133); // Dark teal color
            doc.text('Projects Overview', 14, yPos);
            
            // Reset text color
            doc.setTextColor(0, 0, 0);
            yPos += 8;
            
            // Create projects table
            const projectHeaders = [
              ['ID', 'Project Name', 'Created Date', 'Revenue', 'Status']
            ];
            const projectRows = generatedReport.data.projects.map(project => [
              project.id,
              project.name,
              new Date(project.created_at).toLocaleDateString(),
              project.revenue ? `₺${project.revenue.toLocaleString()}` : 'N/A',
              project.status
            ]);
            
            autoTable(doc, {
              head: projectHeaders,
              body: projectRows,
              startY: yPos,
              styles: { 
                fontSize: 9,
                cellPadding: 3
              },
              headStyles: { 
                fillColor: [22, 160, 133],
                textColor: [255, 255, 255]
              },
              bodyStyles: { 
                textColor: [0, 0, 0]
              },
              alternateRowStyles: { 
                fillColor: [245, 245, 245]
              }
            });
          } else if (generatedReport.data.leads) {
            doc.setFontSize(16);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(22, 160, 133); // Dark teal color
            doc.text('Leads Overview', 14, yPos);
            
            // Reset text color
            doc.setTextColor(0, 0, 0);
            yPos += 8;
            
            // Create leads table
            const leadHeaders = [
              ['ID', 'Lead Name', 'Email', 'Phone', 'Status', 'Source', 'Created']
            ];
            const leadRows = generatedReport.data.leads.map(lead => [
              lead.id,
              lead.name,
              lead.email || 'N/A',
              lead.phone || 'N/A',
              lead.status,
              lead.source || 'N/A',
              new Date(lead.created_at).toLocaleDateString()
            ]);
            
            autoTable(doc, {
              head: leadHeaders,
              body: leadRows,
              startY: yPos,
              styles: { 
                fontSize: 8,
                cellPadding: 2.5
              },
              headStyles: { 
                fillColor: [22, 160, 133],
                textColor: [255, 255, 255]
              },
              bodyStyles: { 
                textColor: [0, 0, 0]
              },
              alternateRowStyles: { 
                fillColor: [245, 245, 245]
              }
            });
          } else if (generatedReport.data.visits) {
            doc.setFontSize(16);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(22, 160, 133); // Dark teal color
            doc.text('Visits Overview', 14, yPos);
            
            // Reset text color
            doc.setTextColor(0, 0, 0);
            yPos += 8;
            
            // Create visits table
            const visitHeaders = [
              ['ID', 'Project ID', 'User ID', 'Visit Type', 'Status', 'Scheduled Date', 'Duration (min)']
            ];
            const visitRows = generatedReport.data.visits.map(visit => [
              visit.id,
              visit.project_id,
              visit.user_id,
              visit.visit_type,
              visit.status,
              new Date(visit.scheduled_date).toLocaleDateString(),
              visit.duration_minutes || 'N/A'
            ]);
            
            autoTable(doc, {
              head: visitHeaders,
              body: visitRows,
              startY: yPos,
              styles: { 
                fontSize: 8,
                cellPadding: 2.5
              },
              headStyles: { 
                fillColor: [22, 160, 133],
                textColor: [255, 255, 255]
              },
              bodyStyles: { 
                textColor: [0, 0, 0]
              },
              alternateRowStyles: { 
                fillColor: [245, 245, 245]
              }
            });
          }
          
          // Add footer
          const pageCount = doc.getNumberOfPages();
          for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setTextColor(150);
            doc.text(`Page ${i} of ${pageCount}`, pageWidth - 20, doc.internal.pageSize.height - 10, { align: 'right' });
            doc.text('Generated by Field Management System', 14, doc.internal.pageSize.height - 10);
          }
          
          // Save the PDF
          blob = new Blob([doc.output('blob')], { type: 'application/pdf' });
          filename = `${generatedReport.name.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
          break;
          
        case 'html':
        default:
          // For HTML, create a simple HTML representation
          let htmlContent = `
            <html>
            <head>
              <title>${generatedReport.name}</title>
              <style>
                body { font-family: Arial, sans-serif; }
                table { border-collapse: collapse; width: 100%; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                th { background-color: #f2f2f2; }
              </style>
            </head>
            <body>
              <h1>${generatedReport.name}</h1>
              <p>Generated: ${new Date(generatedReport.generated_at).toLocaleString()}</p>
              <p>Date Range: ${generatedReport.date_range_start} to ${generatedReport.date_range_end || 'now'}</p>
              
              <h2>Metrics</h2>
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Value</th>
                  </tr>
                </thead>
                <tbody>
          `;
          
          generatedReport.data.metrics.forEach(metric => {
            htmlContent += `<tr><td>${metric.name}</td><td>${metric.value}</td></tr>`;
          });
          
          htmlContent += `</tbody></table>`;
          
          // Add data section based on report type
          if (generatedReport.data.projects) {
            htmlContent += `
              <h2>Projects</h2>
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Created</th>
                    <th>Revenue</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
            `;
            generatedReport.data.projects.forEach(project => {
              htmlContent += `
                <tr>
                  <td>${project.id}</td>
                  <td>${project.name}</td>
                  <td>${project.created_at}</td>
                  <td>${project.revenue || 0}</td>
                  <td>${project.status}</td>
                </tr>
              `;
            });
            htmlContent += `</tbody></table>`;
          } else if (generatedReport.data.leads) {
            htmlContent += `
              <h2>Leads</h2>
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Status</th>
                    <th>Source</th>
                    <th>Created</th>
                  </tr>
                </thead>
                <tbody>
            `;
            generatedReport.data.leads.forEach(lead => {
              htmlContent += `
                <tr>
                  <td>${lead.id}</td>
                  <td>${lead.name}</td>
                  <td>${lead.email || ''}</td>
                  <td>${lead.phone || ''}</td>
                  <td>${lead.status}</td>
                  <td>${lead.source || ''}</td>
                  <td>${lead.created_at}</td>
                </tr>
              `;
            });
            htmlContent += `</tbody></table>`;
          } else if (generatedReport.data.visits) {
            htmlContent += `
              <h2>Visits</h2>
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Project ID</th>
                    <th>User ID</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Scheduled</th>
                    <th>Duration (min)</th>
                  </tr>
                </thead>
                <tbody>
            `;
            generatedReport.data.visits.forEach(visit => {
              htmlContent += `
                <tr>
                  <td>${visit.id}</td>
                  <td>${visit.project_id}</td>
                  <td>${visit.user_id}</td>
                  <td>${visit.visit_type}</td>
                  <td>${visit.status}</td>
                  <td>${visit.scheduled_date}</td>
                  <td>${visit.duration_minutes || 0}</td>
                </tr>
              `;
            });
            htmlContent += `</tbody></table>`;
          }
          
          htmlContent += `</body></html>`;
          
          blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8;' });
          filename = `${generatedReport.name.replace(/[^a-zA-Z0-9]/g, '_')}.${generatedReport.format || 'html'}`;
          break;
      }
      
      // Create download link and trigger download
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      setSnackbar({
        open: true,
        message: `${generatedReport.format.toUpperCase()} report downloaded successfully!`,
        severity: 'success'
      });
    } catch (error) {
      console.error('Error downloading report:', error);
      setSnackbar({
        open: true,
        message: 'Failed to download report. Please try again.',
        severity: 'error'
      });
    }
  };

  const handleViewInstantReport = () => {
    if (!generatedReport) return;
    
    try {
      // Create HTML content for viewing
      let htmlContent = `
        <html>
        <head>
          <title>${generatedReport.name}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            table { border-collapse: collapse; width: 100%; margin: 20px 0; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            .metrics-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin: 20px 0; }
            .metric-card { border: 1px solid #ddd; padding: 15px; border-radius: 4px; }
            .metric-name { font-weight: bold; margin-bottom: 5px; }
            .metric-value { font-size: 1.2em; color: #333; }
          </style>
        </head>
        <body>
          <h1>${generatedReport.name}</h1>
          <p><strong>Generated:</strong> ${new Date(generatedReport.generated_at).toLocaleString()}</p>
          <p><strong>Date Range:</strong> ${generatedReport.date_range_start} to ${generatedReport.date_range_end || 'now'}</p>
          
          <h2>Metrics</h2>
          <div class="metrics-grid">
      `;
      
      generatedReport.data.metrics.forEach(metric => {
        htmlContent += `
          <div class="metric-card">
            <div class="metric-name">${metric.name}</div>
            <div class="metric-value">${metric.value}</div>
          </div>
        `;
      });
      
      htmlContent += `</div>`;
      
      // Add data section based on report type
      if (generatedReport.data.projects) {
        htmlContent += `
          <h2>Projects</h2>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Created</th>
                <th>Revenue</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
        `;
        generatedReport.data.projects.forEach(project => {
          htmlContent += `
            <tr>
              <td>${project.id}</td>
              <td>${project.name}</td>
              <td>${new Date(project.created_at).toLocaleDateString()}</td>
              <td>${project.revenue || 0}</td>
              <td>${project.status}</td>
            </tr>
          `;
        });
        htmlContent += `</tbody></table>`;
      } else if (generatedReport.data.leads) {
        htmlContent += `
          <h2>Leads</h2>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Status</th>
                <th>Source</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
        `;
        generatedReport.data.leads.forEach(lead => {
          htmlContent += `
            <tr>
              <td>${lead.id}</td>
              <td>${lead.name}</td>
              <td>${lead.email || ''}</td>
              <td>${lead.phone || ''}</td>
              <td>${lead.status}</td>
              <td>${lead.source || ''}</td>
              <td>${new Date(lead.created_at).toLocaleDateString()}</td>
            </tr>
          `;
        });
        htmlContent += `</tbody></table>`;
      } else if (generatedReport.data.visits) {
        htmlContent += `
          <h2>Visits</h2>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Project ID</th>
                <th>User ID</th>
                <th>Type</th>
                <th>Status</th>
                <th>Scheduled</th>
                <th>Duration (min)</th>
              </tr>
            </thead>
            <tbody>
        `;
        generatedReport.data.visits.forEach(visit => {
          htmlContent += `
            <tr>
              <td>${visit.id}</td>
              <td>${visit.project_id}</td>
              <td>${visit.user_id}</td>
              <td>${visit.visit_type}</td>
              <td>${visit.status}</td>
              <td>${new Date(visit.scheduled_date).toLocaleDateString()}</td>
              <td>${visit.duration_minutes || 0}</td>
            </tr>
          `;
        });
        htmlContent += `</tbody></table>`;
      }
      
      htmlContent += `</body></html>`;
      
      // Open in new tab
      const newWindow = window.open();
      newWindow.document.write(htmlContent);
      newWindow.document.close();
      newWindow.focus();
      
      setSnackbar({
        open: true,
        message: `Viewing ${generatedReport.name}...`,
        severity: 'info'
      });
    } catch (error) {
      console.error('Error viewing report:', error);
      setSnackbar({
        open: true,
        message: 'Failed to view report. Please try again.',
        severity: 'error'
      });
    }
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
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleOpenScheduleDialog}
            sx={{ mr: 2 }}
          >
            {t('reports.addSchedule')}
          </Button>
          <Button
            variant="contained"
            color="secondary"
            startIcon={<PlayIcon />}
            onClick={handleGenerateReport}
            sx={{ mr: 2 }}
          >
            {t('reports.generateReport')}
          </Button>
          <Tooltip title={t('reports.refreshTooltip')}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<RefreshIcon />}
              onClick={handleRefresh}
            >
              {t('reports.refresh')}
            </Button>
          </Tooltip>
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
                onClick={handleClearFilters}
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
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>{t('common.close')}</Button>
        </DialogActions>
      </Dialog>

      {/* New/Edit Schedule Dialog */}
      <Dialog open={openScheduleDialog} onClose={() => setOpenScheduleDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingReport ? t('reports.editSchedule') : t('reports.newSchedule')}</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label={t('reports.name')}
              value={formData.name}
              onChange={(e) => handleFormChange('name', e.target.value)}
              error={!!formErrors.name}
              helperText={formErrors.name}
              margin="normal"
            />
            
            <FormControl fullWidth margin="normal" error={!!formErrors.type}>
              <InputLabel>{t('reports.type')}</InputLabel>
              <Select
                value={formData.type}
                onChange={(e) => handleFormChange('type', e.target.value)}
                label={t('reports.type')}
              >
                <MenuItem value="sales">{t('reports.types.sales')}</MenuItem>
                <MenuItem value="activity">{t('reports.types.activity')}</MenuItem>
                <MenuItem value="analytics">{t('reports.types.analytics')}</MenuItem>
                <MenuItem value="system">{t('reports.types.system')}</MenuItem>
                <MenuItem value="feedback">{t('reports.types.feedback')}</MenuItem>
              </Select>
            </FormControl>
            
            <FormControl fullWidth margin="normal">
              <InputLabel>{t('reports.frequency')}</InputLabel>
              <Select
                value={formData.frequency}
                onChange={(e) => handleFormChange('frequency', e.target.value)}
                label={t('reports.frequency')}
              >
                <MenuItem value="daily">{t('reports.frequencies.daily')}</MenuItem>
                <MenuItem value="weekly">{t('reports.frequencies.weekly')}</MenuItem>
                <MenuItem value="monthly">{t('reports.frequencies.monthly')}</MenuItem>
              </Select>
            </FormControl>
            
            <TextField
              fullWidth
              label={t('reports.deliveryTime')}
              type="time"
              value={formData.delivery_time}
              onChange={(e) => handleFormChange('delivery_time', e.target.value)}
              InputLabelProps={{
                shrink: true,
              }}
              inputProps={{
                step: 300, // 5 min
              }}
              margin="normal"
            />
            
            <FormControl fullWidth margin="normal" error={!!formErrors.recipients}>
              <Stack direction="row" spacing={1} alignItems="center">
                <TextField
                  label={t('reports.addRecipient')}
                  value={recipientInput}
                  onChange={(e) => setRecipientInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddRecipient();
                    }
                  }}
                  fullWidth
                />
                <Button 
                  variant="outlined" 
                  onClick={handleAddRecipient}
                  disabled={!recipientInput.includes('@')}
                >
                  {t('reports.add')}
                </Button>
              </Stack>
              {formErrors.recipients && (
                <FormHelperText>{formErrors.recipients}</FormHelperText>
              )}
            </FormControl>
            
            {formData.recipients.length > 0 && (
              <Box sx={{ mt: 1, mb: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  {t('reports.recipients')}:
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {formData.recipients.map((recipient, index) => (
                    <Chip
                      key={index}
                      label={recipient}
                      onDelete={() => handleRemoveRecipient(recipient)}
                      size="small"
                    />
                  ))}
                </Box>
              </Box>
            )}
            
            <TextField
              fullWidth
              label={t('reports.pdfTemplate')}
              value={formData.pdf_template}
              onChange={(e) => handleFormChange('pdf_template', e.target.value)}
              margin="normal"
            />
            
            <FormControlLabel
              control={
                <Switch
                  checked={formData.is_active}
                  onChange={(e) => handleFormChange('is_active', e.target.checked)}
                  color="primary"
                />
              }
              label={t('reports.activateSchedule')}
              sx={{ mt: 2, mb: 1 }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenScheduleDialog(false)} color="inherit">
            {t('common.cancel')}
          </Button>
          <Button 
            onClick={handleSaveSchedule} 
            color="primary"
            variant="contained"
          >
            {editingReport ? t('common.save') : t('common.create')}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Instant Report Dialog */}
      <Dialog 
        open={openInstantReportDialog} 
        onClose={handleCloseInstantReportDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {generatedReport ? t('reports.reportDetails') : t('reports.generateReport')}
        </DialogTitle>
        <DialogContent>
          {generatedReport ? (
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6" gutterBottom>
                {generatedReport.name}
              </Typography>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                {t('reports.generatedAt')}: {formatDate(generatedReport.generated_at)}
              </Typography>
              
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                  {t('reports.preview')}
                </Typography>
                <Paper sx={{ p: 2, mb: 2 }}>
                  <Typography variant="body2" paragraph>
                    {generatedReport.data.summary}
                  </Typography>
                  
                  <Typography variant="subtitle2" gutterBottom>
                    {t('reports.metrics')}:
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                    {generatedReport.data.metrics.map((metric, index) => (
                      <Box key={index} sx={{ minWidth: 120 }}>
                        <Typography variant="body2" color="textSecondary">
                          {metric.name}
                        </Typography>
                        <Typography variant="h6">
                          {metric.value}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </Paper>
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 2 }}>
                <Button 
                  variant="outlined" 
                  startIcon={<DownloadIcon />}
                  onClick={handleDownloadInstantReport}
                  disabled={!generatedReport}
                >
                  {t('reports.download')}
                </Button>
                <Button 
                  variant="contained" 
                  startIcon={<VisibilityIcon />}
                  onClick={handleViewInstantReport}
                  disabled={!generatedReport}
                >
                  {t('reports.viewReport')}
                </Button>
              </Box>
            </Box>
          ) : (
            <Box sx={{ mt: 2 }}>
              <FormControl fullWidth margin="normal">
                <InputLabel>{t('reports.type')}</InputLabel>
                <Select
                  value={instantReportParams.type}
                  onChange={(e) => handleInstantReportParamChange('type', e.target.value)}
                  label={t('reports.type')}
                >
                  <MenuItem value="sales">{t('reports.types.sales')}</MenuItem>
                  <MenuItem value="leads">{t('reports.types.leads')}</MenuItem>
                  <MenuItem value="activity">{t('reports.types.activity')}</MenuItem>
                </Select>
              </FormControl>
              
              <FormControl fullWidth margin="normal">
                <InputLabel>{t('reports.format')}</InputLabel>
                <Select
                  value={instantReportParams.format}
                  onChange={(e) => handleInstantReportParamChange('format', e.target.value)}
                  label={t('reports.format')}
                >
                  <MenuItem value="pdf">PDF</MenuItem>
                  <MenuItem value="csv">CSV</MenuItem>
                  <MenuItem value="html">HTML</MenuItem>
                </Select>
              </FormControl>
              
              <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                <TextField
                  fullWidth
                  label={t('reports.fromDate')}
                  type="date"
                  value={instantReportParams.dateRangeStart || ''}
                  onChange={(e) => handleInstantReportParamChange('dateRangeStart', e.target.value)}
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
                <TextField
                  fullWidth
                  label={t('reports.toDate')}
                  type="date"
                  value={instantReportParams.dateRangeEnd || ''}
                  onChange={(e) => handleInstantReportParamChange('dateRangeEnd', e.target.value)}
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                <Button 
                  variant="contained" 
                  color="primary"
                  startIcon={generatingReport ? <CircularProgress size={20} /> : null}
                  onClick={handleGenerateInstantReport}
                  disabled={generatingReport}
                >
                  {generatingReport ? t('reports.generating') : t('reports.generateReport')}
                </Button>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseInstantReportDialog} color="inherit">
            {generatedReport ? t('common.close') : t('common.cancel')}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Snackbar for notifications */}
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity} 
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ReportsPage;
