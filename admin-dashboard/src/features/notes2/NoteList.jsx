import React from 'react';
import {
  Drawer,
  List,
  ListItemButton,
  ListItemText,
  Typography,
  Box,
  Button,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

export const drawerWidth = 280;

/**
 * Sidebar showing list of notes
 */
const NoteList = ({ notes = [], onAdd, statusFilter, onFilterChange }) => {
  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          position: 'relative',
          overflowY: 'hidden' // Remove scrollbar
        },
      }}
    >
      <Box sx={{ 
        width: drawerWidth, 
        bgcolor: 'background.paper',
        display: 'flex',
        flexDirection: 'column',
        height: '100%'
      }}>
        <Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider', bgcolor: 'background.paper' }}>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 3, textAlign: 'center', color: 'text.primary', letterSpacing: '0.02em' }}>
            Notes
          </Typography>
          <Button
            variant="contained"
            onClick={onAdd}
            fullWidth
            startIcon={<AddIcon />}
            sx={{ 
              mt: 1, 
              textTransform: 'none', 
              fontWeight: 600, 
              py: 1.5,
              bgcolor: 'primary.main',
              '&:hover': {
                bgcolor: 'primary.dark'
              }
            }}
          >
            Add Note
          </Button>
        </Box>

        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Typography variant="overline" color="text.secondary">Status</Typography>
          <ToggleButtonGroup
            orientation="vertical"
            value={statusFilter}
            exclusive
            onChange={(e, newFilter) => onFilterChange(newFilter)}
            fullWidth
            size="small"
            sx={{ mt: 1 }}
          >
            <ToggleButton value="all">All</ToggleButton>
            <ToggleButton value="TO DO">To Do</ToggleButton>
            <ToggleButton value="IN PROGRESS">In Progress</ToggleButton>
            <ToggleButton value="COMPLETE">Complete</ToggleButton>
          </ToggleButtonGroup>
        </Box>

        <List 
          dense 
          disablePadding 
          sx={{
            flexGrow: 1,
            overflowY: 'auto',
            p: 1
          }}
        >
          {notes.map((note) => (
            <ListItemButton
              key={note.id}
              // onClick={() => onSelect(note.id)} // No longer selecting notes from the list
              sx={{ borderRadius: 1, mb: 0.5 }}
            >
              <ListItemText
                primary={note.title || 'Untitled'}
                secondary={note.status}
                primaryTypographyProps={{ noWrap: true, fontWeight: 500 }}
                secondaryTypographyProps={{ noWrap: true, variant: 'body2' }}
                sx={{ my: 0 }}
              />
            </ListItemButton>
          ))}
        </List>
      </Box>
    </Drawer>
  );
};

export default NoteList;
