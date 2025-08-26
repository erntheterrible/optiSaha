-- =====================================================
-- UPDATE CUSTOMER TABLE TO ADD MISSING COLUMNS
-- =====================================================

-- Add missing columns to customer table
ALTER TABLE customers ADD COLUMN IF NOT EXISTS email VARCHAR(255);
ALTER TABLE customers ADD COLUMN IF NOT EXISTS phone VARCHAR(50);
ALTER TABLE customers ADD COLUMN IF NOT EXISTS industry VARCHAR(100);
ALTER TABLE customers ADD COLUMN IF NOT EXISTS tier VARCHAR(20);
ALTER TABLE customers ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS city VARCHAR(100);
ALTER TABLE customers ADD COLUMN IF NOT EXISTS country VARCHAR(100);
ALTER TABLE customers ADD COLUMN IF NOT EXISTS website VARCHAR(255);
ALTER TABLE customers ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP;

-- Update existing sample data with comprehensive information
UPDATE customers SET 
  email = CASE 
    WHEN name = 'ABC Corporation' THEN 'contact@abccorp.com'
    WHEN name = 'XYZ Logistics' THEN 'info@xyzlogistics.com'
    WHEN name = 'DEF Manufacturing' THEN 'maintenance@defmanufacturing.com'
    WHEN name = 'GHI Retail' THEN 'projects@ghiretail.com'
    ELSE email
  END,
  phone = CASE 
    WHEN name = 'ABC Corporation' THEN '+905551234571'
    WHEN name = 'XYZ Logistics' THEN '+905551234572'
    WHEN name = 'DEF Manufacturing' THEN '+905551234573'
    WHEN name = 'GHI Retail' THEN '+905551234574'
    ELSE phone
  END,
  industry = CASE 
    WHEN name = 'ABC Corporation' THEN 'Technology'
    WHEN name = 'XYZ Logistics' THEN 'Transportation'
    WHEN name = 'DEF Manufacturing' THEN 'Manufacturing'
    WHEN name = 'GHI Retail' THEN 'Retail'
    ELSE industry
  END,
  tier = CASE 
    WHEN name = 'ABC Corporation' THEN 'A'
    WHEN name = 'XYZ Logistics' THEN 'B'
    WHEN name = 'DEF Manufacturing' THEN 'A'
    WHEN name = 'GHI Retail' THEN 'B'
    ELSE tier
  END,
  status = 'Active',
  address = CASE 
    WHEN name = 'ABC Corporation' THEN 'Maslak Business Center'
    WHEN name = 'XYZ Logistics' THEN 'Logistics Park'
    WHEN name = 'DEF Manufacturing' THEN 'Industrial Zone'
    WHEN name = 'GHI Retail' THEN 'Shopping Mall'
    ELSE address
  END,
  city = CASE 
    WHEN name = 'ABC Corporation' THEN 'Istanbul'
    WHEN name = 'XYZ Logistics' THEN 'Ankara'
    WHEN name = 'DEF Manufacturing' THEN 'Izmir'
    WHEN name = 'GHI Retail' THEN 'Bursa'
    ELSE city
  END,
  country = CASE 
    WHEN name = 'ABC Corporation' THEN 'Turkey'
    WHEN name = 'XYZ Logistics' THEN 'Turkey'
    WHEN name = 'DEF Manufacturing' THEN 'Turkey'
    WHEN name = 'GHI Retail' THEN 'Turkey'
    ELSE country
  END,
  website = CASE 
    WHEN name = 'ABC Corporation' THEN 'https://www.abccorp.com'
    WHEN name = 'XYZ Logistics' THEN 'https://www.xyzlogistics.com'
    WHEN name = 'DEF Manufacturing' THEN 'https://www.defmanufacturing.com'
    WHEN name = 'GHI Retail' THEN 'https://www.ghiretail.com'
    ELSE website
  END,
  updated_at = CURRENT_TIMESTAMP;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);
CREATE INDEX IF NOT EXISTS idx_customers_tier ON customers(tier);
CREATE INDEX IF NOT EXISTS idx_customers_country ON customers(country);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_customers_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_customers_updated_at') THEN
        CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION update_customers_updated_at_column();
    END IF;
END$$;

-- Insert additional sample customers if the table is empty
INSERT INTO customers (name, email, phone, industry, segment, tier, status, address, city, country, website, user_id) 
SELECT 'ABC Corporation', 'contact@abccorp.com', '+905551234571', 'Technology', 'Enterprise', 'A', 'Active', 'Maslak Business Center', 'Istanbul', 'Turkey', 'https://www.abccorp.com', '550e8400-e29b-41d4-a716-446655440001'
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE name = 'ABC Corporation');

INSERT INTO customers (name, email, phone, industry, segment, tier, status, address, city, country, website, user_id) 
SELECT 'XYZ Logistics', 'info@xyzlogistics.com', '+905551234572', 'Transportation', 'SMB', 'B', 'Active', 'Logistics Park', 'Ankara', 'Turkey', 'https://www.xyzlogistics.com', '550e8400-e29b-41d4-a716-446655440001'
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE name = 'XYZ Logistics');

INSERT INTO customers (name, email, phone, industry, segment, tier, status, address, city, country, website, user_id) 
SELECT 'DEF Manufacturing', 'maintenance@defmanufacturing.com', '+905551234573', 'Manufacturing', 'Enterprise', 'A', 'Active', 'Industrial Zone', 'Izmir', 'Turkey', 'https://www.defmanufacturing.com', '550e8400-e29b-41d4-a716-446655440001'
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE name = 'DEF Manufacturing');

INSERT INTO customers (name, email, phone, industry, segment, tier, status, address, city, country, website, user_id) 
SELECT 'GHI Retail', 'projects@ghiretail.com', '+905551234574', 'Retail', 'SMB', 'B', 'Active', 'Shopping Mall', 'Bursa', 'Turkey', 'https://www.ghiretail.com', '550e8400-e29b-41d4-a716-446655440001'
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE name = 'GHI Retail');

-- Insert more sample customers for a comprehensive dataset
INSERT INTO customers (name, email, phone, industry, segment, tier, status, address, city, country, website, user_id) 
SELECT 'Tech Innovations Ltd', 'info@techinnovations.com', '+905551234575', 'Information Technology', 'Enterprise', 'A', 'Active', 'Cyberport', 'Istanbul', 'Turkey', 'https://www.techinnovations.com', '550e8400-e29b-41d4-a716-446655440001'
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE name = 'Tech Innovations Ltd');

INSERT INTO customers (name, email, phone, industry, segment, tier, status, address, city, country, website, user_id) 
SELECT 'Global Trade Partners', 'contact@globaltrade.com', '+905551234576', 'Import/Export', 'Enterprise', 'A', 'Active', 'Free Zone', 'Izmir', 'Turkey', 'https://www.globaltrade.com', '550e8400-e29b-41d4-a716-446655440001'
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE name = 'Global Trade Partners');

INSERT INTO customers (name, email, phone, industry, segment, tier, status, address, city, country, website, user_id) 
SELECT 'Local Cafe & Bakery', 'hello@localcafe.com', '+905551234577', 'Food & Beverage', 'SMB', 'C', 'Active', 'Main Street 123', 'Ankara', 'Turkey', 'https://www.localcafe.com', '550e8400-e29b-41d4-a716-446655440001'
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE name = 'Local Cafe & Bakery');

-- Update customerService to use the correct table name and columns
