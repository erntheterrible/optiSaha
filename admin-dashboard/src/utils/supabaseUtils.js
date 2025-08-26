import { supabase } from '@/lib/supabaseClient';

/**
 * Handles Supabase errors consistently
 * @param {Error} error - The error object from Supabase
 * @param {string} context - Context where the error occurred
 * @throws {Error} Enhanced error with user-friendly message
 */
export const handleSupabaseError = (error, context = 'operation') => {
  console.error(`Supabase ${context} error:`, error);
  
  let userMessage = 'An error occurred';
  
  if (error.code) {
    switch (error.code) {
      case '23505': // Unique violation
        userMessage = 'This record already exists';
        break;
      case '42501': // Insufficient privilege
        userMessage = 'You do not have permission to perform this action';
        break;
      case '42P01': // Undefined table
        userMessage = 'Database configuration error';
        break;
      case 'PGRST301': // Missing authorization header
        userMessage = 'Authentication required';
        break;
      default:
        userMessage = error.message || 'Database operation failed';
    }
  }
  
  const enhancedError = new Error(userMessage);
  enhancedError.originalError = error;
  enhancedError.code = error.code;
  
  throw enhancedError;
};

/**
 * Uploads a file to Supabase Storage
 * @param {string} bucket - The storage bucket name
 * @param {string} path - The path within the bucket
 * @param {File} file - The file to upload
 * @returns {Promise<string>} The public URL of the uploaded file
 */
export const uploadFile = async (bucket, path, file) => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `${path}/${fileName}`;
    
    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, file);
      
    if (uploadError) throw uploadError;
    
    // Get the public URL
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);
      
    return publicUrl;
  } catch (error) {
    handleSupabaseError(error, 'file upload');
  }
};

/**
 * Deletes a file from Supabase Storage
 * @param {string} bucket - The storage bucket name
 * @param {string} filePath - The path to the file to delete
 */
export const deleteFile = async (bucket, filePath) => {
  try {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([filePath]);
      
    if (error) throw error;
    return true;
  } catch (error) {
    handleSupabaseError(error, 'file deletion');
  }
};

/**
 * Subscribes to real-time changes in a table
 * @param {string} table - The table to subscribe to
 * @param {string} event - The event type ('*', 'INSERT', 'UPDATE', 'DELETE')
 * @param {string} filter - Optional filter (e.g., 'id=eq.1')
 * @param {Function} callback - The callback function to execute on changes
 * @returns {object} The subscription object
 */
export const subscribeToTable = (table, event, filter, callback) => {
  let query = supabase
    .channel('db-changes')
    .on(
      'postgres_changes',
      {
        event: event,
        schema: 'public',
        table: table,
        filter: filter ? { filter } : undefined,
      },
      (payload) => callback(payload)
    )
    .subscribe();
    
  return query;
};

/**
 * Unsubscribes from real-time changes
 * @param {object} subscription - The subscription object to unsubscribe
 */
export const unsubscribeFromTable = (subscription) => {
  if (subscription) {
    supabase.removeChannel(subscription);
  }
};

/**
 * Formats a date for display
 * @param {string} dateString - The date string to format
 * @returns {string} Formatted date string
 */
export const formatDate = (dateString) => {
  if (!dateString) return '';
  
  const options = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  };
  
  return new Date(dateString).toLocaleDateString(undefined, options);
};

/**
 * Formats a date range for display
 * @param {string} startDate - The start date string
 * @param {string} endDate - The end date string
 * @returns {string} Formatted date range string
 */
export const formatDateRange = (startDate, endDate) => {
  if (!startDate || !endDate) return '';
  
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  const isSameDay = start.toDateString() === end.toDateString();
  
  const dateOptions = { year: 'numeric', month: 'short', day: 'numeric' };
  const timeOptions = { hour: '2-digit', minute: '2-digit' };
  
  if (isSameDay) {
    return `${start.toLocaleDateString(undefined, dateOptions)} • ${start.toLocaleTimeString(undefined, timeOptions)} - ${end.toLocaleTimeString(undefined, timeOptions)}`;
  }
  
  return `${start.toLocaleString(undefined, { ...dateOptions, ...timeOptions })} - ${end.toLocaleString(undefined, { ...dateOptions, ...timeOptions })}`;
};
