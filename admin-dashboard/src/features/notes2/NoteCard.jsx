import React from 'react';
import { Paper, Typography, Box } from '@mui/material';
import { Draggable } from '@hello-pangea/dnd';

const NoteCard = ({ note, index, onEdit }) => {
  return (
    <Draggable draggableId={note.id.toString()} index={index}>
      {(provided, snapshot) => (
        <Paper
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={() => onEdit(note)}
          sx={{
            p: 2,
            mb: 2,
            bgcolor: snapshot.isDragging ? 'grey.300' : 'background.paper',
            borderRadius: '8px',
            border: '1px solid',
            borderColor: 'rgba(0,0,0,0.1)',
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
            cursor: 'pointer',
            '&:hover': {
              bgcolor: 'action.hover',
              boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
            }
          }}
        >
          <Typography variant="h6" sx={{ mb: 1, fontWeight: 500 }}>{note.title}</Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontSize: '0.875rem' }}
          >
            {note.text}
          </Typography>
        </Paper>
      )}
    </Draggable>
  );
};

export default NoteCard;
