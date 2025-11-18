-- ============================================
-- RUN THIS IN SUPABASE SQL EDITOR NOW
-- ============================================
-- This will fix the products table for all 3 portals

-- Step 1: Add missing columns
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS unit TEXT DEFAULT 'per kg',
ADD COLUMN IF NOT EXISTS origin TEXT DEFAULT 'local',
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS is_available BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS category_id UUID;

-- Step 2: Update category column to ensure it has valid values
-- First, let's see what we have and set defaults
UPDATE products 
SET category = 'vegetables' 
WHERE category IS NULL OR category = '';

-- Step 3: Update existing products with default values
UPDATE products 
SET 
  unit = COALESCE(unit, 'per kg'),
  origin = COALESCE(origin, 'local'),
  is_featured = COALESCE(is_featured, false),
  is_available = COALESCE(is_available, true);

-- Step 4: If there's a status column, sync is_available with it
-- This will not error if status column doesn't exist
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' AND column_name = 'status'
  ) THEN
    UPDATE products 
    SET is_available = CASE 
      WHEN status = 'active' THEN true 
      ELSE false 
    END;
  END IF;
END $$;

-- Step 5: Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_is_featured ON products(is_featured);
CREATE INDEX IF NOT EXISTS idx_products_is_available ON products(is_available);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_origin ON products(origin);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);

-- Step 6: Update RLS policies to allow public read access
DROP POLICY IF EXISTS "Allow public read access to products" ON products;
CREATE POLICY "Allow public read access to products"
ON products
FOR SELECT
TO public
USING (true);

-- Step 7: Keep/create policy for authenticated users
DROP POLICY IF EXISTS "Allow authenticated users to manage products" ON products;
CREATE POLICY "Allow authenticated users to manage products"
ON products
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Step 8: Verify the changes
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'products'
ORDER BY ordinal_position;

-- Done! Now check if you have any products
SELECT COUNT(*) as total_products FROM products;
SELECT COUNT(*) as featured_products FROM products WHERE is_featured = true;
SELECT COUNT(*) as available_products FROM products WHERE is_available = true;
