-- Create a function to safely create a user if they don't exist
CREATE OR REPLACE FUNCTION create_user_if_not_exists(
  user_id TEXT,
  user_email TEXT,
  user_name TEXT,
  user_avatar TEXT
) RETURNS SETOF users AS $$
BEGIN
  -- Check if the user already exists
  IF EXISTS (SELECT 1 FROM users WHERE id = user_id) THEN
    -- Update the existing user
    RETURN QUERY
    UPDATE users
    SET 
      email = user_email,
      full_name = user_name,
      avatar_url = user_avatar,
      updated_at = NOW()
    WHERE id = user_id
    RETURNING *;
  ELSE
    -- Insert a new user
    RETURN QUERY
    INSERT INTO users (id, email, full_name, avatar_url, created_at, updated_at)
    VALUES (user_id, user_email, user_name, user_avatar, NOW(), NOW())
    RETURNING *;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Ensure the users table has the correct structure
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    CREATE TYPE user_role AS ENUM ('user', 'admin');
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Ensure the users table exists with all required columns
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  role user_role DEFAULT 'user'::user_role,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable row level security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create policies
DROP POLICY IF EXISTS "Users can view their own data" ON users;
CREATE POLICY "Users can view their own data"
  ON users FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own data" ON users;
CREATE POLICY "Users can update their own data"
  ON users FOR UPDATE
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Public read access" ON users;
CREATE POLICY "Public read access"
  ON users FOR SELECT
  USING (true);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE users;
