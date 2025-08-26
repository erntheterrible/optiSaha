import { supabase } from '../lib/supabaseClient';

const databaseService = {
  // User related queries
  async getUsers() {
    const { data, error } = await supabase
      .from('users')
      .select('*');
    
    if (error) throw error;
    return data;
  },

  async createUser(userData) {
    const { data, error } = await supabase
      .from('users')
      .insert(userData)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updateUser(userId, userData) {
    const { data, error } = await supabase
      .from('users')
      .update(userData)
      .eq('id', userId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async deleteUser(userId) {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', userId);
    if (error) throw error;
  },

  // Project related queries
  async getProjects() {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async deleteProject(projectId) {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', projectId);

    if (error) throw error;
  },

  // Lead related queries
  async getLeads() {
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async deleteLead(leadId) {
    const { error } = await supabase
      .from('leads')
      .delete()
      .eq('id', leadId);

    if (error) throw error;
  },

  // Region related queries
  async getRegions() {
    const { data, error } = await supabase
      .from('regions')
      .select('*');
    
    if (error) throw error;
    return data;
  },

  async deleteRegion(regionId) {
    const { error } = await supabase
      .from('regions')
      .delete()
      .eq('id', regionId);

    if (error) throw error;
  },

  async createRegion(regionData) {
    const { data, error } = await supabase
      .from('regions')
      .insert(regionData)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updateRegion(regionId, regionData) {
    const { data, error } = await supabase
      .from('regions')
      .update(regionData)
      .eq('id', regionId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },
  
  // Calendar event related queries
  async createEvent(event) {
    const { data, error } = await supabase
      .from('events')
      .insert({
        description: event.title,
        start_time: event.start,
        end_time: event.end,
        location: event.location ?? null,
        created_by: event.createdBy ?? null
      })
      .select()
      .single();

    if (error) throw error;

    // Transform to calendar format to immediately add to UI
    return {
      id: data.id,
      title: data.description,
      start: data.start_time,
      end: data.end_time || null,
      allDay: false,
      extendedProps: {
        description: data.description || '',
        location: data.location || '',
        createdBy: data.created_by
      },
      created_at: data.created_at
    };
  },

  async getEvents() {
    const { data, error } = await supabase
      .from('events')
      .select(`
        id,
        description,
        start:start_time,
        end:end_time,
        location,
        created_by,
        created_at
      `)
      .order('start_time', { ascending: true });
    
    if (error) {
      console.error('Error fetching events:', error);
      throw error;
    }
    
    // Transform data to match FullCalendar's expected format
    return data.map(event => ({
      id: event.id,
      title: event.description, // Using description as title since title column doesn't exist
      start: event.start,
      end: event.end || null,
      allDay: false, // Assuming events are not all day by default
      extendedProps: {
        description: event.description || '',
        location: event.location || '',
        createdBy: event.created_by
      },
      // Include any additional fields you might need
      created_at: event.created_at
    }));
  },

  // Activity related queries
  async getRecentActivities(limit = 5) {
    const { data, error } = await supabase
      .from('activities')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data;
  },

  // Dashboard specific queries
  async getDashboardStats() {
    const { data, error } = await supabase
      .rpc('get_dashboard_stats');
    
    if (error) throw error;
    return data;
  },

  // Generic query method for custom queries
  async query(table, select = '*', filters = {}, orderBy = {}) {
    let query = supabase.from(table).select(select);
    
    // Apply filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        query = query.eq(key, value);
      }
    });
    
    // Apply ordering
    if (orderBy.column) {
      query = query.order(orderBy.column, { ascending: orderBy.ascending ?? true });
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    return data;
  }
};

export default databaseService;
