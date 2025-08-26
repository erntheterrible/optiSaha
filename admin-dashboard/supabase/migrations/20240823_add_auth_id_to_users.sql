-- Add auth_id column to users table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_schema = 'public' 
                  AND table_name = 'users' 
                  AND column_name = 'auth_id') THEN
        ALTER TABLE public.users ADD COLUMN auth_id uuid;
    END IF;
END $$;

-- First, drop the existing policies to avoid conflicts
DROP POLICY IF EXISTS "Allow users to view their own profile" ON public.users;
DROP POLICY IF EXISTS "Allow admins to view all users" ON public.users;

-- Create a function to check admin status
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.users 
    WHERE auth_id = auth.uid()
    AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- Create the new policies
CREATE POLICY "Allow users to view their own profile" 
  ON public.users 
  FOR SELECT 
  USING (auth.uid() = auth_id);

CREATE POLICY "Allow admins to view all users"
  ON public.users 
  FOR SELECT
  USING (public.is_admin());
