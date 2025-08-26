import databaseService from './databaseService';
import { supabase } from '../lib/supabaseClient';

const dashboardService = {
  // Get dashboard KPIs and stats
  async getKPIs() {
    try {
      // First, get the current user's session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        console.error('No active session:', sessionError?.message || 'No session found');
        throw new Error('Authentication required');
      }

      // Get counts using direct Supabase queries with better error handling
      const [
        projectsResult,
        completedProjectsResult,
        usersResult,
        leadsResult,
        convertedLeadsResult
      ] = await Promise.all([
        // Only fetch projects the user has access to
        supabase.rpc('get_accessible_projects_count', { user_id: session.user.id }),
        supabase.rpc('get_accessible_projects_count', { 
          user_id: session.user.id,
          status_filter: 'completed' 
        }),
        // Only admins can see all users
        session.user.user_metadata?.role === 'admin' 
          ? supabase.from('users').select('*', { count: 'exact', head: true })
          : { count: 0, error: null }, // Non-admins get 0 for user count
        // Only fetch leads the user has access to
        supabase.rpc('get_accessible_leads_count', { user_id: session.user.id }),
        supabase.rpc('get_accessible_leads_count', { 
          user_id: session.user.id,
          status_filter: 'completed' 
        })
      ]);

      // Check for errors in any of the queries
      const errors = [
        projectsResult.error,
        completedProjectsResult.error,
        usersResult.error,
        leadsResult.error,
        convertedLeadsResult.error
      ].filter(Boolean);

      if (errors.length > 0) {
        console.error('Errors in KPI queries:', errors);
        throw new Error(`Failed to fetch KPI data: ${errors.map(e => e.message).join('; ')}`);
      }

      // Extract counts from results
      const totalProjects = projectsResult.count || 0;
      const completedProjects = completedProjectsResult.count || 0;
      const totalUsers = usersResult.count || 0;
      const totalLeads = leadsResult.count || 0;
      const convertedLeads = convertedLeadsResult.count || 0;

      // Get new users from the last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      let newUsers = 0;
      try {
        console.log('Fetching new users since:', thirtyDaysAgo.toISOString());
        
        // First, let's check if we can access the users table at all
        const { data: testUsers, error: testError } = await supabase
          .from('users')
          .select('id')
          .limit(1);
          
        console.log('Test users query:', { data: testUsers, error: testError });
        
        if (testError) {
          console.error('Test query failed:', testError);
          throw testError;
        }
        
        // If test query passed, try the actual count
        const { count, error } = await supabase
          .from('users')
          .select('id', { count: 'exact', head: true })
          .gte('created_at', thirtyDaysAgo.toISOString());
          
        console.log('New users count response:', { count, error });
        
        if (error) throw error;
        
        newUsers = count || 0;
        console.log('New users count:', newUsers);
        
      } catch (error) {
        console.error('Error in getKPIs - new users count:', {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint,
          status: error.status,
          statusText: error.statusText
        });
        // Don't throw the error, just return 0 for new users
        newUsers = 0;
      }

      // Get active visits (events happening today)
      const today = new Date();
      const startOfDay = new Date(today);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(today);
      endOfDay.setHours(23, 59, 59, 999);
      
      const { data: activeVisitsData, error: activeVisitsError } = await supabase
        .from('events')
        .select('*', { count: 'exact', head: true })
        .gte('start_time', startOfDay.toISOString())
        .lte('start_time', endOfDay.toISOString());

      if (activeVisitsError) {
        console.error('Error fetching active visits:', activeVisitsError);
        throw new Error(`Failed to fetch active visits: ${activeVisitsError.message}`);
      }
      const activeVisits = activeVisitsData?.length || 0;

      // Calculate average visit duration (placeholder - adjust based on actual data)
      const avgVisitDuration = 30; // minutes

      return {
        total_projects: totalProjects || 0,
        completed_projects: completedProjects || 0,
        active_visits: activeVisits || 0,
        total_revenue: 0, // Removed as revenue column doesn't exist
        avg_visit_duration: avgVisitDuration,
        total_users: totalUsers || 0,
        new_users: newUsers || 0,
        total_leads: totalLeads || 0,
        converted_leads: convertedLeads || 0
      };
    } catch (error) {
      console.error('Error fetching dashboard KPIs:', error);
      throw error;
    }
  },

  // Get sales trend data (using project count instead of revenue)
  async getSalesTrend(timeRange = 'week') {
    try {
      // Calculate date range based on timeRange
      const now = new Date();
      const startDate = new Date(now.getTime()); // Create a copy

      switch (timeRange) {
        case 'week':
          startDate.setDate(startDate.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(startDate.getMonth() - 1);
          break;
        case 'year':
          startDate.setFullYear(startDate.getFullYear() - 1);
          break;
        default:
          startDate.setDate(startDate.getDate() - 7); // Default to 'week'
      }
      
      // Query projects created in the date range
      const { data, error } = await supabase
        .from('projects')
        .select('created_at')
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      
      // Format data for the chart
      const groupedData = data.reduce((acc, project) => {
        const date = new Date(project.created_at).toISOString().split('T')[0];
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      }, {});
      
      return Object.entries(groupedData).map(([date, count]) => ({
        date,
        count
      }));
    } catch (error) {
      console.error('Error fetching sales trend:', error);
      return [];
    }
  },

  // Get project distribution by status
  async getRevenueDistribution() {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('status, count(*)')
        .group('status');
      
      if (error) throw error;
      
      return data.map(item => ({
        status: item.status,
        count: item.count
      }));
    } catch (error) {
      console.error('Error fetching project status distribution:', error);
      return [];
    }
  },

  // Get team performance (project count instead of revenue)
  async getTeamPerformance() {
    try {
      // First get all users with their assigned projects
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('id, full_name, avatar_url');
      
      if (usersError) throw usersError;
      
      // Then get project counts per user
      const { data: projects, error: projectsError } = await supabase
        .from('projects')
        .select('assigned_to, status');
      
      if (projectsError) throw projectsError;
      
      // Calculate metrics for each user
      return users.map(user => {
        const userProjects = projects.filter(p => p.assigned_to === user.id);
        const completedProjects = userProjects.filter(p => p.status === 'completed').length;
        
        return {
          id: user.id,
          name: user.full_name || `User ${user.id}`,
          avatar: user.avatar_url || '',
          projectCount: userProjects.length,
          completedProjects: completedProjects,
          rating: 0 // Not currently tracked in the database
        };
      });
    } catch (error) {
      console.error('Error fetching team performance:', error);
      return [];
    }
  },

  // Get recent activities
  async getRecentActivities(limit = 5) {
    try {
      return await databaseService.getRecentActivities(limit);
    } catch (error) {
      console.error('Error fetching recent activities:', error);
      throw error;
    }
  },

  // Get project status summary
  async getProjectStatusSummary() {
    try {
      // First get all projects
      const { data: projects, error } = await supabase
        .from('projects')
        .select('status');
      
      if (error) throw error;
      
      // Manually group and count by status
      const statusCounts = {};
      projects.forEach(project => {
        const status = project.status || 'No Status';
        statusCounts[status] = (statusCounts[status] || 0) + 1;
      });
      
      // Convert to array of { status, count } objects
      return Object.entries(statusCounts).map(([status, count]) => ({
        status,
        count
      }));
    } catch (error) {
      console.error('Error fetching project status summary:', error);
      throw error;
    }
  },

  /**
   * Fetch the dashboard layout for a given user and role from Supabase
   * @param {string} userId
   * @param {string} role
   * @returns {Promise<object|null>} layout object or null if not found
   */
  async getDashboardLayout(userId, role) {
    const { data, error } = await supabase
      .from('dashboard_layouts')
      .select('layout')
      .eq('user_id', userId)
      .eq('role', role)
      .single();
    if (error && error.code !== 'PGRST116') { // PGRST116: No rows found
      console.error('Error fetching dashboard layout:', error);
      return null;
    }
    return data?.layout || null;
  },

  /**
   * Save (upsert) the dashboard layout for a given user and role to Supabase
   * @param {string} userId
   * @param {string} role
   * @param {object} layout
   * @returns {Promise<boolean>} success
   */
  async saveDashboardLayout(userId, role, layout) {
    const { error } = await supabase
      .from('dashboard_layouts')
      .upsert([
        {
          user_id: userId,
          role,
          layout,
          updated_at: new Date().toISOString(),
        },
      ], { onConflict: ['user_id', 'role'] });
    if (error) {
      console.error('Error saving dashboard layout:', error);
      return false;
    }
    return true;
  },

};

export default dashboardService;
