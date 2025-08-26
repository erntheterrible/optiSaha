import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControlLabel,
  Switch,
  MenuItem,
  Grid
} from '@mui/material';
import { DesktopDateTimePicker } from '@mui/x-date-pickers/DesktopDateTimePicker';
import dayjs from 'dayjs';
import { useFormik } from 'formik';
import * as Yup from 'yup';

const eventTypes = [
  { id: 'meeting', label: 'Meeting' },
  { id: 'task', label: 'Task' },
  { id: 'reminder', label: 'Reminder' },
  { id: 'deadline', label: 'Deadline' },
  { id: 'event', label: 'Event' }
];

const statusOptions = [
  { id: 'planned', label: 'Planned' },
  { id: 'in_progress', label: 'In Progress' },
  { id: 'done', label: 'Done' }
];

export default function AddEventDialog({ open, onClose, onSave, defaultStart }) {
  const formik = useFormik({
    initialValues: {
      title: '',
      event_type: 'meeting',
      status: 'planned',
      all_day: false,
      start: defaultStart ? dayjs(defaultStart) : dayjs(),
      end: defaultStart ? dayjs(defaultStart) : null,
      location: '',
      project_id: '',
      customer_id: ''
    },
    validationSchema: Yup.object({
      title: Yup.string().required('Required'),
      start: Yup.date().required('Required'),
      end: Yup.date().nullable(),
      location: Yup.string().max(255)
    }),
    onSubmit: values => {
      const normalized = {
        ...values,
        start: dayjs(values.start).toDate(),
        end: values.end ? dayjs(values.end).toDate() : null,
      };
      onSave(normalized);
    }
  });

  const handleClose = () => {
    formik.resetForm();
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>Add Event</DialogTitle>
      <form onSubmit={formik.handleSubmit}>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                id="title"
                name="title"
                label="Title"
                value={formik.values.title}
                onChange={formik.handleChange}
                error={formik.touched.title && Boolean(formik.errors.title)}
                helperText={formik.touched.title && formik.errors.title}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                select
                fullWidth
                id="event_type"
                name="event_type"
                label="Type"
                value={formik.values.event_type}
                onChange={formik.handleChange}
              >
                {eventTypes.map(opt => (
                  <MenuItem key={opt.id} value={opt.id}>{opt.label}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={6}>
              <TextField
                select
                fullWidth
                id="status"
                name="status"
                label="Status"
                value={formik.values.status}
                onChange={formik.handleChange}
              >
                {statusOptions.map(opt => (
                  <MenuItem key={opt.id} value={opt.id}>{opt.label}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={<Switch
                  checked={formik.values.all_day}
                  onChange={e => formik.setFieldValue('all_day', e.target.checked)}
                />}
                label="All Day"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <DesktopDateTimePicker
                label="Start"
                value={formik.values.start}
                onChange={value => formik.setFieldValue('start', value)}
                renderInput={(params) => <TextField fullWidth {...params} />}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <DesktopDateTimePicker
                label="End"
                value={formik.values.end}
                onChange={value => formik.setFieldValue('end', value)}
                renderInput={(params) => <TextField fullWidth {...params} />}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                id="location"
                name="location"
                label="Location"
                value={formik.values.location}
                onChange={formik.handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                id="project_id"
                name="project_id"
                label="Project ID"
                value={formik.values.project_id}
                onChange={formik.handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                id="customer_id"
                name="customer_id"
                label="Customer ID"
                value={formik.values.customer_id}
                onChange={formik.handleChange}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button type="submit" variant="contained">Save</Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
