-- Ensure users table exists with correct structure
CREATE TABLE IF NOT EXISTS public.users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable row level security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create policies for users table
DROP POLICY IF EXISTS "Users can view their own data";
CREATE POLICY "Users can view their own data"
  ON public.users
  FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own data";
CREATE POLICY "Users can update their own data"
  ON public.users
  FOR UPDATE
  USING (auth.uid() = id);

-- Create or replace function to create users if they don't exist
CREATE OR REPLACE FUNCTION public.create_user_if_not_exists(
  user_id TEXT,
  user_email TEXT,
  user_name TEXT,
  user_avatar TEXT
) RETURNS public.users AS $$
DECLARE
  new_user public.users;
BEGIN
  -- Check if user exists
  SELECT * INTO new_user FROM public.users WHERE id = user_id;
  
  -- If user doesn't exist, create them
  IF new_user.id IS NULL THEN
    INSERT INTO public.users (id, email, full_name, avatar_url, created_at, updated_at)
    VALUES (user_id, user_email, user_name, user_avatar, NOW(), NOW())
    RETURNING * INTO new_user;
  END IF;
  
  RETURN new_user;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT ALL ON TABLE public.users TO authenticated;
GRANT ALL ON TABLE public.users TO service_role;

-- Enable realtime
alter publication supabase_realtime add table public.users;
