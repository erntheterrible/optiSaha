-- Test script for the fixed get_dashboard_stats function

-- First, let's check the current authenticated user
SELECT auth.uid() as current_user_id;

-- Check if there are any users in the database
SELECT id, email, role FROM users LIMIT 5;

-- Check sample data in projects table
SELECT id, name, status, assigned_to, created_by FROM projects LIMIT 5;

-- Check sample data in visits table
SELECT id, status, user_id FROM visits LIMIT 5;

-- Check sample data in leads table
SELECT id, name, status, assigned_to FROM leads LIMIT 5;

-- Test the fixed function (this will only work if you're authenticated)
-- SELECT get_dashboard_stats();

-- Test the function with a specific user ID (replace with an actual user ID from your database)
-- SELECT get_dashboard_stats('550e8400-e29b-41d4-a716-446655440002');

-- Check permissions
SELECT proname, proacl FROM pg_proc WHERE proname = 'get_dashboard_stats';
