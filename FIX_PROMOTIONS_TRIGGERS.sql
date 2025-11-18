-- Fix promotions triggers to use admins table instead of auth.users
-- This fixes the "permission denied for table users" error

-- Drop existing triggers and functions
DROP TRIGGER IF EXISTS promotions_admin_emails_trigger ON promotions;
DROP TRIGGER IF EXISTS promotions_audit_trigger ON promotions;
DROP FUNCTION IF EXISTS update_promotion_admin_emails();
DROP FUNCTION IF EXISTS log_promotion_action();

-- Recreate function to populate admin emails (using admins table only)
CREATE OR REPLACE FUNCTION update_promotion_admin_emails()
RETURNS TRIGGER AS $$
DECLARE
  v_created_email TEXT;
  v_updated_email TEXT;
BEGIN
  -- Get creator email from admins table
  IF TG_OP = 'INSERT' AND NEW.created_by_id IS NOT NULL THEN
    SELECT email INTO v_created_email FROM admins WHERE id = NEW.created_by_id;
    NEW.created_by_email := v_created_email;
  END IF;
  
  -- Get updater email from admins table
  IF NEW.updated_by_id IS NOT NULL THEN
    SELECT email INTO v_updated_email FROM admins WHERE id = NEW.updated_by_id;
    NEW.updated_by_email := v_updated_email;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate trigger
CREATE TRIGGER promotions_admin_emails_trigger
  BEFORE INSERT OR UPDATE ON promotions
  FOR EACH ROW
  EXECUTE FUNCTION update_promotion_admin_emails();

-- Recreate audit logging function (using admins table only)
CREATE OR REPLACE FUNCTION log_promotion_action()
RETURNS TRIGGER AS $$
DECLARE
  v_action TEXT;
  v_admin_email TEXT;
  v_admin_name TEXT;
  v_details JSONB;
BEGIN
  -- Get admin details from admins table only
  SELECT email, name INTO v_admin_email, v_admin_name 
  FROM admins 
  WHERE id = auth.uid();
  
  -- Determine action
  IF (TG_OP = 'INSERT') THEN
    v_action := 'promotion_created';
    v_details := jsonb_build_object(
      'title', NEW.title,
      'discount_type', NEW.discount_type,
      'discount_value', NEW.discount_value,
      'code', NEW.code,
      'start_date', NEW.start_date,
      'end_date', NEW.end_date
    );
  ELSIF (TG_OP = 'UPDATE') THEN
    IF (OLD.is_active = true AND NEW.is_active = false) THEN
      v_action := 'promotion_deactivated';
    ELSIF (OLD.is_active = false AND NEW.is_active = true) THEN
      v_action := 'promotion_activated';
    ELSE
      v_action := 'promotion_updated';
    END IF;
    v_details := jsonb_build_object(
      'title', NEW.title,
      'changes', jsonb_build_object(
        'old', to_jsonb(OLD),
        'new', to_jsonb(NEW)
      )
    );
  ELSIF (TG_OP = 'DELETE') THEN
    v_action := 'promotion_deleted';
    v_details := jsonb_build_object(
      'title', OLD.title,
      'code', OLD.code
    );
  END IF;
  
  -- Insert audit log (using existing audit_logs table)
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
    'promotion',
    COALESCE(NEW.id, OLD.id),
    v_details
  );
  
  IF (TG_OP = 'DELETE') THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Recreate audit trigger
CREATE TRIGGER promotions_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON promotions
  FOR EACH ROW
  EXECUTE FUNCTION log_promotion_action();

SELECT '✅ Promotions triggers fixed - no longer using auth.users table' as status;
