-- =====================================================
-- MAINTENANCE AND UTILITY FUNCTIONS
-- =====================================================

-- Function to clean up old GPS logs (older than specified days)
CREATE OR REPLACE FUNCTION cleanup_old_gps_logs(days_to_keep INTEGER DEFAULT 90)
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM gps_logs 
    WHERE created_at < CURRENT_DATE - INTERVAL '1 day' * days_to_keep;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to archive completed projects (older than specified months)
CREATE OR REPLACE FUNCTION archive_completed_projects(months_to_keep INTEGER DEFAULT 12)
RETURNS INTEGER AS $$
DECLARE
    archived_count INTEGER;
BEGIN
    -- Create archive table if it doesn't exist
    CREATE TABLE IF NOT EXISTS projects_archive (LIKE projects INCLUDING ALL);
    
    -- Move completed projects older than specified months to archive
    INSERT INTO projects_archive 
    SELECT * FROM projects 
    WHERE status = 'completed' 
    AND updated_at < CURRENT_DATE - INTERVAL '1 month' * months_to_keep;
    
    GET DIAGNOSTICS archived_count = ROW_COUNT;
    
    -- Delete archived projects from main table
    DELETE FROM projects 
    WHERE status = 'completed' 
    AND updated_at < CURRENT_DATE - INTERVAL '1 month' * months_to_keep;
    
    RETURN archived_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update project status based on visit completion
CREATE OR REPLACE FUNCTION update_project_status()
RETURNS INTEGER AS $$
DECLARE
    updated_count INTEGER;
BEGIN
    -- Update projects to 'in_progress' if they have completed visits
    UPDATE projects 
    SET status = 'in_progress'
    WHERE status = 'new' 
    AND EXISTS (
        SELECT 1 FROM visits 
        WHERE visits.project_id = projects.id 
        AND visits.status = 'completed'
    );
    
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    
    -- Update projects to 'completed' if all visits are completed and end date is passed
    UPDATE projects 
    SET status = 'completed'
    WHERE status = 'in_progress'
    AND end_date < CURRENT_DATE
    AND NOT EXISTS (
        SELECT 1 FROM visits 
        WHERE visits.project_id = projects.id 
        AND visits.status IN ('scheduled', 'in_progress')
    );
    
    RETURN updated_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to calculate visit duration automatically
CREATE OR REPLACE FUNCTION calculate_visit_duration()
RETURNS INTEGER AS $$
DECLARE
    updated_count INTEGER;
BEGIN
    UPDATE visits 
    SET duration_minutes = EXTRACT(EPOCH FROM (actual_end_time - actual_start_time)) / 60
    WHERE actual_start_time IS NOT NULL 
    AND actual_end_time IS NOT NULL 
    AND duration_minutes IS NULL;
    
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    RETURN updated_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to sync user data with Supabase auth
CREATE OR REPLACE FUNCTION sync_auth_users()
RETURNS INTEGER AS $$
DECLARE
    synced_count INTEGER;
BEGIN
    -- Insert new auth users into our users table
    INSERT INTO users (id, username, email, full_name, created_at)
    SELECT 
        au.id,
        COALESCE(au.raw_user_meta_data->>'username', au.email) as username,
        au.email,
        COALESCE(au.raw_user_meta_data->>'full_name', au.raw_user_meta_data->>'name', 'Unknown') as full_name,
        au.created_at
    FROM auth.users au
    WHERE NOT EXISTS (SELECT 1 FROM users u WHERE u.id = au.id)
    AND au.email_confirmed_at IS NOT NULL;
    
    GET DIAGNOSTICS synced_count = ROW_COUNT;
    RETURN synced_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to generate system health report
CREATE OR REPLACE FUNCTION get_system_health_report()
RETURNS JSONB AS $$
DECLARE
    result JSONB;
