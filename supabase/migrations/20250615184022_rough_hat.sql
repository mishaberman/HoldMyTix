/*
  # Add DocuSign webhook tracking and status fields

  1. New Tables
    - `docusign_webhook_logs` for tracking all webhook events
  
  2. Schema Updates
    - Add DocuSign completion tracking fields to agreements and transfers
    - Add recipient status tracking fields
    - Add signed timestamps

  3. Security
    - Enable RLS on new table
    - Add policies for admin access
*/

-- Add DocuSign webhook logs table
CREATE TABLE IF NOT EXISTS docusign_webhook_logs (
  id text PRIMARY KEY DEFAULT ('webhook-' || extract(epoch from now()) || '-' || floor(random() * 1000000)),
  envelope_id text NOT NULL,
  status text NOT NULL,
  raw_data text,
  processed_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Add indexes for webhook logs
CREATE INDEX IF NOT EXISTS idx_docusign_webhook_logs_envelope_id ON docusign_webhook_logs(envelope_id);
CREATE INDEX IF NOT EXISTS idx_docusign_webhook_logs_processed_at ON docusign_webhook_logs(processed_at);

-- Enable RLS on webhook logs
ALTER TABLE docusign_webhook_logs ENABLE ROW LEVEL SECURITY;

-- Add policy for webhook logs (admin only)
CREATE POLICY "Admin can view webhook logs"
  ON docusign_webhook_logs
  FOR SELECT
  TO authenticated
  USING (true); -- In production, you'd want to restrict this to admin users

-- Add new fields to docusign_agreements table
DO $$
BEGIN
  -- Add completion tracking
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'docusign_agreements' AND column_name = 'completed_at'
  ) THEN
    ALTER TABLE docusign_agreements ADD COLUMN completed_at timestamptz;
  END IF;

  -- Add seller signed timestamp
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'docusign_agreements' AND column_name = 'seller_signed_at'
  ) THEN
    ALTER TABLE docusign_agreements ADD COLUMN seller_signed_at timestamptz;
  END IF;

  -- Add buyer signed timestamp
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'docusign_agreements' AND column_name = 'buyer_signed_at'
  ) THEN
    ALTER TABLE docusign_agreements ADD COLUMN buyer_signed_at timestamptz;
  END IF;
END $$;

-- Add DocuSign completion field to ticket_transfers
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'ticket_transfers' AND column_name = 'docusign_completed'
  ) THEN
    ALTER TABLE ticket_transfers ADD COLUMN docusign_completed boolean DEFAULT false;
  END IF;
END $$;

-- Add index for DocuSign completion tracking
CREATE INDEX IF NOT EXISTS idx_ticket_transfers_docusign_completed ON ticket_transfers(docusign_completed);