-- Create region_assignments table
CREATE TABLE public.region_assignments (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    region_id uuid NOT NULL REFERENCES public.regions(id) ON DELETE CASCADE,
    user_id uuid NOT NULL,
    assigned_by uuid NOT NULL REFERENCES public.users(id) ON DELETE SET NULL,
    assigned_at timestamptz DEFAULT now(),
    role text, -- e.g., 'admin', 'manager', 'field_user' within this region
    UNIQUE (region_id, user_id),
    CONSTRAINT fk_user_id FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE
);

-- Add RLS policies for region_assignments
ALTER TABLE public.region_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all authenticated users" ON public.region_assignments FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users" ON public.region_assignments FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for assigned users or admins" ON public.region_assignments FOR UPDATE USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM public.region_assignments ra WHERE ra.region_id = region_assignments.region_id AND ra.user_id = auth.uid() AND ra.role = 'admin'));
CREATE POLICY "Enable delete for assigned users or admins" ON public.region_assignments FOR DELETE USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM public.region_assignments ra WHERE ra.region_id = region_assignments.region_id AND ra.user_id = auth.uid() AND ra.role = 'admin'));
