-- Fix Products Audit Trigger - Remove order_number reference
-- Error: record "new" has no field "order_number"

-- Drop the existing trigger
DROP TRIGGER IF EXISTS products_audit_trigger ON products;

-- Drop the old function
DROP FUNCTION IF EXISTS log_products_changes();

-- Create corrected audit function for products table
CREATE OR REPLACE FUNCTION log_products_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
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
      'INSERT',
      NULL,
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
        'is_available', NEW.is_available,
        'health_benefits', NEW.health_benefits,
        'nutrition_facts', NEW.nutrition_facts
      ),
      auth.uid()
    );
    RETURN NEW;
    
  ELSIF TG_OP = 'UPDATE' THEN
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
      jsonb_build_object(
        'id', OLD.id,
        'name', OLD.name,
        'description', OLD.description,
        'price', OLD.price,
        'stock', OLD.stock,
        'category_id', OLD.category_id,
        'unit', OLD.unit,
        'origin', OLD.origin,
        'image_url', OLD.image_url,
        'is_featured', OLD.is_featured,
        'is_available', OLD.is_available,
        'health_benefits', OLD.health_benefits,
        'nutrition_facts', OLD.nutrition_facts
      ),
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
        'is_available', NEW.is_available,
        'health_benefits', NEW.health_benefits,
        'nutrition_facts', NEW.nutrition_facts
      ),
      auth.uid()
    );
    RETURN NEW;
    
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO audit_logs (
      table_name,
      record_id,
      action,
      old_data,
      new_data,
      user_id
    ) VALUES (
      'products',
      OLD.id::text,
      'DELETE',
      jsonb_build_object(
        'id', OLD.id,
        'name', OLD.name,
        'description', OLD.description,
        'price', OLD.price,
        'stock', OLD.stock,
        'category_id', OLD.category_id,
        'unit', OLD.unit,
        'origin', OLD.origin,
        'image_url', OLD.image_url,
        'is_featured', OLD.is_featured,
        'is_available', OLD.is_available,
        'health_benefits', OLD.health_benefits,
        'nutrition_facts', OLD.nutrition_facts
      ),
      NULL,
      auth.uid()
    );
    RETURN OLD;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
CREATE TRIGGER products_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON products
  FOR EACH ROW
  EXECUTE FUNCTION log_products_changes();

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Products audit trigger fixed successfully!';
  RAISE NOTICE 'Removed order_number field reference';
  RAISE NOTICE 'You can now create products without errors';
END $$;
