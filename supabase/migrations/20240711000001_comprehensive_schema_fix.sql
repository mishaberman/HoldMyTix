-- Comprehensive schema fix to resolve all type conflicts and create complete database structure

-- Drop all existing tables to start fresh
DROP TABLE IF EXISTS public.payment_records CASCADE;
DROP TABLE IF EXISTS public.ticket_transfers CASCADE;
DROP TABLE IF EXISTS public.email_notifications CASCADE;
DROP TABLE IF EXISTS public.docusign_agreements CASCADE;
DROP TABLE IF EXISTS public.transactions CASCADE;
DROP TABLE IF EXISTS public.listings CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;
DROP TABLE IF EXISTS public.ticket_transfers CASCADE;

-- Create users table with TEXT ID (for Auth0 compatibility)
CREATE TABLE IF NOT EXISTS public.users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create listings table with TEXT seller_id to match users.id
CREATE TABLE IF NOT EXISTS public.listings (
  id TEXT DEFAULT 'listing-' || generate_random_uuid() PRIMARY KEY,
  seller_id TEXT REFERENCES public.users(id) NOT NULL,
  event_name TEXT NOT NULL,
  event_date TIMESTAMP WITH TIME ZONE NOT NULL,
  venue TEXT NOT NULL,
  location TEXT NOT NULL,
  section TEXT,
  row TEXT,
  seats TEXT,
  quantity INTEGER NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  description TEXT,
  payment_methods TEXT[] NOT NULL,
  verified BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'sold', 'expired', 'cancelled')),
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create ticket_transfers table (from existing migration but with TEXT IDs)
CREATE TABLE IF NOT EXISTS public.ticket_transfers (
  id TEXT PRIMARY KEY DEFAULT 'tx-' || generate_random_uuid(),
  contract_id TEXT UNIQUE NOT NULL,
  seller_id TEXT REFERENCES public.users(id),
  buyer_id TEXT REFERENCES public.users(id),
  event_name TEXT NOT NULL,
  event_date TIMESTAMP WITH TIME ZONE NOT NULL,
  venue TEXT NOT NULL,
  seat_details TEXT,
  ticket_quantity INTEGER NOT NULL DEFAULT 1,
  price DECIMAL(10,2) NOT NULL,
  payment_method TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  payment_verified BOOLEAN DEFAULT FALSE,
  tickets_verified BOOLEAN DEFAULT FALSE,
  time_remaining INTEGER DEFAULT 60,
  expiration_time TIMESTAMP WITH TIME ZONE,
  ticket_provider TEXT,
  ticket_notes TEXT,
  seller_name TEXT,
  seller_email TEXT,
  buyer_name TEXT,
  buyer_email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create transactions table with TEXT IDs
CREATE TABLE IF NOT EXISTS public.transactions (
  id TEXT DEFAULT 'trans-' || generate_random_uuid() PRIMARY KEY,
  contract_id TEXT NOT NULL,
  listing_id TEXT REFERENCES public.listings(id),
  seller_id TEXT REFERENCES public.users(id) NOT NULL,
  buyer_id TEXT REFERENCES public.users(id) NOT NULL,
  event_name TEXT NOT NULL,
  event_date TIMESTAMP WITH TIME ZONE NOT NULL,
  venue TEXT NOT NULL,
  seat_details TEXT,
  ticket_quantity INTEGER NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  payment_method TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'completed', 'cancelled')),
  payment_verified BOOLEAN DEFAULT false,
  tickets_verified BOOLEAN DEFAULT false,
  time_remaining INTEGER,
  expiration_time TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create docusign_agreements table
