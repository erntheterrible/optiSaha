-- =====================================================
-- UPDATE DEALS TABLE FOR CRM FUNCTIONALITY
-- =====================================================

-- Add new columns for CRM functionality
ALTER TABLE deals ADD COLUMN IF NOT EXISTS customer_id UUID REFERENCES customers(id) ON DELETE SET NULL;
ALTER TABLE deals ADD COLUMN IF NOT EXISTS value DECIMAL(12,2) DEFAULT 0.00;
ALTER TABLE deals ADD COLUMN IF NOT EXISTS stage VARCHAR(50) DEFAULT 'prospecting'; -- prospecting, qualification, proposal, negotiation, won, lost
ALTER TABLE deals ADD COLUMN IF NOT EXISTS close_date DATE;
ALTER TABLE deals ADD COLUMN IF NOT EXISTS probability INTEGER DEFAULT 0; -- 0-100 percentage
ALTER TABLE deals ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE deals ADD COLUMN IF NOT EXISTS notes TEXT;

-- Create indexes for new columns
CREATE INDEX IF NOT EXISTS idx_deals_customer_id ON deals(customer_id);
CREATE INDEX IF NOT EXISTS idx_deals_stage ON deals(stage);
CREATE INDEX IF NOT EXISTS idx_deals_close_date ON deals(close_date);
CREATE INDEX IF NOT EXISTS idx_deals_owner_id ON deals(owner_id);

-- Update existing sample deals with CRM data
UPDATE deals SET 
  customer_id = (SELECT id FROM customers LIMIT 1),
  value = 1000.00,
  stage = 'proposal',
  close_date = '2024-09-30',
  probability = 75,
  owner_id = '550e8400-e29b-41d4-a716-446655440001',
  notes = 'Initial contact made, proposal sent'
WHERE id = 1;

UPDATE deals SET 
  customer_id = (SELECT id FROM customers ORDER BY id LIMIT 1 OFFSET 1),
  value = 2500.00,
  stage = 'negotiation',
  close_date = '2024-10-15',
  probability = 90,
  owner_id = '550e8400-e29b-41d4-a716-446655440001',
  notes = 'In negotiation phase, terms being discussed'
WHERE id = 2;

UPDATE deals SET 
  customer_id = (SELECT id FROM customers ORDER BY id LIMIT 1 OFFSET 2),
  value = 500.00,
  stage = 'prospecting',
  close_date = '2024-08-30',
  probability = 25,
  owner_id = '550e8400-e29b-41d4-a716-446655440001',
  notes = 'New lead, initial outreach'
WHERE id = 3;

-- Update RLS policies to include owner access
DROP POLICY IF EXISTS "Creators can manage their deals" ON deals;
CREATE POLICY "Creators and owners can manage their deals" ON deals FOR ALL USING (created_by = auth.uid() OR owner_id = auth.uid());

-- Add a view for deal pipeline analytics
CREATE OR REPLACE VIEW deal_pipeline_view AS
SELECT 
  stage,
  COUNT(*) as deal_count,
  SUM(value) as total_value,
  AVG(probability) as avg_probability
FROM deals 
WHERE stage IN ('prospecting', 'qualification', 'proposal', 'negotiation', 'won', 'lost')
GROUP BY stage
ORDER BY 
  CASE stage
    WHEN 'prospecting' THEN 1
    WHEN 'qualification' THEN 2
    WHEN 'proposal' THEN 3
    WHEN 'negotiation' THEN 4
    WHEN 'won' THEN 5
    WHEN 'lost' THEN 6
  END;
