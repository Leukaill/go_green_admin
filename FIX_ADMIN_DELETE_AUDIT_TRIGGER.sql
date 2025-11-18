-- =====================================================
-- FIX ADMIN DELETE AUDIT TRIGGER ERROR
-- Disables audit trigger on admins table to allow deletion
-- =====================================================

-- Option 1: Drop the audit trigger on admins table
DROP TRIGGER IF EXISTS audit_admins_changes ON admins;

-- Option 2: If you want to keep audit logging but fix the error,
-- we need to recreate the trigger function with proper error handling

-- First, let's create a simpler audit function for admins
CREATE OR REPLACE FUNCTION log_admin_audit()
RETURNS TRIGGER AS $$
DECLARE
  actor_id_val uuid;
  actor_name_val text;
  actor_email_val text;
BEGIN
  -- Get current user info
  actor_id_val := auth.uid();
  
  -- Get actor details from auth.users
  SELECT 
    COALESCE(raw_user_meta_data->>'full_name', email),
    email
  INTO actor_name_val, actor_email_val
  FROM auth.users
  WHERE id = actor_id_val;

  -- Insert audit log with safe values
  INSERT INTO audit_logs (
    actor_id,
    actor_name,
    actor_email,
    actor_role,
    actor_type,
    action,
    category,
    severity,
    description,
    target_type,
    target_id,
    target_name,
    status
  ) VALUES (
    COALESCE(actor_id_val, '00000000-0000-0000-0000-000000000000'::uuid),
    COALESCE(actor_name_val, 'Unknown'),
    COALESCE(actor_email_val, 'unknown@system'),
    'admin',
    'admin',
    LOWER(TG_OP),
    'admins',
    CASE 
      WHEN TG_OP = 'DELETE' THEN 'high'
      WHEN TG_OP = 'UPDATE' THEN 'medium'
      ELSE 'low'
    END,
    TG_OP || ' operation on admin user',
    'admins',
    CASE 
      WHEN TG_OP = 'DELETE' THEN OLD.id::text
      ELSE NEW.id::text
    END,
    CASE 
      WHEN TG_OP = 'DELETE' THEN OLD.email
      ELSE NEW.email
    END,
    'completed'
  );

  RETURN COALESCE(NEW, OLD);
EXCEPTION WHEN OTHERS THEN
  -- If audit logging fails, don't block the operation
  RAISE WARNING 'Audit logging failed: %', SQLERRM;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger with the fixed function
CREATE TRIGGER audit_admins_changes
  AFTER INSERT OR UPDATE OR DELETE ON admins
  FOR EACH ROW
  EXECUTE FUNCTION log_admin_audit();

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION log_admin_audit() TO authenticated;

COMMENT ON FUNCTION log_admin_audit() IS 'Simplified audit logging for admins table with error handling';
