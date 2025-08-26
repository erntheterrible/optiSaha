-- Function to log a region event (entry/exit)
CREATE OR REPLACE FUNCTION public.log_region_event(
    _region_id uuid,
    _event_type text, -- 'entry' or 'exit'
    _session_id uuid -- Unique ID for a continuous visit session
)
RETURNS public.region_events AS $$
DECLARE
    new_event public.region_events;
    entry_event_time timestamptz;
    calculated_duration interval;
BEGIN
    IF _event_type = 'exit' THEN
        -- Find the corresponding 'entry' event for this session
        SELECT event_time INTO entry_event_time
        FROM public.region_events
        WHERE user_id = auth.uid()
          AND region_id = _region_id
          AND event_type = 'entry'
          AND session_id = _session_id
        ORDER BY event_time DESC
        LIMIT 1;

        IF entry_event_time IS NOT NULL THEN
            calculated_duration := now() - entry_event_time;
        END IF;
    END IF;

    INSERT INTO public.region_events (user_id, region_id, event_type, session_id, visit_duration)
    VALUES (auth.uid(), _region_id, _event_type, _session_id, calculated_duration)
    RETURNING * INTO new_event;

    RETURN new_event;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get region events for a user/region/date range
CREATE OR REPLACE FUNCTION public.get_region_events(
    _user_id uuid DEFAULT NULL,
    _region_id uuid DEFAULT NULL,
    _start_time timestamptz DEFAULT NULL,
    _end_time timestamptz DEFAULT NULL
)
RETURNS SETOF public.region_events AS $$
BEGIN
    RETURN QUERY SELECT re.*
    FROM public.region_events re
    WHERE
        (re.user_id = auth.uid() OR EXISTS (SELECT 1 FROM public.region_assignments ra WHERE ra.region_id = re.region_id AND ra.user_id = auth.uid() AND ra.role = 'admin')) -- Admins can see events for regions they manage
        AND (_user_id IS NULL OR re.user_id = _user_id)
        AND (_region_id IS NULL OR re.region_id = _region_id)
        AND (_start_time IS NULL OR re.event_time >= _start_time)
        AND (_end_time IS NULL OR re.event_time <= _end_time);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
