-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Schedule the telegram reminder edge function to run daily at 9:00 AM
SELECT cron.schedule(
  'notify_telegram_reminders',
  '0 9 * * *',
  $$
  SELECT net.http_post(
    url := 'https://nywpojhuxuansxuotuii.supabase.co/functions/v1/notify_telegram_reminders',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer YOUR_SUPABASE_SERVICE_ROLE_KEY'
    ),
    body := '{}'::jsonb
  );
  $$
);
