import React from 'react';
import {
  Box, Typography, Paper, IconButton, Chip, Stack, Button
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import FlagOutlinedIcon from '@mui/icons-material/FlagOutlined';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { format } from 'date-fns';

const statusStyles = {
  'TO DO': { headerBg: 'rgba(66, 165, 245, 0.1)', headerColor: '#1e88e5' },
  'IN PROGRESS': { headerBg: 'rgba(126, 87, 194, 0.1)', headerColor: '#5e35b1' },
  'COMPLETE': { headerBg: 'rgba(102, 187, 106, 0.1)', headerColor: '#388e3c' },
};

const priorityOptions = {
  'Low': { color: 'success.main' },
  'Medium': { color: 'warning.main' },
  'High': { color: 'error.main' },
};

const NoteCard = ({ note, onEdit }) => (
  <Paper
    onClick={() => onEdit(note)}
    sx={{
      p: 2.5,
      mb: 2,
      cursor: 'pointer',
      bgcolor: 'background.paper',
      borderRadius: '12px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
      border: '1px solid',
      borderColor: 'rgba(0,0,0,0.08)',
      transition: 'all 0.2s ease-in-out',
      '&:hover': {
        boxShadow: '0 6px 16px rgba(0,0,0,0.1)',
        transform: 'translateY(-2px)',
      },
    }}
  >
    <Typography variant="h6" sx={{ mb: 1, fontWeight: 500 }}>{note.title}</Typography>
    <Typography
      variant="body2"
      color="text.secondary"
      sx={{ mb: 2, whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontSize: '0.875rem', maxHeight: 60, overflow: 'hidden' }}
    >
      {note.text}
    </Typography>
    <Stack direction="row" spacing={2} alignItems="center" sx={{ color: 'text.secondary' }}>
      {note.priority && (
        <Chip
          icon={<FlagOutlinedIcon style={{ color: priorityOptions[note.priority]?.color }} />}
          label={note.priority}
          variant="outlined"
          size="small"
          sx={{ borderColor: priorityOptions[note.priority]?.color, color: priorityOptions[note.priority]?.color }}
        />
      )}
      {note.due_date && (
        <Stack direction="row" spacing={0.5} alignItems="center">
          <CalendarTodayIcon sx={{ fontSize: '1rem' }} />
          <Typography variant="body2">{format(new Date(note.due_date), 'MMM dd')}</Typography>
        </Stack>
      )}
    </Stack>
  </Paper>
);

const NoteListView = ({ notes, onEditNote, onAddNote }) => {
  const groupedNotes = notes.reduce((acc, note) => {
    const { status } = note;
    if (!acc[status]) acc[status] = [];
    acc[status].push(note);
    return acc;
  }, {});

  return (
    <Box sx={{ p: 2, maxWidth: 768 }}>
      {Object.entries(groupedNotes).map(([status, notesInGroup]) => (
        <Box key={status} sx={{ mb: 4 }}>
          <Stack direction="row" alignItems="center" sx={{ mb: 2 }}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                color: statusStyles[status].headerColor,
                backgroundColor: statusStyles[status].headerBg,
                px: 1.5,
                py: 0.5,
                borderRadius: 1.5,
              }}
            >
              {status}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ ml: 1.5 }}>{notesInGroup.length} Tasks</Typography>
            <Box sx={{ flexGrow: 1 }} />
            <IconButton size="small"><MoreHorizIcon /></IconButton>
            <IconButton size="small" onClick={() => onAddNote(status)}><AddIcon /></IconButton>
          </Stack>

          {notesInGroup.map(note => (
            <NoteCard key={note.id} note={note} onEdit={onEditNote} />
          ))}
          <Button startIcon={<AddIcon />} sx={{ mt: 1, color: 'text.secondary', textTransform: 'none' }}>
            Add Task
          </Button>
        </Box>
      ))}
    </Box>
  );
};

export default NoteListView;
