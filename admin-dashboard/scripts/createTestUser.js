const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Initialize Supabase client
const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL || 'https://zsxiehzfwfrsmujhcsat.supabase.co',
  process.env.REACT_APP_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpzeGllaHpmd2Zyc211amhjc2F0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM5NjI0OTIsImV4cCI6MjA2OTUzODQ5Mn0.YIhZU2XBnHLrEMbZKGrQe2cuadLWVdXUj2Z3pj7tVh8'
);

async function createTestUser() {
  const email = 'test@example.com';
  const password = 'Test123!';
  const fullName = 'Test User';

  console.log('Creating test user...');
  
  try {
    // Try to sign up a new user
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          username: email.split('@')[0]
        }
      }
    });

    if (error) {
      // If user already exists, sign in to get the user
      if (error.message.includes('already registered')) {
        console.log('User already exists, signing in...');
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (signInError) throw signInError;
        
        console.log('Successfully signed in existing user:');
        console.log('Email:', signInData.user.email);
        console.log('ID:', signInData.user.id);
        return;
      }
      throw error;
    }

    console.log('Test user created successfully!');
    console.log('Email:', data.user.email);
    console.log('ID:', data.user.id);
    console.log('Please check your email to verify your account.');
    
  } catch (error) {
    console.error('Error creating test user:', error.message);
    console.log('Make sure the Supabase URL and anon key are correct.');
  }
}

createTestUser();
