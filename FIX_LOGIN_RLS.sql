-- Fix RLS Policy to Allow Login
-- The issue: Users need to check if they're an admin BEFORE we know they're an admin

-- Drop the restrictive policy
DROP POLICY IF EXISTS "Admins can view own profile" ON admins;

-- Create a new policy that allows ANY authenticated user to view their own admin record
CREATE POLICY "Users can view own admin record" ON admins
  FOR SELECT
  TO authenticated
  USING (id = auth.uid());

-- This allows the login flow to work:
-- 1. User authenticates with Supabase Auth
-- 2. User queries admins table with their own ID
-- 3. If record exists, they're an admin
-- 4. If not, they get rejected

SELECT 'Login RLS policy fixed!' as message;
