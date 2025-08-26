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
