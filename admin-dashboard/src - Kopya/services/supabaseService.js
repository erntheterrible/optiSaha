import { supabase } from '../lib/supabaseClient';

// User Operations
export const userService = {
  // Get all users
  async getUsers() {
    const { data, error } = await supabase
      .from('users')
      .select('*');
    
    if (error) throw error;
    return data;
  },

  // Get user by ID
  async getUserById(id) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  // Update user
  async updateUser(id, updates) {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', id);
    
    if (error) throw error;
    return data;
  },
};

// Project Operations
export const projectService = {
  // Get all projects
  async getProjects() {
    const { data, error } = await supabase
      .from('projects')
      .select(`
        *,
        users:assigned_to (id, username, email)
      `);
    
    if (error) throw error;
    return data;
  },

  // Create new project
  async createProject(projectData) {
    const { data, error } = await supabase
      .from('projects')
      .insert([projectData])
      .select();
    
    if (error) throw error;
    return data[0];
  },

  // Update project
  async updateProject(id, updates) {
    const { data, error } = await supabase
      .from('projects')
      .update(updates)
      .eq('id', id)
      .select();
    
    if (error) throw error;
    return data[0];
  },
};

// Visit Operations
export const visitService = {
  // Get all visits
  async getVisits() {
    const { data, error } = await supabase
      .from('visits')
      .select('*');
    
    if (error) throw error;
    return data;
  },

  // Create new visit
  async createVisit(visitData) {
    const { data, error } = await supabase
      .from('visits')
      .insert([visitData])
      .select();
    
    if (error) throw error;
    return data[0];
  },
};

// Customer Operations
export const customerService = {
  // Get all customers
  async getCustomers() {
    const { data, error } = await supabase
      .from('customers')
      .select('*');
    
    if (error) throw error;
    return data;
  },

  // Create new customer
  async createCustomer(customerData) {
    const { data, error } = await supabase
      .from('customers')
      .insert([customerData])
      .select();
    
    if (error) throw error;
    return data[0];
  },
};

// Export all services
export default {
  userService,
  projectService,
  visitService,
  customerService,
};
