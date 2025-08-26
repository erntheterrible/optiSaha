import { supabase } from '../lib/supabaseClient';

const dealService = {
  async getCustomerDeals(customerId) {
    const { data, error } = await supabase
      .from('deals')
      .select('*')
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async createDeal(payload) {
    const { data: userData } = await supabase.auth.getUser();
    const user = userData?.user;
    if (!user) throw new Error('No authenticated user');

    const insert = { 
      ...payload,
      user_id: user.id,
      created_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('deals')
      .insert(insert)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateDeal(dealId, payload) {
    const { data, error } = await supabase
      .from('deals')
      .update(payload)
      .eq('id', dealId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteDeal(dealId) {
    const { error } = await supabase
      .from('deals')
      .delete()
      .eq('id', dealId);

    if (error) throw error;
  }
};

export default dealService;
