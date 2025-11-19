-- ============================================
-- COMBINED FIX: Products AND Categories
-- Does NOT touch admin or other table triggers
-- Run this to fix both tables at once
-- ============================================

-- ==================== PRODUCTS ====================

-- Drop ONLY products-specific triggers
DROP TRIGGER IF EXISTS products_audit_trigger ON products CASCADE;
DROP TRIGGER IF EXISTS audit_products_changes ON products CASCADE;
DROP FUNCTION IF EXISTS log_products_changes() CASCADE;
DROP FUNCTION IF EXISTS audit_products_changes() CASCADE;

-- Create safe function for products
CREATE OR REPLACE FUNCTION log_products_changes_safe()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    BEGIN
      INSERT INTO audit_logs (table_name, record_id, action, new_data, user_id, created_at)
      VALUES ('products', NEW.id::text, 'INSERT',
        jsonb_build_object('id', NEW.id, 'name', NEW.name, 'description', NEW.description, 
          'price', NEW.price, 'stock', NEW.stock, 'category_id', NEW.category_id,
          'unit', NEW.unit, 'origin', NEW.origin, 'image_url', NEW.image_url,
          'is_featured', NEW.is_featured, 'is_available', NEW.is_available),
        COALESCE(auth.uid(), '00000000-0000-0000-0000-000000000000'::uuid), NOW());
    EXCEPTION WHEN OTHERS THEN
      RAISE WARNING 'Products audit failed: %', SQLERRM;
    END;
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    BEGIN
      INSERT INTO audit_logs (table_name, record_id, action, old_data, new_data, user_id, created_at)
      VALUES ('products', NEW.id::text, 'UPDATE',
        jsonb_build_object('id', OLD.id, 'name', OLD.name, 'price', OLD.price, 'stock', OLD.stock),
        jsonb_build_object('id', NEW.id, 'name', NEW.name, 'price', NEW.price, 'stock', NEW.stock),
        COALESCE(auth.uid(), '00000000-0000-0000-0000-000000000000'::uuid), NOW());
    EXCEPTION WHEN OTHERS THEN
      RAISE WARNING 'Products audit failed: %', SQLERRM;
    END;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    BEGIN
      INSERT INTO audit_logs (table_name, record_id, action, old_data, user_id, created_at)
      VALUES ('products', OLD.id::text, 'DELETE',
        jsonb_build_object('id', OLD.id, 'name', OLD.name),
        COALESCE(auth.uid(), '00000000-0000-0000-0000-000000000000'::uuid), NOW());
    EXCEPTION WHEN OTHERS THEN
      RAISE WARNING 'Products audit failed: %', SQLERRM;
    END;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create products trigger
CREATE TRIGGER products_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON products
  FOR EACH ROW
  EXECUTE FUNCTION log_products_changes_safe();

-- ==================== CATEGORIES ====================

-- Drop ONLY categories-specific triggers
DROP TRIGGER IF EXISTS categories_audit_trigger ON categories CASCADE;
DROP TRIGGER IF EXISTS audit_categories_changes ON categories CASCADE;
DROP FUNCTION IF EXISTS log_categories_changes() CASCADE;
DROP FUNCTION IF EXISTS audit_categories_changes() CASCADE;

-- Create safe function for categories
CREATE OR REPLACE FUNCTION log_categories_changes_safe()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    BEGIN
      INSERT INTO audit_logs (table_name, record_id, action, new_data, user_id, created_at)
      VALUES ('categories', NEW.id::text, 'INSERT',
        jsonb_build_object('id', NEW.id, 'name', NEW.name, 'description', NEW.description,
          'icon', NEW.icon, 'color', NEW.color, 'is_active', NEW.is_active),
        COALESCE(auth.uid(), '00000000-0000-0000-0000-000000000000'::uuid), NOW());
    EXCEPTION WHEN OTHERS THEN
      RAISE WARNING 'Categories audit failed: %', SQLERRM;
    END;
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    BEGIN
      INSERT INTO audit_logs (table_name, record_id, action, old_data, new_data, user_id, created_at)
      VALUES ('categories', NEW.id::text, 'UPDATE',
        jsonb_build_object('id', OLD.id, 'name', OLD.name, 'description', OLD.description,
          'icon', OLD.icon, 'color', OLD.color, 'is_active', OLD.is_active),
        jsonb_build_object('id', NEW.id, 'name', NEW.name, 'description', NEW.description,
          'icon', NEW.icon, 'color', NEW.color, 'is_active', NEW.is_active),
        COALESCE(auth.uid(), '00000000-0000-0000-0000-000000000000'::uuid), NOW());
    EXCEPTION WHEN OTHERS THEN
      RAISE WARNING 'Categories audit failed: %', SQLERRM;
    END;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    BEGIN
      INSERT INTO audit_logs (table_name, record_id, action, old_data, user_id, created_at)
      VALUES ('categories', OLD.id::text, 'DELETE',
        jsonb_build_object('id', OLD.id, 'name', OLD.name, 'description', OLD.description),
        COALESCE(auth.uid(), '00000000-0000-0000-0000-000000000000'::uuid), NOW());
    EXCEPTION WHEN OTHERS THEN
      RAISE WARNING 'Categories audit failed: %', SQLERRM;
    END;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create categories trigger
CREATE TRIGGER categories_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON categories
  FOR EACH ROW
  EXECUTE FUNCTION log_categories_changes_safe();

-- ==================== VERIFICATION ====================

-- Verify all triggers
SELECT 
    event_object_table,
    trigger_name,
    event_manipulation
FROM information_schema.triggers
WHERE event_object_table IN ('admins', 'categories', 'products')
ORDER BY event_object_table, trigger_name;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ Products trigger fixed';
  RAISE NOTICE '✅ Categories trigger fixed';
  RAISE NOTICE '✅ Admin triggers NOT affected';
  RAISE NOTICE '✅ Try creating products and categories now';
  RAISE NOTICE '========================================';
END $$;
