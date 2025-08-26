import { supabase } from '../lib/supabaseClient';

const noteService = {
  async getNotes() {
    const { data, error } = await supabase
      .from('notes')
      .select('*, users(full_name)')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async getCustomerNotes(customerId) {
    const { data, error } = await supabase
      .from('notes')
      .select('*, users(full_name)')
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async createNote(payload) {
    const { data: userData } = await supabase.auth.getUser();
    const user = userData?.user;
    if (!user) throw new Error('No authenticated user');

    const insert = { 
      ...payload,
      user_id: user.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('notes')
      .insert(insert)
      .select('*, users(full_name)')
      .single();

    if (error) {
      console.error('Supabase createNote error:', error);
      throw error;
    }
    return data;
  },

  async updateNote(noteId, payload) {
    const { data, error } = await supabase
      .from('notes')
      .update(payload)
      .eq('id', noteId)
      .select()
      .single();

    if (error) {
      console.error('Supabase updateNote error:', error);
      throw error;
    }
    return data;
  },

  async deleteNote(noteId) {
    const { error } = await supabase
      .from('notes')
      .delete()
      .eq('id', noteId);

    if (error) throw error;
  }
};

export default noteService;
