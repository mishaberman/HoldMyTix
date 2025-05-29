-- Create users table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID REFERENCES auth.users NOT NULL PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create listings table
CREATE TABLE IF NOT EXISTS public.listings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  seller_id UUID REFERENCES public.users NOT NULL,
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
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create transactions table
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  contract_id TEXT NOT NULL,
  listing_id UUID REFERENCES public.listings,
  seller_id UUID REFERENCES public.users NOT NULL,
  buyer_id UUID REFERENCES public.users NOT NULL,
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
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create docusign_agreements table
CREATE TABLE IF NOT EXISTS public.docusign_agreements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  transaction_id UUID REFERENCES public.transactions NOT NULL,
  envelope_id TEXT NOT NULL,
  status TEXT DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'signed', 'completed', 'declined', 'voided')),
  document_url TEXT,
  seller_status TEXT DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'signed', 'completed', 'declined')),
  buyer_status TEXT DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'signed', 'completed', 'declined')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create email_notifications table
CREATE TABLE IF NOT EXISTS public.email_notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  transaction_id UUID REFERENCES public.transactions,
  recipient_id UUID REFERENCES public.users NOT NULL,
  email_type TEXT NOT NULL CHECK (email_type IN ('buyer_instructions', 'seller_instructions', 'payment_received', 'tickets_transferred', 'transaction_completed', 'transaction_cancelled', 'reminder')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'failed')),
  message_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create ticket_transfers table
CREATE TABLE IF NOT EXISTS public.ticket_transfers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  transaction_id UUID REFERENCES public.transactions NOT NULL,
  provider TEXT NOT NULL,
  transfer_status TEXT DEFAULT 'pending' CHECK (transfer_status IN ('pending', 'initiated', 'completed', 'failed')),
  verification_code TEXT,
  transfer_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create payment_records table
CREATE TABLE IF NOT EXISTS public.payment_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  transaction_id UUID REFERENCES public.transactions NOT NULL,
  payment_method TEXT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  payment_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.docusign_agreements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_transfers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_records ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Users policies
DROP POLICY IF EXISTS "Users can view their own data";
CREATE POLICY "Users can view their own data"
ON public.users FOR SELECT
USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own data";
CREATE POLICY "Users can update their own data"
ON public.users FOR UPDATE
USING (auth.uid() = id);

-- Listings policies
DROP POLICY IF EXISTS "Anyone can view active listings";
CREATE POLICY "Anyone can view active listings"
ON public.listings FOR SELECT
USING (status = 'active');

DROP POLICY IF EXISTS "Users can view their own listings";
CREATE POLICY "Users can view their own listings"
ON public.listings FOR SELECT
USING (seller_id = auth.uid());

DROP POLICY IF EXISTS "Users can create listings";
CREATE POLICY "Users can create listings"
ON public.listings FOR INSERT
WITH CHECK (seller_id = auth.uid());

DROP POLICY IF EXISTS "Users can update their own listings";
CREATE POLICY "Users can update their own listings"
ON public.listings FOR UPDATE
USING (seller_id = auth.uid());

-- Transactions policies
DROP POLICY IF EXISTS "Users can view their own transactions";
CREATE POLICY "Users can view their own transactions"
ON public.transactions FOR SELECT
USING (seller_id = auth.uid() OR buyer_id = auth.uid());

DROP POLICY IF EXISTS "Users can create transactions";
CREATE POLICY "Users can create transactions"
ON public.transactions FOR INSERT
WITH CHECK (seller_id = auth.uid() OR buyer_id = auth.uid());

DROP POLICY IF EXISTS "Users can update their own transactions";
CREATE POLICY "Users can update their own transactions"
ON public.transactions FOR UPDATE
USING (seller_id = auth.uid() OR buyer_id = auth.uid());

-- Enable realtime subscriptions
alter publication supabase_realtime add table public.users;
alter publication supabase_realtime add table public.listings;
alter publication supabase_realtime add table public.transactions;
alter publication supabase_realtime add table public.docusign_agreements;
alter publication supabase_realtime add table public.email_notifications;
alter publication supabase_realtime add table public.ticket_transfers;
alter publication supabase_realtime add table public.payment_records;

-- Create functions for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
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

CREATE TRIGGER update_docusign_agreements_updated_at
BEFORE UPDATE ON public.docusign_agreements
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_email_notifications_updated_at
BEFORE UPDATE ON public.email_notifications
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_ticket_transfers_updated_at
BEFORE UPDATE ON public.ticket_transfers
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_payment_records_updated_at
BEFORE UPDATE ON public.payment_records
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();
