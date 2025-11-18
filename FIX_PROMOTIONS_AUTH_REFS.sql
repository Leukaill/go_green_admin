-- Fix promotions table to remove auth.users foreign key constraints
-- This fixes the "permission denied for table users" error

-- Drop the foreign key constraints
ALTER TABLE promotions 
DROP CONSTRAINT IF EXISTS promotions_created_by_id_fkey,
DROP CONSTRAINT IF EXISTS promotions_updated_by_id_fkey;

ALTER TABLE promotion_usage
DROP CONSTRAINT IF EXISTS promotion_usage_user_id_fkey;

-- The columns remain, just without foreign key constraints
-- This allows the system to work without auth.users permission issues

SELECT '✅ Foreign key constraints removed from promotions tables' as status;
