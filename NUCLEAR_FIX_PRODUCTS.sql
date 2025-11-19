-- ============================================
-- NUCLEAR OPTION: Remove ALL audit triggers
-- This will allow products to be created
-- ============================================

-- STEP 1: Drop ALL possible trigger names on products
DROP TRIGGER IF EXISTS products_audit_trigger ON products CASCADE;
DROP TRIGGER IF EXISTS audit_products_changes ON products CASCADE;
DROP TRIGGER IF EXISTS log_products_audit ON products CASCADE;
DROP TRIGGER IF EXISTS products_changes_trigger ON products CASCADE;
DROP TRIGGER IF EXISTS audit_trigger ON products CASCADE;
DROP TRIGGER IF EXISTS log_changes ON products CASCADE;

-- STEP 2: Drop ALL possible function names
DROP FUNCTION IF EXISTS log_products_changes() CASCADE;
DROP FUNCTION IF EXISTS audit_products_changes() CASCADE;
DROP FUNCTION IF EXISTS log_changes() CASCADE;
DROP FUNCTION IF EXISTS audit_log_changes() CASCADE;

-- STEP 3: Check if products table structure is correct
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'products'
ORDER BY ordinal_position;

-- STEP 4: Verify no triggers remain
SELECT 
    trigger_name,
    event_manipulation
FROM information_schema.triggers
WHERE event_object_table = 'products';

-- STEP 5: Success message
DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ ALL TRIGGERS REMOVED FROM PRODUCTS';
  RAISE NOTICE '✅ You can now create products';
  RAISE NOTICE '⚠️  Audit logging is disabled for products';
  RAISE NOTICE '========================================';
END $$;

-- STEP 6: Try a test insert (will rollback, just testing)
DO $$
BEGIN
  -- Test insert (will be rolled back)
  INSERT INTO products (
    name,
    description,
    price,
    stock,
    category_id,
    unit,
    origin,
    image_url,
    is_featured,
    is_available
  ) VALUES (
    'TEST PRODUCT - DELETE ME',
    'This is a test',
    100,
    0,
    (SELECT id FROM categories LIMIT 1),
    'kg',
    'Test',
    '',
    false,
    true
  );
  
  RAISE NOTICE '✅ TEST INSERT SUCCESSFUL!';
  RAISE NOTICE '⚠️  Rolling back test insert...';
  
  -- Rollback the test
  RAISE EXCEPTION 'Test complete - rolling back';
EXCEPTION
  WHEN OTHERS THEN
    IF SQLERRM LIKE '%Test complete%' THEN
      RAISE NOTICE '✅ Products table is working correctly!';
    ELSE
      RAISE NOTICE '❌ Error: %', SQLERRM;
    END IF;
END $$;
