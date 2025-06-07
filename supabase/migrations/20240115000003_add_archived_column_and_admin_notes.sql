-- Add archived column to ticket_transfers table
ALTER TABLE ticket_transfers ADD COLUMN IF NOT EXISTS archived BOOLEAN DEFAULT FALSE;

-- Add admin_notes column to ticket_transfers table
ALTER TABLE ticket_transfers ADD COLUMN IF NOT EXISTS admin_notes TEXT;

-- Add new columns for enhanced admin tracking
ALTER TABLE ticket_transfers ADD COLUMN IF NOT EXISTS seller_ticketmaster_email TEXT;
ALTER TABLE ticket_transfers ADD COLUMN IF NOT EXISTS buyer_ticketmaster_email TEXT;
ALTER TABLE ticket_transfers ADD COLUMN IF NOT EXISTS payment_method_details TEXT;
ALTER TABLE ticket_transfers ADD COLUMN IF NOT EXISTS payment_received BOOLEAN DEFAULT FALSE;
ALTER TABLE ticket_transfers ADD COLUMN IF NOT EXISTS payment_sent BOOLEAN DEFAULT FALSE;
ALTER TABLE ticket_transfers ADD COLUMN IF NOT EXISTS ticket_received BOOLEAN DEFAULT FALSE;
ALTER TABLE ticket_transfers ADD COLUMN IF NOT EXISTS ticket_sent BOOLEAN DEFAULT FALSE;

-- Add index for archived column for better performance
CREATE INDEX IF NOT EXISTS idx_ticket_transfers_archived ON ticket_transfers(archived);

-- Archive all existing transfers to start fresh
UPDATE ticket_transfers SET archived = TRUE WHERE archived = FALSE OR archived IS NULL;

-- Update admin access to include austen.dewolf@hover.to
-- This will be handled in the application code
