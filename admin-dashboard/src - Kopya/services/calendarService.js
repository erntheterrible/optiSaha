import { supabase } from '@/lib/supabaseClient';

/**
 * Get events within a date range
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @param {string} userId - Optional user ID to filter events
 */
export const getEvents = async (startDate, endDate, userId = null) => {
  let query = supabase
    .from('events')
    .select(`
      *,
      created_by_user:created_by(id, full_name, email),
      attendees:event_attendees(
        user:user_id(id, full_name, email, avatar_url)
      )
    `)
    .gte('start_time', startDate.toISOString())
    .lte('end_time', endDate.toISOString())
    .order('start_time', { ascending: true });

  // Filter by user if specified
  if (userId) {
    query = query.or(`created_by.eq.${userId},attendees.user_id.eq.${userId}`);
  }

  const { data, error } = await query;
  if (error) throw error;
  
  return data;
};

/**
 * Get a single event by ID
 * @param {number} eventId - The ID of the event
 */
export const getEventById = async (eventId) => {
  const { data, error } = await supabase
    .from('events')
    .select(`
      *,
      created_by_user:created_by(id, full_name, email),
      attendees:event_attendees(
        user:user_id(id, full_name, email, avatar_url, response_status)
      )
    `)
    .eq('id', eventId)
    .single();
    
  if (error) throw error;
  return data;
};

/**
 * Create a new event
 * @param {object} eventData - The event data
 * @param {string} eventData.title - Event title
 * @param {string} eventData.description - Event description
 * @param {Date} eventData.start_time - Start time
 * @param {Date} eventData.end_time - End time
 * @param {string} eventData.location - Event location
 * @param {string} eventData.event_type - Type of event
 * @param {string} eventData.status - Event status
 * @param {Array<string>} attendeeIds - Array of user IDs to invite
 */
export const createEvent = async (eventData, attendeeIds = []) => {
  // Get current user
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    throw new Error('User not authenticated');
  }
  
  // Start a transaction
  const { data: event, error: eventError } = await supabase
    .from('events')
    .insert([{
      ...eventData,
      created_by: user.id,
      all_day: eventData.all_day || false,
    }])
    .select()
    .single();
    
  if (eventError) {
    console.error('Event creation error:', eventError);
    throw new Error(`Failed to create event: ${eventError.message}`);
  }
  
  // Add attendees if any
  if (attendeeIds.length > 0) {
    const attendees = attendeeIds.map(userId => ({
      event_id: event.id,
      user_id: userId,
      response_status: userId === user.id ? 'accepted' : 'pending'
    }));
    
    const { error: attendeeError } = await supabase
      .from('event_attendees')
      .insert(attendees);
      
    if (attendeeError) {
      console.error('Attendee creation error:', attendeeError);
      throw new Error(`Failed to add attendees: ${attendeeError.message}`);
    }
  }
  
  // Return the full event with attendees
  return getEventById(event.id);
};

/**
 * Update an existing event
 * @param {number} eventId - The ID of the event to update
 * @param {object} updates - The fields to update
 * @param {Array<string>} [newAttendeeIds] - Optional new list of attendee IDs
 */
export const updateEvent = async (eventId, updates, newAttendeeIds) => {
  // Update the event
  const { data: event, error: eventError } = await supabase
    .from('events')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', eventId)
    .select()
    .single();
    
  if (eventError) throw eventError;
  
  // Update attendees if provided
  if (Array.isArray(newAttendeeIds)) {
    // First, get current attendees
    const { data: currentAttendees, error: fetchError } = await supabase
      .from('event_attendees')
      .select('user_id')
      .eq('event_id', eventId);
      
    if (fetchError) throw fetchError;
    
    const currentAttendeeIds = currentAttendees.map(a => a.user_id);
    
    // Determine attendees to add and remove
    const attendeesToAdd = newAttendeeIds.filter(id => !currentAttendeeIds.includes(id));
    const attendeesToRemove = currentAttendeeIds.filter(id => !newAttendeeIds.includes(id));
    
    // Add new attendees
    if (attendeesToAdd.length > 0) {
      const newAttendees = attendeesToAdd.map(userId => ({
        event_id: eventId,
        user_id: userId,
        response_status: 'pending'
      }));
      
      const { error: addError } = await supabase
        .from('event_attendees')
        .insert(newAttendees);
        
      if (addError) throw addError;
    }
    
    // Remove attendees
    if (attendeesToRemove.length > 0) {
      const { error: removeError } = await supabase
        .from('event_attendees')
        .delete()
        .eq('event_id', eventId)
        .in('user_id', attendeesToRemove);
        
      if (removeError) throw removeError;
    }
  }
  
  // Return the full updated event
  return getEventById(eventId);
};

/**
 * Delete an event
 * @param {number} eventId - The ID of the event to delete
 */
export const deleteEvent = async (eventId) => {
  // Delete attendees first (due to foreign key constraint)
  const { error: attendeeError } = await supabase
    .from('event_attendees')
    .delete()
    .eq('event_id', eventId);
    
  if (attendeeError) throw attendeeError;
  
  // Then delete the event
  const { error: eventError } = await supabase
    .from('events')
    .delete()
    .eq('id', eventId);
    
  if (eventError) throw eventError;
  
  return true;
};

/**
 * Update attendee response status
 * @param {number} eventId - The ID of the event
 * @param {string} userId - The ID of the user
 * @param {string} status - The response status ('pending', 'accepted', 'declined', 'tentative')
 */
export const updateAttendeeStatus = async (eventId, userId, status) => {
  const { data, error } = await supabase
    .from('event_attendees')
    .update({ response_status: status })
    .eq('event_id', eventId)
    .eq('user_id', userId)
    .select()
    .single();
    
  if (error) throw error;
  return data;
};
