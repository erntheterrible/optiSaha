import React, { useEffect, useState, useMemo } from 'react';
import { Box, Typography, CircularProgress, Stack, ToggleButton, ToggleButtonGroup } from '@mui/material';
import ViewKanbanIcon from '@mui/icons-material/ViewKanban';
import ViewListIcon from '@mui/icons-material/ViewList';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import NoteList, { drawerWidth } from './NoteList';
import NoteKanbanView from './NoteKanbanView';
import NoteTableView from './NoteTableView';
import NoteListView from './NoteListView';
import NoteHorizontalListView from './NoteHorizontalListView';
import NoteDialog from './NoteDialog';
import noteService from '../../services/noteService';

const NotesPage = () => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('kanban'); // 'kanban', 'table', or 'list'
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'TO DO', 'IN PROGRESS', 'COMPLETE'
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingNote, setEditingNote] = useState(null);

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const list = await noteService.getNotes();
        setNotes(list);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchNotes();
  }, []);

  const handleViewChange = (event, newView) => {
    if (newView !== null) {
      setView(newView);
    }
  };

  const handleFilterChange = (newFilter) => {
    if (newFilter !== null) {
      setStatusFilter(newFilter);
    }
  };

  const handleNoteUpdate = (updatedNote) => {
    setNotes(prevNotes => 
      prevNotes.map(note => 
        note.id === updatedNote.id ? updatedNote : note
      )
    );
  };

  const handleAddClick = () => {
    setEditingNote(null);
    setDialogOpen(true);
  };

  const handleEditClick = (note) => {
    setEditingNote(note);
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setEditingNote(null);
  };

  const handleSaveNote = async (values) => {
    try {
      if (editingNote) {
        const updatedNote = await noteService.updateNote(editingNote.id, values);
        setNotes(prev => prev.map(n => (n.id === updatedNote.id ? updatedNote : n)));
      } else {
        const newNote = await noteService.createNote(values);
        setNotes(prev => [newNote, ...prev]);
      }
    } catch (error) {
      console.error('Failed to save note:', error);
    }
  };

  const filteredNotes = useMemo(() => {
    if (statusFilter === 'all') return notes;
    return notes.filter(note => note.status === statusFilter);
  }, [notes, statusFilter]);

  if (loading) return <CircularProgress sx={{ mt: 4, ml: 4 }} />;

  return (
    <Box sx={{ display: 'flex', p: 2, height: 'calc(100vh - 64px)' }}>
      {/* Sidebar */}
      <NoteList 
        notes={filteredNotes} 
        onAdd={handleAddClick} 
        statusFilter={statusFilter} 
        onFilterChange={handleFilterChange} 
      />

      {/* Main Content */}
      <Box
        sx={{
          flexGrow: 1,
          width: `calc(100% - ${drawerWidth}px)`,
          display: 'flex',
          flexDirection: 'column',
          p: 2,
        }}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Typography variant="h4">Notes</Typography>
          <ToggleButtonGroup
            value={view}
            exclusive
            onChange={handleViewChange}
            aria-label="view mode"
          >
            <ToggleButton value="kanban" aria-label="kanban view">
              <ViewKanbanIcon />
            </ToggleButton>
            <ToggleButton value="table" aria-label="table view">
              <ViewListIcon />
            </ToggleButton>
            <ToggleButton value="list" aria-label="list view">
              <ViewModuleIcon />
            </ToggleButton>
            <ToggleButton value="horizontal-list" aria-label="horizontal list view">
              <ViewListIcon /> {/* Using ViewListIcon for now, can change later */}
            </ToggleButton>
          </ToggleButtonGroup>
        </Stack>

        {view === 'kanban' && <NoteKanbanView notes={filteredNotes} onNoteUpdate={handleNoteUpdate} onEditNote={handleEditClick} />}
        {view === 'table' && <NoteTableView notes={filteredNotes} onEditNote={handleEditClick} />}
        {view === 'list' && <NoteListView notes={filteredNotes} onEditNote={handleEditClick} onAddNote={handleAddClick} />}
        {view === 'horizontal-list' && <NoteHorizontalListView notes={filteredNotes} onEditNote={handleEditClick} onAddNote={handleAddClick} />}
      </Box>

      <NoteDialog 
        open={dialogOpen}
        onClose={handleDialogClose}
        onSave={handleSaveNote}
        note={editingNote}
      />
    </Box>
  );
};

export default NotesPage;
