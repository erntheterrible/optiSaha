import { supabase } from '../lib/supabaseClient';

/**
 * customerService
 * Basic CRUD + helper queries for customers and related entities.
 */
const customerService = {
  async getCustomers({ search = '', limit = 50, offset = 0 } = {}) {
    console.log('Fetching customers from Supabase...');
    
    // First, let's check if we can access the customers table at all
    const { data: tableData, error: tableError } = await supabase
      .from('customers')
      .select('id')
      .limit(1);
    
    console.log('Table access test:', { tableData, tableError });
    
    let query = supabase.from('customers').select('id, name, email, phone, industry, segment, tier, status, address, city, country, website, notes, user_id, created_at, updated_at', { count: 'exact' })
      .order('id', { ascending: false })
      .range(offset, offset + limit - 1);

    if (search) {
      query = query.or(`name.ilike.%${search}%,industry.ilike.%${search}%,city.ilike.%${search}%`);
    }

    console.log('Executing main query:', query);
    const { data, error, count } = await query;
    console.log('Main query result:', { data, error, count });
    if (error) {
      console.error('Error fetching customers:', error);
      throw error;
    }
    return { data, count };
  },

  async getCustomerById(customerId) {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('id', customerId)
      .single();
    if (error) throw error;
    return data;
  },

  async createCustomer(payload) {
    const { data: userData } = await supabase.auth.getUser();
    const user = userData?.user;
    if (!user) throw new Error('No authenticated user');
    const cleaned = Object.fromEntries(Object.entries(payload).filter(([_, v]) => v !== undefined && v !== ''));
    cleaned.user_id = user.id;
    const { data, error } = await supabase
      .from('customers')
      .insert(cleaned)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updateCustomer(customerId, payload) {
    console.log('Updating customer:', { customerId, payload });
    
    // First verify we can access this customer
    const { data: existing, error: existingError } = await supabase
      .from('customers')
      .select('user_id')
      .eq('id', customerId)
      .single();

    console.log('Existing customer check:', { existing, existingError });

    if (existingError || !existing) {
      console.error('Failed to fetch existing customer:', existingError);
      throw new Error('Kayıt bulunamadı veya güncellemeye yetkiniz yok.');
    }

    // Get current user
    const { data: userData, error: userError } = await supabase.auth.getUser();
    const user = userData?.user;

    console.log('Current user check:', { user, userError });

    if (userError || !user) {
      console.error('No authenticated user:', userError);
      throw new Error('No authenticated user');
    }

    // Verify ownership
    console.log('Ownership check:', { 
      existingUserId: existing.user_id, 
      currentUserId: user.id,
      matches: existing.user_id === user.id
    });

    if (existing.user_id !== user.id) {
      throw new Error('Kayıt bulunamadı veya güncellemeye yetkiniz yok.');
    }

    // Ensure we don't change the user_id
    const cleaned = { ...payload };
    delete cleaned.user_id;

    console.log('Sending update with cleaned payload:', cleaned);

    const { data, error } = await supabase
      .from('customers')
      .update(cleaned)
      .eq('id', customerId)
      .select()
      .single();

    console.log('Update result:', { data, error });

    if (error) {
      console.error('Update failed:', error);
      if (error.code === 'PGRST116') {
        throw new Error('Kayıt bulunamadı veya güncellemeye yetkiniz yok.');
      }
      throw error;
    }
    return data;
  },

  async deleteCustomer(customerId) {
    const { error } = await supabase.from('customers').delete().eq('id', customerId);
    if (error) throw error;
  },

  // Contacts ------------------------------
  async getContacts(customerId) {
    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .eq('customer_id', customerId)
      .order('id', { ascending: false });
    if (error) throw error;
    return data;
  },

  async addContact(customerId, payload) {
    const insert = { ...payload, customer_id: customerId };
    const { data, error } = await supabase
      .from('contacts')
      .insert(insert)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updateContact(contactId, payload) {
    const { data, error } = await supabase
      .from('contacts')
      .update(payload)
      .eq('id', contactId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async deleteContact(contactId) {
    const { error } = await supabase.from('contacts').delete().eq('id', contactId);
    if (error) throw error;
  },
};

export default customerService;
