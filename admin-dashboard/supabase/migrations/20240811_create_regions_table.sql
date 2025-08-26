-- Create regions table
CREATE TABLE public.regions (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL,
    description text,
    shape_type text NOT NULL,
    geometry jsonb NOT NULL,
    color text,
    created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Add RLS policies for regions
ALTER TABLE public.regions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all authenticated users" ON public.regions FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users" ON public.regions FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Enable update for users who created the region" ON public.regions FOR UPDATE USING (auth.uid() = created_by);
CREATE POLICY "Enable delete for users who created the region" ON public.regions FOR DELETE USING (auth.uid() = created_by);
