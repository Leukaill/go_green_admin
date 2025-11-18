-- =====================================================
-- FIX ADMINS TABLE FOR SIGNUP
-- Ensures admins table is ready for new signups
-- =====================================================

-- Step 1: Check current state of admins table
SELECT 
    tablename,
    schemaname
FROM pg_tables 
WHERE tablename = 'admins';

-- Step 2: Check if admins table exists, if not create it
CREATE TABLE IF NOT EXISTS admins (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'admin',
    phone TEXT,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 3: Drop ALL triggers on admins table (including broken ones)
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

-- Step 4: Create a simple updated_at trigger (optional, but useful)
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

-- Step 5: Enable RLS
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- Step 6: Drop existing policies and create new ones
DROP POLICY IF EXISTS "Admins can view all admins" ON admins;
DROP POLICY IF EXISTS "Super admins can manage admins" ON admins;
DROP POLICY IF EXISTS "Service role can insert admins" ON admins;

-- Allow service role to insert (for signup)
CREATE POLICY "Service role can insert admins"
    ON admins
    FOR INSERT
    WITH CHECK (true);

-- Allow admins to view all admins
CREATE POLICY "Admins can view all admins"
    ON admins
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM admins
            WHERE admins.id = auth.uid()
        )
    );

-- Allow super admins to manage all admins
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

-- Step 7: Grant necessary permissions
GRANT ALL ON admins TO service_role;
GRANT SELECT, INSERT, UPDATE ON admins TO authenticated;

-- Step 8: Verify setup
SELECT 
    'Admins table is ready for signup!' as status,
    COUNT(*) as existing_admins,
    COUNT(*) FILTER (WHERE role = 'super_admin') as super_admins
FROM admins;

-- Step 9: Show remaining triggers
SELECT 
    t.tgname as trigger_name,
    'admins' as table_name
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
WHERE c.relname = 'admins'
AND NOT t.tgisinternal;
