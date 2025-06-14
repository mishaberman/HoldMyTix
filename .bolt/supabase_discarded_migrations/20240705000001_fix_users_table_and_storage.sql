-- Drop existing users table if it exists to ensure a clean slate
DROP TABLE IF EXISTS public.users CASCADE;

-- Create users table with proper constraints
CREATE TABLE IF NOT EXISTS public.users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Disable row level security by default as requested
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- Add to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.users;

-- Create storage bucket for user avatars if it doesn't exist
-- Using a different approach to ensure the bucket is created
BEGIN;
  -- Check if bucket exists first
  DO $$
  BEGIN
    IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'user-avatars') THEN
      -- Create the bucket if it doesn't exist
      INSERT INTO storage.buckets (id, name, public)
      VALUES ('user-avatars', 'user-avatars', true);
    END IF;
  END
  $$;
COMMIT;

-- Set up storage policies for user avatars
-- First drop any existing policies to avoid conflicts
DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;
CREATE POLICY "Avatar images are publicly accessible"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'user-avatars');

DROP POLICY IF EXISTS "Anyone can upload avatars" ON storage.objects;
CREATE POLICY "Anyone can upload avatars"
  ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'user-avatars');

DROP POLICY IF EXISTS "Anyone can update avatars" ON storage.objects;
CREATE POLICY "Anyone can update avatars"
  ON storage.objects
  FOR UPDATE
  USING (bucket_id = 'user-avatars');

DROP POLICY IF EXISTS "Anyone can delete avatars" ON storage.objects;
CREATE POLICY "Anyone can delete avatars"
  ON storage.objects
  FOR DELETE
  USING (bucket_id = 'user-avatars');
