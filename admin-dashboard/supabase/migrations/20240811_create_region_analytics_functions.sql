-- Function to get region analytics
CREATE OR REPLACE FUNCTION public.get_region_analytics(
    _region_id uuid DEFAULT NULL,
    _start_date date DEFAULT NULL,
    _end_date date DEFAULT NULL
)
RETURNS SETOF public.region_analytics AS $$
BEGIN
    RETURN QUERY SELECT ra.*
    FROM public.region_analytics ra
    WHERE
        (_region_id IS NULL OR ra.region_id = _region_id)
        AND (_start_date IS NULL OR ra.date >= _start_date)
        AND (_end_date IS NULL OR ra.date <= _end_date)
    ORDER BY ra.date DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