BEGIN
    SELECT jsonb_build_object(
        'database_size_mb', (SELECT pg_database_size(current_database()) / 1024 / 1024),
        'total_users', (SELECT COUNT(*) FROM users),
        'active_users', (SELECT COUNT(*) FROM users WHERE last_login > CURRENT_DATE - INTERVAL '30 days'),
        'total_projects', (SELECT COUNT(*) FROM projects),
        'active_projects', (SELECT COUNT(*) FROM projects WHERE status = 'in_progress'),
        'total_visits', (SELECT COUNT(*) FROM visits),
        'completed_visits', (SELECT COUNT(*) FROM visits WHERE status = 'completed'),
        'total_leads', (SELECT COUNT(*) FROM leads),
        'qualified_leads', (SELECT COUNT(*) FROM leads WHERE status = 'qualified'),
        'gps_logs_count', (SELECT COUNT(*) FROM gps_logs),
        'old_gps_logs', (SELECT COUNT(*) FROM gps_logs WHERE created_at < CURRENT_DATE - INTERVAL '90 days'),
        'orphaned_records', (
            SELECT COUNT(*) FROM visits v 
            WHERE NOT EXISTS (SELECT 1 FROM projects p WHERE p.id = v.project_id)
        ),
        'data_integrity_issues', (
            SELECT COUNT(*) FROM projects p 
            WHERE p.assigned_to IS NOT NULL 
            AND NOT EXISTS (SELECT 1 FROM users u WHERE u.id = p.assigned_to)
        )
    ) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to optimize database performance
CREATE OR REPLACE FUNCTION optimize_database()
RETURNS JSONB AS $$
DECLARE
    result JSONB;
    vacuum_result TEXT;
    analyze_result TEXT;
BEGIN
    -- Run VACUUM to reclaim storage and update statistics
    VACUUM (ANALYZE);
    
    -- Update table statistics
    ANALYZE;
    
    -- Reindex tables for better performance
    REINDEX TABLE projects;
    REINDEX TABLE visits;
    REINDEX TABLE users;
    REINDEX TABLE leads;
    REINDEX TABLE events;
    REINDEX TABLE gps_logs;
    
    SELECT jsonb_build_object(
        'status', 'completed',
        'message', 'Database optimization completed successfully',
        'timestamp', CURRENT_TIMESTAMP
    ) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to backup critical data
CREATE OR REPLACE FUNCTION backup_critical_data()
RETURNS JSONB AS $$
DECLARE
    result JSONB;
BEGIN
    -- Create backup tables with timestamp
    CREATE TABLE IF NOT EXISTS backup_projects_2024 AS 
    SELECT * FROM projects WHERE created_at >= CURRENT_DATE - INTERVAL '1 year';
    
    CREATE TABLE IF NOT EXISTS backup_visits_2024 AS 
    SELECT * FROM visits WHERE created_at >= CURRENT_DATE - INTERVAL '1 year';
    
    CREATE TABLE IF NOT EXISTS backup_users_2024 AS 
    SELECT * FROM users;
    
    CREATE TABLE IF NOT EXISTS backup_leads_2024 AS 
    SELECT * FROM leads WHERE created_at >= CURRENT_DATE - INTERVAL '1 year';
    
    SELECT jsonb_build_object(
        'status', 'completed',
        'backup_tables', ARRAY['backup_projects_2024', 'backup_visits_2024', 'backup_users_2024', 'backup_leads_2024'],
        'timestamp', CURRENT_TIMESTAMP
    ) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to validate data integrity
CREATE OR REPLACE FUNCTION validate_data_integrity()
RETURNS JSONB AS $$
DECLARE
    result JSONB;
    integrity_issues JSONB;
