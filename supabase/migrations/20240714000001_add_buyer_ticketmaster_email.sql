
-- Add buyer_ticketmaster_email column to ticket_transfers table
ALTER TABLE ticket_transfers ADD COLUMN IF NOT EXISTS buyer_ticketmaster_email TEXT;
