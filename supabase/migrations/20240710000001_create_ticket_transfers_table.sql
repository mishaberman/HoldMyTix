CREATE TABLE IF NOT EXISTS public.ticket_transfers (
  id TEXT PRIMARY KEY DEFAULT 'tx-' || generate_random_uuid(),
  contract_id TEXT UNIQUE NOT NULL,
  seller_id TEXT,
  buyer_id TEXT,
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

CREATE TABLE IF NOT EXISTS public.email_notifications (
  id TEXT PRIMARY KEY DEFAULT 'email-' || generate_random_uuid(),
  transaction_id TEXT REFERENCES public.ticket_transfers(id),
  recipient_id TEXT,
  email_type TEXT NOT NULL,
  status TEXT DEFAULT 'sent',
  message_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

DROP POLICY IF EXISTS "Public access" ON public.ticket_transfers;
CREATE POLICY "Public access"
ON public.ticket_transfers FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Users can insert transfers" ON public.ticket_transfers;
CREATE POLICY "Users can insert transfers"
ON public.ticket_transfers FOR INSERT
WITH CHECK (true);

DROP POLICY IF EXISTS "Users can update transfers" ON public.ticket_transfers;
CREATE POLICY "Users can update transfers"
ON public.ticket_transfers FOR UPDATE
USING (true);

DROP POLICY IF EXISTS "Public access" ON public.docusign_agreements;
CREATE POLICY "Public access"
ON public.docusign_agreements FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Users can insert agreements" ON public.docusign_agreements;
CREATE POLICY "Users can insert agreements"
ON public.docusign_agreements FOR INSERT
WITH CHECK (true);

DROP POLICY IF EXISTS "Public access" ON public.email_notifications;
CREATE POLICY "Public access"
ON public.email_notifications FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Users can insert notifications" ON public.email_notifications;
CREATE POLICY "Users can insert notifications"
ON public.email_notifications FOR INSERT
WITH CHECK (true);

alter publication supabase_realtime add table public.ticket_transfers;
alter publication supabase_realtime add table public.docusign_agreements;
alter publication supabase_realtime add table public.email_notifications;
