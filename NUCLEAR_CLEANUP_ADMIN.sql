-- =====================================================
-- NUCLEAR CLEANUP - REMOVE ALL BLOCKING TRIGGERS
-- This removes ALL custom triggers that might block signup
-- =====================================================

-- WARNING: This is aggressive. It removes all audit/log triggers.
-- Only run this if you're okay with losing audit functionality.

-- Step 1: Drop ALL audit-related functions (which will drop their triggers)
DROP FUNCTION IF EXISTS log_database_change() CASCADE;
DROP FUNCTION IF EXISTS log_audit_trail() CASCADE;
DROP FUNCTION IF EXISTS audit_trigger_func() CASCADE;
DROP FUNCTION IF EXISTS log_admin_audit() CASCADE;
DROP FUNCTION IF EXISTS update_whatsapp_settings_updated_at() CASCADE;

-- Step 2: Drop any remaining triggers on admins table
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
        EXECUTE 'DROP TRIGGER IF EXISTS ' || trigger_record.tgname || ' ON admins CASCADE';
        RAISE NOTICE 'Dropped trigger: %', trigger_record.tgname;
    END LOOP;
END $$;

-- Step 3: Drop any remaining triggers on blog_posts table
DO $$ 
DECLARE
    trigger_record RECORD;
BEGIN
    FOR trigger_record IN 
        SELECT tgname 
        FROM pg_trigger 
        WHERE tgrelid = 'blog_posts'::regclass
        AND NOT tgisinternal
    LOOP
        EXECUTE 'DROP TRIGGER IF EXISTS ' || trigger_record.tgname || ' ON blog_posts CASCADE';
        RAISE NOTICE 'Dropped trigger: %', trigger_record.tgname;
    END LOOP;
END $$;

-- Step 4: Clean up admins table completely
DELETE FROM admins;

-- Step 5: Clean up auth.users (be careful - this deletes ALL users)
-- Comment out if you want to keep some users
DELETE FROM auth.users;

-- Alternative: Delete only admin users
-- DELETE FROM auth.users 
-- WHERE raw_user_meta_data->>'role' IN ('admin', 'super_admin');

-- Step 6: Recreate admins table fresh
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

-- Step 7: Create ONLY the updated_at trigger (safe and simple)
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

-- Step 8: Enable RLS
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- Step 9: Drop all existing policies
DROP POLICY IF EXISTS "Service role can insert admins" ON admins;
DROP POLICY IF EXISTS "Admins can view all admins" ON admins;
DROP POLICY IF EXISTS "Super admins can manage admins" ON admins;
DROP POLICY IF EXISTS "Anyone can view active whatsapp settings" ON whatsapp_settings;
DROP POLICY IF EXISTS "Admins can manage whatsapp settings" ON whatsapp_settings;

-- Step 10: Create fresh RLS policies for admins
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

-- Step 11: Recreate WhatsApp settings policies (if table exists)
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'whatsapp_settings') THEN
        EXECUTE 'CREATE POLICY "Anyone can view active whatsapp settings"
            ON whatsapp_settings
            FOR SELECT
            USING (is_active = true)';
        
        EXECUTE 'CREATE POLICY "Admins can manage whatsapp settings"
            ON whatsapp_settings
            FOR ALL
            USING (
                EXISTS (
                    SELECT 1 FROM admins
                    WHERE admins.id = auth.uid()
                )
            )';
    END IF;
END $$;

-- Step 12: Grant permissions
GRANT ALL ON admins TO service_role;
GRANT SELECT, INSERT, UPDATE ON admins TO authenticated;

-- Step 13: Verify everything is clean
SELECT 'Nuclear cleanup complete! System is ready for fresh signup.' as status;

SELECT 
    'Remaining admins' as check_type,
    COUNT(*) as count
FROM admins
UNION ALL
SELECT 
    'Remaining auth users' as check_type,
    COUNT(*) as count
FROM auth.users
UNION ALL
SELECT 
    'Triggers on admins' as check_type,
    COUNT(*) as count
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
WHERE c.relname = 'admins'
AND NOT t.tgisinternal;

-- Step 14: List any remaining custom functions
SELECT 
    'Remaining audit functions:' as info,
    p.proname as function_name
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
AND (p.proname LIKE '%audit%' OR p.proname LIKE '%log%');