BEGIN
    SELECT jsonb_build_object(
        'orphaned_visits', (
            SELECT COUNT(*) FROM visits v 
            WHERE NOT EXISTS (SELECT 1 FROM projects p WHERE p.id = v.project_id)
        ),
        'orphaned_events', (
            SELECT COUNT(*) FROM events e 
            WHERE e.project_id IS NOT NULL 
            AND NOT EXISTS (SELECT 1 FROM projects p WHERE p.id = e.project_id)
        ),
        'orphaned_notes', (
            SELECT COUNT(*) FROM notes n 
            WHERE n.project_id IS NOT NULL 
            AND NOT EXISTS (SELECT 1 FROM projects p WHERE p.id = n.project_id)
        ),
        'invalid_user_references', (
            SELECT COUNT(*) FROM projects p 
            WHERE p.assigned_to IS NOT NULL 
            AND NOT EXISTS (SELECT 1 FROM users u WHERE u.id = p.assigned_to)
        ),
        'duplicate_emails', (
            SELECT COUNT(*) FROM (
                SELECT email, COUNT(*) 
                FROM users 
                GROUP BY email 
                HAVING COUNT(*) > 1
            ) as duplicates
        ),
        'inconsistent_dates', (
            SELECT COUNT(*) FROM projects p 
            WHERE p.start_date > p.end_date
        )
    ) INTO integrity_issues;
    
    SELECT jsonb_build_object(
        'status', CASE WHEN integrity_issues ? 'orphaned_visits' AND (integrity_issues->>'orphaned_visits')::int > 0 THEN 'issues_found' ELSE 'clean' END,
        'issues', integrity_issues,
        'timestamp', CURRENT_TIMESTAMP
    ) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to generate data export
CREATE OR REPLACE FUNCTION export_data_for_date_range(start_date DATE, end_date DATE)
RETURNS JSONB AS $$
DECLARE
    result JSONB;
BEGIN
    SELECT jsonb_build_object(
        'export_period', jsonb_build_object('start_date', start_date, 'end_date', end_date),
        'projects', (
            SELECT jsonb_agg(jsonb_build_object(
                'id', p.id,
                'name', p.name,
                'status', p.status,
                'budget', p.budget,
                'customer_name', p.customer_name,
                'assigned_to', u.full_name,
                'created_at', p.created_at
            ))
            FROM projects p
            LEFT JOIN users u ON p.assigned_to = u.id
            WHERE p.created_at::DATE BETWEEN start_date AND end_date
        ),
        'visits', (
            SELECT jsonb_agg(jsonb_build_object(
                'id', v.id,
                'project_name', p.name,
                'visit_type', v.visit_type,
                'status', v.status,
                'scheduled_date', v.scheduled_date,
                'duration_minutes', v.duration_minutes,
                'user_name', u.full_name
            ))
            FROM visits v
            JOIN projects p ON v.project_id = p.id
            JOIN users u ON v.user_id = u.id
            WHERE v.created_at::DATE BETWEEN start_date AND end_date
        ),
        'leads', (
            SELECT jsonb_agg(jsonb_build_object(
                'id', l.id,
                'name', l.name,
                'company', l.company,
                'status', l.status,
                'assigned_to', u.full_name,
                'created_at', l.created_at
            ))
            FROM leads l
            LEFT JOIN users u ON l.assigned_to = u.id
            WHERE l.created_at::DATE BETWEEN start_date AND end_date
        ),
        'summary', jsonb_build_object(
            'total_projects', (SELECT COUNT(*) FROM projects WHERE created_at::DATE BETWEEN start_date AND end_date),
            'total_visits', (SELECT COUNT(*) FROM visits WHERE created_at::DATE BETWEEN start_date AND end_date),
            'total_leads', (SELECT COUNT(*) FROM leads WHERE created_at::DATE BETWEEN start_date AND end_date),
            'total_revenue', (SELECT COALESCE(SUM(budget), 0) FROM projects WHERE created_at::DATE BETWEEN start_date AND end_date)
        )
    ) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to reset demo data
CREATE OR REPLACE FUNCTION reset_demo_data()
RETURNS JSONB AS $$
DECLARE
    result JSONB;
BEGIN
    -- Delete all data except admin user
    DELETE FROM activities;
    DELETE FROM notes;
    DELETE FROM event_attendees;
    DELETE FROM events;
    DELETE FROM visits;
    DELETE FROM leads;
    DELETE FROM regions;
    DELETE FROM gps_logs;
    DELETE FROM projects;
    DELETE FROM users WHERE role != 'admin';
    
    -- Reset sequences
    ALTER SEQUENCE projects_id_seq RESTART WITH 1;
    ALTER SEQUENCE visits_id_seq RESTART WITH 1;
    ALTER SEQUENCE events_id_seq RESTART WITH 1;
    ALTER SEQUENCE leads_id_seq RESTART WITH 1;
    ALTER SEQUENCE regions_id_seq RESTART WITH 1;
    ALTER SEQUENCE notes_id_seq RESTART WITH 1;
    ALTER SEQUENCE activities_id_seq RESTART WITH 1;
    ALTER SEQUENCE gps_logs_id_seq RESTART WITH 1;
    
    SELECT jsonb_build_object(
        'status', 'completed',
        'message', 'Demo data reset completed',
        'timestamp', CURRENT_TIMESTAMP
    ) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get database statistics
