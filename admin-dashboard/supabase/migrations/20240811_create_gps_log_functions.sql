-- Function to log GPS data
CREATE OR REPLACE FUNCTION public.log_gps_data(
    _latitude numeric,
    _longitude numeric,
    _speed numeric DEFAULT NULL,
    _accuracy numeric DEFAULT NULL
)
RETURNS public.gps_logs AS $$
DECLARE
    new_log public.gps_logs;
BEGIN
    INSERT INTO public.gps_logs (user_id, latitude, longitude, speed, accuracy)
    VALUES (auth.uid(), _latitude, _longitude, _speed, _accuracy)
    RETURNING * INTO new_log;

    RETURN new_log;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get GPS logs for a user within a date range and/or region
CREATE OR REPLACE FUNCTION public.get_gps_logs(
    _user_id uuid DEFAULT NULL,
    _start_time timestamptz DEFAULT NULL,
    _end_time timestamptz DEFAULT NULL,
    _region_id uuid DEFAULT NULL
)
RETURNS SETOF public.gps_logs AS $$
BEGIN
    RETURN QUERY SELECT gl.*
    FROM public.gps_logs gl
    WHERE
        (gl.user_id = auth.uid() OR auth.uid() IN (SELECT user_id FROM public.region_assignments WHERE region_id = _region_id AND role = 'admin')) -- Allow admins to see logs for regions they manage
        AND (_user_id IS NULL OR gl.user_id = _user_id)
        AND (_start_time IS NULL OR gl.timestamp >= _start_time)
        AND (_end_time IS NULL OR gl.timestamp <= _end_time)
        AND (_region_id IS NULL OR ST_Contains(
            (SELECT ST_GeomFromGeoJSON(geometry::text) FROM public.regions WHERE id = _region_id),
            ST_SetSRID(ST_MakePoint(gl.longitude, gl.latitude), 4326)
        ));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
