const { supabase } = require('./src/lib/supabaseClient');

async function testFunctions() {
  try {
    // First, get the current user's session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session) {
      console.error('No active session:', sessionError?.message || 'No session found');
      return;
    }
    
    console.log('Current user ID:', session.user.id);
    
    // Test get_accessible_projects_count function
    const projectsCountResult = await supabase.rpc('get_accessible_projects_count', { 
      status_filter: null, 
      user_id: session.user.id 
    });
    
    console.log('Projects count result:', projectsCountResult);
    
    // Test get_accessible_leads_count function
    const leadsCountResult = await supabase.rpc('get_accessible_leads_count', { 
      status_filter: null, 
      user_id: session.user.id 
    });
    
    console.log('Leads count result:', leadsCountResult);
    
  } catch (error) {
    console.error('Error testing RPC functions:', error);
  }
}

testFunctions();
