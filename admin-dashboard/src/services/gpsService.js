import supabase from '../config/supabase';

export const gpsService = {
  async getGpsLogs(startDate, endDate) {
    const { data, error } = await supabase
      .from('gps_logs')
      .select('*')
      .gte('timestamp', startDate)
      .lte('timestamp', endDate)
      .order('timestamp', { ascending: true });

    if (error) throw error;
    return data;
  },

  async getEntryExitEvents(regionId, startDate, endDate) {
    const { data, error } = await supabase
      .from('region_events')
      .select(`
        *,
        users:user_id (
          id,
          name,
          avatar
        )
      `)
      .eq('region_id', regionId)
      .gte('timestamp', startDate)
      .lte('timestamp', endDate)
      .order('timestamp', { ascending: true });

    if (error) throw error;
    return data;
  },

  async getRegionAnalytics(regionId, startDate, endDate) {
    const { data, error } = await supabase
      .from('region_analytics')
      .select(`
        region_id,
        total_visits,
        unique_visitors,
        avg_duration,
        peak_hours,
        heatmap_data
      `)
      .eq('region_id', regionId)
      .gte('date', startDate)
      .lte('date', endDate)
      .single();

    if (error) throw error;
    return data;
  },

  async getLiveUserLocations() {
    const { data, error } = await supabase
      .from('user_locations')
      .select(`
        *,
        users:user_id (
          id,
          name,
          avatar
        )
      `)
      .eq('is_online', true)
      .order('last_update', { ascending: false });

    if (error) throw error;
    return data;
  }
};

export default gpsService;
