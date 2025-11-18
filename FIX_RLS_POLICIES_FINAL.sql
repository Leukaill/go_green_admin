-- Fix RLS Policies for Admins Table - FINAL FIX
-- Run this in Supabase SQL Editor

-- Step 1: Drop all existing policies
DROP POLICY IF EXISTS "Allow insert for authenticated users" ON admins;
DROP POLICY IF EXISTS "Admins can view all admins" ON admins;
DROP POLICY IF EXISTS "Super admins can update admins" ON admins;
DROP POLICY IF EXISTS "Super admins can delete admins" ON admins;
DROP POLICY IF EXISTS "Service role can insert admins" ON admins;
DROP POLICY IF EXISTS "Service role can select admins" ON admins;

-- Step 2: Create simple, working policies

-- Allow users to read their own admin record (for login)
CREATE POLICY "Users can read own admin record"
ON admins
FOR SELECT
TO authenticated
USING (id = auth.uid());

-- Allow users to read all admins if they are an active admin
CREATE POLICY "Active admins can read all admins"
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

-- Allow super admins to insert new admins
CREATE POLICY "Super admins can insert admins"
ON admins
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM admins
    WHERE admins.id = auth.uid()
    AND admins.role = 'super_admin'
    AND admins.status = 'active'
  )
);

-- Allow super admins to update admins
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

-- Step 3: Allow service role to do everything (for API)
CREATE POLICY "Service role full access"
ON admins
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Done! Now try logging in again
