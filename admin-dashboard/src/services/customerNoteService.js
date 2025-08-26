import { supabase } from '../lib/supabaseClient';

const customerNoteService = {
  async getCustomerNotes(customerId) {
    const { data, error } = await supabase
      .from('customer_notes')
      .select('*')
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    // Fetch user details separately to avoid join issues
    if (data && data.length > 0) {
      const userIds = [...new Set(data.map(note => note.user_id))];
      const { data: users, error: userError } = await supabase
        .from('users')
        .select('id, full_name')
        .in('id', userIds);
      
      if (!userError && users) {
        const userMap = users.reduce((acc, user) => {
          acc[user.id] = user;
          return acc;
        }, {});
        
        return data.map(note => ({
          ...note,
          user: userMap[note.user_id]
        }));
      }
    }
    
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
      .from('customer_notes')
      .insert(insert)
      .select('*')
      .single();
    
    if (error) throw error;
    
    // Fetch user details separately
    if (data) {
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id, full_name')
        .eq('id', data.user_id)
        .single();
      
      if (!userError && userData) {
        return {
          ...data,
          user: userData
        };
      }
    }
    
    return data;

    if (error) throw error;
    return data;
  },

  async updateNote(noteId, payload) {
    const { data, error } = await supabase
      .from('customer_notes')
      .update({
        ...payload,
        updated_at: new Date().toISOString()
      })
      .eq('id', noteId)
      .select('*')
      .single();
    
    if (error) throw error;
    
    // Fetch user details separately
    if (data) {
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id, full_name')
        .eq('id', data.user_id)
        .single();
      
      if (!userError && userData) {
        return {
          ...data,
          user: userData
        };
      }
    }
    
    return data;

    if (error) throw error;
    return data;
  },

  async deleteNote(noteId) {
    const { error } = await supabase
      .from('customer_notes')
      .delete()
      .eq('id', noteId);

    if (error) throw error;
  }
};

export default customerNoteService;
