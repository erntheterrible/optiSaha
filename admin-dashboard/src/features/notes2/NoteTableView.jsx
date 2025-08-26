import React from 'react';
import { Box, IconButton, Chip } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import EditIcon from '@mui/icons-material/Edit';
import FlagOutlinedIcon from '@mui/icons-material/FlagOutlined';
import { format } from 'date-fns';

const statusOptions = {
  'TO DO': { label: 'To Do', color: '#2196f3', bgcolor: '#e3f2fd' }, // Blue
  'IN PROGRESS': { label: 'In Progress', color: '#ff9800', bgcolor: '#fff3e0' }, // Orange
  'COMPLETE': { label: 'Complete', color: '#4caf50', bgcolor: '#e8f5e9' }, // Green
};

const priorityOptions = {
  'Low': { label: 'Low', color: '#4caf50', bgcolor: '#e8f5e9' }, // Green
  'Medium': { label: 'Medium', color: '#ff9800', bgcolor: '#fff3e0' }, // Orange
  'High': { label: 'High', color: '#f44336', bgcolor: '#ffebee' }, // Red
};

const NoteTableView = ({ notes, onEditNote }) => {
  const columns = [
    { field: 'title', headerName: 'Title', flex: 1, minWidth: 250 },
    {
      field: 'status',
      headerName: 'Status',
      width: 150,
      renderCell: (params) => {
        const status = statusOptions[params.value];
        return status ? <Chip label={status.label} sx={{ bgcolor: status.bgcolor, color: status.color, fontWeight: 600 }} size="small" /> : null;
      },
    },
    {
      field: 'priority',
      headerName: 'Priority',
      width: 120,
      renderCell: (params) => {
        const priority = priorityOptions[params.value];
        return priority ? (
          <Chip
            icon={<FlagOutlinedIcon />}
            label={priority.label}
            sx={{ bgcolor: priority.bgcolor, color: priority.color, fontWeight: 600 }}
            size="small"
          />
        ) : null;
      },
    },
    {
      field: 'due_date',
      headerName: 'Due Date',
      width: 150,
      valueGetter: ({ value }) => value && format(new Date(value), 'MMM dd, yyyy'),
    },
    {
      field: 'created_at',
      headerName: 'Created',
      width: 150,
      valueGetter: ({ value }) => value && format(new Date(value), 'MMM dd, yyyy'),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 100,
      sortable: false,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <IconButton size="small" onClick={() => onEditNote(params.row)}>
          <EditIcon fontSize="small" />
        </IconButton>
      ),
    },
  ];

  return (
    <Box sx={{ height: 'calc(100vh - 200px)', width: '100%', p: 2 }}>
      <DataGrid
        rows={notes}
        columns={columns}
        pageSize={10}
        rowsPerPageOptions={[5, 10, 20]}
        disableSelectionOnClick
        density="comfortable"
        sx={{
          border: '1px solid #e0e0e0',
          borderRadius: '8px',
          '& .MuiDataGrid-columnHeaders': {
            backgroundColor: '#f5f5f5',
            fontWeight: '600',
            fontSize: '0.9rem',
            color: '#555',
            borderBottom: '1px solid #e0e0e0',
          },
          '& .MuiDataGrid-columnHeaderTitle': {
            fontWeight: '600',
          },
          '& .MuiDataGrid-row': {
            '&:nth-of-type(odd)': {
              backgroundColor: '#fafafa',
            },
            '&:hover': {
              backgroundColor: '#e0f2f7', // Light blue on hover
            },
            borderBottom: '1px solid #f0f0f0',
          },
          '& .MuiDataGrid-cell': {
            borderBottom: 'none',
          },
          '& .MuiDataGrid-footerContainer': {
            borderTop: '1px solid #e0e0e0',
            backgroundColor: '#f5f5f5',
            borderRadius: '0 0 8px 8px',
          },
        }}
      />
    </Box>
  );
};

export default NoteTableView;
