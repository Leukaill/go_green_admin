-- Simple RLS Fix - No Recursion
-- Run this in Supabase SQL Editor

-- Step 1: Drop all existing policies
DROP POLICY IF EXISTS "Users can read own admin record" ON admins;
DROP POLICY IF EXISTS "Active admins can read all admins" ON admins;
DROP POLICY IF EXISTS "Super admins can insert admins" ON admins;
DROP POLICY IF EXISTS "Super admins can update admins" ON admins;
DROP POLICY IF EXISTS "Super admins can delete admins" ON admins;
DROP POLICY IF EXISTS "Service role full access" ON admins;
DROP POLICY IF EXISTS "Allow insert for authenticated users" ON admins;
DROP POLICY IF EXISTS "Admins can view all admins" ON admins;

-- Step 2: Create SIMPLE policies without recursion

-- Allow authenticated users to read ALL admins (simple, no recursion)
CREATE POLICY "Authenticated users can read admins"
ON admins
FOR SELECT
TO authenticated
USING (true);

-- Allow authenticated users to insert (for API creating admins)
CREATE POLICY "Authenticated users can insert admins"
ON admins
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Allow authenticated users to update admins
CREATE POLICY "Authenticated users can update admins"
ON admins
FOR UPDATE
TO authenticated
USING (true);

-- Allow authenticated users to delete admins
CREATE POLICY "Authenticated users can delete admins"
ON admins
FOR DELETE
TO authenticated
USING (true);

-- Service role full access
CREATE POLICY "Service role full access"
ON admins
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Done! Now try logging in - no more recursion!
