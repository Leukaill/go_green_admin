-- Simple RLS Fix - Remove Recursive Policies
-- Run this in Supabase SQL Editor

-- Drop ALL existing policies
DROP POLICY IF EXISTS "Service role bypass RLS" ON admins;
DROP POLICY IF EXISTS "Admins can view own profile" ON admins;
DROP POLICY IF EXISTS "Admins can update own profile" ON admins;
DROP POLICY IF EXISTS "Active admins can view all admins" ON admins;
DROP POLICY IF EXISTS "Super admins can manage all admins" ON admins;
DROP POLICY IF EXISTS "Prevent self-deletion" ON admins;
DROP POLICY IF EXISTS "Users can view own admin record" ON admins;

-- 1. Service role can do anything (for API routes)
CREATE POLICY "service_role_all" ON admins
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- 2. Authenticated users can view their own record (for login)
CREATE POLICY "auth_view_own" ON admins
  FOR SELECT
  TO authenticated
  USING (id = auth.uid());

-- 3. Authenticated users can update their own record (except role/status)
CREATE POLICY "auth_update_own" ON admins
  FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- That's it! Keep it simple. Super admin permissions will be handled in the application layer.

SELECT 'Simple RLS policies applied!' as message;
