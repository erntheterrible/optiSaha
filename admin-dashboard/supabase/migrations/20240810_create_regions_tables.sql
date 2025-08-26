-- Create the regions table
CREATE TABLE public.regions (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    name text NOT NULL,
    description text,
    shape_type text NOT NULL, -- e.g., 'polygon', 'polyline', 'point'
    geometry jsonb NOT NULL, -- GeoJSON representation of the shape
    color text DEFAULT '#3388ff',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL
);

ALTER TABLE public.regions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own regions" ON public.regions
    FOR SELECT USING (created_by = auth.uid());

CREATE POLICY "Users can insert their own regions" ON public.regions
    FOR INSERT WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update their own regions" ON public.regions
    FOR UPDATE USING (created_by = auth.uid());

CREATE POLICY "Users can delete their own regions" ON public.regions
    FOR DELETE USING (created_by = auth.uid());

-- Create the region_assignments table
CREATE TABLE public.region_assignments (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    region_id uuid REFERENCES public.regions(id) ON DELETE CASCADE,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    assigned_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    assigned_at timestamptz DEFAULT now(),
    role text DEFAULT 'member',
    UNIQUE (region_id, user_id)
);

ALTER TABLE public.region_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their region assignments" ON public.region_assignments
    FOR SELECT USING (user_id = auth.uid() OR assigned_by = auth.uid());

CREATE POLICY "Users can insert region assignments" ON public.region_assignments
    FOR INSERT WITH CHECK (assigned_by = auth.uid());

CREATE POLICY "Users can delete their region assignments" ON public.region_assignments
    FOR DELETE USING (assigned_by = auth.uid());

-- Create the gps_logs table
CREATE TABLE public.gps_logs (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    latitude numeric NOT NULL,
    longitude numeric NOT NULL,
    altitude numeric,
    timestamp timestamptz DEFAULT now(),
    accuracy numeric,
    speed numeric,
    heading numeric
);

ALTER TABLE public.gps_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own gps logs" ON public.gps_logs
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own gps logs" ON public.gps_logs
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- Create the user_locations table (for live tracking)
CREATE TABLE public.user_locations (
    user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    latitude numeric NOT NULL,
    longitude numeric NOT NULL,
    updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.user_locations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all user locations" ON public.user_locations
    FOR SELECT USING (true); -- Adjust as needed for specific visibility rules

CREATE POLICY "Users can update their own location" ON public.user_locations
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own location" ON public.user_locations
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- Create the region_analytics table
CREATE TABLE public.region_analytics (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    region_id uuid REFERENCES public.regions(id) ON DELETE CASCADE,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    visit_count int DEFAULT 0,
    time_spent_seconds int DEFAULT 0,
    last_visit_at timestamptz,
    UNIQUE (region_id, user_id)
);

ALTER TABLE public.region_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all region analytics" ON public.region_analytics
    FOR SELECT USING (true); -- Adjust as needed for specific visibility rules

CREATE POLICY "Users can insert region analytics" ON public.region_analytics
    FOR INSERT WITH CHECK (true); -- Adjust as needed

CREATE POLICY "Users can update region analytics" ON public.region_analytics
    FOR UPDATE USING (true); -- Adjust as needed
