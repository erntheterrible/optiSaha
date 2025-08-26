-- =====================================================
-- CHECK CUSTOMERS TABLE RLS POLICIES
-- =====================================================

-- Check if RLS is enabled on customers table
SELECT tablename, relrowsecurity, relforcerowsecurity 
FROM pg_class c 
JOIN pg_namespace n ON c.relnamespace = n.oid 
WHERE n.nspname = 'public' AND c.relname = 'customers';

-- Check RLS policies on customers table
SELECT *
FROM pg_policy pol
JOIN pg_class pc ON pc.oid = pol.polrelid
WHERE pc.relname = 'customers';

-- Check if current user can access customers
SELECT auth.uid();

-- Try to select from customers table with current user
SELECT COUNT(*) FROM customers;
