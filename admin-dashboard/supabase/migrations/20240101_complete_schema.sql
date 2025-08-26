-- =====================================================
-- COMPLETE FIELD MANAGEMENT SYSTEM DATABASE SCHEMA
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- CORE TABLES
-- =====================================================

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    full_name VARCHAR(100),
    phone VARCHAR(20),
    avatar_url TEXT,
    role VARCHAR(50) DEFAULT 'field_agent',
    department VARCHAR(100),
    manager_id UUID REFERENCES users(id),
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP WITHOUT TIME ZONE,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'new',
    priority VARCHAR(20) DEFAULT 'medium',
    budget DECIMAL(12,2),
    start_date DATE,
    end_date DATE,
    actual_start_date DATE,
    actual_end_date DATE,
    customer_name VARCHAR(255),
    customer_email VARCHAR(255),
    customer_phone VARCHAR(50),
    location_address TEXT,
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    assigned_to UUID REFERENCES users(id),
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Visits table
CREATE TABLE IF NOT EXISTS visits (
    id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),
    visit_type VARCHAR(50) NOT NULL,
    status VARCHAR(50) DEFAULT 'scheduled',
    scheduled_date TIMESTAMP WITHOUT TIME ZONE,
    actual_start_time TIMESTAMP WITHOUT TIME ZONE,
    actual_end_time TIMESTAMP WITHOUT TIME ZONE,
    duration_minutes INTEGER,
    description TEXT,
    notes TEXT,
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    location_address TEXT,
    is_auto_detected BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Events table (for calendar)
