-- Create region_events table
CREATE TABLE public.region_events (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    region_id uuid NOT NULL REFERENCES public.regions(id) ON DELETE CASCADE,
    event_type text NOT NULL, -- 'entry' or 'exit'
    event_time timestamptz DEFAULT now() NOT NULL,
    visit_duration interval, -- Only for 'exit' events
    session_id uuid NOT NULL -- To group entry/exit pairs for a continuous visit
);

-- Add RLS policies for region_events
ALTER TABLE public.region_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for authenticated users on their own region events" ON public.region_events FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Enable insert for authenticated users on their own region events" ON public.region_events FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Enable update for authenticated users on their own region events" ON public.region_events FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Enable delete for authenticated users on their own region events" ON public.region_events FOR DELETE USING (auth.uid() = user_id);

-- Add indexes for faster queries
CREATE INDEX idx_region_events_user_id_region_id ON public.region_events (user_id, region_id);
CREATE INDEX idx_region_events_session_id ON public.region_events (session_id);
