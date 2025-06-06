-- Add archived column to ticket_transfers table
ALTER TABLE ticket_transfers ADD COLUMN IF NOT EXISTS archived BOOLEAN DEFAULT FALSE;

-- Add admin_notes column to ticket_transfers table
ALTER TABLE ticket_transfers ADD COLUMN IF NOT EXISTS admin_notes TEXT;

-- Add index for archived column for better performance
CREATE INDEX IF NOT EXISTS idx_ticket_transfers_archived ON ticket_transfers(archived);

-- Update admin access to include austen.dewolf@hover.to
-- This will be handled in the application code
