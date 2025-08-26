import { supabase } from '../lib/supabaseClient';

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
 * @param {string} noteData.title - The note title
 * @param {string} noteData.text - The note text
 * @param {string} noteData.status - The status of the note
 * @param {string} noteData.priority - The priority of the note
 * @param {string} noteData.due_date - The due date of the note
 * @param {string} noteData.assignee - The assignee of the note
 * @param {string} noteData.entity_type - The entity type of the note
 * @param {string} noteData.entity_id - The entity ID of the note
 */
export const createNote = async (noteData) => {
  const userId = (await supabase.auth.getUser()).data.user.id;
  
  // Omit unsupported columns like 'tags'
  const { title, text, status, priority, due_date, assignee, entity_type, entity_id } = noteData;
  const { data, error } = await supabase
    .from('notes')
    .insert([{
      title,
      text,
      status,
      priority,
      due_date,
      assignee,
      entity_type,
      entity_id,
      created_by: userId 
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
 * @param {string} updates.title - The new title of the note
 * @param {string} updates.text - The new text of the note
 * @param {string} updates.status - The new status of the note
 * @param {string} updates.priority - The new priority of the note
 * @param {string} updates.due_date - The new due date of the note
 * @param {string} updates.assignee - The new assignee of the note
 * @param {string} updates.entity_type - The new entity type of the note
 * @param {string} updates.entity_id - The new entity ID of the note
 */
export const updateNote = async (noteId, updates) => {
  // Remove unsupported fields
  const { title, text, status, priority, due_date, assignee, entity_type, entity_id } = updates;
  const payload = {
    title,
    text,
    status,
    priority,
    due_date,
    assignee,
    entity_type,
    entity_id,
    updated_at: new Date().toISOString()
  };
  const { data, error } = await supabase
    .from('notes')
    .update(payload)
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
// Group notes by status and return as { TODO:[], IN_PROGRESS:[], COMPLETED:[] }
export const getByStatus = async () => {
  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .eq('entity_type', 'other')
    .eq('entity_id', 'general')
    .order('priority', { ascending: false });
  if (error) throw error;
  const grouped = { TODO: [], IN_PROGRESS: [], COMPLETED: [] };
  (data || []).forEach((n) => {
    const key = n.status || 'TODO';
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(n);
  });
  return grouped;
};

export const getRecentNotes = async (limit = 10) => {
  const { data, error } = await supabase
    .from('notes')
    .select('id,title,description,created_at,updated_at')
    .order('created_at', { ascending: false })
    .limit(limit);
    
  if (error) throw error;
  return data;
};
