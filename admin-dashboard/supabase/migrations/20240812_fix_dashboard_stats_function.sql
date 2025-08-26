-- Fix get_dashboard_stats function to properly use auth.uid() and implement RLS

-- Drop the existing function
DROP FUNCTION IF EXISTS get_dashboard_stats(UUID);

-- Create the updated function with proper RLS implementation
CREATE OR REPLACE FUNCTION get_dashboard_stats(user_id UUID DEFAULT NULL)
RETURNS JSONB AS $$
DECLARE
    result JSONB;
    current_user_id UUID := COALESCE(user_id, auth.uid());
BEGIN
    -- Check if we have a valid user ID
    IF current_user_id IS NULL THEN
        RAISE EXCEPTION 'User must be authenticated or user_id must be provided';
    END IF;
    
    SELECT jsonb_build_object(
        'total_projects', (
            SELECT COUNT(*) 
            FROM projects 
            WHERE assigned_to = current_user_id 
               OR created_by = current_user_id
               OR EXISTS (
                   SELECT 1 FROM users 
                   WHERE id = current_user_id 
                   AND role IN ('admin', 'manager')
               )
        ),
        'active_projects', (
            SELECT COUNT(*) 
            FROM projects 
            WHERE (assigned_to = current_user_id 
               OR created_by = current_user_id
               OR EXISTS (
                   SELECT 1 FROM users 
                   WHERE id = current_user_id 
                   AND role IN ('admin', 'manager')
               ))
            AND status = 'in_progress'
        ),
        'completed_projects', (
            SELECT COUNT(*) 
            FROM projects 
            WHERE (assigned_to = current_user_id 
               OR created_by = current_user_id
               OR EXISTS (
                   SELECT 1 FROM users 
                   WHERE id = current_user_id 
                   AND role IN ('admin', 'manager')
               ))
            AND status = 'completed'
        ),
        'total_visits', (
            SELECT COUNT(*) 
            FROM visits 
            WHERE user_id = current_user_id
               OR EXISTS (
                   SELECT 1 FROM users 
                   WHERE id = current_user_id 
                   AND role IN ('admin', 'manager')
               )
        ),
        'scheduled_visits', (
            SELECT COUNT(*) 
            FROM visits 
            WHERE (user_id = current_user_id
               OR EXISTS (
                   SELECT 1 FROM users 
                   WHERE id = current_user_id 
                   AND role IN ('admin', 'manager')
               ))
            AND status = 'scheduled'
        ),
        'total_leads', (
            SELECT COUNT(*) 
            FROM leads 
            WHERE assigned_to = current_user_id
               OR EXISTS (
                   SELECT 1 FROM users 
                   WHERE id = current_user_id 
                   AND role IN ('admin', 'manager')
               )
        ),
        'qualified_leads', (
            SELECT COUNT(*) 
            FROM leads 
            WHERE (assigned_to = current_user_id
               OR EXISTS (
                   SELECT 1 FROM users 
                   WHERE id = current_user_id 
                   AND role IN ('admin', 'manager')
               ))
            AND status = 'qualified'
        ),
        'total_revenue', (
            SELECT COALESCE(SUM(budget), 0) 
            FROM projects 
            WHERE (assigned_to = current_user_id 
               OR created_by = current_user_id
               OR EXISTS (
                   SELECT 1 FROM users 
                   WHERE id = current_user_id 
                   AND role IN ('admin', 'manager')
               ))
            AND status = 'completed'
        )
    ) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_dashboard_stats TO authenticated;

-- Add comment for documentation
COMMENT ON FUNCTION get_dashboard_stats IS 'Get dashboard statistics for a user with proper RLS implementation';
