import { supabase } from '@/lib/supabaseClient';

/**
 * Get all leads with optional filters
 * @param {object} filters - Filters for the query
 * @param {string} filters.status - Filter by status
 * @param {string} filters.assignedTo - Filter by assigned user ID
 * @param {string} filters.search - Search term for name, company, or email
 */
export const getLeads = async (filters = {}) => {
  let query = supabase
    .from('leads')
    .select('*, assigned_user:assigned_to(full_name, email, avatar_url)')
    .order('created_at', { ascending: false });

  // Apply filters if provided
  if (filters.status) {
    query = query.eq('status', filters.status);
  }
  
  if (filters.assignedTo) {
    query = query.eq('assigned_to', filters.assignedTo);
  }
  
  if (filters.search) {
    const searchTerm = `%${filters.search}%`;
    query = query.or(
      `name.ilike.${searchTerm},company.ilike.${searchTerm},email.ilike.${searchTerm}`
    );
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
};

/**
 * Get a single lead by ID
 * @param {number} id - The ID of the lead
 */
export const getLeadById = async (id) => {
  const { data, error } = await supabase
    .from('leads')
    .select('*, assigned_user:assigned_to(full_name, email, avatar_url)')
    .eq('id', id)
    .single();
    
  if (error) throw error;
  return data;
};

/**
 * Create a new lead
 * @param {object} leadData - The lead data
 * @param {string} leadData.name - The name of the lead
 * @param {string} leadData.company - The company name
 * @param {string} leadData.email - The email address
 * @param {string} leadData.phone - The phone number
 * @param {string} leadData.status - The status of the lead
 * @param {string} leadData.assigned_to - The ID of the assigned user
 * @param {string} leadData.notes - Additional notes
 */
export const createLead = async (leadData) => {
  const { data, error } = await supabase
    .from('leads')
    .insert([{
      ...leadData,
      created_by: (await supabase.auth.getUser()).data.user.id
    }])
    .select()
    .single();
    
  if (error) throw error;
  return data;
};

/**
 * Update an existing lead
 * @param {number} id - The ID of the lead to update
 * @param {object} updates - The fields to update
 */
export const updateLead = async (id, updates) => {
  const { data, error } = await supabase
    .from('leads')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();
    
  if (error) throw error;
  return data;
};

/**
 * Delete a lead
 * @param {number} id - The ID of the lead to delete
 */
export const deleteLead = async (id) => {
  const { error } = await supabase
    .from('leads')
    .delete()
    .eq('id', id);
    
  if (error) throw error;
  return true;
};

/**
 * Get lead statistics (count by status)
 */
export const getLeadStats = async () => {
  const { data, error } = await supabase
    .from('leads')
    .select('status, count(*)')
    .group('status');
    
  if (error) throw error;
  
  // Transform to a more usable format
  return data.reduce((acc, { status, count }) => ({
    ...acc,
    [status]: parseInt(count, 10)
  }), {});
};
