-- Insert test users (these would normally be created through Auth0 signup)
-- In a real scenario, users would be created in auth.users first, then in public.users
-- For testing purposes, we'll insert directly into public.users with mock UUIDs

INSERT INTO public.users (id, email, full_name, avatar_url, created_at, updated_at)
VALUES
  ('00000000-0000-0000-0000-000000000001', 'john.doe@example.com', 'John Doe', 'https://api.dicebear.com/7.x/avataaars/svg?seed=john', now(), now()),
  ('00000000-0000-0000-0000-000000000002', 'jane.smith@example.com', 'Jane Smith', 'https://api.dicebear.com/7.x/avataaars/svg?seed=jane', now(), now()),
  ('00000000-0000-0000-0000-000000000003', 'bob.johnson@example.com', 'Bob Johnson', 'https://api.dicebear.com/7.x/avataaars/svg?seed=bob', now(), now()),
  ('00000000-0000-0000-0000-000000000004', 'alice.williams@example.com', 'Alice Williams', 'https://api.dicebear.com/7.x/avataaars/svg?seed=alice', now(), now()),
  ('00000000-0000-0000-0000-000000000005', 'david.brown@example.com', 'David Brown', 'https://api.dicebear.com/7.x/avataaars/svg?seed=david', now(), now())
ON CONFLICT (id) DO NOTHING;

-- Insert test listings
INSERT INTO public.listings (
  id, seller_id, event_name, event_date, venue, location, 
  section, row, seats, quantity, price, description, 
  payment_methods, verified, status, image_url, created_at, updated_at
)
VALUES
  (
    '00000000-0000-0000-0000-000000000101', 
    '00000000-0000-0000-0000-000000000001', 
    'Taylor Swift - The Eras Tour', 
    '2023-08-15 19:00:00+00', 
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
    now(), 
    now()
  ),
  (
    '00000000-0000-0000-0000-000000000102', 
    '00000000-0000-0000-0000-000000000002', 
    'Lakers vs. Warriors', 
    '2023-08-20 18:30:00+00', 
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
    now(), 
    now()
  ),
  (
    '00000000-0000-0000-0000-000000000103', 
    '00000000-0000-0000-0000-000000000003', 
    'Hamilton', 
    '2023-09-05 19:30:00+00', 
    'Pantages Theatre', 
    'Los Angeles, CA', 
    'Orchestra', 
    'J', 
    '101-102', 
    2, 
    225.00, 
    'Orchestra seats for Hamilton, amazing show!', 
    ARRAY['PayPal', 'Zelle'], 
    true, 
    'active', 
    'https://images.unsplash.com/photo-1503095396549-807759245b35?w=800&q=80', 
    now(), 
    now()
  ),
  (
    '00000000-0000-0000-0000-000000000104', 
    '00000000-0000-0000-0000-000000000004', 
    'Coachella Music Festival', 
    '2023-04-14 12:00:00+00', 
    'Empire Polo Club', 
    'Indio, CA', 
    'GA', 
    '', 
    '', 
    1, 
    450.00, 
    'General Admission pass for Weekend 1', 
    ARRAY['Venmo', 'PayPal', 'Zelle'], 
    true, 
    'active', 
    'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&q=80', 
    now(), 
    now()
  ),
  (
    '00000000-0000-0000-0000-000000000105', 
    '00000000-0000-0000-0000-000000000005', 
    'Bad Bunny - World''s Hottest Tour', 
    '2023-09-30 20:00:00+00', 
    'SoFi Stadium', 
    'Los Angeles, CA', 
    '230', 
    'D', 
    '15-17', 
    3, 
    280.00, 
    'Three seats together with a great view!', 
    ARRAY['Venmo', 'Zelle'], 
    false, 
    'active', 
    'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=800&q=80', 
    now(), 
    now()
  ),
  (
    '00000000-0000-0000-0000-000000000106', 
    '00000000-0000-0000-0000-000000000001', 
    'Dodgers vs. Giants', 
    '2023-08-25 19:10:00+00', 
    'Dodger Stadium', 
    'Los Angeles, CA', 
    'Loge', 
    '125', 
    '5-6', 
    2, 
    85.00, 
    'Great seats for the rivalry game!', 
    ARRAY['PayPal'], 
    true, 
    'active', 
    'https://images.unsplash.com/photo-1562771379-eafdca7a02f8?w=800&q=80', 
    now(), 
    now()
  )
