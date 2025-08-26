import React from 'react';
import { Box, Typography, Stack } from '@mui/material';
import NoteCard from './NoteCard';

const columns = ['TO DO', 'IN PROGRESS', 'COMPLETE'];

const statusStyles = {
  'TO DO': {
    headerBg: 'rgba(66, 165, 245, 0.1)',
    headerColor: '#1e88e5',
    columnBg: 'rgba(66, 165, 245, 0.05)',
  },
  'IN PROGRESS': {
    headerBg: 'rgba(126, 87, 194, 0.1)',
    headerColor: '#5e35b1',
    columnBg: 'rgba(126, 87, 194, 0.05)',
  },
  'COMPLETE': {
    headerBg: 'rgba(102, 187, 106, 0.1)',
    headerColor: '#388e3c',
    columnBg: 'rgba(102, 187, 106, 0.05)',
  },
};

const NoteHorizontalListView = ({ notes, onEditNote, onAddNote }) => {
  return (
    <Box sx={{ display: 'flex', gap: 2, overflowX: 'auto', p: 1 }}>
      {columns.map(status => (
        <Box
          key={status}
          sx={{
            flex: '1 1 300px',
            minWidth: 300,
            display: 'flex',
            flexDirection: 'column',
            bgcolor: statusStyles[status].columnBg,
            borderRadius: '12px',
            transition: 'background-color 0.2s ease',
          }}
        >
          <Typography
            variant="h6"
            sx={{
              p: 1.5,
              mb: 2,
              fontWeight: 600,
              textAlign: 'center',
              color: statusStyles[status].headerColor,
              backgroundColor: statusStyles[status].headerBg,
              borderTopLeftRadius: '12px',
              borderTopRightRadius: '12px',
              borderBottom: '1px solid',
              borderColor: 'divider',
            }}
          >
            {status}
          </Typography>
          <Stack spacing={1} sx={{ p: '0 16px 16px', minHeight: '200px', overflowY: 'auto' }}>
            {notes
              .filter(note => note.status === status)
              .map((note) => (
                <NoteCard key={note.id} note={note} onEdit={onEditNote} />
              ))}
          </Stack>
        </Box>
      ))}
    </Box>
  );
};

export default NoteHorizontalListView;
