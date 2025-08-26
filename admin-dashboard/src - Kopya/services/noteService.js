import { supabase } from '../lib/supabaseClient';

const noteService = {
  // Get all notes for the current user
  async getNotes(userId) {
    try {
      console.log('Fetching notes for user:', userId);
      const { data, error, status } = await supabase
        .from('notes')
        .select(`
          *,
          project:project_id (id, name),
          lead:lead_id (id, name)
        `)
        .or(`created_by.eq.${userId},is_private.eq.false`)
        .order('created_at', { ascending: false });
      
      console.log('Notes fetch status:', status);
      console.log('Notes data:', data);
      
      if (error) {
        console.error('Error details:', error);
        throw error;
      }
      
      // Transform data to match the expected format
      return (data || []).map(note => ({
        id: note.id,
        title: note.title,
        content: note.content,
        category: note.category,
        tags: note.tags || [],
        projectId: note.project_id,
        projectName: note.project?.name,
        leadId: note.lead_id,
        leadName: note.lead?.name,
        isPrivate: note.is_private,
        createdAt: note.created_at,
        updatedAt: note.updated_at,
        createdBy: note.created_by
      }));
    } catch (error) {
      console.error('Error fetching notes:', error);
      throw error;
    }
  },

  // Get a single note by ID
  async getNoteById(noteId) {
    try {
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('id', noteId)
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching note:', error);
      throw error;
    }
  },

  // Create a new note
  async createNote(noteData) {
    try {
      const { data, error } = await supabase
        .from('notes')
        .insert([{
          title: noteData.title,
          content: noteData.content,
          category: noteData.category,
          tags: noteData.tags || [],
          project_id: noteData.projectId || null,
          lead_id: noteData.leadId || null,
          is_private: noteData.isPrivate || false,
          created_by: noteData.userId
        }])
        .select();
      
      if (error) throw error;
      
      // Return the transformed note
      const newNote = data?.[0];
      if (!newNote) return null;
      
      return {
        id: newNote.id,
        title: newNote.title,
        content: newNote.content,
        category: newNote.category,
        tags: newNote.tags || [],
        projectId: newNote.project_id,
        leadId: newNote.lead_id,
        isPrivate: newNote.is_private,
        createdAt: newNote.created_at,
        updatedAt: newNote.updated_at,
        createdBy: newNote.created_by
      };
    } catch (error) {
      console.error('Error creating note:', error);
      throw error;
    }
  },

  // Update an existing note
  async updateNote(noteId, noteData) {
    try {
      const { data, error } = await supabase
        .from('notes')
        .update({
          title: noteData.title,
          content: noteData.content,
          category: noteData.category,
          tags: noteData.tags || [],
          project_id: noteData.projectId || null,
          lead_id: noteData.leadId || null,
          is_private: noteData.isPrivate || false,
          updated_at: new Date().toISOString()
        })
        .eq('id', noteId)
        .select();
      
      if (error) throw error;
      
      const updatedNote = data?.[0];
      if (!updatedNote) return null;
      
      return {
        id: updatedNote.id,
        title: updatedNote.title,
        content: updatedNote.content,
        category: updatedNote.category,
        tags: updatedNote.tags || [],
        projectId: updatedNote.project_id,
        projectName: updatedNote.project?.name,
        leadId: updatedNote.lead_id,
        leadName: updatedNote.lead?.name,
        isPrivate: updatedNote.is_private,
        createdAt: updatedNote.created_at,
        updatedAt: updatedNote.updated_at,
        createdBy: updatedNote.created_by
      };
    } catch (error) {
      console.error('Error updating note:', error);
      throw error;
    }
  },

  // Delete a note
  async deleteNote(noteId) {
    try {
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', noteId);
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting note:', error);
      throw error;
    }
  },

  // Search notes
  async searchNotes(userId, searchTerm) {
    try {
      const { data, error } = await supabase
        .from('notes')
        .select(`
          *,
          project:project_id (id, name),
          lead:lead_id (id, name)
        `)
        .or(`created_by.eq.${userId},is_private.eq.false`)
        .or(`title.ilike.%${searchTerm}%,content.ilike.%${searchTerm}%`)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Transform data to match the expected format
      return (data || []).map(note => ({
        id: note.id,
        title: note.title,
        content: note.content,
        category: note.category,
        tags: note.tags || [],
        projectId: note.project_id,
        projectName: note.project?.name,
        leadId: note.lead_id,
        leadName: note.lead?.name,
        isPrivate: note.is_private,
        createdAt: note.created_at,
        updatedAt: note.updated_at,
        createdBy: note.created_by
      }));
    } catch (error) {
      console.error('Error searching notes:', error);
      throw error;
    }
  }
};

export default noteService;
