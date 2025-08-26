-- Grant execute permission to the 'authenticated' role for each function.
-- This allows logged-in users to call these functions via the API.

GRANT EXECUTE ON FUNCTION get_sales_trends(integer) TO authenticated;
GRANT EXECUTE ON FUNCTION get_project_status_distribution() TO authenticated;
GRANT EXECUTE ON FUNCTION get_visit_analytics(integer) TO authenticated;
GRANT EXECUTE ON FUNCTION get_team_performance() TO authenticated;

-- It can also be useful to grant permissions to the 'anon' role if you ever need
-- to access this data from a non-authenticated state.
GRANT EXECUTE ON FUNCTION get_sales_trends(integer) TO anon;
GRANT EXECUTE ON FUNCTION get_project_status_distribution() TO anon;
GRANT EXECUTE ON FUNCTION get_visit_analytics(integer) TO anon;
GRANT EXECUTE ON FUNCTION get_team_performance() TO anon;
