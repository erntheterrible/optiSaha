import { createClient } from '@supabase/supabase-js';

// These will be set in your .env file
const supabaseUrl = 'https://zsxiehzfwfrsmujhcsat.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpzeGllaHpmd2Zyc211amhjc2F0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM5NjI0OTIsImV4cCI6MjA2OTUzODQ5Mn0.YIhZU2XBnHLrEMbZKGrQe2cuadLWVdXUj2Z3pj7tVh8';

// Create and export the supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

// Helper function to get the current user
export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) throw error;
  return user;
};

// Helper function to get the current session
export const getSession = async () => {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) throw error;
  return session;
};
