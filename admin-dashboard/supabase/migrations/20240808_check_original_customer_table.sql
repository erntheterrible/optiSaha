-- =====================================================
-- CHECK ORIGINAL CUSTOMER TABLE
-- =====================================================

-- Check if the original customer table still exists
SELECT EXISTS (
   SELECT FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name = 'customer'
) as customer_table_exists;

-- Check if the customers table exists
SELECT EXISTS (
   SELECT FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name = 'customers'
) as customers_table_exists;

-- If customer table exists, check its data
SELECT COUNT(*) as original_customer_count FROM customer;

-- Check first few rows in original customer table
SELECT * FROM customer LIMIT 5;

-- If customers table exists, check its data
SELECT COUNT(*) as new_customers_count FROM customers;

-- Check first few rows in customers table
SELECT * FROM customers LIMIT 5;
