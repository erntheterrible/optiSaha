-- Create region_history table
CREATE TABLE public.region_history (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    region_id uuid NOT NULL REFERENCES public.regions(id) ON DELETE CASCADE,
    change_type text NOT NULL, -- e.g., 'create', 'update', 'delete'
    changed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    changed_at timestamptz DEFAULT now() NOT NULL,
    old_data jsonb, -- Snapshot of the region data before the change
    new_data jsonb -- Snapshot of the region data after the change
);

-- Add RLS policies for region_history
ALTER TABLE public.region_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all authenticated users" ON public.region_history FOR SELECT USING (true);

-- Add index for faster queries by region and time
CREATE INDEX idx_region_history_region_id_changed_at ON public.region_history (region_id, changed_at);
