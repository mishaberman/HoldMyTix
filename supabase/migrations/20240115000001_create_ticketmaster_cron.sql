-- Create a cron job to sync Ticketmaster events daily
-- This requires the pg_cron extension to be enabled

-- Enable the pg_cron extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule the job to run daily at 2 AM UTC
SELECT cron.schedule(
  'sync-ticketmaster-events',
  '0 2 * * *', -- Daily at 2 AM UTC
  $$
  SELECT
    net.http_post(
      url := 'https://jhzdxaesfbripkorambc.supabase.co/functions/v1/get_ticketmaster_events',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')
      ),
      body := '{}'
    );
  $$
);
