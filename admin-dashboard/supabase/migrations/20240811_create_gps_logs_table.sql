-- Create gps_logs table
CREATE TABLE public.gps_logs (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    latitude numeric NOT NULL,
    longitude numeric NOT NULL,
    timestamp timestamptz DEFAULT now() NOT NULL,
    speed numeric,
    accuracy numeric
);

-- Add RLS policies for gps_logs
ALTER TABLE public.gps_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for authenticated users on their own logs" ON public.gps_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Enable insert for authenticated users on their own logs" ON public.gps_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Enable update for authenticated users on their own logs" ON public.gps_logs FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Enable delete for authenticated users on their own logs" ON public.gps_logs FOR DELETE USING (auth.uid() = user_id);

-- Add index for faster queries by user and time
CREATE INDEX idx_gps_logs_user_id_timestamp ON public.gps_logs (user_id, timestamp);