CREATE TABLE IF NOT EXISTS public.docusign_agreements (
  id TEXT PRIMARY KEY DEFAULT 'doc-' || generate_random_uuid(),
  transaction_id TEXT REFERENCES public.ticket_transfers(id),
  envelope_id TEXT,
  status TEXT DEFAULT 'sent',
  document_url TEXT,
  seller_status TEXT DEFAULT 'sent',
  buyer_status TEXT DEFAULT 'sent',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create email_notifications table
CREATE TABLE IF NOT EXISTS public.email_notifications (
  id TEXT PRIMARY KEY DEFAULT 'email-' || generate_random_uuid(),
  transaction_id TEXT REFERENCES public.ticket_transfers(id),
  recipient_id TEXT REFERENCES public.users(id),
  email_type TEXT NOT NULL,
  status TEXT DEFAULT 'sent',
  message_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create payment_records table
CREATE TABLE IF NOT EXISTS public.payment_records (
  id TEXT DEFAULT 'payment-' || generate_random_uuid() PRIMARY KEY,
  transaction_id TEXT REFERENCES public.transactions(id) NOT NULL,
  payment_method TEXT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  payment_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create or replace function to handle user creation/updates
CREATE OR REPLACE FUNCTION create_user_if_not_exists(
  user_id TEXT,
  user_email TEXT,
  user_name TEXT,
  user_avatar TEXT
) RETURNS JSONB AS $$
DECLARE
  existing_user JSONB;
  updated_user JSONB;
BEGIN
  -- Check if user exists
  SELECT to_jsonb(u) INTO existing_user FROM public.users u WHERE id = user_id;
  
  IF existing_user IS NOT NULL THEN
    -- User exists, update their information
    UPDATE public.users
    SET 
      email = user_email,
      full_name = COALESCE(user_name, full_name),
      avatar_url = COALESCE(user_avatar, avatar_url),
      updated_at = NOW()
    WHERE id = user_id
    RETURNING to_jsonb(users.*) INTO updated_user;
    
    RETURN updated_user;
  ELSE
    -- User doesn't exist, create a new user
    INSERT INTO public.users (id, email, full_name, avatar_url, created_at, updated_at)
    VALUES (user_id, user_email, user_name, user_avatar, NOW(), NOW())
    RETURNING to_jsonb(users.*) INTO updated_user;
    
    RETURN updated_user;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updating timestamps
CREATE TRIGGER update_users_updated_at
BEFORE UPDATE ON public.users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_listings_updated_at
BEFORE UPDATE ON public.listings
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_transactions_updated_at
BEFORE UPDATE ON public.transactions
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_ticket_transfers_updated_at
BEFORE UPDATE ON public.ticket_transfers
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_docusign_agreements_updated_at
BEFORE UPDATE ON public.docusign_agreements
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_email_notifications_updated_at
BEFORE UPDATE ON public.email_notifications
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_payment_records_updated_at
BEFORE UPDATE ON public.payment_records
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

-- Disable RLS by default as requested
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.listings DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_transfers DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.docusign_agreements DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_notifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_records DISABLE ROW LEVEL SECURITY;

-- Enable realtime subscriptions
alter publication supabase_realtime add table public.users;
alter publication supabase_realtime add table public.listings;
alter publication supabase_realtime add table public.transactions;
alter publication supabase_realtime add table public.ticket_transfers;
alter publication supabase_realtime add table public.docusign_agreements;
alter publication supabase_realtime add table public.email_notifications;
alter publication supabase_realtime add table public.payment_records;

-- Insert sample data for testing
INSERT INTO public.users (id, email, full_name, avatar_url, created_at, updated_at)
VALUES
  ('auth0|user1', 'john.doe@example.com', 'John Doe', 'https://api.dicebear.com/7.x/avataaars/svg?seed=john', NOW(), NOW()),
  ('auth0|user2', 'jane.smith@example.com', 'Jane Smith', 'https://api.dicebear.com/7.x/avataaars/svg?seed=jane', NOW(), NOW()),
  ('auth0|user3', 'bob.johnson@example.com', 'Bob Johnson', 'https://api.dicebear.com/7.x/avataaars/svg?seed=bob', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Insert sample listings
INSERT INTO public.listings (
  id, seller_id, event_name, event_date, venue, location, 
  section, row, seats, quantity, price, description, 
  payment_methods, verified, status, image_url, created_at, updated_at
)
VALUES
  (
    'listing-1', 
    'auth0|user1', 
    'Taylor Swift - The Eras Tour', 
    '2024-08-15 19:00:00+00', 
    'SoFi Stadium', 
    'Los Angeles, CA', 
    '134', 
    'G', 
    '12-13', 
    2, 
    350.00, 
    'Great seats with an amazing view of the stage!', 
    ARRAY['Venmo', 'PayPal'], 
    true, 
    'active', 
    'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800&q=80', 
    NOW(), 
    NOW()
  ),
  (
    'listing-2', 
    'auth0|user2', 
    'Lakers vs. Warriors', 
    '2024-08-20 18:30:00+00', 
    'Crypto.com Arena', 
    'Los Angeles, CA', 
    '217', 
    'C', 
    '5-8', 
    4, 
    175.00, 
    'Four seats together, perfect for a group!', 
    ARRAY['Venmo', 'Zelle'], 
    true, 
    'active', 
    'https://images.unsplash.com/photo-1504450758481-7338eba7524a?w=800&q=80', 
    NOW(), 
    NOW()
  )
ON CONFLICT (id) DO NOTHING;

-- Insert sample ticket transfers
INSERT INTO public.ticket_transfers (
  id, contract_id, seller_id, buyer_id, event_name, event_date, venue, 
  seat_details, ticket_quantity, price, payment_method, status, 
  payment_verified, tickets_verified, seller_name, seller_email, 
  buyer_name, buyer_email, created_at, updated_at
)
VALUES
  (
    'tx-1', 
    'TIX-12345', 
    'auth0|user1', 
    'auth0|user2', 
    'Taylor Swift - The Eras Tour', 
    '2024-08-15 19:00:00+00', 
    'SoFi Stadium, Los Angeles', 
    'Section 134, Row G, Seats 12-13', 
    2, 
    700.00, 
    'Venmo', 
    'pending', 
    false, 
    true, 
    'John Doe', 
    'john.doe@example.com', 
    'Jane Smith', 
    'jane.smith@example.com', 
    NOW(), 
    NOW()
  )
ON CONFLICT (id) DO NOTHING;
