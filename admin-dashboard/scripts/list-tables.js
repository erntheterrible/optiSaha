const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function listTables() {
  try {
    const { data, error } = await supabase
      .rpc('get_tables');
    
    if (error) throw error;
    console.log('Tables in database:');
    console.log(data);
  } catch (error) {
    console.error('Error listing tables:', error);
  }
}

listTables();
