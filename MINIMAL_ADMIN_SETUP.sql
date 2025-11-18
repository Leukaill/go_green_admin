-- MINIMAL Admin Table Setup (No RLS for testing)
-- Run this in Supabase SQL Editor

-- Drop the table if it exists (to start fresh)
DROP TABLE IF EXISTS admins CASCADE;

-- Create the admins table
CREATE TABLE admins (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  avatar_url TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_login TIMESTAMPTZ
);

-- DISABLE RLS for testing (we'll enable it later)
ALTER TABLE admins DISABLE ROW LEVEL SECURITY;

SELECT 'Admins table created (RLS disabled for testing)!' as message;
