-- =====================================================
-- CLEANUP AND RESET ADMIN SYSTEM
-- Complete cleanup to allow fresh super admin signup
-- =====================================================

-- Step 1: Drop ALL triggers on admins table
DO $$ 
DECLARE
    trigger_record RECORD;
BEGIN
    FOR trigger_record IN 
        SELECT tgname 
        FROM pg_trigger 
        WHERE tgrelid = 'admins'::regclass
        AND NOT tgisinternal
    LOOP
        EXECUTE 'DROP TRIGGER IF EXISTS ' || trigger_record.tgname || ' ON admins';
        RAISE NOTICE 'Dropped trigger: %', trigger_record.tgname;
    END LOOP;
END $$;

-- Step 2: Delete ALL existing admins (careful!)
-- This will allow you to create a fresh super admin
DELETE FROM admins;

-- Step 3: Delete corresponding auth users
-- WARNING: This deletes ALL admin users from auth.users
-- Only run this if you want to start completely fresh
DELETE FROM auth.users 
WHERE id IN (
    SELECT id FROM auth.users 
    WHERE email LIKE '%admin%' 
    OR raw_user_meta_data->>'role' = 'super_admin'
    OR raw_user_meta_data->>'role' = 'admin'
);

-- Alternative: Delete specific user by email
-- DELETE FROM auth.users WHERE email = 'your-email@example.com';

-- Step 4: Recreate admins table with clean structure
DROP TABLE IF EXISTS admins CASCADE;

CREATE TABLE admins (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'admin',
    phone TEXT,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 5: Create simple updated_at trigger
CREATE OR REPLACE FUNCTION update_admins_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER admins_updated_at
    BEFORE UPDATE ON admins
    FOR EACH ROW
    EXECUTE FUNCTION update_admins_updated_at();

-- Step 6: Enable RLS
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- Step 7: Create RLS policies
CREATE POLICY "Service role can insert admins"
    ON admins
    FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Admins can view all admins"
    ON admins
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM admins
            WHERE admins.id = auth.uid()
        )
    );

CREATE POLICY "Super admins can manage admins"
    ON admins
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM admins
            WHERE admins.id = auth.uid()
            AND admins.role = 'super_admin'
        )
    );

-- Step 8: Grant permissions
GRANT ALL ON admins TO service_role;
GRANT SELECT, INSERT, UPDATE ON admins TO authenticated;

-- Step 9: Verify cleanup
SELECT 'Cleanup complete! Ready for fresh signup.' as status;
SELECT COUNT(*) as remaining_admins FROM admins;
SELECT COUNT(*) as remaining_auth_users FROM auth.users;

-- Step 10: Show what's ready
SELECT 
    'admins' as table_name,
    COUNT(*) as trigger_count
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
WHERE c.relname = 'admins'
AND NOT t.tgisinternal;
