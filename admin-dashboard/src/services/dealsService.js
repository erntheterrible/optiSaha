import { supabase } from '../lib/supabaseClient';

// Get all deals with customer and owner information
export const getDeals = async (filters = {}) => {
  try {
    // Log current user for debugging
    const { data: { user } } = await supabase.auth.getUser();
    console.log('Current user:', user?.id);
    
    // First, get deals with basic info
    let query = supabase
      .from('deals')
      .select(`
        *,
        customer_id,
        owner_id
      `);

    // Apply filters
    if (filters.search) {
      query = query.ilike('title', `%${filters.search}%`);
    }
    
    if (filters.stage) {
      query = query.eq('stage', filters.stage);
    }
    
    if (filters.customerId) {
      query = query.eq('customer_id', filters.customerId);
    }
    
    // Apply sorting
    query = query.order('created_at', { ascending: false });

    const { data: dealsData, error: dealsError } = await query;
    
    if (dealsError) throw dealsError;
    
    console.log('Deals data:', dealsData);
    
    // Get unique customer IDs and owner IDs
    const customerIds = [...new Set(dealsData.filter(deal => deal.customer_id).map(deal => deal.customer_id))];
    const ownerIds = [...new Set(dealsData.filter(deal => deal.owner_id).map(deal => deal.owner_id))];
    
    console.log('Customer IDs:', customerIds);
    console.log('Owner IDs:', ownerIds);
    
    // Fetch customer details if there are customer IDs
    let customersData = [];
    if (customerIds.length > 0) {
      const { data: customers, error: customersError } = await supabase
        .from('customers')
        .select('id, name')
        .in('id', customerIds);
      
      console.log('Customers data:', customers);
      console.log('Customers error:', customersError);
      
      if (!customersError && customers) {
        customersData = customers;
      }
    }
    
    // Fetch owner details if there are owner IDs
    let ownersData = [];
    if (ownerIds.length > 0) {
      const { data: owners, error: ownersError } = await supabase
        .from('users')
        .select('id, email')
        .in('id', ownerIds);
      
      console.log('Owners data:', owners);
      console.log('Owners error:', ownersError);
      
      if (!ownersError && owners) {
        ownersData = owners;
      }
    }
    
    // Format data for UI
    return dealsData.map(deal => {
      const customer = customersData.find(c => c.id === deal.customer_id);
      const owner = ownersData.find(o => o.id === deal.owner_id);
      
      return {
        ...deal,
        customer: customer ? { name: customer.name } : null,
        owner: owner ? { name: owner.email } : null,
        stageLabel: getStageLabel(deal.stage),
        value: deal.value || 0
      };
    });
  } catch (error) {
    console.error('Error fetching deals:', error);
    throw error;
  }
};

// Helper function to get stage labels
const getStageLabel = (stage) => {
  const stageLabels = {
    'prospecting': 'Prospecting',
    'qualification': 'Qualification',
    'proposal': 'Proposal Sent',
    'negotiation': 'Negotiation',
    'won': 'Won',
    'lost': 'Lost'
  };
  return stageLabels[stage] || stage;
};

