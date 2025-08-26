import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useSupabase } from '../../contexts/SupabaseContext';
import { supabase } from '../../lib/supabaseClient';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  IconButton,
  Chip,
  Avatar,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  FormControlLabel,
  Checkbox,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Tooltip,
  LinearProgress,
  Snackbar,
  Alert
} from '@mui/material';
import noteService from '../../services/noteService';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  Work as ProjectIcon,
  Label as LabelIcon,
  Mic as MicIcon,
  AttachFile as AttachFileIcon,
  Image as ImageIcon,
  Close as CloseIcon,
  Check as CheckIcon,
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  Stop as StopIcon
} from '@mui/icons-material';
import VoiceRecorder from '../../components/VoiceRecorder';

import useProjects from '../../hooks/useProjects';

// Note Dialog Component
const NoteDialog = ({ open, onClose, onSave, note, projects }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    customerId: '',
    projectId: '',
    tags: [],
    attachments: [],
    hasVoiceNote: false,
  });
  
  const [isRecording, setIsRecording] = useState(false);
  const fileInputRef = useRef(null);
  const [errors, setErrors] = useState({});
  
  // Initialize form data when note prop changes
  useEffect(() => {
    if (note) {
      setFormData({
        title: note.title || '',
        content: note.content || '',
        category: note.category || '',
        projectId: note.projectId || null,
        leadId: note.leadId || null,
        tags: note.tags || [],
        attachments: note.attachments || [],
        isPrivate: note.isPrivate || false
      });
    } else {
      setFormData({
        title: '',
        content: '',
        category: '',
        projectId: null,
        leadId: null,
        tags: [],
        attachments: [],
      });
    }
    setErrors({});
  }, [note]);
  
  // Handle form input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    
    // Extract tags from content
    if (name === 'content') {
      const tags = value.match(/#(\w+)/g)?.map(tag => tag.substring(1)) || [];
      setFormData(prev => ({
        ...prev,
        tags,
        content: value
      }));
    }
  };
  
  // Handle file upload
  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    const newAttachments = files.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      type: file.type.startsWith('image/') ? 'image' : 'file',
      file
    }));
    
    setFormData(prev => ({
      ...prev,
      attachments: [...prev.attachments, ...newAttachments]
    }));
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  // Handle remove attachment
  const handleRemoveAttachment = (id) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter(a => a.id !== id)
    }));
  };
  
  // Handle voice note recording complete
  const handleVoiceNoteRecorded = (audioBlob) => {
    // In a real app, you would upload the blob to your server and get a URL
    const audioUrl = URL.createObjectURL(audioBlob);
    setFormData(prev => ({
      ...prev,
      voiceNoteUrl: audioUrl,
      hasVoiceNote: true
    }));
  };
  
  // Handle voice note delete
  const handleVoiceNoteDelete = () => {
    if (formData.voiceNoteUrl) {
      URL.revokeObjectURL(formData.voiceNoteUrl);
    }
    setFormData(prev => ({
      ...prev,
      voiceNoteUrl: null,
      hasVoiceNote: false
    }));
  };
  
  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = t('common.requiredField');
    }
    
    if (!formData.content.trim()) {
      newErrors.content = t('common.requiredField');
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSave({
        ...formData,
        projectId: formData.projectId || null,
        leadId: formData.leadId || null,
        // In a real app, you would upload files and get URLs
        attachments: formData.attachments.map(attachment => ({
          id: attachment.id,
          name: attachment.name,
          type: attachment.type
        }))
      });
    }
  };
  
  // Get filtered projects based on selected customer
  const filteredProjects = formData.customerId
    ? projects.filter(project => project.customerId === parseInt(formData.customerId))
    : [];
  
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>{note ? t('notes.editNote') : t('notes.addNote')}</DialogTitle>
        <DialogContent dividers>
          <TextField
            autoFocus
            margin="dense"
            label={t('notes.title')}
            type="text"
            fullWidth
            variant="outlined"
            value={formData.title}
            onChange={handleChange}
            error={!!errors.title}
            helperText={errors.title}
            sx={{ mb: 2 }}
          />
          
          <TextField
            margin="dense"
            label={t('notes.content')}
            type="text"
            fullWidth
            multiline
            rows={6}
            variant="outlined"
            value={formData.content}
            onChange={handleChange}
            error={!!errors.content}
            helperText={t('notes.useHashtags')}
            sx={{ mb: 2 }}
          />
          
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="dense" error={!!errors.category}>
                <InputLabel>{t('notes.category')}</InputLabel>
                <Select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  label={t('notes.category')}
                >
                  <MenuItem value="">
                    <em>{t('common.none')}</em>
                  </MenuItem>
                  <MenuItem value="personal">{t('notes.personal')}</MenuItem>
                  <MenuItem value="work">{t('notes.work')}</MenuItem>
                </Select>
                {errors.category && <FormHelperText>{errors.category}</FormHelperText>}
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl 
                fullWidth 
                margin="dense" 
                error={!!errors.projectId}
                disabled={!formData.customerId}
              >
                <InputLabel>{t('notes.project')}</InputLabel>
                <Select
                  name="projectId"
                  value={formData.projectId}
                  onChange={handleChange}
                  label={t('notes.project')}
                >
                  <MenuItem value="">
                    <em>{t('common.none')}</em>
                  </MenuItem>
                  {filteredProjects.map(project => (
                    <MenuItem key={project.id} value={project.id}>
                      {project.name}
                    </MenuItem>
                  ))}
                </Select>
                {errors.projectId && <FormHelperText>{errors.projectId}</FormHelperText>}
              </FormControl>
            </Grid>
          </Grid>
          
          {/* Tags preview */}
          {formData.tags.length > 0 && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                {t('notes.tags')}:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {formData.tags.map(tag => (
                  <Chip
                    key={tag}
                    label={`#${tag}`}
                    size="small"
                    icon={<LabelIcon fontSize="small" />}
                  />
                ))}
              </Box>
            </Box>
          )}
          
          {/* Attachments */}
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="subtitle2" color="textSecondary">
                {t('notes.attachments')}:
              </Typography>
              <input
                type="file"
                id="file-upload"
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={handleFileUpload}
                multiple
              />
              <Button
                size="small"
                startIcon={<AttachFileIcon />}
                onClick={() => fileInputRef.current?.click()}
              >
                {t('notes.addAttachment')}
              </Button>
            </Box>
            
            <List dense>
              {formData.attachments.map(attachment => (
                <ListItem 
                  key={attachment.id}
                  secondaryAction={
                    <IconButton 
                      edge="end" 
                      aria-label={t('notes.removeAttachment')}
                      onClick={() => handleRemoveAttachment(attachment.id)}
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  }
                >
                  <ListItemAvatar>
                    <Avatar>
                      {attachment.type === 'image' ? <ImageIcon /> : <AttachFileIcon />}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={attachment.name}
                    secondary={`${attachment.type.toUpperCase()}`}
                  />
                </ListItem>
              ))}
              
              {formData.attachments.length === 0 && (
                <Typography variant="body2" color="textSecondary" sx={{ fontStyle: 'italic' }}>
                  {t('common.noAttachments')}
                </Typography>
              )}
            </List>
          </Box>
          
          {/* Voice Note */}
          <Box sx={{ mt: 2, mb: 2 }}>
            <Typography variant="subtitle2" color="textSecondary" gutterBottom>
              {t('notes.voiceNote')}:
            </Typography>
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 1 }}>
              <VoiceRecorder 
                onRecordingComplete={handleVoiceNoteRecorded}
                onDelete={handleVoiceNoteDelete}
                initialAudioUrl={formData.voiceNoteUrl}
              />
            </Paper>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} color="inherit">
            {t('actions.cancel')}
          </Button>
          <Button type="submit" color="primary" variant="contained">
            {t('actions.save')}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

