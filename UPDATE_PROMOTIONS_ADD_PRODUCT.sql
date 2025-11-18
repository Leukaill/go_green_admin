-- Add product_id field to promotions table for direct product linking
-- This allows promotions to link directly to a specific product

-- Add product_id column (single product link)
ALTER TABLE promotions 
ADD COLUMN IF NOT EXISTS product_id UUID REFERENCES products(id) ON DELETE SET NULL;

-- Create index for product_id
CREATE INDEX IF NOT EXISTS idx_promotions_product ON promotions(product_id) WHERE product_id IS NOT NULL;

-- Update the applicable_product_ids to be more flexible
COMMENT ON COLUMN promotions.applicable_product_ids IS 'Array of product IDs this promotion applies to (for discount calculation)';
COMMENT ON COLUMN promotions.product_id IS 'Single product ID to link banner to (for navigation)';

SELECT '✅ Product linking added to promotions table' as status;