CREATE TABLE IF NOT EXISTS events (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    start_time TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    end_time TIMESTAMP WITHOUT TIME ZONE,
    location TEXT,
    event_type VARCHAR(50) DEFAULT 'meeting',
    status VARCHAR(50) DEFAULT 'scheduled',
    all_day BOOLEAN DEFAULT FALSE,
    created_by UUID REFERENCES users(id) ON DELETE CASCADE,
    project_id INTEGER REFERENCES projects(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Event attendees table
CREATE TABLE IF NOT EXISTS event_attendees (
    id SERIAL PRIMARY KEY,
    event_id INTEGER REFERENCES events(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    response_status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(event_id, user_id)
);

-- Leads table
CREATE TABLE IF NOT EXISTS leads (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    company VARCHAR(255),
    position VARCHAR(100),
    status VARCHAR(50) DEFAULT 'new',
    source VARCHAR(100),
    priority VARCHAR(20) DEFAULT 'medium',
    assigned_to UUID REFERENCES users(id),
    created_by UUID REFERENCES users(id),
    notes TEXT,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Regions table
CREATE TABLE IF NOT EXISTS regions (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    coordinates TEXT NOT NULL, -- JSON string of LatLng points
    assigned_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    created_by UUID REFERENCES users(id),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Notes table
CREATE TABLE IF NOT EXISTS notes (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT,
    category VARCHAR(100),
    tags TEXT[], -- Array of tags
    project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
    lead_id INTEGER REFERENCES leads(id) ON DELETE CASCADE,
    created_by UUID REFERENCES users(id) ON DELETE CASCADE,
    is_private BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Activities table (for audit trail)
CREATE TABLE IF NOT EXISTS activities (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    activity_type VARCHAR(50) NOT NULL,
    description TEXT,
    entity_type VARCHAR(50), -- 'project', 'visit', 'lead', etc.
    entity_id INTEGER,
    metadata JSONB,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- GPS logs table
CREATE TABLE IF NOT EXISTS gps_logs (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    latitude DECIMAL(10,8) NOT NULL,
    longitude DECIMAL(11,8) NOT NULL,
    accuracy DECIMAL(5,2),
    speed DECIMAL(5,2),
    heading DECIMAL(5,2),
    altitude DECIMAL(8,2),
    region_id INTEGER REFERENCES regions(id),
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Users indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_manager ON users(manager_id);

-- Projects indexes
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_assigned_to ON projects(assigned_to);
CREATE INDEX IF NOT EXISTS idx_projects_created_by ON projects(created_by);
CREATE INDEX IF NOT EXISTS idx_projects_start_date ON projects(start_date);
CREATE INDEX IF NOT EXISTS idx_projects_customer ON projects(customer_name);

-- Visits indexes
CREATE INDEX IF NOT EXISTS idx_visits_project_id ON visits(project_id);
CREATE INDEX IF NOT EXISTS idx_visits_user_id ON visits(user_id);
CREATE INDEX IF NOT EXISTS idx_visits_scheduled_date ON visits(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_visits_status ON visits(status);

-- Events indexes
CREATE INDEX IF NOT EXISTS idx_events_start_time ON events(start_time);
CREATE INDEX IF NOT EXISTS idx_events_created_by ON events(created_by);
CREATE INDEX IF NOT EXISTS idx_events_project_id ON events(project_id);

-- Event attendees indexes
CREATE INDEX IF NOT EXISTS idx_event_attendees_event_id ON event_attendees(event_id);
CREATE INDEX IF NOT EXISTS idx_event_attendees_user_id ON event_attendees(user_id);

-- Leads indexes
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_assigned_to ON leads(assigned_to);
CREATE INDEX IF NOT EXISTS idx_leads_company ON leads(company);

-- Regions indexes
CREATE INDEX IF NOT EXISTS idx_regions_assigned_user_id ON regions(assigned_user_id);
CREATE INDEX IF NOT EXISTS idx_regions_active ON regions(is_active);

-- Notes indexes
CREATE INDEX IF NOT EXISTS idx_notes_created_by ON notes(created_by);
CREATE INDEX IF NOT EXISTS idx_notes_project_id ON notes(project_id);
CREATE INDEX IF NOT EXISTS idx_notes_category ON notes(category);

-- Activities indexes
CREATE INDEX IF NOT EXISTS idx_activities_user_id ON activities(user_id);
CREATE INDEX IF NOT EXISTS idx_activities_type ON activities(activity_type);
CREATE INDEX IF NOT EXISTS idx_activities_created_at ON activities(created_at);

-- GPS logs indexes
CREATE INDEX IF NOT EXISTS idx_gps_logs_user_id ON gps_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_gps_logs_created_at ON gps_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_gps_logs_region ON gps_logs(region_id);

-- =====================================================
-- SAMPLE DATA
-- =====================================================

-- Insert sample users (these will be linked to Supabase auth.users)
INSERT INTO users (id, username, email, full_name, phone, role, department) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'admin', 'admin@fieldmanagement.com', 'System Administrator', '+905551234567', 'admin', 'IT'),
('550e8400-e29b-41d4-a716-446655440002', 'john.doe', 'john.doe@fieldmanagement.com', 'John Doe', '+905551234568', 'field_agent', 'Sales'),
('550e8400-e29b-41d4-a716-446655440003', 'jane.smith', 'jane.smith@fieldmanagement.com', 'Jane Smith', '+905551234569', 'field_agent', 'Sales'),
('550e8400-e29b-41d4-a716-446655440004', 'mike.wilson', 'mike.wilson@fieldmanagement.com', 'Mike Wilson', '+905551234570', 'manager', 'Sales')
ON CONFLICT (id) DO NOTHING;

-- Insert sample projects
INSERT INTO projects (name, description, status, priority, budget, start_date, end_date, customer_name, customer_email, customer_phone, location_address, latitude, longitude, assigned_to, created_by) VALUES
('Istanbul Office Renovation', 'Complete renovation of office building in Istanbul', 'in_progress', 'high', 50000.00, '2024-01-15', '2024-06-30', 'ABC Corporation', 'contact@abccorp.com', '+905551234571', 'Maslak, Istanbul', 41.1124, 29.0197, '550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001'),
('Ankara Warehouse Setup', 'New warehouse setup and equipment installation', 'new', 'medium', 75000.00, '2024-02-01', '2024-08-15', 'XYZ Logistics', 'info@xyzlogistics.com', '+905551234572', 'Çankaya, Ankara', 39.9334, 32.8597, '550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440001'),
('Izmir Factory Maintenance', 'Regular maintenance and safety inspection', 'completed', 'low', 25000.00, '2024-01-01', '2024-01-31', 'DEF Manufacturing', 'maintenance@defmanufacturing.com', '+905551234573', 'Bornova, Izmir', 38.4622, 27.0923, '550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001'),
('Bursa Retail Store', 'New retail store setup and interior design', 'planning', 'high', 35000.00, '2024-03-01', '2024-07-31', 'GHI Retail', 'projects@ghiretail.com', '+905551234574', 'Nilüfer, Bursa', 40.1885, 29.0610, '550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440001');

-- Insert sample visits
INSERT INTO visits (project_id, user_id, visit_type, status, scheduled_date, description, latitude, longitude, location_address) VALUES
(1, '550e8400-e29b-41d4-a716-446655440002', 'site_inspection', 'completed', '2024-01-20 09:00:00', 'Initial site inspection and measurements', 41.1124, 29.0197, 'Maslak, Istanbul'),
(1, '550e8400-e29b-41d4-a716-446655440002', 'progress_check', 'scheduled', '2024-02-15 14:00:00', 'Progress check and quality inspection', 41.1124, 29.0197, 'Maslak, Istanbul'),
(2, '550e8400-e29b-41d4-a716-446655440003', 'site_survey', 'completed', '2024-01-25 10:00:00', 'Site survey and requirements gathering', 39.9334, 32.8597, 'Çankaya, Ankara'),
(3, '550e8400-e29b-41d4-a716-446655440002', 'maintenance_check', 'completed', '2024-01-15 08:00:00', 'Regular maintenance and safety check', 38.4622, 27.0923, 'Bornova, Izmir');

-- Insert sample events
INSERT INTO events (title, description, start_time, end_time, location, event_type, status, created_by, project_id) VALUES
('Project Kickoff Meeting', 'Initial project discussion and planning', '2024-01-20 10:00:00', '2024-01-20 11:30:00', 'Conference Room A', 'meeting', 'scheduled', '550e8400-e29b-41d4-a716-446655440001', 1),
('Site Inspection', 'Site visit for Istanbul office renovation', '2024-01-22 09:00:00', '2024-01-22 12:00:00', 'Maslak, Istanbul', 'site_visit', 'scheduled', '550e8400-e29b-41d4-a716-446655440002', 1),
('Client Presentation', 'Present project progress to ABC Corporation', '2024-02-01 14:00:00', '2024-02-01 15:30:00', 'ABC Corp Office', 'presentation', 'scheduled', '550e8400-e29b-41d4-a716-446655440002', 1);

-- Insert sample leads
INSERT INTO leads (name, email, phone, company, position, status, source, priority, assigned_to, created_by, notes) VALUES
('Ahmet Yılmaz', 'ahmet.yilmaz@techcorp.com', '+905551234575', 'TechCorp', 'Operations Manager', 'qualified', 'website', 'high', '550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', 'Interested in office automation solutions'),
('Fatma Demir', 'fatma.demir@manufacturing.com', '+905551234576', 'Manufacturing Inc', 'CEO', 'new', 'referral', 'medium', '550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440001', 'Looking for factory optimization'),
('Mehmet Kaya', 'mehmet.kaya@retail.com', '+905551234577', 'Retail Solutions', 'Project Manager', 'contacted', 'cold_call', 'low', '550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', 'Interested in retail store setup');

-- Insert sample regions
INSERT INTO regions (name, description, coordinates, assigned_user_id, created_by) VALUES
('Istanbul Central', 'Central Istanbul area including Maslak, Levent, and Beşiktaş', '[{"lat": 41.1124, "lng": 29.0197}, {"lat": 41.0785, "lng": 29.0424}]', '550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001'),
('Ankara Business District', 'Çankaya and surrounding business areas', '[{"lat": 39.9334, "lng": 32.8597}, {"lat": 39.9208, "lng": 32.8541}]', '550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440001'),
('Izmir Industrial Zone', 'Industrial areas in Izmir including Bornova', '[{"lat": 38.4622, "lng": 27.0923}, {"lat": 38.4192, "lng": 27.1287}]', '550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001');

-- Insert sample notes
INSERT INTO notes (title, content, category, tags, project_id, created_by) VALUES
('Site Access Requirements', 'Need security clearance for site access. Contact building management.', 'logistics', ARRAY['access', 'security'], 1, '550e8400-e29b-41d4-a716-446655440002'),
('Material Specifications', 'All materials must meet fire safety standards. Use only approved suppliers.', 'technical', ARRAY['materials', 'safety'], 1, '550e8400-e29b-41d4-a716-446655440002'),
('Client Preferences', 'Client prefers modern, minimalist design with focus on natural light.', 'design', ARRAY['design', 'preferences'], 1, '550e8400-e29b-41d4-a716-446655440002');

-- Insert sample activities
INSERT INTO activities (user_id, activity_type, description, entity_type, entity_id, metadata) VALUES
('550e8400-e29b-41d4-a716-446655440002', 'project_created', 'Created new project: Istanbul Office Renovation', 'project', 1, '{"project_name": "Istanbul Office Renovation", "budget": 50000}'),
('550e8400-e29b-41d4-a716-446655440002', 'visit_completed', 'Completed site inspection for Istanbul project', 'visit', 1, '{"visit_type": "site_inspection", "duration": 180}'),
('550e8400-e29b-41d4-a716-446655440003', 'lead_contacted', 'Contacted lead: Ahmet Yılmaz from TechCorp', 'lead', 1, '{"contact_method": "phone", "duration": 15}'),
('550e8400-e29b-41d4-a716-446655440001', 'user_assigned', 'Assigned project to field agent', 'project', 1, '{"assigned_user": "John Doe", "role": "field_agent"}');

-- =====================================================
-- FUNCTIONS AND TRIGGERS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_visits_updated_at BEFORE UPDATE ON visits FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON leads FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_regions_updated_at BEFORE UPDATE ON regions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_notes_updated_at BEFORE UPDATE ON notes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to log activities automatically
CREATE OR REPLACE FUNCTION log_activity()
RETURNS TRIGGER AS $$
DECLARE
    item_name TEXT := NULL;
    column_exists BOOLEAN;
    query_text TEXT;
    rec RECORD;
BEGIN
    -- Only process INSERT and UPDATE operations
    IF TG_OP IN ('INSERT', 'UPDATE') THEN
        -- Check if 'name' column exists in the table
        SELECT EXISTS (
            SELECT 1 
            FROM information_schema.columns 
            WHERE table_schema = TG_TABLE_SCHEMA 
            AND table_name = TG_TABLE_NAME 
            AND column_name = 'name'
        ) INTO column_exists;

        -- Try to get the name or title from the record
        IF column_exists THEN
            EXECUTE format('SELECT ($1).%I', 'name') USING NEW INTO item_name;
        ELSE
            -- Check if 'title' column exists
            SELECT EXISTS (
                SELECT 1 
                FROM information_schema.columns 
                WHERE table_schema = TG_TABLE_SCHEMA 
                AND table_name = TG_TABLE_NAME 
                AND column_name = 'title'
            ) INTO column_exists;
            
            IF column_exists THEN
                EXECUTE format('SELECT ($1).%I', 'title') USING NEW INTO item_name;
            END IF;
        END IF;

        -- Prepare the description based on the operation
        IF TG_OP = 'INSERT' THEN
            INSERT INTO activities (
                user_id, 
                activity_type, 
                description, 
                entity_type, 
                entity_id, 
                metadata
            ) VALUES (
                NEW.created_by,
                TG_ARGV[0] || '_created',
                'Created new ' || TG_ARGV[1] || 
                    CASE WHEN item_name IS NOT NULL 
                         THEN ': ' || item_name 
                         ELSE '' 
                    END,
                TG_ARGV[1],
                NEW.id,
                jsonb_build_object('created_at', NEW.created_at)
            );
            RETURN NEW;
            
        ELSIF TG_OP = 'UPDATE' THEN
            INSERT INTO activities (
                user_id, 
                activity_type, 
                description, 
                entity_type, 
                entity_id, 
                metadata
            ) VALUES (
                NEW.created_by,
                TG_ARGV[0] || '_updated',
                'Updated ' || TG_ARGV[1] || 
                    CASE WHEN item_name IS NOT NULL 
                         THEN ': ' || item_name 
                         ELSE ' #' || NEW.id::text 
                    END,
                TG_ARGV[1],
                NEW.id,
                jsonb_build_object('updated_at', NEW.updated_at)
            );
            RETURN NEW;
        END IF;
    END IF;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create activity logging triggers
CREATE TRIGGER log_project_activity AFTER INSERT OR UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION log_activity('project', 'project');
CREATE TRIGGER log_visit_activity AFTER INSERT OR UPDATE ON visits FOR EACH ROW EXECUTE FUNCTION log_activity('visit', 'visit');
CREATE TRIGGER log_lead_activity AFTER INSERT OR UPDATE ON leads FOR EACH ROW EXECUTE FUNCTION log_activity('lead', 'lead');

-- Function to get dashboard statistics
CREATE OR REPLACE FUNCTION get_dashboard_stats(user_id UUID DEFAULT NULL)
RETURNS JSONB AS $$
DECLARE
    result JSONB;
BEGIN
    SELECT jsonb_build_object(
        'total_projects', (SELECT COUNT(*) FROM projects WHERE user_id IS NULL OR assigned_to = user_id),
        'active_projects', (SELECT COUNT(*) FROM projects WHERE (user_id IS NULL OR assigned_to = user_id) AND status = 'in_progress'),
        'completed_projects', (SELECT COUNT(*) FROM projects WHERE (user_id IS NULL OR assigned_to = user_id) AND status = 'completed'),
        'total_visits', (SELECT COUNT(*) FROM visits WHERE user_id IS NULL OR visits.user_id = user_id),
        'scheduled_visits', (SELECT COUNT(*) FROM visits WHERE (user_id IS NULL OR visits.user_id = user_id) AND status = 'scheduled'),
        'total_leads', (SELECT COUNT(*) FROM leads WHERE user_id IS NULL OR assigned_to = user_id),
        'qualified_leads', (SELECT COUNT(*) FROM leads WHERE (user_id IS NULL OR assigned_to = user_id) AND status = 'qualified'),
        'total_revenue', (SELECT COALESCE(SUM(budget), 0) FROM projects WHERE (user_id IS NULL OR assigned_to = user_id) AND status = 'completed')
    ) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get project performance metrics
CREATE OR REPLACE FUNCTION get_project_performance(project_id INTEGER)
RETURNS JSONB AS $$
DECLARE
    result JSONB;
BEGIN
    SELECT jsonb_build_object(
        'project_id', p.id,
        'project_name', p.name,
        'status', p.status,
        'progress_percentage', 
            CASE 
                WHEN p.status = 'completed' THEN 100
                WHEN p.status = 'new' THEN 0
                ELSE 50 -- Default for in_progress
            END,
        'total_visits', (SELECT COUNT(*) FROM visits WHERE visits.project_id = p.id),
        'completed_visits', (SELECT COUNT(*) FROM visits WHERE visits.project_id = p.id AND visits.status = 'completed'),
        'days_remaining', 
            CASE 
                WHEN p.end_date IS NOT NULL THEN 
                    GREATEST(0, p.end_date - CURRENT_DATE)
                ELSE NULL
            END,
        'budget_utilized', 
            CASE 
                WHEN p.budget > 0 THEN 
                    COALESCE((SELECT SUM(cost) FROM visit_costs WHERE project_id = p.id), 0) / p.budget * 100
                ELSE 0
            END
    ) INTO result
    FROM projects p
    WHERE p.id = project_id;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- HELPER FUNCTIONS FOR DASHBOARD
-- =====================================================

-- Get accessible projects count for a user (with status_filter as first parameter)
CREATE OR REPLACE FUNCTION public.get_accessible_projects_count(
  status_filter text DEFAULT NULL,
  user_id uuid DEFAULT NULL
) 
RETURNS bigint
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT COUNT(*) 
  FROM projects 
  WHERE 
    (assigned_to = COALESCE(user_id, auth.uid()) OR 
     created_by = COALESCE(user_id, auth.uid()) OR
     EXISTS (SELECT 1 FROM users WHERE id = COALESCE(user_id, auth.uid()) AND role IN ('admin', 'manager')))
    AND (status_filter IS NULL OR status = status_filter)
$$;

-- Get accessible leads count for a user (with status_filter as first parameter)
CREATE OR REPLACE FUNCTION public.get_accessible_leads_count(
  status_filter text DEFAULT NULL,
  user_id uuid DEFAULT NULL
) 
RETURNS bigint
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT COUNT(*) 
  FROM leads 
  WHERE 
    (assigned_to = COALESCE(user_id, auth.uid()) OR
     EXISTS (SELECT 1 FROM users WHERE id = COALESCE(user_id, auth.uid()) AND role IN ('admin', 'manager')))
    AND (status_filter IS NULL OR status = status_filter)
$$;

-- =====================================================
-- VIEWS FOR COMMON QUERIES
-- =====================================================

-- View for project summary
CREATE OR REPLACE VIEW project_summary AS
SELECT 
    p.id,
    p.name,
    p.status,
    p.priority,
    p.budget,
    p.start_date,
    p.end_date,
    p.customer_name,
    u.full_name as assigned_to_name,
    COUNT(v.id) as total_visits,
    COUNT(CASE WHEN v.status = 'completed' THEN 1 END) as completed_visits,
    COUNT(CASE WHEN v.status = 'scheduled' THEN 1 END) as scheduled_visits
FROM projects p
LEFT JOIN users u ON p.assigned_to = u.id
LEFT JOIN visits v ON p.id = v.project_id
GROUP BY p.id, p.name, p.status, p.priority, p.budget, p.start_date, p.end_date, p.customer_name, u.full_name;

-- View for user performance
CREATE OR REPLACE VIEW user_performance AS
SELECT 
    u.id,
    u.full_name,
    u.role,
    COUNT(DISTINCT p.id) as total_projects,
    COUNT(DISTINCT CASE WHEN p.status = 'completed' THEN p.id END) as completed_projects,
    COUNT(DISTINCT v.id) as total_visits,
    COUNT(DISTINCT CASE WHEN v.status = 'completed' THEN v.id END) as completed_visits,
    COUNT(DISTINCT l.id) as total_leads,
    COUNT(DISTINCT CASE WHEN l.status = 'qualified' THEN l.id END) as qualified_leads,
    COALESCE(SUM(p.budget), 0) as total_revenue
FROM users u
LEFT JOIN projects p ON u.id = p.assigned_to
LEFT JOIN visits v ON u.id = v.user_id
LEFT JOIN leads l ON u.id = l.assigned_to
GROUP BY u.id, u.full_name, u.role;

-- View for upcoming visits
CREATE OR REPLACE VIEW upcoming_visits AS
SELECT 
    v.id,
    v.scheduled_date,
    v.visit_type,
    v.status,
    p.name as project_name,
    p.customer_name,
    u.full_name as assigned_user,
    v.location_address,
    v.latitude,
    v.longitude
FROM visits v
JOIN projects p ON v.project_id = p.id
JOIN users u ON v.user_id = u.id
WHERE v.scheduled_date >= CURRENT_DATE
ORDER BY v.scheduled_date ASC;

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_attendees ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE regions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE gps_logs ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view all users" ON users FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can manage all users" ON users FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

-- Projects policies
CREATE POLICY "Users can view assigned projects" ON projects FOR SELECT USING (
    assigned_to = auth.uid() OR 
    created_by = auth.uid() OR
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'manager'))
);
CREATE POLICY "Users can create projects" ON projects FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Users can update assigned projects" ON projects FOR UPDATE USING (
    assigned_to = auth.uid() OR 
    created_by = auth.uid() OR
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'manager'))
);

-- Visits policies
CREATE POLICY "Users can view own visits" ON visits FOR SELECT USING (
    user_id = auth.uid() OR
    EXISTS (SELECT 1 FROM projects WHERE id = visits.project_id AND assigned_to = auth.uid())
);
CREATE POLICY "Users can create visits" ON visits FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Users can update own visits" ON visits FOR UPDATE USING (user_id = auth.uid());

-- Events policies
CREATE POLICY "Users can view all events" ON events FOR SELECT USING (true);
CREATE POLICY "Users can create events" ON events FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Users can update own events" ON events FOR UPDATE USING (created_by = auth.uid());

-- Leads policies
CREATE POLICY "Users can view assigned leads" ON leads FOR SELECT USING (
    assigned_to = auth.uid() OR
    created_by = auth.uid() OR
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'manager'))
);
CREATE POLICY "Users can create leads" ON leads FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Users can update assigned leads" ON leads FOR UPDATE USING (
    assigned_to = auth.uid() OR
    created_by = auth.uid() OR
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'manager'))
);

