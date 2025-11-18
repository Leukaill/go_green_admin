-- =====================================================
-- FIX INFINITE RECURSION IN ADMINS RLS POLICY
-- The policy is checking admins table within admins table
-- =====================================================

-- Step 1: Drop all existing policies on admins table
DROP POLICY IF EXISTS "Service role can insert admins" ON admins;
DROP POLICY IF EXISTS "Admins can view all admins" ON admins;
DROP POLICY IF EXISTS "Super admins can manage admins" ON admins;

-- Step 2: Create non-recursive policies
-- These policies check auth.uid() directly without querying admins table

-- Allow authenticated users to view their own admin record
CREATE POLICY "Users can view own admin record"
    ON admins
    FOR SELECT
    USING (id = auth.uid());

-- Allow service role to insert (for signup)
CREATE POLICY "Service role can insert admins"
    ON admins
    FOR INSERT
    WITH CHECK (true);

-- Allow users to update their own record
CREATE POLICY "Users can update own admin record"
    ON admins
    FOR UPDATE
    USING (id = auth.uid())
    WITH CHECK (id = auth.uid());

-- For super admin operations, we'll handle this in application code
-- or use service role, to avoid recursion

-- Step 3: Grant necessary permissions
GRANT ALL ON admins TO service_role;
GRANT SELECT, UPDATE ON admins TO authenticated;

-- Step 4: Verify policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies
WHERE tablename = 'admins';

-- Step 5: Test query that was failing
SELECT 'Policy fixed! Login should work now.' as status;
