import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { DragDropContext, Droppable } from '@hello-pangea/dnd';
import NoteCard from './NoteCard';
import noteService from '../../services/noteService';

const columns = ['TO DO', 'IN PROGRESS', 'COMPLETE'];

const statusStyles = {
  'TO DO': {
    headerBg: '#e3f2fd', // Light Blue
    headerColor: '#1e88e5',
    columnBg: '#f5f5f5', // Lighter grey
  },
  'IN PROGRESS': {
    headerBg: '#ede7f6', // Light Purple
    headerColor: '#5e35b1',
    columnBg: '#f5f5f5',
  },
  'COMPLETE': {
    headerBg: '#e8f5e9', // Light Green
    headerColor: '#388e3c',
    columnBg: '#f5f5f5',
  },
};

const NoteKanbanView = ({ notes, onNoteUpdate, onEditNote }) => {

  const onDragEnd = async (result) => {
    const { source, destination, draggableId } = result;

    if (!destination) return;
    if (source.droppableId === destination.droppableId) return;

    const noteId = draggableId;
    const newStatus = destination.droppableId;
    const originalNote = notes.find(n => n.id.toString() === noteId);

    if (!originalNote) return;

    // Optimistic update
    onNoteUpdate({ ...originalNote, status: newStatus });

    try {
      await noteService.updateNote(draggableId, { status: destination.droppableId });
    } catch (error) {
      console.error('Failed to update note status:', error);
      // Revert the optimistic update on failure
      onNoteUpdate(originalNote);
    }
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Box sx={{ display: 'flex', gap: 2, overflowX: 'auto', p: 1 }}>
        {columns.map(status => (
          <Droppable key={status} droppableId={status}>
            {(provided, snapshot) => (
              <Box
                ref={provided.innerRef}
                {...provided.droppableProps}
                sx={{
                  flex: '1 1 300px',
                  minWidth: 300,
                  display: 'flex',
                  flexDirection: 'column',
                  bgcolor: snapshot.isDraggingOver ? 'rgba(0,0,0,0.05)' : statusStyles[status].columnBg,
                  borderRadius: '12px',
                  transition: 'background-color 0.2s ease',
                }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    p: 1.5,
                    mb: 2,
                    fontWeight: 700,
                    fontSize: '1.1rem',
                    textAlign: 'center',
                    textTransform: 'uppercase',
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
                <Box sx={{ p: '0 16px 16px', minHeight: '200px', overflowY: 'auto' }}>
                  {notes
                    .filter(note => note.status === status)
                    .map((note, index) => (
                      <NoteCard key={note.id} note={note} index={index} onEdit={onEditNote} />
                    ))}
                  {provided.placeholder}
                </Box>
              </Box>
            )}
          </Droppable>
        ))}
      </Box>
    </DragDropContext>
  );
};

export default NoteKanbanView;
