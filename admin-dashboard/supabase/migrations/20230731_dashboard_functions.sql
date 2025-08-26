-- Create function to get dashboard KPIs
CREATE OR REPLACE FUNCTION get_dashboard_kpis()
RETURNS JSONB AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'total_visits', (SELECT COUNT(*) FROM visits),
    'total_revenue', (SELECT COALESCE(SUM(amount), 0) FROM invoices WHERE status = 'paid'),
    'active_projects', (SELECT COUNT(*) FROM projects WHERE status = 'active'),
    'new_customers', (SELECT COUNT(*) FROM customers WHERE created_at >= (CURRENT_DATE - INTERVAL '30 days')),
    'avg_visit_duration', (SELECT AVG(EXTRACT(EPOCH FROM (end_time - start_time)) / 60) FROM visits WHERE end_time IS NOT NULL)
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get sales trend data
CREATE OR REPLACE FUNCTION get_sales_trend(time_range TEXT DEFAULT 'week')
RETURNS TABLE (date DATE, amount NUMERIC) AS $$
BEGIN
  IF time_range = 'day' THEN
    RETURN QUERY 
    SELECT 
      date_trunc('hour', created_at)::date as date,
      COALESCE(SUM(amount), 0) as amount
    FROM 
      invoices 
    WHERE 
      created_at >= (CURRENT_DATE - INTERVAL '1 day')
      AND status = 'paid'
    GROUP BY 
      date_trunc('hour', created_at)
    ORDER BY 
      date;
  ELSIF time_range = 'month' THEN
    RETURN QUERY 
    SELECT 
      date_trunc('day', created_at)::date as date,
      COALESCE(SUM(amount), 0) as amount
    FROM 
      invoices 
    WHERE 
      created_at >= (CURRENT_DATE - INTERVAL '30 days')
      AND status = 'paid'
    GROUP BY 
      date_trunc('day', created_at)
    ORDER BY 
      date;
  ELSE -- week (default)
    RETURN QUERY 
    SELECT 
      date_trunc('day', created_at)::date as date,
      COALESCE(SUM(amount), 0) as amount
    FROM 
      invoices 
    WHERE 
      created_at >= (CURRENT_DATE - INTERVAL '7 days')
      AND status = 'paid'
    GROUP BY 
      date_trunc('day', created_at)
    ORDER BY 
      date;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get revenue distribution
CREATE OR REPLACE FUNCTION get_revenue_distribution()
RETURNS TABLE (category TEXT, amount NUMERIC) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.category,
    COALESCE(SUM(i.amount), 0) as amount
  FROM 
    projects p
  LEFT JOIN 
    invoices i ON p.id = i.project_id
  WHERE 
    i.status = 'paid'
  GROUP BY 
    p.category
  ORDER BY 
    amount DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get team performance
CREATE OR REPLACE FUNCTION get_team_performance()
RETURNS TABLE (
  user_id UUID,
  user_name TEXT,
  visits_completed INTEGER,
  revenue_generated NUMERIC,
  avg_visit_rating NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id as user_id,
    u.full_name as user_name,
    COUNT(v.id) as visits_completed,
    COALESCE(SUM(i.amount), 0) as revenue_generated,
    AVG(v.rating) as avg_visit_rating
  FROM 
    users u
  LEFT JOIN 
    visits v ON u.id = v.user_id
  LEFT JOIN 
    invoices i ON v.id = i.visit_id AND i.status = 'paid'
  WHERE 
    v.status = 'completed'
    AND v.completed_at >= (CURRENT_DATE - INTERVAL '30 days')
  GROUP BY 
    u.id, u.full_name
  ORDER BY 
    revenue_generated DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
