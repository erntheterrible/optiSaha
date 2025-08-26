import React, { useState, useEffect } from 'react';
import { Snackbar, Alert, 
  Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, FormControl, InputLabel, Select, MenuItem, Grid
} from '@mui/material';
import * as XLSX from 'xlsx';
import databaseService from '../../services/databaseService';

const LeadImportDialog = ({ open, onClose }) => {
  const [file, setFile] = useState(null);
  const [data, setData] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [mappedHeaders, setMappedHeaders] = useState({});

  const leadFields = [
    { id: 'name', label: 'Name' },
    { id: 'email', label: 'Email' },
    { id: 'phone', label: 'Phone' },
    { id: 'company', label: 'Company' },
    { id: 'status', label: 'Status' },
    { id: 'contactPersonName', label: 'Contact Person Name' },
    { id: 'address', label: 'Address' },
    { id: 'region', label: 'Region' },
    { id: 'industry', label: 'Industry' },
    { id: 'estimatedValue', label: 'Estimated Value' },
    { id: 'website', label: 'Website' },
    { id: 'notes', label: 'Notes' },
    { id: 'tags', label: 'Tags' },
  ];

  useEffect(() => {
    if (!open) {
      setFile(null);
      setData([]);
      setHeaders([]);
      setMappedHeaders({});
    }
  }, [open]);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    setFile(selectedFile);
    if (selectedFile) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const binaryStr = e.target.result;
        const workbook = XLSX.read(binaryStr, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        if (json.length > 0) {
          const fileHeaders = json[0];
          setHeaders(fileHeaders);
          setData(json.slice(1));

          // Initialize mapped headers with direct matches
          const initialMapping = {};
          fileHeaders.forEach(header => {
            const matchingField = leadFields.find(field => field.label.toLowerCase() === header.toLowerCase());
            if (matchingField) {
              initialMapping[header] = matchingField.id;
            }
          });
          setMappedHeaders(initialMapping);
        }
      };
      reader.readAsBinaryString(selectedFile);
    }
  };

  const handleMappingChange = (fileHeader, leadFieldId) => {
    setMappedHeaders(prev => ({ ...prev, [fileHeader]: leadFieldId }));
  };

  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const handleImport = async () => {
    setLoading(true);
    try {
      const leadsToImport = data.map(row => {
        const newLead = {};
        headers.forEach((header, index) => {
          const mappedField = mappedHeaders[header];
          if (mappedField) {
            newLead[mappedField] = row[index];
          }
        });
        return newLead;
      }).filter(lead => Object.keys(lead).length > 0); // Filter out empty objects

      if (leadsToImport.length > 0) {
        await databaseService.importLeads(leadsToImport);
        setSnackbar({ open: true, message: `Successfully imported ${leadsToImport.length} leads!`, severity: 'success' });
        onClose();
      } else {
        setSnackbar({ open: true, message: 'No valid leads to import after mapping.', severity: 'warning' });
      }
    } catch (error) {
      console.error('Error importing leads:', error);
      setSnackbar({ open: true, message: `Error importing leads: ${error.message}`, severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="lg">
      <DialogTitle>Import Leads</DialogTitle>
      <DialogContent>
        <Typography variant="body1" sx={{ mb: 2 }}>
          Upload a CSV or Excel file to import leads. You can download a template file here.
        </Typography>
        <Box sx={{ border: '2px dashed #ccc', padding: '20px', textAlign: 'center', mb: 2 }}>
          <input type="file" accept=".csv, .xlsx" onChange={handleFileChange} />
          {file && <Typography variant="body2" sx={{ mt: 2 }}>Selected file: {file.name}</Typography>}
        </Box>

        {headers.length > 0 && (
          <Box>
            <Typography variant="h6" sx={{ mb: 2 }}>Column Mapping</Typography>
            <Grid container spacing={2} sx={{ mb: 2 }}>
              {headers.map((header, index) => (
                <Grid item xs={6} sm={4} md={3} key={index}>
                  <FormControl fullWidth>
                    <InputLabel>{header}</InputLabel>
                    <Select
                      value={mappedHeaders[header] || ''}
                      label={header}
                      onChange={(e) => handleMappingChange(header, e.target.value)}
                    >
                      <MenuItem value=""><em>Do not import</em></MenuItem>
                      {leadFields.map(field => (
                        <MenuItem key={field.id} value={field.id}>{field.label}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              ))}
            </Grid>

            <Typography variant="h6" sx={{ mb: 2 }}>Data Preview (First 5 Rows)</Typography>
            <TableContainer component={Paper}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    {headers.map((header, index) => (
                      <TableCell key={index}>{header}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.slice(0, 5).map((row, rowIndex) => (
                    <TableRow key={rowIndex}>
                      {row.map((cell, cellIndex) => (
                        <TableCell key={cellIndex}>{String(cell)}</TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleImport} disabled={!file || headers.length === 0 || loading} variant="contained">{loading ? 'Importing...' : 'Import'}</Button>
      </DialogActions>
      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleSnackbarClose}>
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Dialog>
  );
};

export default LeadImportDialog;
