import { supabase } from '../lib/supabaseClient';

// Get deal performance analytics
export const getDealAnalytics = async (dealId = null, dateRange = '30d') => {
  try {
    let query = supabase
      .from('deals')
      .select(`
        id,
        title,
        click_count,
        conversion_count,
        created_at,
        start_date,
        end_date
      `);

    if (dealId) {
      query = query.eq('id', dealId);
    }
    
    const { data, error } = await query.order('created_at', { ascending: false });
    
    if (error) throw error;
    
    // Calculate additional metrics
    const analyticsData = data.map(deal => ({
      ...deal,
      conversion_rate: deal.click_count > 0 ? (deal.conversion_count / deal.click_count * 100).toFixed(2) : 0,
      days_active: calculateDaysActive(deal.start_date, deal.end_date),
      days_remaining: calculateDaysRemaining(deal.end_date),
      performance_score: calculatePerformanceScore(deal)
    }));
    
    return analyticsData;
  } catch (error) {
    console.error('Error fetching deal analytics:', error);
    throw error;
  }
};

// Get overall deals performance summary
export const getDealsPerformanceSummary = async () => {
  try {
    const { data, error } = await supabase
      .from('deals')
      .select(`
        click_count,
        conversion_count
      `)
      .eq('is_active', true);
    
    if (error) throw error;
    
    // Calculate summary metrics
    const totalClicks = data.reduce((sum, deal) => sum + (deal.click_count || 0), 0);
    const totalConversions = data.reduce((sum, deal) => sum + (deal.conversion_count || 0), 0);
    const totalDeals = data.length;
    const avgConversionRate = totalClicks > 0 ? ((totalConversions / totalClicks) * 100).toFixed(2) : 0;
    
    return {
      totalClicks,
      totalConversions,
      totalDeals,
      avgConversionRate
    };
  } catch (error) {
    console.error('Error fetching deals performance summary:', error);
    throw error;
  }
};

// Get top performing deals
export const getTopPerformingDeals = async (limit = 5) => {
  try {
    const { data, error } = await supabase
      .from('deals')
      .select(`
        id,
        title,
        click_count,
        conversion_count,
        conversion_rate:conversion_count
      `)
      .eq('is_active', true)
      .order('conversion_count', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    
    // Calculate conversion rate
    const topDeals = data.map(deal => ({
      ...deal,
      conversion_rate: deal.click_count > 0 ? (deal.conversion_count / deal.click_count * 100).toFixed(2) : 0
    }));
    
    return topDeals;
  } catch (error) {
    console.error('Error fetching top performing deals:', error);
    throw error;
  }
};

// Helper functions
const calculateDaysActive = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end - start);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

const calculateDaysRemaining = (endDate) => {
  const end = new Date(endDate);
  const now = new Date();
  const diffTime = end - now;
  return diffTime > 0 ? Math.ceil(diffTime / (1000 * 60 * 60 * 24)) : 0;
};

const calculatePerformanceScore = (deal) => {
  // Simple performance score based on clicks and conversions
  const clickScore = deal.click_count || 0;
  const conversionScore = (deal.conversion_count || 0) * 10;
  const daysRemaining = calculateDaysRemaining(deal.end_date);
  
  // Boost score for deals with more time remaining
  const timeBonus = daysRemaining > 0 ? Math.log(daysRemaining + 1) : 0;
  
  return Math.round((clickScore + conversionScore) * (1 + timeBonus));
};