CREATE OR REPLACE FUNCTION get_database_stats()
RETURNS JSONB AS $$
DECLARE
    result JSONB;
BEGIN
    SELECT jsonb_build_object(
        'table_sizes', (
            SELECT jsonb_object_agg(table_name, table_size)
            FROM (
                SELECT 
                    schemaname||'.'||tablename as table_name,
                    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as table_size
                FROM pg_tables 
                WHERE schemaname = 'public'
                ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
            ) as sizes
        ),
        'index_sizes', (
            SELECT jsonb_object_agg(index_name, index_size)
            FROM (
                SELECT 
                    indexname as index_name,
                    pg_size_pretty(pg_relation_size(indexname::regclass)) as index_size
                FROM pg_indexes 
                WHERE schemaname = 'public'
                ORDER BY pg_relation_size(indexname::regclass) DESC
            ) as index_sizes
        ),
        'database_size', pg_size_pretty(pg_database_size(current_database())),
        'total_connections', (
            SELECT count(*) FROM pg_stat_activity WHERE state = 'active'
        ),
        'cache_hit_ratio', (
            SELECT round(100.0 * sum(heap_blks_hit) / (sum(heap_blks_hit) + sum(heap_blks_read)), 2)
            FROM pg_statio_user_tables
        )
    ) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- SCHEDULED MAINTENANCE TASKS
-- =====================================================

-- Create a function to run scheduled maintenance
CREATE OR REPLACE FUNCTION run_scheduled_maintenance()
RETURNS JSONB AS $$
DECLARE
    result JSONB;
    gps_cleaned INTEGER;
    projects_archived INTEGER;
    status_updated INTEGER;
    duration_calculated INTEGER;
BEGIN
    -- Clean up old GPS logs (older than 90 days)
    SELECT cleanup_old_gps_logs(90) INTO gps_cleaned;
    
    -- Archive completed projects (older than 12 months)
    SELECT archive_completed_projects(12) INTO projects_archived;
    
    -- Update project statuses
    SELECT update_project_status() INTO status_updated;
    
    -- Calculate visit durations
    SELECT calculate_visit_duration() INTO duration_calculated;
    
    -- Optimize database
    PERFORM optimize_database();
    
    SELECT jsonb_build_object(
        'status', 'completed',
        'gps_logs_cleaned', gps_cleaned,
        'projects_archived', projects_archived,
        'statuses_updated', status_updated,
        'durations_calculated', duration_calculated,
        'timestamp', CURRENT_TIMESTAMP
    ) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON FUNCTION cleanup_old_gps_logs IS 'Clean up GPS logs older than specified days to save storage';
COMMENT ON FUNCTION archive_completed_projects IS 'Archive completed projects older than specified months';
COMMENT ON FUNCTION update_project_status IS 'Automatically update project status based on visit completion';
COMMENT ON FUNCTION calculate_visit_duration IS 'Calculate visit duration from start and end times';
COMMENT ON FUNCTION sync_auth_users IS 'Sync Supabase auth users with our users table';
COMMENT ON FUNCTION get_system_health_report IS 'Generate comprehensive system health report';
COMMENT ON FUNCTION optimize_database IS 'Optimize database performance with VACUUM and REINDEX';
COMMENT ON FUNCTION backup_critical_data IS 'Create backup of critical data tables';
COMMENT ON FUNCTION validate_data_integrity IS 'Validate data integrity and find orphaned records';
COMMENT ON FUNCTION export_data_for_date_range IS 'Export data for specified date range';
COMMENT ON FUNCTION reset_demo_data IS 'Reset all data for demo purposes';
COMMENT ON FUNCTION get_database_stats IS 'Get detailed database statistics';
COMMENT ON FUNCTION run_scheduled_maintenance IS 'Run all scheduled maintenance tasks'; 