const NotesPage = () => {
  const { t } = useTranslation();
  const { user } = useSupabase();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredNotes, setFilteredNotes] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: '',
    projectId: null,
    leadId: null,
    tags: [],
    attachments: [],
    isPrivate: false
  });

  const { projects, loading: projectsLoading } = useProjects();

  // Fetch notes from the database
  const fetchNotes = useCallback(async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      const data = await noteService.getNotes(user.id);
      setNotes(data);
      setFilteredNotes(data);
    } catch (err) {
      console.error('Error fetching notes:', err);
      setError(t('notes.errors.fetchFailed'));
      setSnackbar({
        open: true,
        message: t('notes.errors.fetchFailed'),
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  }, [user?.id, t]);

  React.useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);
  
  // Handle dialog close
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingNote(null);
  };
  
  // Handle save note
  const handleSaveNote = async (noteData) => {
    if (!user?.id) {
      setSnackbar({
        open: true,
        message: t('common.unauthorized'),
        severity: 'error'
      });
      return;
    }

    try {
      let savedNote;
      
      if (editingNote) {
        // Update existing note
        savedNote = await noteService.updateNote(editingNote.id, {
          ...noteData,
          userId: user.id,
          projectId: noteData.projectId || null,
          leadId: noteData.leadId || null
        });
        
        setNotes(prev => 
          prev.map(note => 
            note.id === editingNote.id ? { ...note, ...savedNote } : note
          )
        );
        
        setSnackbar({
          open: true,
          message: t('notes.updateSuccess'),
          severity: 'success'
        });
      } else {
        // Create new note
        savedNote = await noteService.createNote({
          ...noteData,
          userId: user.id,
          projectId: noteData.projectId || null,
          leadId: noteData.leadId || null
        });
        
        setNotes(prev => [savedNote, ...prev]);
        
        setSnackbar({
          open: true,
          message: t('notes.createSuccess'),
          severity: 'success'
        });
      }
      
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving note:', error);
      setSnackbar({
        open: true,
        message: t(editingNote ? 'notes.updateError' : 'notes.createError'),
        severity: 'error'
      });
    }
  };
  
  // Handle edit note
  const handleEditNote = (note) => {
    setEditingNote(note);
    setFormData({
      title: note.title || '',
      content: note.content || '',
      category: note.category || '',
      projectId: note.projectId || null,
      leadId: note.leadId || null,
      tags: [...(note.tags || [])],
      attachments: [...(note.attachments || [])],
      isPrivate: note.isPrivate || false
    });
    setOpenDialog(true);
  };
  
  // Handle delete note
  const handleDeleteNote = async (noteId) => {
    if (!window.confirm(t('notes.confirmDelete'))) return;
    
    try {
      await noteService.deleteNote(noteId);
      setNotes(prev => prev.filter(note => note.id !== noteId));
      
      setSnackbar({
        open: true,
        message: t('notes.deleteSuccess'),
        severity: 'success'
      });
    } catch (error) {
      console.error('Error deleting note:', error);
      setSnackbar({
        open: true,
        message: t('notes.deleteError'),
        severity: 'error'
      });
    }
  };
  
  // Handle add new note
  const handleAddNote = () => {
    setEditingNote(null);
    setOpenDialog(true);
  };

  // Handle search
  const handleSearch = async (term) => {
    setSearchTerm(term);
    
    if (!term.trim()) {
      setFilteredNotes(notes);
      return;
    }
    
    try {
      const results = await noteService.searchNotes(user.id, term);
      setFilteredNotes(results);
    } catch (error) {
      console.error('Error searching notes:', error);
      setSnackbar({
        open: true,
        message: t('notes.searchError'),
        severity: 'error'
      });
    }
  };
  
  // Handle snackbar close
  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };
  
  // Filter notes based on search term
  React.useEffect(() => {
    if (!searchTerm) {
      setFilteredNotes(notes);
      return;
    }

    const term = searchTerm.toLowerCase();
    const filtered = notes.filter(note => 
      note.title.toLowerCase().includes(term) || 
      note.content.toLowerCase().includes(term) ||
      (note.tags && note.tags.some(tag => tag.toLowerCase().includes(term)))
    );
    
    setFilteredNotes(filtered);
  }, [searchTerm, notes]);
  
  // Handle voice note recording complete
  const handleVoiceNoteRecorded = (audioBlob) => {
    // In a real app, you would upload the blob to your server and get a URL
    const audioUrl = URL.createObjectURL(audioBlob);
    return audioUrl;
  };
  
  // Handle voice note delete
  const handleVoiceNoteDelete = (noteId) => {
    // In a real app, you would also delete the audio file from the server
    setNotes(prev => 
      prev.map(note => 
        note.id === noteId 
          ? { ...note, voiceNoteUrl: null, hasVoiceNote: false } 
          : note
      )
    );
  };
  
  // Handle voice note save in the dialog
  const handleSaveVoiceNote = (audioBlob) => {
    const audioUrl = handleVoiceNoteRecorded(audioBlob);
    setFormData(prev => ({
      ...prev,
      voiceNoteUrl: audioUrl,
      hasVoiceNote: true
    }));
  };
  
  // Handle voice note delete in the dialog
  const handleDeleteVoiceNote = () => {
    if (formData.voiceNoteUrl) {
      URL.revokeObjectURL(formData.voiceNoteUrl);
    }
    setFormData(prev => ({
      ...prev,
      voiceNoteUrl: null,
      hasVoiceNote: false
    }));
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          {t('menu.notes')}
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleAddNote}
        >
          {t('notes.addNote')}
        </Button>
      </Box>

      {/* Search */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <TextField
          fullWidth
          placeholder={t('notes.searchPlaceholder')}
          variant="outlined"
          size="small"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />,
          }}
        />
      </Paper>

      {/* Notes Grid */}
      <Grid container spacing={3}>
        {filteredNotes.map(note => (
          <Grid item xs={12} sm={6} md={4} key={note.id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h6" component="div" gutterBottom>
                  {note.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  {note.content}
                </Typography>
                
                {/* Tags */}
                {note.tags.length > 0 && (
                  <Box sx={{ mt: 1, mb: 2, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {(note.tags || []).map(tag => (
                      <Chip
                        key={tag}
                        label={`#${tag}`}
                        size="small"
                        icon={<LabelIcon fontSize="small" />}
                      />
                    ))}
                  </Box>
                )}
                
                {/* Project and Lead */}
                <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {note.projectId && (
                    <Chip
                      icon={<ProjectIcon />}
                      label={note.projectName || t('common.unknownProject')}
                      size="small"
                      variant="outlined"
                    />
                  )}
                  {note.leadId && (
                    <Chip
                      icon={<PersonIcon />}
                      label={note.leadName || t('common.unknownLead')}
                      size="small"
                      variant="outlined"
                    />
                  )}
                  {/* Category */}
                  {note.category && (
                    <Chip
                      label={t(`notes.categories.${note.category}`)}
                      size="small"
                      sx={{ mt: 1 }}
                      color="primary"
                      variant="outlined"
                    />
                  )}
                </Box>
                
                {/* Attachments */}
                {(note.attachments && note.attachments.length > 0) && (
                  <Box sx={{ mt: 2 }}>
                    <Divider sx={{ my: 1 }} />
                    <Typography variant="caption" color="text.secondary">
                      {t('notes.attachments')}:
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                      {(note.attachments || []).map(attachment => (
                        <Chip
                          key={attachment.id}
                          icon={attachment.type === 'image' ? <ImageIcon /> : <AttachFileIcon />}
                          label={attachment.name}
                          size="small"
                          variant="outlined"
                        />
                      ))}
                    </Box>
                  </Box>
                )}
                
                {/* Voice Note Indicator */}
                {note.hasVoiceNote && (
                  <Box sx={{ mt: 1, display: 'flex', alignItems: 'center' }}>
                    <MicIcon color="primary" sx={{ mr: 1 }} />
                    <Typography variant="caption" color="text.secondary">
                      {t('notes.voiceNoteAvailable')}
                    </Typography>
                  </Box>
                )}
              </CardContent>
              <CardActions sx={{ justifyContent: 'space-between', p: 2, pt: 0 }}>
                <Typography variant="caption" color="text.secondary">
                  {new Date(note.updatedAt).toLocaleString()}
                </Typography>
                <Box>
                  <Tooltip title={t('actions.edit')}>
                    <IconButton size="small" onClick={() => handleEditNote(note)}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title={t('actions.delete')}>
                    <IconButton size="small" onClick={() => handleDeleteNote(note.id)}>
                      <DeleteIcon fontSize="small" color="error" />
                    </IconButton>
                  </Tooltip>
                </Box>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
      
      {/* Note Dialog */}
      <NoteDialog
        open={openDialog}
        onClose={handleCloseDialog}
        onSave={handleSaveNote}
        note={editingNote}
        projects={projects}
      />
    </Box>
  );
};



export default NotesPage;
