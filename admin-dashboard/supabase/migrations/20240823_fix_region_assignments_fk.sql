-- Fix foreign keys in region_assignments table to reference public.users

-- Drop existing foreign keys
ALTER TABLE public.region_assignments DROP CONSTRAINT IF EXISTS region_assignments_user_id_fkey;
ALTER TABLE public.region_assignments DROP CONSTRAINT IF EXISTS region_assignments_assigned_by_fkey;

-- Add new foreign keys to public.users
ALTER TABLE public.region_assignments 
    ADD CONSTRAINT region_assignments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

ALTER TABLE public.region_assignments 
    ADD CONSTRAINT region_assignments_assigned_by_fkey FOREIGN KEY (assigned_by) REFERENCES public.users(id) ON DELETE SET NULL;
