-- =====================================================
-- CHECK USER_ID MATCH BETWEEN SAMPLE DATA AND AUTHENTICATED USER
-- =====================================================

-- Get the authenticated user ID
SELECT auth.uid() as authenticated_user_id;

-- Check user_id in sample customers data
SELECT DISTINCT user_id FROM customers;

-- Check if authenticated user exists in users table
SELECT id, email FROM users WHERE id = (SELECT auth.uid());

-- Check all users in users table
SELECT id, email FROM users;
