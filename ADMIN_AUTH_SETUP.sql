-- =====================================================
-- GO GREEN RWANDA - ADMIN AUTHENTICATION SETUP
-- =====================================================
-- This SQL file sets up the complete admin authentication system
-- Run this in your Supabase SQL Editor
-- =====================================================

-- =====================================================
-- 1. CREATE ADMINS TABLE
-- =====================================================

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

-- =====================================================
-- 2. CREATE INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_admins_email ON admins(email);
CREATE INDEX IF NOT EXISTS idx_admins_role ON admins(role);
CREATE INDEX IF NOT EXISTS idx_admins_status ON admins(status);

-- =====================================================
-- 3. ENABLE ROW LEVEL SECURITY (RLS)
-- =====================================================

ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 4. CREATE RLS POLICIES
-- =====================================================

-- Policy: Admins can view all admins
DROP POLICY IF EXISTS "Admins can view all admins" ON admins;
CREATE POLICY "Admins can view all admins" ON admins
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admins 
      WHERE id = auth.uid() AND status = 'active'
    )
  );

-- Policy: Admins can view their own profile
DROP POLICY IF EXISTS "Admins can view own profile" ON admins;
CREATE POLICY "Admins can view own profile" ON admins
  FOR SELECT
  USING (id = auth.uid());

-- Policy: Admins can update their own profile
DROP POLICY IF EXISTS "Admins can update own profile" ON admins;
CREATE POLICY "Admins can update own profile" ON admins
  FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Policy: Super admins can manage all admins
DROP POLICY IF EXISTS "Super admins can manage admins" ON admins;
CREATE POLICY "Super admins can manage admins" ON admins
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM admins 
      WHERE id = auth.uid() 
      AND role = 'super_admin' 
      AND status = 'active'
    )
  );

-- =====================================================
-- 5. CREATE FUNCTION TO AUTO-UPDATE updated_at
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 6. CREATE TRIGGER FOR updated_at
-- =====================================================

DROP TRIGGER IF EXISTS update_admins_updated_at ON admins;
CREATE TRIGGER update_admins_updated_at
  BEFORE UPDATE ON admins
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 7. CREATE FUNCTION TO CREATE ADMIN USER
-- =====================================================

CREATE OR REPLACE FUNCTION create_admin_user(
  user_email TEXT,
  user_password TEXT,
  user_name TEXT,
  user_role TEXT DEFAULT 'admin'
)
RETURNS JSON AS $$
DECLARE
  new_user_id UUID;
  result JSON;
