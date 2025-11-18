-- Fix products table schema to work with all 3 portals
-- (Admin Panel, Super Admin Panel, Main Website)

-- Add missing columns to products table
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS unit TEXT DEFAULT 'per kg',
ADD COLUMN IF NOT EXISTS origin TEXT DEFAULT 'local',
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS is_available BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS category_id UUID;

-- Update existing products to have default values
UPDATE products 
SET 
  unit = COALESCE(unit, 'per kg'),
  origin = COALESCE(origin, 'local'),
  is_featured = COALESCE(is_featured, false),
  is_available = CASE 
    WHEN status = 'active' THEN true 
    ELSE false 
  END
WHERE unit IS NULL OR origin IS NULL OR is_featured IS NULL OR is_available IS NULL;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_products_is_featured ON products(is_featured);
CREATE INDEX IF NOT EXISTS idx_products_is_available ON products(is_available);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_origin ON products(origin);

-- Update RLS policies to allow public read access for main website
DROP POLICY IF EXISTS "Allow public read access to products" ON products;
CREATE POLICY "Allow public read access to products"
ON products
FOR SELECT
TO public
USING (true);

-- Keep existing policies for authenticated users
DROP POLICY IF EXISTS "Allow authenticated users to manage products" ON products;
CREATE POLICY "Allow authenticated users to manage products"
ON products
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

COMMENT ON COLUMN products.unit IS 'Unit of measurement (e.g., per kg, per dozen, per piece)';
COMMENT ON COLUMN products.origin IS 'Product origin: local or imported';
COMMENT ON COLUMN products.is_featured IS 'Whether product is featured on homepage';
COMMENT ON COLUMN products.is_available IS 'Whether product is available for purchase (synced with status)';
COMMENT ON COLUMN products.category_id IS 'Reference to categories table (optional)';
