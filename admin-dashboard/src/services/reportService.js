import { supabase } from '../lib/supabaseClient';

const reportService = {
  /**
   * Fetches all report schedules for the current user
   * @returns {Promise<Array>} A promise that resolves to an array of report schedules
   */
  async getReportSchedules() {
    try {
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching report schedules:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error in getReportSchedules service:', error);
      throw error;
    }
  },

  /**
   * Creates a new report schedule
   * @param {Object} reportData - The report schedule data
   * @returns {Promise<Object>} A promise that resolves to the created report schedule
   */
  async createReportSchedule(reportData) {
    try {
      // Calculate next send time based on frequency and delivery time
      const nextSend = this.calculateNextSend(reportData.frequency, reportData.delivery_time);
      
      const { data, error } = await supabase
        .from('reports')
        .insert([
          {
            ...reportData,
            next_send: nextSend
          }
        ])
        .select()
        .single();

      if (error) {
        console.error('Error creating report schedule:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in createReportSchedule service:', error);
      throw error;
    }
  },

  /**
   * Updates an existing report schedule
   * @param {number} id - The ID of the report schedule to update
   * @param {Object} reportData - The updated report schedule data
   * @returns {Promise<Object>} A promise that resolves to the updated report schedule
   */
  async updateReportSchedule(id, reportData) {
    try {
      // If frequency or delivery_time is updated, recalculate next_send
      let updateData = { ...reportData };
      if (reportData.frequency || reportData.delivery_time) {
        const frequency = reportData.frequency || (await this.getReportScheduleById(id)).frequency;
        const deliveryTime = reportData.delivery_time || (await this.getReportScheduleById(id)).delivery_time;
        updateData.next_send = this.calculateNextSend(frequency, deliveryTime);
      }
      
      const { data, error } = await supabase
        .from('reports')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating report schedule:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in updateReportSchedule service:', error);
      throw error;
    }
  },

  /**
   * Deletes a report schedule
   * @param {number} id - The ID of the report schedule to delete
   * @returns {Promise<Object>} A promise that resolves to the deleted report schedule
   */
  async deleteReportSchedule(id) {
    try {
      const { data, error } = await supabase
        .from('reports')
        .delete()
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error deleting report schedule:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in deleteReportSchedule service:', error);
      throw error;
    }
  },

  /**
   * Gets a single report schedule by ID
   * @param {number} id - The ID of the report schedule to retrieve
   * @returns {Promise<Object>} A promise that resolves to the report schedule
   */
  async getReportScheduleById(id) {
    try {
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching report schedule:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in getReportScheduleById service:', error);
      throw error;
    }
  },

  /**
   * Manually triggers a report to be sent now
   * @param {number} id - The ID of the report schedule to trigger
   * @returns {Promise<Object>} A promise that resolves to the updated report schedule
   */
  async triggerReportNow(id) {
    try {
      // First, get the current report data
      const { data: currentData, error: fetchError } = await supabase
        .from('reports')
        .select('frequency, delivery_time')
        .eq('id', id)
        .single();

      if (fetchError) {
        console.error('Error fetching report data:', fetchError);
        throw fetchError;
      }

      // In a real implementation, this would call a backend function
      // For now, we'll just update the last_sent timestamp
      const { data, error } = await supabase
        .from('reports')
        .update({
          last_sent: new Date().toISOString(),
          next_send: this.calculateNextSendFromLastSent(currentData?.frequency || 'daily', currentData?.delivery_time || '09:00:00')
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error triggering report:', error);
        throw error;
      }

      // In a real implementation, you would also call a backend function
      // to generate and send the actual report
      console.log(`Report ${id} triggered manually`);

      return data;
    } catch (error) {
      console.error('Error in triggerReportNow service:', error);
      throw error;
    }
  },

  /**
   * Generates a report instantly for immediate review
   * @param {Object} reportParams - The parameters for the report to generate
   * @param {string} reportParams.type - The type of report (sales, leads, activity)
   * @param {string} reportParams.format - The format of the report (pdf, csv, html)
   * @param {Date} reportParams.dateRangeStart - Start date for the report
   * @param {Date} reportParams.dateRangeEnd - End date for the report
   * @returns {Promise<Object>} A promise that resolves to the generated report data
   */
  async generateReportInstantly(reportParams) {
    try {
      console.log('Generating instant report with params:', reportParams);
      
      // Fetch actual data based on report type
      let reportData = {};
      
      switch (reportParams.type) {
        case 'sales':
          // Fetch sales-related data
          const { data: projects, error: projectsError } = await supabase
            .from('projects')
            .select('id, name, created_at, revenue, status')
            .gte('created_at', reportParams.dateRangeStart)
            .lte('created_at', reportParams.dateRangeEnd || new Date().toISOString());
          
          if (projectsError) throw projectsError;
          
          // Calculate sales metrics
          const totalRevenue = projects.reduce((sum, project) => sum + (project.revenue || 0), 0);
          const completedProjects = projects.filter(p => p.status === 'completed').length;
          const totalProjects = projects.length;
          
          reportData = {
            id: Date.now(),
            name: `Sales Report - ${new Date().toLocaleDateString()}`,
            type: 'sales',
            format: reportParams.format,
            generated_at: new Date().toISOString(),
            date_range_start: reportParams.dateRangeStart,
            date_range_end: reportParams.dateRangeEnd,
            data: {
              summary: `Sales report for ${reportParams.dateRangeStart} to ${reportParams.dateRangeEnd || 'now'}`,
              metrics: [
                { name: 'Total Projects', value: totalProjects },
                { name: 'Completed Projects', value: completedProjects },
                { name: 'Total Revenue', value: totalRevenue, format: 'currency' },
                { name: 'Average Project Value', value: totalProjects > 0 ? Math.round(totalRevenue / totalProjects) : 0, format: 'currency' }
              ],
              projects: projects
            }
          };
          break;
          
        case 'leads':
          // Fetch leads data
          const { data: leads, error: leadsError } = await supabase
            .from('leads')
            .select('id, name, email, phone, status, created_at, source')
            .gte('created_at', reportParams.dateRangeStart)
            .lte('created_at', reportParams.dateRangeEnd || new Date().toISOString());
          
          if (leadsError) throw leadsError;
          
          // Calculate leads metrics
          const totalLeads = leads.length;
          const convertedLeads = leads.filter(l => l.status === 'converted').length;
          const conversionRate = totalLeads > 0 ? Math.round((convertedLeads / totalLeads) * 100) : 0;
          
          // Group by source
          const sourceCounts = {};
          leads.forEach(lead => {
            const source = lead.source || 'Unknown';
            sourceCounts[source] = (sourceCounts[source] || 0) + 1;
          });
          
          reportData = {
            id: Date.now(),
            name: `Leads Report - ${new Date().toLocaleDateString()}`,
            type: 'leads',
            format: reportParams.format,
            generated_at: new Date().toISOString(),
            date_range_start: reportParams.dateRangeStart,
            date_range_end: reportParams.dateRangeEnd,
            data: {
              summary: `Leads report for ${reportParams.dateRangeStart} to ${reportParams.dateRangeEnd || 'now'}`,
              metrics: [
                { name: 'Total Leads', value: totalLeads },
                { name: 'Converted Leads', value: convertedLeads },
                { name: 'Conversion Rate', value: `${conversionRate}%` }
              ],
              leads: leads,
              sourceDistribution: Object.keys(sourceCounts).map(source => ({
                source,
                count: sourceCounts[source]
              }))
            }
          };
          break;
          
        case 'activity':
        default:
          // Fetch activity data (visits)
          const { data: visits, error: visitsError } = await supabase
            .from('visits')
            .select('id, project_id, user_id, visit_type, status, scheduled_date, actual_start_time, actual_end_time, duration_minutes')
            .gte('scheduled_date', reportParams.dateRangeStart)
            .lte('scheduled_date', reportParams.dateRangeEnd || new Date().toISOString());
          
          if (visitsError) throw visitsError;
          
          // Calculate activity metrics
          const totalVisits = visits.length;
          const completedVisits = visits.filter(v => v.status === 'completed').length;
          const avgDuration = visits.reduce((sum, visit) => sum + (visit.duration_minutes || 0), 0) / Math.max(totalVisits, 1);
          
          reportData = {
            id: Date.now(),
            name: `Activity Report - ${new Date().toLocaleDateString()}`,
            type: 'activity',
            format: reportParams.format,
            generated_at: new Date().toISOString(),
            date_range_start: reportParams.dateRangeStart,
            date_range_end: reportParams.dateRangeEnd,
            data: {
              summary: `Activity report for ${reportParams.dateRangeStart} to ${reportParams.dateRangeEnd || 'now'}`,
              metrics: [
                { name: 'Total Visits', value: totalVisits },
                { name: 'Completed Visits', value: completedVisits },
                { name: 'Completion Rate', value: totalVisits > 0 ? `${Math.round((completedVisits / totalVisits) * 100)}%` : '0%' },
                { name: 'Average Duration', value: `${Math.round(avgDuration)} minutes` }
              ],
              visits: visits
            }
          };
          break;
      }
      
      console.log(`Instant report generated:`, reportData);
      return reportData;
    } catch (error) {
      console.error('Error generating instant report:', error);
      throw error;
    }
  },

  /**
   * Calculates the next send time based on frequency and delivery time
   * @param {string} frequency - daily, weekly, or monthly
   * @param {string} deliveryTime - Time in HH:MM:SS format
   * @returns {string} Next send timestamp in ISO format
   */
  calculateNextSend(frequency, deliveryTime) {
    const now = new Date();
    let nextSend = new Date();
    
    // Parse delivery time
    const [hours, minutes, seconds] = deliveryTime.split(':').map(Number);
    
    switch (frequency) {
      case 'daily':
        nextSend.setDate(now.getDate() + 1);
        break;
      case 'weekly':
        nextSend.setDate(now.getDate() + 7);
        break;
      case 'monthly':
        nextSend.setMonth(now.getMonth() + 1);
        break;
      default:
        nextSend.setDate(now.getDate() + 1);
    }
    
    nextSend.setHours(hours || 9, minutes || 0, seconds || 0, 0);
    
    return nextSend.toISOString();
  },

  /**
   * Calculates the next send time based on the last sent time
   * @param {string} frequency - daily, weekly, or monthly
   * @param {string} deliveryTime - Time in HH:MM:SS format
   * @returns {string} Next send timestamp in ISO format
   */
  calculateNextSendFromLastSent(frequency, deliveryTime) {
    const lastSent = new Date();
    let nextSend = new Date(lastSent);
    
    // Parse delivery time
    const [hours, minutes, seconds] = deliveryTime.split(':').map(Number);
    
    switch (frequency) {
      case 'daily':
        nextSend.setDate(lastSent.getDate() + 1);
        break;
      case 'weekly':
        nextSend.setDate(lastSent.getDate() + 7);
        break;
      case 'monthly':
        nextSend.setMonth(lastSent.getMonth() + 1);
        break;
      default:
        nextSend.setDate(lastSent.getDate() + 1);
    }
    
    nextSend.setHours(hours || 9, minutes || 0, seconds || 0, 0);
    
    return nextSend.toISOString();
  }
};

export default reportService;
