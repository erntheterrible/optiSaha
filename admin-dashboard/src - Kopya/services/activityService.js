import { supabase } from '../lib/supabaseClient';

const activityService = {
  /**
   * Fetches all activities, optionally filtered by user ID.
   * Joins with the users table to get the full name of the user who performed the activity.
   * @param {string} [userId] - Optional ID of the user to filter activities by.
   * @returns {Promise<Array>} A promise that resolves to an array of activities.
   */
  async getActivities(filters = {}) {
    try {
      let query = supabase
        .from('activities')
        .select(`
          *,
          user:user_id (full_name)
        `)
        .order('created_at', { ascending: false });

      // Apply filters if they are provided
      if (filters.userId) {
        query = query.eq('user_id', filters.userId);
      }
      if (filters.action_type) {
        query = query.eq('action_type', filters.action_type);
      }
      if (filters.startDate) {
        query = query.gte('created_at', filters.startDate);
      }
      if (filters.endDate) {
        query = query.lte('created_at', filters.endDate);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching activities:', error);
        throw error;
      }

      // Transform data to match the expected format for the reports page
      return (data || []).map(activity => ({
        id: activity.id,
        title: activity.description,
        type: activity.action_type,
        status: 'completed', // Assuming all logged activities are 'completed'
        format: 'log', // Representing an activity log entry
        createdBy: activity.user?.full_name || 'System',
        createdAt: activity.created_at,
        size: activity.details ? JSON.stringify(activity.details).length / 1024 : 0, // Approximate size in KB
        description: `Entity: ${activity.entity_type}, ID: ${activity.entity_id}`,
        details: activity.details,
      }));
    } catch (error) {
      console.error('Error in getActivities service:', error);
      throw error;
    }
  },
};

export default activityService;