BEGIN
  -- Validate role
  IF user_role NOT IN ('super_admin', 'admin', 'moderator') THEN
    RAISE EXCEPTION 'Invalid role. Must be super_admin, admin, or moderator';
  END IF;

  -- Create auth user (this would typically be done via Supabase Auth API)
  -- This is a placeholder - actual user creation should be done via Supabase Dashboard or API
  
  -- For now, return instructions
  result := json_build_object(
    'success', false,
    'message', 'Please create the auth user via Supabase Dashboard first, then insert into admins table',
    'instructions', json_build_object(
      'step1', 'Go to Supabase Dashboard → Authentication → Users',
      'step2', 'Click "Add User"',
      'step3', 'Enter email: ' || user_email,
      'step4', 'Enter password',
      'step5', 'Enable "Auto Confirm User"',
      'step6', 'Copy the created user ID',
      'step7', 'Run: INSERT INTO admins (id, email, name, role, status) VALUES (''[user-id]'', ''' || user_email || ''', ''' || user_name || ''', ''' || user_role || ''', ''active'');'
    )
  );
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 8. INSERT SAMPLE SUPER ADMIN (MANUAL STEP REQUIRED)
-- =====================================================

-- IMPORTANT: Before running this, you MUST:
-- 1. Go to Supabase Dashboard → Authentication → Users
-- 2. Create a new user with email: superadmin@gogreen.rw
-- 3. Set a strong password
-- 4. Enable "Auto Confirm User" checkbox
-- 5. Copy the generated user ID
-- 6. Replace 'YOUR-USER-ID-HERE' below with the actual ID

-- Example (REPLACE THE ID):
-- INSERT INTO admins (id, email, name, role, status)
-- VALUES (
--   'YOUR-USER-ID-HERE',
--   'superadmin@gogreen.rw',
--   'Super Admin',
--   'super_admin',
--   'active'
-- );

-- =====================================================
-- 9. HELPER FUNCTION: Get Admin by Email
-- =====================================================

CREATE OR REPLACE FUNCTION get_admin_by_email(admin_email TEXT)
RETURNS TABLE (
  id UUID,
  email TEXT,
  name TEXT,
  role TEXT,
  status TEXT,
  last_login TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT a.id, a.email, a.name, a.role, a.status, a.last_login
  FROM admins a
  WHERE a.email = admin_email;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 10. HELPER FUNCTION: Update Last Login
-- =====================================================

CREATE OR REPLACE FUNCTION update_admin_last_login(admin_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE admins
  SET last_login = NOW()
  WHERE id = admin_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 11. HELPER FUNCTION: Suspend Admin
-- =====================================================

CREATE OR REPLACE FUNCTION suspend_admin(admin_id UUID)
RETURNS VOID AS $$
BEGIN
  -- Only super admins can suspend
  IF NOT EXISTS (
    SELECT 1 FROM admins 
    WHERE id = auth.uid() 
    AND role = 'super_admin' 
    AND status = 'active'
  ) THEN
    RAISE EXCEPTION 'Only super admins can suspend users';
  END IF;

  UPDATE admins
  SET status = 'suspended', updated_at = NOW()
  WHERE id = admin_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 12. HELPER FUNCTION: Activate Admin
-- =====================================================

CREATE OR REPLACE FUNCTION activate_admin(admin_id UUID)
RETURNS VOID AS $$
BEGIN
  -- Only super admins can activate
  IF NOT EXISTS (
    SELECT 1 FROM admins 
    WHERE id = auth.uid() 
    AND role = 'super_admin' 
    AND status = 'active'
  ) THEN
    RAISE EXCEPTION 'Only super admins can activate users';
  END IF;

  UPDATE admins
  SET status = 'active', updated_at = NOW()
  WHERE id = admin_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 13. HELPER FUNCTION: Change Admin Role
-- =====================================================

CREATE OR REPLACE FUNCTION change_admin_role(admin_id UUID, new_role TEXT)
RETURNS VOID AS $$
BEGIN
  -- Validate role
  IF new_role NOT IN ('super_admin', 'admin', 'moderator') THEN
    RAISE EXCEPTION 'Invalid role';
  END IF;

  -- Only super admins can change roles
  IF NOT EXISTS (
    SELECT 1 FROM admins 
    WHERE id = auth.uid() 
    AND role = 'super_admin' 
    AND status = 'active'
  ) THEN
    RAISE EXCEPTION 'Only super admins can change roles';
  END IF;

  UPDATE admins
  SET role = new_role, updated_at = NOW()
  WHERE id = admin_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 14. VIEW: Active Admins Count
-- =====================================================

CREATE OR REPLACE VIEW active_admins_count AS
SELECT 
  COUNT(*) FILTER (WHERE role = 'super_admin') as super_admin_count,
  COUNT(*) FILTER (WHERE role = 'admin') as admin_count,
  COUNT(*) FILTER (WHERE role = 'moderator') as moderator_count,
  COUNT(*) as total_count
FROM admins
WHERE status = 'active';

-- =====================================================
-- 15. GRANT PERMISSIONS
-- =====================================================

-- Grant access to authenticated users
GRANT SELECT ON admins TO authenticated;
GRANT SELECT ON active_admins_count TO authenticated;

-- =====================================================
-- SETUP COMPLETE!
-- =====================================================

-- Next Steps:
-- 1. Create your first super admin user in Supabase Dashboard
-- 2. Insert the admin record using the INSERT statement above
-- 3. Test login with the credentials
-- 4. Use the super admin account to create other admins

SELECT 'Admin authentication system setup complete!' as message;
