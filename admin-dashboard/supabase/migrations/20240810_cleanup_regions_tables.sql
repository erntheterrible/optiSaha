-- Drop RLS policies for region_analytics if they exist
DROP POLICY IF EXISTS "Users can view all region analytics" ON public.region_analytics;
DROP POLICY IF EXISTS "Users can insert region analytics" ON public.region_analytics;
DROP POLICY IF EXISTS "Users can update region analytics" ON public.region_analytics;

-- Drop RLS policies for user_locations if they exist
DROP POLICY IF EXISTS "Enable join with users table" ON public.user_locations;

-- Drop tables in dependency order
DROP TABLE IF EXISTS public.region_analytics CASCADE;
DROP TABLE IF EXISTS public.user_locations CASCADE;
DROP TABLE IF EXISTS public.gps_logs CASCADE;
DROP TABLE IF EXISTS public.regions CASCADE;

-- Optional: Clean up any sequences if they were used for integer IDs
-- This is less likely if UUIDs were used, but good for completeness if you had integer IDs
-- DROP SEQUENCE IF EXISTS public.regions_id_seq CASCADE;
-- DROP SEQUENCE IF EXISTS public.gps_logs_id_seq CASCADE;
-- DROP SEQUENCE IF EXISTS public.user_locations_id_seq CASCADE;
-- DROP SEQUENCE IF EXISTS public.region_analytics_id_seq CASCADE;

-- Optional: Remove any functions or triggers specifically related to regions if they were created
-- For example:
-- DROP FUNCTION IF EXISTS public.get_accessible_regions_count();
