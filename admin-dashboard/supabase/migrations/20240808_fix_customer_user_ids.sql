-- =====================================================
-- FIX CUSTOMER USER IDs FOR TESTING
-- =====================================================

-- For testing purposes, we'll assign all existing customers to the first user in the system
-- This is a temporary solution for development/testing environments

-- First, let's get the first user ID from the users table
-- Then update all customers to belong to that user

DO $$
DECLARE
    first_user_id UUID;
BEGIN
    -- Get the first user ID
    SELECT id INTO first_user_id FROM users LIMIT 1;
    
    -- If we found a user, update all customers to belong to that user
    IF first_user_id IS NOT NULL THEN
        UPDATE customers SET user_id = first_user_id WHERE user_id IS NULL OR user_id != first_user_id;
        RAISE NOTICE 'Updated customer user_ids to %', first_user_id;
    ELSE
        RAISE NOTICE 'No users found in the database';
    END IF;
END $$;

-- Alternative approach: If you want to temporarily disable RLS for testing
-- Uncomment the following lines to disable RLS on customers table
-- ALTER TABLE customers DISABLE ROW LEVEL SECURITY;

-- To re-enable RLS later, you can use:
-- ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
