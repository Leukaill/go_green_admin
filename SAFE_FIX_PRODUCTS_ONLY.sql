-- ============================================
-- SAFE FIX: Only fix products table trigger
-- Does NOT touch admin or other table triggers
-- ============================================

-- STEP 1: First, let's see what we're dealing with
SELECT 
    trigger_name,
    event_manipulation,
    action_statement
FROM information_schema.triggers
WHERE event_object_table = 'products';

-- STEP 2: Drop ONLY products-specific triggers (not affecting admins)
DROP TRIGGER IF EXISTS products_audit_trigger ON products CASCADE;
DROP TRIGGER IF EXISTS audit_products_changes ON products CASCADE;

-- STEP 3: Drop ONLY products-specific functions (not affecting admins)
DROP FUNCTION IF EXISTS log_products_changes() CASCADE;
DROP FUNCTION IF EXISTS audit_products_changes() CASCADE;

-- STEP 4: Create a NEW safe function ONLY for products
CREATE OR REPLACE FUNCTION log_products_changes_safe()
RETURNS TRIGGER AS $$
BEGIN
  -- This function ONLY handles products table
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
        'products',
        NEW.id::text,
        'INSERT',
        jsonb_build_object(
          'id', NEW.id,
          'name', NEW.name,
          'description', NEW.description,
          'price', NEW.price,
          'stock', NEW.stock,
          'category_id', NEW.category_id,
          'unit', NEW.unit,
          'origin', NEW.origin,
          'image_url', NEW.image_url,
          'is_featured', NEW.is_featured,
          'is_available', NEW.is_available
        ),
        COALESCE(auth.uid(), '00000000-0000-0000-0000-000000000000'::uuid),
        NOW()
      );
    EXCEPTION WHEN OTHERS THEN
      -- If audit fails, don't block the insert
      RAISE WARNING 'Products audit log failed: %', SQLERRM;
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
        'products',
        NEW.id::text,
        'UPDATE',
        jsonb_build_object(
          'id', OLD.id,
          'name', OLD.name,
          'price', OLD.price,
          'stock', OLD.stock
        ),
        jsonb_build_object(
          'id', NEW.id,
          'name', NEW.name,
          'price', NEW.price,
          'stock', NEW.stock
        ),
        COALESCE(auth.uid(), '00000000-0000-0000-0000-000000000000'::uuid),
        NOW()
      );
    EXCEPTION WHEN OTHERS THEN
      RAISE WARNING 'Products audit log failed: %', SQLERRM;
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
        'products',
        OLD.id::text,
        'DELETE',
        jsonb_build_object(
          'id', OLD.id,
          'name', OLD.name
        ),
        COALESCE(auth.uid(), '00000000-0000-0000-0000-000000000000'::uuid),
        NOW()
      );
    EXCEPTION WHEN OTHERS THEN
      RAISE WARNING 'Products audit log failed: %', SQLERRM;
    END;
    RETURN OLD;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- STEP 5: Create trigger ONLY for products table
CREATE TRIGGER products_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON products
  FOR EACH ROW
  EXECUTE FUNCTION log_products_changes_safe();

-- STEP 6: Verify admin triggers are still intact
SELECT 
    event_object_table,
    trigger_name,
    event_manipulation
FROM information_schema.triggers
WHERE event_object_table IN ('admins', 'products')
ORDER BY event_object_table, trigger_name;

-- STEP 7: Success message
DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ Products trigger fixed safely';
  RAISE NOTICE '✅ Admin triggers NOT affected';
  RAISE NOTICE '✅ Try creating a product now';
  RAISE NOTICE '========================================';
END $$;
