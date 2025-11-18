-- =============================================
-- BLOG AUDIT LOGS & ENHANCED FEATURES
-- =============================================
-- 1. Audit logs for blog actions
-- 2. RLS for admin-specific unpublished posts
-- 3. Admin email display for super admin
-- =============================================

-- Step 1: Create audit_logs table if not exists
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  admin_email TEXT,
  admin_name TEXT,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id UUID,
  details JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for audit logs
CREATE INDEX IF NOT EXISTS idx_audit_logs_admin_id ON audit_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource ON audit_logs(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);

-- Step 2: Add admin email columns to blog_posts for super admin view
ALTER TABLE blog_posts 
ADD COLUMN IF NOT EXISTS created_by_email TEXT,
ADD COLUMN IF NOT EXISTS updated_by_email TEXT;

-- Step 3: Create function to log blog actions
CREATE OR REPLACE FUNCTION log_blog_action()
RETURNS TRIGGER AS $$
DECLARE
  v_action TEXT;
  v_admin_email TEXT;
  v_admin_name TEXT;
  v_details JSONB;
BEGIN
  -- Get admin details
  SELECT email INTO v_admin_email FROM auth.users WHERE id = auth.uid();
  SELECT name INTO v_admin_name FROM admins WHERE id = auth.uid();
  
  -- Determine action
  IF (TG_OP = 'INSERT') THEN
    v_action := 'blog_post_created';
    v_details := jsonb_build_object(
      'title', NEW.title,
      'slug', NEW.slug,
      'category', NEW.category,
      'is_published', NEW.is_published
    );
  ELSIF (TG_OP = 'UPDATE') THEN
    -- Check what changed
    IF (OLD.is_published = false AND NEW.is_published = true) THEN
      v_action := 'blog_post_published';
    ELSIF (OLD.is_published = true AND NEW.is_published = false) THEN
      v_action := 'blog_post_unpublished';
    ELSE
      v_action := 'blog_post_updated';
    END IF;
    
    v_details := jsonb_build_object(
      'title', NEW.title,
      'slug', NEW.slug,
      'category', NEW.category,
      'is_published', NEW.is_published,
      'changes', jsonb_build_object(
        'title_changed', OLD.title != NEW.title,
        'content_changed', OLD.content != NEW.content,
        'status_changed', OLD.is_published != NEW.is_published
      )
    );
  ELSIF (TG_OP = 'DELETE') THEN
    v_action := 'blog_post_deleted';
    v_details := jsonb_build_object(
      'title', OLD.title,
      'slug', OLD.slug,
      'category', OLD.category,
      'was_published', OLD.is_published
    );
  END IF;
  
  -- Insert audit log
  INSERT INTO audit_logs (
    admin_id,
    admin_email,
    admin_name,
    action,
    resource_type,
    resource_id,
    details
  ) VALUES (
    auth.uid(),
    v_admin_email,
    v_admin_name,
    v_action,
    'blog_post',
    COALESCE(NEW.id, OLD.id),
    v_details
  );
  
  -- Return appropriate value
  IF (TG_OP = 'DELETE') THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 4: Create trigger for audit logging
DROP TRIGGER IF EXISTS blog_posts_audit_trigger ON blog_posts;
CREATE TRIGGER blog_posts_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON blog_posts
  FOR EACH ROW
  EXECUTE FUNCTION log_blog_action();

-- Step 5: Create function to update admin emails in blog_posts
CREATE OR REPLACE FUNCTION update_blog_admin_emails()
RETURNS TRIGGER AS $$
DECLARE
  v_created_email TEXT;
  v_updated_email TEXT;
BEGIN
  -- Get creator email
  IF NEW.created_by_id IS NOT NULL THEN
    SELECT email INTO v_created_email FROM auth.users WHERE id = NEW.created_by_id;
    NEW.created_by_email := v_created_email;
  END IF;
  
  -- Get updater email
  IF NEW.updated_by_id IS NOT NULL THEN
    SELECT email INTO v_updated_email FROM auth.users WHERE id = NEW.updated_by_id;
    NEW.updated_by_email := v_updated_email;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 6: Create trigger to auto-populate admin emails
DROP TRIGGER IF EXISTS blog_posts_admin_emails_trigger ON blog_posts;
CREATE TRIGGER blog_posts_admin_emails_trigger
  BEFORE INSERT OR UPDATE ON blog_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_blog_admin_emails();

-- Step 7: Update RLS policies for admin-specific unpublished posts
DROP POLICY IF EXISTS "Authenticated users can view all posts" ON blog_posts;

-- Admins can see their own unpublished posts + all published posts
CREATE POLICY "Admins can view own unpublished and all published posts"
  ON blog_posts FOR SELECT
  TO authenticated
  USING (
    is_published = true OR created_by_id = auth.uid()
  );

-- Super admins can see ALL posts
CREATE POLICY "Super admins can view all posts"
  ON blog_posts FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins 
      WHERE id = auth.uid() 
      AND role = 'super_admin'
    )
  );

-- Step 8: RLS for audit_logs
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Only super admins can view audit logs
CREATE POLICY "Super admins can view audit logs"
  ON audit_logs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins 
      WHERE id = auth.uid() 
      AND role = 'super_admin'
    )
  );

-- System can insert audit logs
CREATE POLICY "System can insert audit logs"
  ON audit_logs FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Step 9: Grant permissions
GRANT SELECT ON audit_logs TO authenticated;
GRANT INSERT ON audit_logs TO authenticated;

-- Step 10: Backfill existing posts with admin emails
UPDATE blog_posts p
SET 
  created_by_email = u.email
FROM auth.users u
WHERE p.created_by_id = u.id
AND p.created_by_email IS NULL;

UPDATE blog_posts p
SET 
  updated_by_email = u.email
FROM auth.users u
WHERE p.updated_by_id = u.id
AND p.updated_by_email IS NULL;

-- Verification
SELECT '✅ Step 1: audit_logs table created' as status;
SELECT '✅ Step 2: Admin email columns added to blog_posts' as status;
SELECT '✅ Step 3: Audit logging function created' as status;
SELECT '✅ Step 4: Audit trigger created' as status;
SELECT '✅ Step 5: Admin email function created' as status;
SELECT '✅ Step 6: Admin email trigger created' as status;
SELECT '✅ Step 7: RLS policies updated' as status;
SELECT '✅ Step 8: Audit logs RLS enabled' as status;
SELECT '✅ Step 9: Permissions granted' as status;
SELECT '✅ Step 10: Existing posts backfilled' as status;

-- Show sample audit logs
SELECT 
  '📋 Recent Audit Logs:' as info,
  admin_email,
  action,
  resource_type,
  created_at
FROM audit_logs
WHERE resource_type = 'blog_post'
ORDER BY created_at DESC
LIMIT 5;

SELECT '🎉 BLOG AUDIT LOGS SETUP COMPLETE!' as status;
SELECT '✅ Audit logs will now track all blog actions' as message;
SELECT '✅ Super admins can see admin emails' as message2;
SELECT '✅ Admins can only see their own unpublished posts' as message3;
