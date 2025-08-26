-- Create reports table
CREATE TABLE IF NOT EXISTS reports (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL, -- sales, leads, activity
    frequency VARCHAR(20) NOT NULL, -- daily, weekly, monthly
    delivery_time TIME NOT NULL DEFAULT '09:00:00',
    recipients TEXT[] NOT NULL, -- Array of email addresses
    pdf_template VARCHAR(100), -- Optional template name
    is_active BOOLEAN DEFAULT TRUE,
    last_sent TIMESTAMP WITHOUT TIME ZONE,
    next_send TIMESTAMP WITHOUT TIME ZONE,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_reports_next_send ON reports(next_send);
CREATE INDEX IF NOT EXISTS idx_reports_is_active ON reports(is_active);
CREATE INDEX IF NOT EXISTS idx_reports_created_by ON reports(created_by);

-- Enable RLS
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own reports" ON reports
    FOR SELECT USING (created_by = auth.uid());

CREATE POLICY "Users can insert their own reports" ON reports
    FOR INSERT WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update their own reports" ON reports
    FOR UPDATE USING (created_by = auth.uid());

CREATE POLICY "Users can delete their own reports" ON reports
    FOR DELETE USING (created_by = auth.uid());

-- Grant permissions
GRANT ALL ON TABLE reports TO authenticated;
GRANT USAGE ON SEQUENCE reports_id_seq TO authenticated;

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create a trigger to automatically update the updated_at column
DROP TRIGGER IF EXISTS update_reports_updated_at ON reports;
CREATE TRIGGER update_reports_updated_at
    BEFORE UPDATE ON reports
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data for testing (optional)
-- Note: You'll need to replace 'USER_ID_HERE' with an actual user ID from your database
/*
INSERT INTO reports (name, type, frequency, delivery_time, recipients, pdf_template, is_active, last_sent, next_send, created_by)
VALUES 
    ('Monthly Sales Report', 'sales', 'monthly', '09:00:00', ARRAY['manager@company.com'], 'sales_template', true, '2024-07-01 09:00:00', '2024-09-01 09:00:00', 'USER_ID_HERE'),
    ('Weekly Activity Report', 'activity', 'weekly', '10:30:00', ARRAY['supervisor@company.com', 'team@company.com'], 'activity_template', true, '2024-08-05 10:30:00', '2024-08-12 10:30:00', 'USER_ID_HERE'),
    ('Daily Leads Report', 'leads', 'daily', '08:00:00', ARRAY['sales@company.com'], 'leads_template', false, '2024-08-07 08:00:00', NULL, 'USER_ID_HERE');
*/
