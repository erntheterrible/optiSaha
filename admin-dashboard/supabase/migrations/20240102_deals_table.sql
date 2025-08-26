-- =====================================================
-- DEALS TABLE FOR CUSTOMER PROMOTIONS AND OFFERS
-- =====================================================

-- Create deals table
CREATE TABLE IF NOT EXISTS deals (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    image_url TEXT,
    deal_type VARCHAR(50) DEFAULT 'percentage_off', -- percentage_off, fixed_price, buy_one_get_one, free_trial, etc.
    discount_value DECIMAL(5,2), -- Percentage or fixed amount
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    is_featured BOOLEAN DEFAULT FALSE,
    category VARCHAR(100),
    tags TEXT[], -- Array of tags for filtering
    terms TEXT, -- Deal terms and conditions
    click_count INTEGER DEFAULT 0,
    conversion_count INTEGER DEFAULT 0,
    created_by UUID REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_deals_active ON deals(is_active);
CREATE INDEX IF NOT EXISTS idx_deals_featured ON deals(is_featured);
CREATE INDEX IF NOT EXISTS idx_deals_category ON deals(category);
CREATE INDEX IF NOT EXISTS idx_deals_dates ON deals(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_deals_type ON deals(deal_type);

-- Enable RLS on deals table
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;

-- Deals policies
CREATE POLICY "Users can view active deals" ON deals FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage all deals" ON deals FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'manager'))
);
CREATE POLICY "Creators can manage their deals" ON deals FOR ALL USING (created_by = auth.uid());

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_deals_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
CREATE TRIGGER update_deals_updated_at BEFORE UPDATE ON deals FOR EACH ROW EXECUTE FUNCTION update_deals_updated_at_column();

-- Insert sample deals
INSERT INTO deals (title, description, image_url, deal_type, discount_value, start_date, end_date, is_active, is_featured, category, tags, terms, created_by) VALUES
('Summer Sale - 20% Off', 'Get 20% off on all our premium services this summer. Limited time offer!', 'https://images.unsplash.com/photo-1607082350899-7e105aa886ae?w=400', 'percentage_off', 20.00, '2024-06-01', '2024-08-31', true, true, 'services', ARRAY['summer', 'premium'], 'Valid for new customers only. Cannot be combined with other offers.', '550e8400-e29b-41d4-a716-446655440001'),
('Buy One Get One Free', 'Buy one premium package and get another one free. Great value for your business!', 'https://images.unsplash.com/photo-1556742111-a301076d9d18?w=400', 'buy_one_get_one', NULL, '2024-07-01', '2024-07-31', true, true, 'packages', ARRAY['bogo', 'popular'], 'Offer valid for same package type. Limited to one per customer.', '550e8400-e29b-41d4-a716-446655440001'),
('Free 30-Day Trial', 'Try our premium service free for 30 days. No credit card required!', 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=400', 'free_trial', NULL, '2024-06-15', '2024-12-31', true, false, 'trial', ARRAY['free', 'trial'], 'After 30 days, standard pricing applies unless canceled.', '550e8400-e29b-41d4-a716-446655440001');