// Get deal by ID with customer and owner information
export const getDealById = async (id) => {
  try {
    // Log current user for debugging
    const { data: { user } } = await supabase.auth.getUser();
    console.log('Current user in getDealById:', user?.id);
    
    const { data: dealData, error: dealError } = await supabase
      .from('deals')
      .select(`
        *
      `)
      .eq('id', id)
      .single();
    
    if (dealError) throw dealError;
    
    console.log('Deal data:', dealData);
    
    // Fetch customer details if there is a customer_id
    let customer = null;
    if (dealData.customer_id) {
      const { data: customerData, error: customerError } = await supabase
        .from('customers')
        .select('id, name')
        .eq('id', dealData.customer_id)
        .single();
      
      console.log('Customer data:', customerData);
      console.log('Customer error:', customerError);
      
      if (!customerError && customerData) {
        customer = { name: customerData.name };
      }
    }
    
    // Fetch owner details if there is an owner_id
    let owner = null;
    if (dealData.owner_id) {
      const { data: ownerData, error: ownerError } = await supabase
        .from('users')
        .select('id, email')
        .eq('id', dealData.owner_id)
        .single();
      
      console.log('Owner data:', ownerData);
      console.log('Owner error:', ownerError);
      
      if (!ownerError && ownerData) {
        owner = { name: ownerData.email };
      }
    }
    
    // Format data for UI
    return {
      ...dealData,
      customer,
      owner,
      stageLabel: getStageLabel(dealData.stage),
      value: dealData.value || 0
    };
  } catch (error) {
    console.error('Error fetching deal:', error);
    throw error;
  }
};

// Create a new deal
export const createDeal = async (dealData) => {
  try {
    // Clean the data to remove undefined values
    const cleanedData = Object.fromEntries(
      Object.entries(dealData).filter(([_, v]) => v !== undefined)
    );
    
    const { data: dealResult, error: dealError } = await supabase
      .from('deals')
      .insert([cleanedData])
      .select(`
        *
      `)
      .single();
    
    if (dealError) throw dealError;
    
    // Fetch customer details if there is a customer_id
    let customer = null;
    if (dealResult.customer_id) {
      const { data: customerData, error: customerError } = await supabase
        .from('customers')
        .select('id, name')
        .eq('id', dealResult.customer_id)
        .single();
      
      if (!customerError && customerData) {
        customer = { name: customerData.name };
      }
    }
    
    // Fetch owner details if there is an owner_id
    let owner = null;
    if (dealResult.owner_id) {
      const { data: ownerData, error: ownerError } = await supabase
        .from('users')
        .select('id, email')
        .eq('id', dealResult.owner_id)
        .single();
      
      if (!ownerError && ownerData) {
        owner = { name: ownerData.email };
      }
    }
    
    // Format data for UI
    return {
      ...dealResult,
      customer,
      owner,
      stageLabel: getStageLabel(dealResult.stage),
      value: dealResult.value || 0
    };
  } catch (error) {
    console.error('Error creating deal:', error);
    throw error;
  }
};

// Update an existing deal
export const updateDeal = async (id, dealData) => {
  try {
    // Clean the data to remove undefined values but keep null values
    const cleanedData = Object.fromEntries(
      Object.entries(dealData).filter(([_, v]) => v !== undefined)
    );
    
    const { data: dealResult, error: dealError } = await supabase
      .from('deals')
      .update(cleanedData)
      .eq('id', id)
      .select(`
        *
      `)
      .single();
    
    if (dealError) throw dealError;
    
    // Fetch customer details if there is a customer_id
    let customer = null;
    if (dealResult.customer_id) {
      const { data: customerData, error: customerError } = await supabase
        .from('customers')
        .select('id, name')
        .eq('id', dealResult.customer_id)
        .single();
      
      if (!customerError && customerData) {
        customer = { name: customerData.name };
      }
    }
    
    // Fetch owner details if there is an owner_id
    let owner = null;
    if (dealResult.owner_id) {
      const { data: ownerData, error: ownerError } = await supabase
        .from('users')
        .select('id, email')
        .eq('id', dealResult.owner_id)
        .single();
      
      if (!ownerError && ownerData) {
        owner = { name: ownerData.email };
      }
    }
    
    // Format data for UI
    return {
      ...dealResult,
      customer,
      owner,
      stageLabel: getStageLabel(dealResult.stage),
      value: dealResult.value || 0
    };
  } catch (error) {
    console.error('Error updating deal:', error);
    throw error;
  }
};

// Delete a deal
export const deleteDeal = async (id) => {
  try {
    const { error } = await supabase
      .from('deals')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error('Error deleting deal:', error);
    throw error;
  }
};
