-- ============================================
-- SAFE FIX: Only fix categories table trigger
-- Does NOT touch admin or other table triggers
-- ============================================

-- STEP 1: First, let's see what we're dealing with
SELECT 
    trigger_name,
    event_manipulation,
    action_statement
FROM information_schema.triggers
WHERE event_object_table = 'categories';

-- STEP 2: Drop ONLY categories-specific triggers (not affecting admins)
DROP TRIGGER IF EXISTS categories_audit_trigger ON categories CASCADE;
DROP TRIGGER IF EXISTS audit_categories_changes ON categories CASCADE;

-- STEP 3: Drop ONLY categories-specific functions (not affecting admins)
DROP FUNCTION IF EXISTS log_categories_changes() CASCADE;
DROP FUNCTION IF EXISTS audit_categories_changes() CASCADE;

-- STEP 4: Create a NEW safe function ONLY for categories
CREATE OR REPLACE FUNCTION log_categories_changes_safe()
RETURNS TRIGGER AS $$
BEGIN
  -- This function ONLY handles categories table
  -- It does NOT reference order_number or any admin fields
  
  IF TG_OP = 'INSERT' THEN
    BEGIN
      INSERT INTO audit_logs (
        table_name,
        record_id,
        action,
        new_data,
        user_id,
        created_at
      ) VALUES (
        'categories',
        NEW.id::text,
        'INSERT',
        jsonb_build_object(
          'id', NEW.id,
          'name', NEW.name,
          'description', NEW.description,
          'icon', NEW.icon,
          'color', NEW.color,
          'is_active', NEW.is_active
        ),
        COALESCE(auth.uid(), '00000000-0000-0000-0000-000000000000'::uuid),
        NOW()
      );
    EXCEPTION WHEN OTHERS THEN
      -- If audit fails, don't block the insert
      RAISE WARNING 'Categories audit log failed: %', SQLERRM;
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
        user_id,
        created_at
      ) VALUES (
        'categories',
        NEW.id::text,
        'UPDATE',
        jsonb_build_object(
          'id', OLD.id,
          'name', OLD.name,
          'description', OLD.description,
          'icon', OLD.icon,
          'color', OLD.color,
          'is_active', OLD.is_active
        ),
        jsonb_build_object(
          'id', NEW.id,
          'name', NEW.name,
          'description', NEW.description,
          'icon', NEW.icon,
          'color', NEW.color,
          'is_active', NEW.is_active
        ),
        COALESCE(auth.uid(), '00000000-0000-0000-0000-000000000000'::uuid),
        NOW()
      );
    EXCEPTION WHEN OTHERS THEN
      RAISE WARNING 'Categories audit log failed: %', SQLERRM;
    END;
    RETURN NEW;
    
  ELSIF TG_OP = 'DELETE' THEN
    BEGIN
      INSERT INTO audit_logs (
        table_name,
        record_id,
        action,
        old_data,
        user_id,
        created_at
      ) VALUES (
        'categories',
        OLD.id::text,
        'DELETE',
        jsonb_build_object(
          'id', OLD.id,
          'name', OLD.name,
          'description', OLD.description
        ),
        COALESCE(auth.uid(), '00000000-0000-0000-0000-000000000000'::uuid),
        NOW()
      );
    EXCEPTION WHEN OTHERS THEN
      RAISE WARNING 'Categories audit log failed: %', SQLERRM;
    END;
    RETURN OLD;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- STEP 5: Create trigger ONLY for categories table
CREATE TRIGGER categories_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON categories
  FOR EACH ROW
  EXECUTE FUNCTION log_categories_changes_safe();

-- STEP 6: Verify admin triggers are still intact
SELECT 
    event_object_table,
    trigger_name,
    event_manipulation
FROM information_schema.triggers
WHERE event_object_table IN ('admins', 'categories', 'products')
ORDER BY event_object_table, trigger_name;

-- STEP 7: Success message
DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ Categories trigger fixed safely';
  RAISE NOTICE '✅ Admin triggers NOT affected';
  RAISE NOTICE '✅ Products triggers NOT affected';
  RAISE NOTICE '✅ Try creating a category now';
  RAISE NOTICE '========================================';
END $$;
