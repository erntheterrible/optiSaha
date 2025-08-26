import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Box, 
  Typography, 
  Button, 
  Container,
  IconButton,
  CircularProgress,
  Alert,
  Snackbar
} from '@mui/material';
import { 
  Add as AddIcon, 
  FilterList as FilterIcon
} from '@mui/icons-material';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import databaseService from '../../services/databaseService';

// Event type configurations
const eventTypes = [
  { id: 'meeting', label: 'Meeting', color: '#3f51b5' },
  { id: 'task', label: 'Task', color: '#4caf50' },
  { id: 'reminder', label: 'Reminder', color: '#ff9800' },
  { id: 'deadline', label: 'Deadline', color: '#f44336' },
  { id: 'event', label: 'Event', color: '#9c27b0' }
];

const CalendarPage = () => {
  const { t } = useTranslation();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({ 
    open: false, 
    message: '', 
    severity: 'success' 
  });
  const calendarRef = useRef(null);

  // Fetch events from Supabase
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const data = await databaseService.getEvents();
        setEvents(data);
      } catch (err) {
        console.error('Error fetching events:', err);
        setError(t('calendar.errors.fetchFailed'));
        showSnackbar(t('calendar.errors.fetchFailed'), 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [t]);

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({
      open: true,
      message,
      severity
    });
  };

  const handleEventClick = (clickInfo) => {
    // Handle event click
    console.log('Event clicked:', clickInfo.event);
  };

  const handleDateClick = (arg) => {
    // Handle date click (for creating new events)
    console.log('Date clicked:', arg.dateStr);
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  // Loading state
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  // Error state
  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  // Main render
  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" component="h1">
          {t('calendar.title')}
        </Typography>
        <Box>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => {
              // Open new event dialog
              console.log('Add new event');
            }}
            sx={{ mr: 2 }}
          >
            {t('calendar.newEvent')}
          </Button>
          <Button
            variant="outlined"
            startIcon={<FilterIcon />}
            onClick={() => {
              // Open filter dialog
              console.log('Open filters');
            }}
          >
            {t('common.filters')}
          </Button>
        </Box>
      </Box>

      <Box sx={{ height: 'calc(100vh - 200px)' }}>
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
          }}
          events={events}
          eventClick={handleEventClick}
          dateClick={handleDateClick}
          editable={true}
          selectable={true}
          selectMirror={true}
          dayMaxEvents={true}
          locale={t('calendar.locale')}
          buttonText={{
            today: t('calendar.today'),
            month: t('calendar.month'),
            week: t('calendar.week'),
            day: t('calendar.day'),
            list: t('calendar.list')
          }}
          eventTimeFormat={{
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
          }}
        />
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default CalendarPage;
