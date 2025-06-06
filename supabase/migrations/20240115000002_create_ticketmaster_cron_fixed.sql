-- Create a function to sync Ticketmaster events
CREATE OR REPLACE FUNCTION sync_ticketmaster_events()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Call the edge function to sync events
  PERFORM
    net.http_post(
      url := current_setting('app.supabase_url') || '/functions/v1/get_ticketmaster_events',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.supabase_service_key')
      ),
      body := '{}'
    );
END;
$$;

-- Create the cron job to run daily at 2 AM UTC
SELECT cron.schedule(
  'sync-ticketmaster-events',
  '0 2 * * *',
  'SELECT sync_ticketmaster_events();'
);

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION sync_ticketmaster_events() TO postgres;
GRANT EXECUTE ON FUNCTION sync_ticketmaster_events() TO service_role;
