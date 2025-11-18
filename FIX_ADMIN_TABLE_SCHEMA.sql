-- Fix Admin Table Schema
-- Run this in Supabase SQL Editor to fix the "Database error saving new user" issue

-- Step 1: Drop the existing foreign key constraint if it exists
ALTER TABLE admins 
DROP CONSTRAINT IF EXISTS admins_id_fkey;

-- Step 2: Recreate the table without the foreign key constraint
-- This allows us to create admin records independently of auth.users
DROP TABLE IF EXISTS admins CASCADE;

CREATE TABLE admins (
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

-- Step 3: Add indexes for better performance
CREATE INDEX idx_admins_email ON admins(email);
CREATE INDEX idx_admins_role ON admins(role);
CREATE INDEX idx_admins_status ON admins(status);

-- Step 4: Enable RLS
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- Step 5: Create RLS policies
-- Allow anyone to insert (they'll use their own auth.uid())
CREATE POLICY "Allow insert for authenticated users"
ON admins
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Allow admins to view all admins
CREATE POLICY "Admins can view all admins"
ON admins
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM admins
    WHERE admins.id = auth.uid()
    AND admins.status = 'active'
  )
);

-- Allow super admins to update any admin
CREATE POLICY "Super admins can update admins"
ON admins
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM admins
    WHERE admins.id = auth.uid()
    AND admins.role = 'super_admin'
    AND admins.status = 'active'
  )
);

-- Allow super admins to delete admins
CREATE POLICY "Super admins can delete admins"
ON admins
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM admins
    WHERE admins.id = auth.uid()
    AND admins.role = 'super_admin'
    AND admins.status = 'active'
  )
);

-- Step 6: If you have an existing super admin, re-insert them
-- Replace these values with your actual super admin details
-- INSERT INTO admins (id, email, name, role, status)
-- VALUES (
--   'your-super-admin-auth-uid',
--   'superadmin@gogreen.rw',
--   'Super Admin',
--   'super_admin',
--   'active'
-- );

-- Done! Now try creating an admin again
