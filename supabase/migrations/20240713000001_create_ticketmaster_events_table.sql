-- Create Ticketmaster events table
CREATE TABLE IF NOT EXISTS public.ticketmaster_events (
  id TEXT PRIMARY KEY DEFAULT 'tm-' || EXTRACT(EPOCH FROM NOW())::TEXT || '-' || FLOOR(RANDOM() * 1000000)::TEXT,
  ticketmaster_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  url TEXT,
  locale TEXT DEFAULT 'en-us',
  images JSONB DEFAULT '[]'::jsonb,
  sales JSONB DEFAULT '{}'::jsonb,
  dates JSONB DEFAULT '{}'::jsonb,
  classifications JSONB DEFAULT '[]'::jsonb,
  promoter JSONB DEFAULT '{}'::jsonb,
  promoters JSONB DEFAULT '[]'::jsonb,
  price_ranges JSONB DEFAULT '[]'::jsonb,
  products JSONB DEFAULT '[]'::jsonb,
  seat_map JSONB DEFAULT '{}'::jsonb,
  accessibility JSONB DEFAULT '{}'::jsonb,
  ticket_limit JSONB DEFAULT '{}'::jsonb,
  age_restrictions JSONB DEFAULT '{}'::jsonb,
  ticketing JSONB DEFAULT '{}'::jsonb,
  venues JSONB DEFAULT '[]'::jsonb,
  attractions JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_ticketmaster_events_name ON public.ticketmaster_events USING gin(to_tsvector('english', name));
CREATE INDEX IF NOT EXISTS idx_ticketmaster_events_dates ON public.ticketmaster_events USING gin(dates);
CREATE INDEX IF NOT EXISTS idx_ticketmaster_events_venues ON public.ticketmaster_events USING gin(venues);
CREATE INDEX IF NOT EXISTS idx_ticketmaster_events_created_at ON public.ticketmaster_events(created_at);

-- Create trigger for updating timestamps
CREATE TRIGGER update_ticketmaster_events_updated_at
BEFORE UPDATE ON public.ticketmaster_events
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

-- Disable RLS by default
ALTER TABLE public.ticketmaster_events DISABLE ROW LEVEL SECURITY;

-- Enable realtime subscriptions
alter publication supabase_realtime add table public.ticketmaster_events;
