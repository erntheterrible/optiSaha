-- Function to assign users to a region
CREATE OR REPLACE FUNCTION public.assign_users_to_region(
    _region_id uuid,
    _user_ids uuid[]
)
RETURNS SETOF public.region_assignments AS $$
DECLARE
    user_id_val uuid;
    new_assignment public.region_assignments;
BEGIN
    FOREACH user_id_val IN ARRAY _user_ids
    LOOP
        INSERT INTO public.region_assignments (region_id, user_id, assigned_by)
        VALUES (_region_id, user_id_val, auth.uid())
        ON CONFLICT (region_id, user_id) DO NOTHING -- Prevent duplicate assignments
        RETURNING * INTO new_assignment;

        IF new_assignment.id IS NOT NULL THEN
            RETURN NEXT new_assignment;
        END IF;
    END LOOP;
    RETURN;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to unassign users from a region
CREATE OR REPLACE FUNCTION public.unassign_users_from_region(
    _region_id uuid,
    _user_ids uuid[]
)
RETURNS void AS $$
BEGIN
    DELETE FROM public.region_assignments
    WHERE region_id = _region_id AND user_id = ANY(_user_ids);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get region assignments for a specific region
CREATE OR REPLACE FUNCTION public.get_region_assignments(
    _region_id uuid
)
RETURNS TABLE (
    id uuid,
    region_id uuid,
    user_id uuid,
    assigned_by uuid,
    assigned_at timestamptz,
    role text,
    user_email text,
    user_full_name text
) AS $$
BEGIN
    RETURN QUERY SELECT
        ra.id,
        ra.region_id,
        ra.user_id,
        ra.assigned_by,
        ra.assigned_at,
        ra.role,
        au.email AS user_email,
        (au.raw_user_meta_data->>'full_name')::text AS user_full_name
    FROM public.region_assignments ra
    JOIN auth.users au ON ra.user_id = au.id
    WHERE ra.region_id = _region_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
