import React from 'react';
import {
  Dialog, DialogContent, Button, TextField, Select, MenuItem, FormControl,
  Box, Typography, IconButton, Chip, Stack, Grid, DialogTitle, Autocomplete
} from '@mui/material';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import FlagOutlinedIcon from '@mui/icons-material/FlagOutlined';
import LocalOfferOutlinedIcon from '@mui/icons-material/LocalOfferOutlined';

const statusOptions = {
  'TO DO': { label: 'To Do', color: 'info.main' },
  'IN PROGRESS': { label: 'In Progress', color: 'warning.main' },
  'COMPLETE': { label: 'Complete', color: 'success.main' },
};

const priorityOptions = {
  'Low': { label: 'Low', color: 'success.main' },
  'Medium': { label: 'Medium', color: 'warning.main' },
  'High': { label: 'High', color: 'error.main' },
};

const NoteDialog = ({ open, onClose, onSave, note }) => {
  const isEditing = !!note;

  const formik = useFormik({
    initialValues: {
      title: note?.title || '',
      text: note?.text || '',
      status: note?.status || 'TO DO',
      tags: note?.tags || [],
      priority: note?.priority || 'Medium',
      due_date: note?.due_date ? new Date(note.due_date) : null,
      assignee: note?.assignee || '',
    },
    validationSchema: Yup.object({
      title: Yup.string().max(255).required('Task Name is required'),
      text: Yup.string(),
      status: Yup.string().oneOf(Object.keys(statusOptions)).required('Status is required'),
      tags: Yup.array().of(Yup.string()),
    }),
    onSubmit: (values) => {
      onSave(values);
      onClose();
    },
    enableReinitialize: true,
  });

  const renderField = (icon, label, control) => (
    <Box>
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
        {icon}
        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>{label}</Typography>
      </Stack>
      {control}
    </Box>
  );

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', overflow: 'visible' } }}>
      <DialogTitle sx={{ p: 2.5, pb: 1.5, borderBottom: '1px solid #eee' }}>
        <Typography variant="h5" component="div" sx={{ fontWeight: 700, color: '#333' }}>
          {formik.values.title || 'New Task'}
        </Typography>
        <IconButton onClick={onClose} sx={{ position: 'absolute', right: 16, top: 16, color: 'grey.600' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ p: 2.5, pt: 2 }}>
        <form onSubmit={formik.handleSubmit}>
          <Stack spacing={2.5}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Task Name"
              name="title"
              value={formik.values.title}
              onChange={formik.handleChange}
              error={formik.touched.title && Boolean(formik.errors.title)}
              helperText={formik.touched.title && formik.errors.title}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
            />
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Add a more detailed description..."
              name="text"
              multiline
              rows={3}
              value={formik.values.text}
              onChange={formik.handleChange}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
            />

            <Grid container spacing={2.5}>
              <Grid item xs={12} sm={6}>
                {renderField(
                  <CheckCircleOutlineIcon fontSize="small" sx={{ color: 'text.secondary' }} />,
                  'Status',
                  <FormControl fullWidth size="small">
                    <Select name="status" value={formik.values.status} onChange={formik.handleChange} sx={{ borderRadius: '8px' }}>
                      {Object.entries(statusOptions).map(([key, { label, color }]) => (
                        <MenuItem key={key} value={key}>
                          <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: color, mr: 1.5 }} />
                          {label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              </Grid>
              <Grid item xs={12} sm={6}>
                {renderField(
                  <PersonOutlineIcon fontSize="small" sx={{ color: 'text.secondary' }} />,
                  'Assignee',
                  <TextField fullWidth size="small" name="assignee" value={formik.values.assignee} onChange={formik.handleChange} placeholder="Enter assignee" sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }} />
                )}
              </Grid>
              <Grid item xs={12} sm={6}>
                {renderField(
                  <CalendarTodayIcon fontSize="small" sx={{ color: 'text.secondary' }} />,
                  'Due Date',
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker
                      value={formik.values.due_date}
                      onChange={(date) => formik.setFieldValue('due_date', date)}
                      renderInput={(params) => <TextField {...params} fullWidth size="small" sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }} />}
                    />
                  </LocalizationProvider>
                )}
              </Grid>
              <Grid item xs={12} sm={6}>
                {renderField(
                  <FlagOutlinedIcon fontSize="small" sx={{ color: 'text.secondary' }} />,
                  'Priority',
                  <FormControl fullWidth size="small">
                    <Select name="priority" value={formik.values.priority} onChange={formik.handleChange} sx={{ borderRadius: '8px' }}>
                      {Object.entries(priorityOptions).map(([key, { label, color }]) => (
                        <MenuItem key={key} value={key}>
                          <FlagOutlinedIcon fontSize="small" sx={{ color, mr: 1.5 }} />
                          {label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              </Grid>
              <Grid item xs={12}>
                {renderField(
                  <LocalOfferOutlinedIcon fontSize="small" sx={{ color: 'text.secondary' }} />,
                  'Tags',
                  <Autocomplete
                    multiple
                    freeSolo
                    options={[]}
                    value={formik.values.tags}
                    onChange={(event, newValue) => {
                      formik.setFieldValue('tags', newValue);
                    }}
                    renderTags={(value, getTagProps) =>
                      value.map((option, index) => (
                        <Chip label={option} {...getTagProps({ index })} sx={{ borderRadius: '8px' }} />
                      ))
                    }
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        variant="outlined"
                        size="small"
                        placeholder="Add tags"
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
                      />
                    )}
                  />
                )}
              </Grid>
            </Grid>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', pt: 2 }}>
              <Button onClick={onClose} variant="text" sx={{ mr: 1.5, color: 'text.secondary', borderRadius: '8px', '&:hover': { bgcolor: 'action.hover' } }}>Cancel</Button>
              <Button
                type="submit"
                variant="contained"
                disableElevation
                sx={{
                  borderRadius: '8px',
                  px: 3,
                  background: 'linear-gradient(90deg, #1e88e5 30%, #2196f3 90%)', // More vibrant blue gradient
                  '&:hover': {
                    background: 'linear-gradient(90deg, #1565c0 30%, #1976d2 90%)', // Darker on hover
                  },
                }}
              >
                {isEditing ? 'Save Changes' : 'Create Task'}
              </Button>
            </Box>
          </Stack>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default NoteDialog;
