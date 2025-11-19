-- Add unit_type and unit_options columns to products table
-- Run this in Supabase SQL Editor

-- Add unit_type column
ALTER TABLE products
ADD COLUMN IF NOT EXISTS unit_type TEXT DEFAULT 'weight';

-- Add unit_options column (JSONB array of {quantity, price} objects)
ALTER TABLE products
ADD COLUMN IF NOT EXISTS unit_options JSONB DEFAULT '[]'::jsonb;

-- Add comment to explain the structure
COMMENT ON COLUMN products.unit_type IS 'Type of unit: weight, piece, bundle, or custom';
COMMENT ON COLUMN products.unit_options IS 'Array of {quantity: string, price: number} objects. Example: [{"quantity": "1kg", "price": 2500}, {"quantity": "2kg", "price": 4500}]';

-- Update existing products to have default unit options based on their current price
UPDATE products
SET unit_options = jsonb_build_array(
  jsonb_build_object(
    'quantity', CASE 
      WHEN unit LIKE '%kg%' THEN '1kg'
      WHEN unit LIKE '%piece%' THEN '1 piece'
      WHEN unit LIKE '%bundle%' THEN '1 bundle'
      ELSE '1 unit'
    END,
    'price', price
  )
)
WHERE unit_options = '[]'::jsonb OR unit_options IS NULL;

-- Verify the changes
SELECT id, name, unit, unit_type, unit_options 
FROM products 
LIMIT 5;