ON CONFLICT (id) DO NOTHING;

-- Insert test transactions
INSERT INTO public.transactions (
  id, contract_id, listing_id, seller_id, buyer_id, 
  event_name, event_date, venue, seat_details, ticket_quantity, 
  price, payment_method, status, payment_verified, tickets_verified, 
  time_remaining, expiration_time, created_at, updated_at
)
VALUES
  (
    '00000000-0000-0000-0000-000000000201', 
    'TIX-12345', 
    '00000000-0000-0000-0000-000000000101', 
    '00000000-0000-0000-0000-000000000001', 
    '00000000-0000-0000-0000-000000000002', 
    'Taylor Swift - The Eras Tour', 
    '2023-08-15 19:00:00+00', 
    'SoFi Stadium, Los Angeles', 
    'Section 134, Row G, Seats 12-13', 
    2, 
    700.00, 
    'Venmo', 
    'active', 
    false, 
    true, 
    45, 
    now() + interval '45 minutes', 
    now(), 
    now()
  ),
  (
    '00000000-0000-0000-0000-000000000202', 
    'TIX-67890', 
    '00000000-0000-0000-0000-000000000103', 
    '00000000-0000-0000-0000-000000000003', 
    '00000000-0000-0000-0000-000000000004', 
    'Hamilton', 
    '2023-09-05 19:30:00+00', 
    'Pantages Theatre, Los Angeles', 
    'Orchestra, Row J, Seats 101-102', 
    2, 
    450.00, 
    'PayPal', 
    'completed', 
    true, 
    true, 
    0, 
    now() - interval '2 days', 
    now() - interval '3 days', 
    now() - interval '2 days'
  ),
  (
    '00000000-0000-0000-0000-000000000203', 
    'TIX-24680', 
    '00000000-0000-0000-0000-000000000102', 
    '00000000-0000-0000-0000-000000000002', 
    '00000000-0000-0000-0000-000000000005', 
    'Lakers vs. Warriors', 
    '2023-08-20 18:30:00+00', 
    'Crypto.com Arena, Los Angeles', 
    'Section 217, Row C, Seats 5-8', 
    4, 
    700.00, 
    'Zelle', 
    'pending', 
    false, 
    false, 
    60, 
    now() + interval '60 minutes', 
    now(), 
    now()
  )
ON CONFLICT (id) DO NOTHING;

-- Insert test docusign agreements
INSERT INTO public.docusign_agreements (
  id, transaction_id, envelope_id, status, document_url, 
  seller_status, buyer_status, created_at, updated_at
)
VALUES
  (
    '00000000-0000-0000-0000-000000000301', 
    '00000000-0000-0000-0000-000000000201', 
    'env-abc123', 
    'signed', 
    'https://demo.docusign.net/documents/view/abc123', 
    'signed', 
    'signed', 
    now(), 
    now()
  ),
  (
    '00000000-0000-0000-0000-000000000302', 
    '00000000-0000-0000-0000-000000000202', 
    'env-def456', 
    'completed', 
    'https://demo.docusign.net/documents/view/def456', 
    'completed', 
    'completed', 
    now() - interval '3 days', 
    now() - interval '2 days'
  ),
  (
    '00000000-0000-0000-0000-000000000303', 
    '00000000-0000-0000-0000-000000000203', 
    'env-ghi789', 
    'sent', 
    'https://demo.docusign.net/documents/view/ghi789', 
    'sent', 
    'sent', 
    now(), 
    now()
  )
