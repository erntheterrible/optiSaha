-- Fix RLS policies for events table
-- Enable RLS on events table
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to read all events
CREATE POLICY "Users can view all events" ON events
    FOR SELECT USING (true);

-- Create policy to allow authenticated users to create events
CREATE POLICY "Authenticated users can create events" ON events
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Create policy to allow users to update their own events
CREATE POLICY "Users can update their own events" ON events
    FOR UPDATE USING (auth.uid() = created_by);

-- Create policy to allow users to delete their own events
CREATE POLICY "Users can delete their own events" ON events
    FOR DELETE USING (auth.uid() = created_by);

-- Enable RLS on event_attendees table
ALTER TABLE event_attendees ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to view event attendees
CREATE POLICY "Users can view event attendees" ON event_attendees
    FOR SELECT USING (true);

-- Create policy to allow authenticated users to create event attendees
CREATE POLICY "Authenticated users can create event attendees" ON event_attendees
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Create policy to allow users to update their own attendee records
CREATE POLICY "Users can update their own attendee records" ON event_attendees
    FOR UPDATE USING (auth.uid() = user_id);

-- Enable RLS on users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to view all users (for team performance)
CREATE POLICY "Users can view all users" ON users
    FOR SELECT USING (true);

-- Create policy to allow users to update their own profile
CREATE POLICY "Users can update their own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

-- Enable RLS on projects table
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to view all projects
CREATE POLICY "Users can view all projects" ON projects
    FOR SELECT USING (true);

-- Create policy to allow authenticated users to create projects
CREATE POLICY "Authenticated users can create projects" ON projects
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Create policy to allow users to update their own projects
CREATE POLICY "Users can update their own projects" ON projects
    FOR UPDATE USING (auth.uid() = assigned_to OR auth.uid() = created_by);

-- Create policy to allow users to delete their own projects
CREATE POLICY "Users can delete their own projects" ON projects
    FOR DELETE USING (auth.uid() = assigned_to OR auth.uid() = created_by);

-- Enable RLS on leads table
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to view all leads
CREATE POLICY "Users can view all leads" ON leads
    FOR SELECT USING (true);

-- Create policy to allow authenticated users to create leads
CREATE POLICY "Authenticated users can create leads" ON leads
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Create policy to allow users to update their own leads
CREATE POLICY "Users can update their own leads" ON leads
    FOR UPDATE USING (auth.uid() = assigned_to OR auth.uid() = created_by);

-- Create policy to allow users to delete their own leads
CREATE POLICY "Users can delete their own leads" ON leads
    FOR DELETE USING (auth.uid() = assigned_to OR auth.uid() = created_by);

-- Enable RLS on regions table
ALTER TABLE regions ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to view all regions
CREATE POLICY "Users can view all regions" ON regions
    FOR SELECT USING (true);

-- Create policy to allow authenticated users to create regions
CREATE POLICY "Authenticated users can create regions" ON regions
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Create policy to allow users to update their own regions
CREATE POLICY "Users can update their own regions" ON regions
    FOR UPDATE USING (auth.uid() = assigned_user_id OR auth.uid() = created_by);

-- Create policy to allow users to delete their own regions
CREATE POLICY "Users can delete their own regions" ON regions
    FOR DELETE USING (auth.uid() = assigned_user_id OR auth.uid() = created_by); 