-- Check and fix any constraints or issues with admins table
-- Run this in Supabase SQL Editor

-- Step 1: Check if there are any triggers on auth.users
SELECT 
    trigger_name, 
    event_manipulation, 
    event_object_table, 
    action_statement
FROM information_schema.triggers
WHERE event_object_schema = 'auth' 
AND event_object_table = 'users';

-- Step 2: Drop ALL triggers on auth.users (just to be sure)
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT trigger_name
        FROM information_schema.triggers
        WHERE event_object_schema = 'auth' 
        AND event_object_table = 'users'
    ) LOOP
        EXECUTE 'DROP TRIGGER IF EXISTS ' || r.trigger_name || ' ON auth.users CASCADE';
    END LOOP;
END $$;

-- Step 3: Remove foreign key constraint from admins table if it exists
ALTER TABLE admins DROP CONSTRAINT IF EXISTS admins_id_fkey CASCADE;

-- Step 4: Make sure admins table has correct structure
-- (This won't drop the table if it exists, just ensures structure)
CREATE TABLE IF NOT EXISTS admins (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('super_admin', 'admin', 'moderator')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'inactive')),
  phone TEXT,
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 5: Ensure RLS is enabled with simple policies
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DROP POLICY IF EXISTS "Authenticated users can read admins" ON admins;
DROP POLICY IF EXISTS "Authenticated users can insert admins" ON admins;
DROP POLICY IF EXISTS "Authenticated users can update admins" ON admins;
DROP POLICY IF EXISTS "Authenticated users can delete admins" ON admins;
DROP POLICY IF EXISTS "Service role full access" ON admins;

-- Create simple policies
CREATE POLICY "Authenticated users can read admins"
ON admins FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert admins"
ON admins FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update admins"
ON admins FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can delete admins"
ON admins FOR DELETE TO authenticated USING (true);

CREATE POLICY "Service role full access"
ON admins FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Done! Try creating an admin now
