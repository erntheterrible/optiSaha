import { supabase } from '@/lib/supabaseClient';

/**
 * Get notes for a specific entity
 * @param {string} entityType - The type of entity ('lead', 'project', 'visit', 'other')
 * @param {string} entityId - The ID of the entity
 * @param {object} options - Additional options
 * @param {number} [options.limit] - Maximum number of notes to return
 * @param {boolean} [options.withUser] - Whether to include user details
 */
export const getNotes = async (entityType, entityId, { limit, withUser = false } = {}) => {
  let query = supabase
    .from('notes')
    .select(
      withUser 
        ? '*, created_by_user:created_by(id, full_name, avatar_url)' 
        : '*'
    )
    .eq('entity_type', entityType)
    .eq('entity_id', entityId)
    .order('created_at', { ascending: false });

  if (limit) {
    query = query.limit(limit);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
};

/**
 * Get a single note by ID
 * @param {number} noteId - The ID of the note
 */
export const getNoteById = async (noteId) => {
  const { data, error } = await supabase
    .from('notes')
    .select('*, created_by_user:created_by(id, full_name, avatar_url)')
    .eq('id', noteId)
    .single();
    
  if (error) throw error;
  return data;
};

/**
 * Create a new note
 * @param {object} noteData - The note data
 * @param {string} noteData.content - The note content
 * @param {string} noteData.entity_type - The type of entity the note is for
 * @param {string} noteData.entity_id - The ID of the entity
 */
export const createNote = async (noteData) => {
  const userId = (await supabase.auth.getUser()).data.user.id;
  
  const { data, error } = await supabase
    .from('notes')
    .insert([{
      ...noteData,
      created_by: userId,
    }])
    .select()
    .single();
    
  if (error) throw error;
  return data;
};

/**
 * Update an existing note
 * @param {number} noteId - The ID of the note to update
 * @param {object} updates - The fields to update
 */
export const updateNote = async (noteId, updates) => {
  const { data, error } = await supabase
    .from('notes')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', noteId)
    .select()
    .single();
    
  if (error) throw error;
  return data;
};

/**
 * Delete a note
 * @param {number} noteId - The ID of the note to delete
 */
export const deleteNote = async (noteId) => {
  const { error } = await supabase
    .from('notes')
    .delete()
    .eq('id', noteId);
    
  if (error) throw error;
  return true;
};

/**
 * Get recent notes across all entities
 * @param {number} limit - Maximum number of notes to return
 */
export const getRecentNotes = async (limit = 10) => {
  const { data, error } = await supabase
    .from('notes')
    .select('*, created_by_user:created_by(id, full_name, avatar_url)')
    .order('created_at', { ascending: false })
    .limit(limit);
    
  if (error) throw error;
  return data;
};