ON CONFLICT (id) DO NOTHING;

-- Insert test email notifications
INSERT INTO public.email_notifications (
  id, transaction_id, recipient_id, email_type, 
  status, message_id, created_at, updated_at
)
VALUES
  (
    '00000000-0000-0000-0000-000000000401', 
    '00000000-0000-0000-0000-000000000201', 
    '00000000-0000-0000-0000-000000000002', 
    'buyer_instructions', 
    'sent', 
    'msg-abc123', 
    now(), 
    now()
  ),
  (
    '00000000-0000-0000-0000-000000000402', 
    '00000000-0000-0000-0000-000000000201', 
    '00000000-0000-0000-0000-000000000001', 
    'seller_instructions', 
    'sent', 
    'msg-def456', 
    now(), 
    now()
  ),
  (
    '00000000-0000-0000-0000-000000000403', 
    '00000000-0000-0000-0000-000000000202', 
    '00000000-0000-0000-0000-000000000003', 
    'payment_received', 
    'delivered', 
    'msg-ghi789', 
    now() - interval '3 days', 
    now() - interval '3 days'
  ),
  (
    '00000000-0000-0000-0000-000000000404', 
    '00000000-0000-0000-0000-000000000202', 
    '00000000-0000-0000-0000-000000000004', 
    'tickets_transferred', 
    'delivered', 
    'msg-jkl012', 
    now() - interval '2 days', 
    now() - interval '2 days'
  ),
  (
    '00000000-0000-0000-0000-000000000405', 
    '00000000-0000-0000-0000-000000000203', 
    '00000000-0000-0000-0000-000000000005', 
    'buyer_instructions', 
    'pending', 
    null, 
    now(), 
    now()
  )
ON CONFLICT (id) DO NOTHING;

-- Insert test ticket transfers
INSERT INTO public.ticket_transfers (
  id, transaction_id, provider, transfer_status, 
  verification_code, transfer_date, created_at, updated_at
)
VALUES
  (
    '00000000-0000-0000-0000-000000000501', 
    '00000000-0000-0000-0000-000000000201', 
    'Ticketmaster', 
    'completed', 
    'TM-VERIFY-123', 
    now() - interval '1 day', 
    now() - interval '1 day', 
    now() - interval '1 day'
  ),
  (
    '00000000-0000-0000-0000-000000000502', 
    '00000000-0000-0000-0000-000000000202', 
    'StubHub', 
    'completed', 
    'SH-VERIFY-456', 
    now() - interval '2 days', 
    now() - interval '3 days', 
    now() - interval '2 days'
  ),
  (
    '00000000-0000-0000-0000-000000000503', 
    '00000000-0000-0000-0000-000000000203', 
    'Ticketmaster', 
    'pending', 
    null, 
    null, 
    now(), 
    now()
  )
ON CONFLICT (id) DO NOTHING;

-- Insert test payment records
INSERT INTO public.payment_records (
  id, transaction_id, payment_method, amount, 
  status, payment_date, created_at, updated_at
)
VALUES
  (
    '00000000-0000-0000-0000-000000000601', 
    '00000000-0000-0000-0000-000000000201', 
    'Venmo', 
    700.00, 
    'pending', 
    null, 
    now(), 
    now()
  ),
  (
    '00000000-0000-0000-0000-000000000602', 
    '00000000-0000-0000-0000-000000000202', 
    'PayPal', 
    450.00, 
    'completed', 
    now() - interval '2 days', 
    now() - interval '3 days', 
    now() - interval '2 days'
  ),
  (
    '00000000-0000-0000-0000-000000000603', 
    '00000000-0000-0000-0000-000000000203', 
    'Zelle', 
    700.00, 
    'pending', 
    null, 
    now(), 
    now()
  )
ON CONFLICT (id) DO NOTHING;