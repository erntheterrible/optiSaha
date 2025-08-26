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

  async createProject(projectData) {
    // Remove id from projectData as it's auto-generated
    const { id, ...dataWithoutId } = projectData;
    
    const { data, error } = await supabase
      .from('projects')
      .insert(dataWithoutId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateProject(projectData) {
    const { id, ...dataWithoutId } = projectData;
    
    const { data, error } = await supabase
      .from('projects')
      .update(dataWithoutId)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
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

  async createLead(leadData) {
    const { id, ...dataWithoutId } = leadData; // id is auto-generated
    const { data, error } = await supabase
      .from('leads')
      .insert(dataWithoutId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updateLead(leadId, leadData) {
    const { data, error } = await supabase
      .from('leads')
      .update(leadData)
      .eq('id', leadId)
      .select()
      .single();
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

  async importLeads(leadsData) {
    const { data, error } = await supabase
      .from('leads')
      .insert(leadsData)
      .select();
    if (error) throw error;
    return data;
  },

  // Region related queries
  async getRegions() {
    const { data, error } = await supabase
      .from('regions')
      .select('*');
    
    if (error) throw error;
    
    // Parse coordinates from JSON string format and map fields
    return data.map(region => ({
      ...region,
      coordinates: region.coordinates ? JSON.parse(region.coordinates) : [],
      // Map database fields to expected frontend fields
      type: region.type || 'polygon',
      status: region.is_active ? 'active' : 'inactive',
      name: region.name || '',
      description: region.description || '',
      color: region.color || '#3f51b5'
    }));
  },

  async deleteRegion(regionId) {
    const { error } = await supabase
      .from('regions')
      .delete()
      .eq('id', regionId);

    if (error) throw error;
  },

  async createRegion(regionData) {
    // Serialize coordinates as JSON string before storing
    // Only include fields that exist in the database table
    const processedRegionData = {
      name: regionData.name || '',
      description: regionData.description || '',
      coordinates: regionData.coordinates ? JSON.stringify(regionData.coordinates) : '[]',
      color: regionData.color || '#3f51b5',
      type: regionData.type || 'polygon',
      is_active: regionData.status === 'active',
      assigned_user_id: regionData.assignedTo || null,
      created_by: regionData.createdBy || null,
      created_at: regionData.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    const { data, error } = await supabase
      .from('regions')
      .insert(processedRegionData)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updateRegion(regionId, regionData) {
    // Serialize coordinates as JSON string before storing
    // Only include fields that exist in the database table
    const processedRegionData = {
      name: regionData.name || '',
      description: regionData.description || '',
      coordinates: regionData.coordinates ? JSON.stringify(regionData.coordinates) : '[]',
      color: regionData.color || '#3f51b5',
      type: regionData.type || 'polygon',
      is_active: regionData.status === 'active',
      assigned_user_id: regionData.assignedTo || null,
      updated_at: new Date().toISOString()
    };
    
    const { data, error } = await supabase
      .from('regions')
      .update(processedRegionData)
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
        title: event.title,
        description: event.title,
        start_time: event.start,
        end_time: event.end,
        location: event.location ?? null,
        created_by: event.createdBy ?? null,
        event_type: event.event_type,
        status: event.status,
        all_day: event.all_day,
        project_id: event.project_id,
        customer_id: event.customer_id
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
