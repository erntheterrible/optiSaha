ALTER TABLE public.notes
ADD COLUMN due_date TIMESTAMPTZ,
ADD COLUMN priority TEXT DEFAULT 'Medium';

-- Update RLS policies to include the new columns
DROP POLICY IF EXISTS "Enable all for authenticated users only" ON public.notes;

CREATE POLICY "Enable all for authenticated users only" ON public.notes
AS PERMISSIVE FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
