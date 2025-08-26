-- Create region_analytics table
CREATE TABLE public.region_analytics (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    region_id uuid NOT NULL REFERENCES public.regions(id) ON DELETE CASCADE,
    date date NOT NULL,
    total_visits integer DEFAULT 0,
    total_time_spent interval DEFAULT '0'::interval,
    unique_visitors integer DEFAULT 0,
    first_visit_at timestamptz,
    last_visit_at timestamptz,
    updated_at timestamptz DEFAULT now(),
    UNIQUE (region_id, date)
);

-- Add RLS policies for region_analytics
ALTER TABLE public.region_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all authenticated users" ON public.region_analytics FOR SELECT USING (true);

-- Add indexes for faster queries
CREATE INDEX idx_region_analytics_region_id_date ON public.region_analytics (region_id, date);
