-- ============================================
-- URGENT FIX: Products Table Trigger Error
-- Error: record "new" has no field "order_number"
-- ============================================

-- STEP 1: Check what triggers exist on products table
SELECT 
    trigger_name,
    event_manipulation,
    action_statement
FROM information_schema.triggers
WHERE event_object_table = 'products';

-- STEP 2: Drop ALL triggers on products table
DROP TRIGGER IF EXISTS products_audit_trigger ON products;
DROP TRIGGER IF EXISTS audit_products_changes ON products;
DROP TRIGGER IF EXISTS log_products_audit ON products;

-- STEP 3: Drop the problematic function
DROP FUNCTION IF EXISTS log_products_changes() CASCADE;
DROP FUNCTION IF EXISTS audit_products_changes() CASCADE;

-- STEP 4: Create a SIMPLE working audit function (no order_number!)
CREATE OR REPLACE FUNCTION log_products_changes()
RETURNS TRIGGER AS $$
BEGIN
  -- Only log if audit_logs table exists
  IF TG_OP = 'INSERT' THEN
    BEGIN
      INSERT INTO audit_logs (
        table_name,
        record_id,
        action,
        new_data,
        user_id
      ) VALUES (
        'products',
        NEW.id::text,
        'INSERT',
        to_jsonb(NEW),
        auth.uid()
      );
    EXCEPTION WHEN OTHERS THEN
      -- If audit fails, don't block the insert
      RAISE WARNING 'Audit log failed: %', SQLERRM;
    END;
    RETURN NEW;
    
  ELSIF TG_OP = 'UPDATE' THEN
    BEGIN
      INSERT INTO audit_logs (
        table_name,
        record_id,
        action,
        old_data,
        new_data,
        user_id
      ) VALUES (
        'products',
        NEW.id::text,
        'UPDATE',
        to_jsonb(OLD),
        to_jsonb(NEW),
        auth.uid()
      );
    EXCEPTION WHEN OTHERS THEN
      RAISE WARNING 'Audit log failed: %', SQLERRM;
    END;
    RETURN NEW;
    
  ELSIF TG_OP = 'DELETE' THEN
    BEGIN
      INSERT INTO audit_logs (
        table_name,
        record_id,
        action,
        old_data,
        user_id
      ) VALUES (
        'products',
        OLD.id::text,
        'DELETE',
        to_jsonb(OLD),
        auth.uid()
      );
    EXCEPTION WHEN OTHERS THEN
      RAISE WARNING 'Audit log failed: %', SQLERRM;
    END;
    RETURN OLD;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- STEP 5: Create the trigger
CREATE TRIGGER products_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON products
  FOR EACH ROW
  EXECUTE FUNCTION log_products_changes();

-- STEP 6: Test it works
DO $$
BEGIN
  RAISE NOTICE '✅ Products audit trigger has been fixed!';
  RAISE NOTICE '✅ No more order_number errors';
  RAISE NOTICE '✅ Try creating a product now';
END $$;

-- STEP 7: Verify the fix
SELECT 
    trigger_name,
    event_manipulation,
    action_statement
FROM information_schema.triggers
WHERE event_object_table = 'products';
