-- Simple Admin Table Setup
-- Copy and run this in Supabase SQL Editor

-- Create the admins table
CREATE TABLE IF NOT EXISTS admins (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('super_admin', 'admin', 'moderator')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  avatar_url TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_login TIMESTAMPTZ
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_admins_email ON admins(email);
CREATE INDEX IF NOT EXISTS idx_admins_role ON admins(role);

-- Enable RLS (Row Level Security)
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- Allow service role to bypass RLS (needed for signup API)
CREATE POLICY "Service role can do anything" ON admins
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Allow authenticated users to read admins
CREATE POLICY "Authenticated users can read admins" ON admins
  FOR SELECT
  TO authenticated
  USING (true);

SELECT 'Admins table created successfully!' as message;
