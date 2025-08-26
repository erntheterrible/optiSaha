-- =====================================================
-- CUSTOMER AND CONTACTS TABLES
-- =====================================================

-- Create customers table
CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    industry VARCHAR(100),
    segment VARCHAR(100),
    tier VARCHAR(20),
    status VARCHAR(50) DEFAULT 'Active',
    address TEXT,
    city VARCHAR(100),
    country VARCHAR(100),
    website VARCHAR(255),
    notes TEXT,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create contacts table
CREATE TABLE IF NOT EXISTS contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    position VARCHAR(100),
    department VARCHAR(100),
    is_primary BOOLEAN DEFAULT FALSE,
    notes TEXT,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_customers_user_id ON customers(user_id);
CREATE INDEX IF NOT EXISTS idx_customers_name ON customers(name);
CREATE INDEX IF NOT EXISTS idx_customers_industry ON customers(industry);
CREATE INDEX IF NOT EXISTS idx_customers_segment ON customers(segment);
CREATE INDEX IF NOT EXISTS idx_customers_tier ON customers(tier);
CREATE INDEX IF NOT EXISTS idx_customers_status ON customers(status);

CREATE INDEX IF NOT EXISTS idx_contacts_customer_id ON contacts(customer_id);
CREATE INDEX IF NOT EXISTS idx_contacts_name ON contacts(name);
CREATE INDEX IF NOT EXISTS idx_contacts_email ON contacts(email);

-- Enable RLS on customer tables
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

-- Customers policies
CREATE POLICY "Users can view their own customers" ON customers FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can create customers" ON customers FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Users can update their own customers" ON customers FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete their own customers" ON customers FOR DELETE USING (user_id = auth.uid());

-- Contacts policies
CREATE POLICY "Users can view contacts for their customers" ON contacts FOR SELECT USING (
    EXISTS (SELECT 1 FROM customers WHERE id = contacts.customer_id AND user_id = auth.uid())
);
CREATE POLICY "Users can create contacts for their customers" ON contacts FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM customers WHERE id = contacts.customer_id AND user_id = auth.uid())
);
CREATE POLICY "Users can update contacts for their customers" ON contacts FOR UPDATE USING (
    EXISTS (SELECT 1 FROM customers WHERE id = contacts.customer_id AND user_id = auth.uid())
);
CREATE POLICY "Users can delete contacts for their customers" ON contacts FOR DELETE USING (
    EXISTS (SELECT 1 FROM customers WHERE id = contacts.customer_id AND user_id = auth.uid())
);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_customers_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE OR REPLACE FUNCTION update_contacts_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION update_customers_updated_at_column();
CREATE TRIGGER update_contacts_updated_at BEFORE UPDATE ON contacts FOR EACH ROW EXECUTE FUNCTION update_contacts_updated_at_column();

-- Insert sample customers
INSERT INTO customers (name, email, phone, industry, segment, tier, status, address, city, country, website, user_id) VALUES
('ABC Corporation', 'contact@abccorp.com', '+905551234571', 'Technology', 'Enterprise', 'A', 'Active', 'Maslak Business Center', 'Istanbul', 'Turkey', 'https://www.abccorp.com', '550e8400-e29b-41d4-a716-446655440001'),
('XYZ Logistics', 'info@xyzlogistics.com', '+905551234572', 'Transportation', 'SMB', 'B', 'Active', 'Logistics Park', 'Ankara', 'Turkey', 'https://www.xyzlogistics.com', '550e8400-e29b-41d4-a716-446655440001'),
('DEF Manufacturing', 'maintenance@defmanufacturing.com', '+905551234573', 'Manufacturing', 'Enterprise', 'A', 'Active', 'Industrial Zone', 'Izmir', 'Turkey', 'https://www.defmanufacturing.com', '550e8400-e29b-41d4-a716-446655440001'),
('GHI Retail', 'projects@ghiretail.com', '+905551234574', 'Retail', 'SMB', 'B', 'Active', 'Shopping Mall', 'Bursa', 'Turkey', 'https://www.ghiretail.com', '550e8400-e29b-41d4-a716-446655440001');

-- Insert sample contacts
INSERT INTO contacts (customer_id, name, email, phone, position, department, is_primary, notes) VALUES
((SELECT id FROM customers WHERE name = 'ABC Corporation'), 'John Smith', 'john.smith@abccorp.com', '+905551234571', 'Operations Manager', 'Operations', true, 'Primary contact for all projects'),
((SELECT id FROM customers WHERE name = 'ABC Corporation'), 'Jane Doe', 'jane.doe@abccorp.com', '+905551234572', 'Project Coordinator', 'Operations', false, 'Secondary contact'),
((SELECT id FROM customers WHERE name = 'XYZ Logistics'), 'Mike Johnson', 'mike.johnson@xyzlogistics.com', '+905551234573', 'Logistics Director', 'Management', true, 'Decision maker'),
((SELECT id FROM customers WHERE name = 'DEF Manufacturing'), 'Sarah Wilson', 'sarah.wilson@defmanufacturing.com', '+905551234574', 'Plant Manager', 'Operations', true, 'Technical contact'),
((SELECT id FROM customers WHERE name = 'GHI Retail'), 'Tom Brown', 'tom.brown@ghiretail.com', '+905551234575', 'Store Manager', 'Operations', true, 'Site contact');
