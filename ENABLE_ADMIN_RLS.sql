-- Enable RLS and Create Proper Policies for Admins Table
-- Run this in Supabase SQL Editor

-- 1. Enable Row Level Security
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing policies if any
DROP POLICY IF EXISTS "Service role can do anything" ON admins;
DROP POLICY IF EXISTS "Authenticated users can read admins" ON admins;
DROP POLICY IF EXISTS "Admins can view all admins" ON admins;
DROP POLICY IF EXISTS "Admins can view own profile" ON admins;
DROP POLICY IF EXISTS "Admins can update own profile" ON admins;
DROP POLICY IF EXISTS "Super admins can manage admins" ON admins;

-- 3. Allow service role full access (needed for API routes)
CREATE POLICY "Service role bypass RLS" ON admins
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- 4. Admins can view their own profile
CREATE POLICY "Admins can view own profile" ON admins
  FOR SELECT
  TO authenticated
  USING (id = auth.uid());

-- 5. Admins can update their own profile (except role and status)
CREATE POLICY "Admins can update own profile" ON admins
  FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (
    id = auth.uid() 
    AND role = (SELECT role FROM admins WHERE id = auth.uid())
    AND status = (SELECT status FROM admins WHERE id = auth.uid())
  );

-- 6. Active admins can view all other admins
CREATE POLICY "Active admins can view all admins" ON admins
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins 
      WHERE id = auth.uid() 
      AND status = 'active'
    )
  );

-- 7. Super admins can do everything
CREATE POLICY "Super admins can manage all admins" ON admins
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins 
      WHERE id = auth.uid() 
      AND role = 'super_admin' 
      AND status = 'active'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admins 
      WHERE id = auth.uid() 
      AND role = 'super_admin' 
      AND status = 'active'
    )
  );

-- 8. Prevent admins from deleting themselves
CREATE POLICY "Prevent self-deletion" ON admins
  FOR DELETE
  TO authenticated
  USING (
    id != auth.uid()
    AND EXISTS (
      SELECT 1 FROM admins 
      WHERE id = auth.uid() 
      AND role = 'super_admin' 
      AND status = 'active'
    )
  );

SELECT 'RLS policies created successfully!' as message;
