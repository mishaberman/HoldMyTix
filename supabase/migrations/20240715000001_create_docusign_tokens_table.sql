
-- Create table for storing DocuSign OAuth tokens
CREATE TABLE IF NOT EXISTS public.docusign_tokens (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT UNIQUE NOT NULL,
    account_id TEXT NOT NULL,
    base_uri TEXT NOT NULL,
    access_token TEXT NOT NULL,
    refresh_token TEXT,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE public.docusign_tokens ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to read their own tokens (for service functions)
CREATE POLICY "Users can read their own tokens" ON public.docusign_tokens
    FOR SELECT USING (true); -- For now, allow service functions to read

-- Policy to allow inserting/updating tokens
CREATE POLICY "Allow token upserts" ON public.docusign_tokens
    FOR ALL USING (true); -- For now, allow service functions to manage tokens

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_docusign_tokens_user_id ON public.docusign_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_docusign_tokens_account_id ON public.docusign_tokens(account_id);
