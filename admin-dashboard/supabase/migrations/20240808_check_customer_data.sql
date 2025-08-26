-- =====================================================
-- CHECK CUSTOMER DATA
-- =====================================================

-- Check if there are any customers in the database
SELECT COUNT(*) as customer_count FROM customers;

-- Check if there are any users in the database
SELECT COUNT(*) as user_count FROM users;

-- Check the first few customers
SELECT id, name, user_id FROM customers LIMIT 5;

-- Check the first few users
SELECT id, email FROM users LIMIT 5;
