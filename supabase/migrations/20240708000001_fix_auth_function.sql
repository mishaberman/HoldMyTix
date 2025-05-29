-- Create or replace the function to handle user creation/updates
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

-- Ensure the users table exists
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

-- Create policies
DROP POLICY IF EXISTS "Users can view their own data" ON public.users;
CREATE POLICY "Users can view their own data"
  ON public.users
  FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own data" ON public.users;
CREATE POLICY "Users can update their own data"
  ON public.users
  FOR UPDATE
  USING (auth.uid() = id);

-- Add realtime support
ALTER PUBLICATION supabase_realtime ADD TABLE public.users;
