-- =====================================================
-- ADD PERMISSIVE SELECT RLS POLICY TO CUSTOMERS
-- =====================================================

-- First, ensure RLS is enabled on the customers table
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

-- Drop any existing select policy to avoid conflicts
DROP POLICY IF EXISTS "Allow authenticated users to read all customers" ON public.customers;

-- Create a new policy that allows any authenticated user to read all customer records.
-- This is for debugging purposes. We can create a more restrictive policy later.
CREATE POLICY "Allow authenticated users to read all customers"
ON public.customers
FOR SELECT
USING (auth.role() = 'authenticated');
