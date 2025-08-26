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
import MeetingBriefingModal from '../../components/MeetingBriefingModal';
import AddEventDialog from '../../components/AddEventDialog';
import aiService from '../../services/aiService';
import { getEventById as fetchEventById } from '../../services/calendarService';
import { customerService } from '../../services/supabaseService';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import databaseService from '../../services/databaseService';
import './CalendarStyles.css';

// Event type configurations
const eventTypes = [
  { id: 'meeting', label: 'Meeting', color: '#3f51b5' },
  { id: 'task', label: 'Task', color: '#4caf50' },
  { id: 'reminder', label: 'Reminder', color: '#ff9800' },
  { id: 'deadline', label: 'Deadline', color: '#f44336' },
  { id: 'event', label: 'Event', color: '#9c27b0' }
];

const CalendarPage = () => {
  const { t, i18n } = useTranslation();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({ 
    open: false, 
    message: '', 
    severity: 'success' 
  });
  const calendarRef = useRef(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogStart, setDialogStart] = useState(null);
  const [briefingOpen, setBriefingOpen] = useState(false);
  const [briefingSummary, setBriefingSummary] = useState('');
  const [briefingLoading, setBriefingLoading] = useState(false);

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

  const handleEventClick = async (clickInfo) => {
    try {
      setBriefingOpen(true);
      setBriefingLoading(true);
      const eventId = clickInfo.event.id;
      // Fetch full event details & related customer
      const eventData = await fetchEventById(eventId);
      let customerData = null;
      const isUUID = (v) => /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/.test(v);
      if (eventData?.customer_id && isUUID(eventData.customer_id)) {
        customerData = await customerService.getCustomerById(eventData.customer_id);
      }
      const response = await aiService.generateMeetingBriefing(eventData, customerData);
      setBriefingSummary(response.summary || 'No summary generated.');
    } catch (err) {
      console.error('AI briefing failed:', err);
      setBriefingSummary('Failed to generate briefing.');
    } finally {
      setBriefingLoading(false);
    }
  };

  const addNewEvent = async (form) => {
    console.log('--- Step 1: Form data received ---', form);

    const eventToSave = {
      title: form.title,
      description: form.title,
      start: (() => {
        const d = form.start instanceof Date ? form.start : new Date(form.start);
        return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString();
      })(),
      end: (() => {
        if (!form.end) return null;
        const d = form.end instanceof Date ? form.end : new Date(form.end);
        return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString();
      })(),
      location: form.location || null,
      created_by: form.createdBy || null, // Ensure key matches DB column
      event_type: form.event_type,
      status: form.status,
      all_day: form.all_day,
      project_id: form.project_id || null,
      customer_id: form.customer_id || null,
    };

    console.log('--- Step 2: Object being sent to database ---', eventToSave);

    try {
      const newEventFromDb = await databaseService.createEvent(eventToSave);
      console.log('--- Step 3: Event object received from database ---', newEventFromDb);
      setEvents(prevEvents => [...prevEvents, newEventFromDb]);
      showSnackbar(t('calendar.eventForm.save'), 'success');
    } catch (error) {
      console.error('Failed to create event:', error);
      showSnackbar(t('calendar.eventForm.error'), 'error');
    } finally {
      setDialogOpen(false);
    }
  };

  const handleDateClick = (arg) => {
    setDialogStart(arg.date);
    setDialogOpen(true);
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
      <Box m={2} className="calendar-container">
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
              setDialogStart(new Date());
              setDialogOpen(true);
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
          locale={i18n.language}
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

      <AddEventDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        defaultStart={dialogStart}
        onSave={async (values) => {
          try {
            await addNewEvent(values);
            setDialogOpen(false);
          } catch (e) {}
        }}
      />

      <MeetingBriefingModal 
        open={briefingOpen} 
        onClose={() => setBriefingOpen(false)} 
        summary={briefingSummary}
        loading={briefingLoading}
      />

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