-- Notes policies
CREATE POLICY "Users can view project notes" ON notes FOR SELECT USING (
    created_by = auth.uid() OR
    NOT is_private OR
    EXISTS (SELECT 1 FROM projects WHERE id = notes.project_id AND assigned_to = auth.uid())
);
CREATE POLICY "Users can create notes" ON notes FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Users can update own notes" ON notes FOR UPDATE USING (created_by = auth.uid());

-- Activities policies (read-only for audit)
CREATE POLICY "Users can view own activities" ON activities FOR SELECT USING (user_id = auth.uid());

-- GPS logs policies
CREATE POLICY "Users can view own GPS logs" ON gps_logs FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can create GPS logs" ON gps_logs FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE users IS 'User profiles extending Supabase auth.users';
COMMENT ON TABLE projects IS 'Field management projects with customer and location information';
COMMENT ON TABLE visits IS 'Site visits and field activities';
COMMENT ON TABLE events IS 'Calendar events and meetings';
COMMENT ON TABLE leads IS 'Sales leads and prospects';
COMMENT ON TABLE regions IS 'Geographic regions for field operations';
COMMENT ON TABLE notes IS 'Project and lead notes with categorization';
COMMENT ON TABLE activities IS 'Audit trail for user activities';
COMMENT ON TABLE gps_logs IS 'GPS tracking data for field agents';

COMMENT ON FUNCTION get_dashboard_stats IS 'Get dashboard statistics for a user or all users';
COMMENT ON FUNCTION get_project_performance IS 'Get performance metrics for a specific project';
COMMENT ON FUNCTION update_updated_at_column IS 'Trigger function to update updated_at timestamp';
COMMENT ON FUNCTION log_activity IS 'Trigger function to log user activities'; 