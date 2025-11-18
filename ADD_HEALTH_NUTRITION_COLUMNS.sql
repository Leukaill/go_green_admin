-- =============================================
-- ADD HEALTH BENEFITS AND NUTRITION FACTS TO PRODUCTS
-- =============================================

-- Add health_benefits column (array of text)
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS health_benefits TEXT[];

-- Add nutrition_facts column (array of JSON objects)
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS nutrition_facts JSONB;

-- Add comments for documentation
COMMENT ON COLUMN products.health_benefits IS 'Array of health benefit strings';
COMMENT ON COLUMN products.nutrition_facts IS 'Array of nutrition fact objects with label and value';

-- Verification
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'products'
  AND column_name IN ('health_benefits', 'nutrition_facts');

SELECT '✅ Health benefits column added (TEXT[])' as status;
SELECT '✅ Nutrition facts column added (JSONB)' as status;
SELECT '✅ Columns are ready to store product health information' as status;
