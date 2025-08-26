-- Function to get region history
CREATE OR REPLACE FUNCTION public.get_region_history(
    _region_id uuid
)
RETURNS SETOF public.region_history AS $$
BEGIN
    RETURN QUERY SELECT rh.*
    FROM public.region_history rh
    WHERE rh.region_id = _region_id
    ORDER BY rh.changed_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
