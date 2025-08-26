-- Drop existing functions to ensure a clean slate
DROP FUNCTION IF EXISTS get_sales_trends(integer);
DROP FUNCTION IF EXISTS get_project_status_distribution();
DROP FUNCTION IF EXISTS get_visit_analytics(integer);
DROP FUNCTION IF EXISTS get_team_performance();

-- Function to get sales trends over the last N months
CREATE OR REPLACE FUNCTION get_sales_trends(months_back integer DEFAULT 12)
RETURNS TABLE(
    month_start date,
    total_projects bigint,
    total_revenue numeric,
    avg_project_value numeric
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        date_trunc('month', olusturma_tarihi)::date AS month_start,
        COUNT(id) AS total_projects,
        SUM(deger) AS total_revenue,
        AVG(deger) AS avg_project_value
    FROM
        projeler
    WHERE
        olusturma_tarihi >= date_trunc('month', current_date - (months_back || ' months')::interval)
    GROUP BY
        date_trunc('month', olusturma_tarihi)
    ORDER BY
        month_start;
END;
$$ LANGUAGE plpgsql;

-- Function to get the distribution of project statuses
CREATE OR REPLACE FUNCTION get_project_status_distribution()
RETURNS TABLE(
    status text,
    project_count bigint,
    percentage numeric
) AS $$
BEGIN
    RETURN QUERY
    WITH status_counts AS (
        SELECT
            durum,
            COUNT(*) AS count
        FROM
            projeler
        GROUP BY
            durum
    ),
    total_projects AS (
        SELECT COUNT(*) AS total FROM projeler
    )
    SELECT
        sc.durum::text AS status,
        sc.count AS project_count,
        (sc.count::numeric / tp.total::numeric) * 100 AS percentage
    FROM
        status_counts sc,
        total_projects tp
    ORDER BY
        sc.count DESC;
END;
$$ LANGUAGE plpgsql;

-- Function for detailed visit analytics
CREATE OR REPLACE FUNCTION get_visit_analytics(days_back integer DEFAULT 30)
RETURNS TABLE(
    visit_type text,
    total_visits bigint,
    completed_visits bigint,
    avg_duration_minutes numeric,
    completion_rate numeric
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        COALESCE(v.ziyaret_tipi, 'Unknown')::text AS visit_type,
        COUNT(v.id) AS total_visits,
        COUNT(CASE WHEN v.durum = 'tamamlandı' THEN 1 END) AS completed_visits,
        AVG(EXTRACT(EPOCH FROM (v.bitis_zamani - v.baslangic_zamani)) / 60) AS avg_duration_minutes,
        (COUNT(CASE WHEN v.durum = 'tamamlandı' THEN 1 END)::numeric / COUNT(v.id)::numeric) * 100 AS completion_rate
    FROM
        ziyaretler v
    WHERE
        v.baslangic_zamani >= (current_date - (days_back || ' days')::interval)
    GROUP BY
        v.ziyaret_tipi;
END;
$$ LANGUAGE plpgsql;

-- Function for team performance metrics
CREATE OR REPLACE FUNCTION get_team_performance()
RETURNS TABLE(
    user_id uuid,
    full_name text,
    total_projects_assigned bigint,
    total_projects_completed bigint,
    completion_rate numeric,
    total_revenue_generated numeric,
    avg_project_value numeric,
    total_visits bigint,
    avg_visits_per_day numeric
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        u.id AS user_id,
        u.full_name,
        COUNT(DISTINCT p.id) AS total_projects_assigned,
        COUNT(DISTINCT CASE WHEN p.durum = 'tamamlandı' THEN p.id END) AS total_projects_completed,
        (COUNT(DISTINCT CASE WHEN p.durum = 'tamamlandı' THEN p.id END)::numeric / COUNT(DISTINCT p.id)::numeric) * 100 AS completion_rate,
        COALESCE(SUM(p.deger), 0) AS total_revenue_generated,
        COALESCE(AVG(p.deger), 0) AS avg_project_value,
        COUNT(DISTINCT v.id) AS total_visits,
        COUNT(DISTINCT v.id)::numeric / COUNT(DISTINCT date_trunc('day', v.baslangic_zamani))::numeric AS avg_visits_per_day
    FROM
        users u
    LEFT JOIN
        projeler p ON u.id = p.satisci_id
    LEFT JOIN
        ziyaretler v ON u.id = v.user_id
    GROUP BY
        u.id, u.full_name
    ORDER BY
        total_revenue_generated DESC;
END;
$$ LANGUAGE plpgsql;
