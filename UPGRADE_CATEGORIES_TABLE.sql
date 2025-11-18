-- =============================================
-- UPGRADE CATEGORIES TABLE WITH ADMIN TRACKING
-- =============================================

-- Add admin tracking columns to categories table
ALTER TABLE categories 
ADD COLUMN IF NOT EXISTS created_by_id UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS updated_by_id UUID REFERENCES auth.users(id);

-- Add comment for documentation
COMMENT ON COLUMN categories.created_by_id IS 'UUID of admin/super admin who created the category';
COMMENT ON COLUMN categories.updated_by_id IS 'UUID of admin/super admin who last updated the category';

-- Create a view to get category details with admin info
CREATE OR REPLACE VIEW categories_with_admin_details AS
SELECT 
  c.id,
  c.name,
  c.slug,
  c.description,
  c.icon,
  c.display_order,
  c.is_active,
  c.created_at,
  c.updated_at,
  c.created_by_id,
  c.updated_by_id,
  creator.email as created_by_email,
  creator.email as created_by_name,
  updater.email as updated_by_email,
  updater.email as updated_by_name,
  (SELECT COUNT(*) FROM products WHERE category_id = c.id AND is_available = true) as product_count
FROM categories c
LEFT JOIN auth.users creator ON c.created_by_id = creator.id
LEFT JOIN auth.users updater ON c.updated_by_id = updater.id;

-- Grant permissions to view
GRANT SELECT ON categories_with_admin_details TO authenticated;

-- Verification
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'categories'
  AND column_name IN ('created_by_id', 'updated_by_id');

SELECT '✅ Admin tracking columns added to categories table' as status;
SELECT '✅ View created: categories_with_admin_details' as status;
SELECT '✅ Categories system ready for admin tracking' as status;
