-- Function to create a new region
CREATE OR REPLACE FUNCTION public.create_region(
    _name text,
    _description text,
    _shape_type text,
    _geometry jsonb,
    _color text
)
RETURNS public.regions AS $$
DECLARE
    new_region public.regions;
BEGIN
    INSERT INTO public.regions (name, description, shape_type, geometry, color, created_by)
    VALUES (_name, _description, _shape_type, _geometry, _color, auth.uid())
    RETURNING * INTO new_region;

    RETURN new_region;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update an existing region
CREATE OR REPLACE FUNCTION public.update_region(
    _region_id uuid,
    _name text,
    _description text,
    _shape_type text,
    _geometry jsonb,
    _color text
)
RETURNS public.regions AS $$
DECLARE
    updated_region public.regions;
BEGIN
    UPDATE public.regions
    SET
        name = _name,
        description = _description,
        shape_type = _shape_type,
        geometry = _geometry,
        color = _color,
        updated_at = now()
    WHERE id = _region_id AND created_by = auth.uid()
    RETURNING * INTO updated_region;

    RETURN updated_region;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to delete a region
CREATE OR REPLACE FUNCTION public.delete_region(
    _region_id uuid
)
RETURNS void AS $$
BEGIN
    DELETE FROM public.regions
    WHERE id = _region_id AND created_by = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get regions accessible to the current user
CREATE OR REPLACE FUNCTION public.get_accessible_regions()
RETURNS SETOF public.regions AS $$
BEGIN
    RETURN QUERY SELECT r.*
    FROM public.regions r
    LEFT JOIN public.region_assignments ra ON r.id = ra.region_id
    WHERE r.created_by = auth.uid() OR ra.user_id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
