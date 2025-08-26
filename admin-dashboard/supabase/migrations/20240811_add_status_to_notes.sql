CREATE TYPE public.note_status AS ENUM ('TO DO', 'IN PROGRESS', 'COMPLETE');

ALTER TABLE public.notes
ADD COLUMN status note_status NOT NULL DEFAULT 'TO DO';

-- Drop the existing policy and recreate it to include the new column
DROP POLICY "Enable all actions for users based on user_id" ON "public"."notes";

CREATE POLICY "Enable all actions for users based on user_id" ON "public"."notes"
AS PERMISSIVE FOR ALL
TO public
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
