-- =====================================================
-- DELETE ADMIN - DROP ALL AUDIT TRIGGERS FIRST
-- =====================================================

-- Replace with your admin ID
-- ADMIN_ID: 'cece608e-fef2-4e07-bb76-79285c2c0144'

-- Step 1: Find and drop ALL audit triggers on blog_posts
DO $$ 
DECLARE
    trigger_record RECORD;
BEGIN
    FOR trigger_record IN 
        SELECT tgname 
        FROM pg_trigger 
        WHERE tgrelid = 'blog_posts'::regclass 
        AND tgname LIKE '%audit%'
    LOOP
        EXECUTE 'DROP TRIGGER IF EXISTS ' || trigger_record.tgname || ' ON blog_posts';
        RAISE NOTICE 'Dropped trigger: %', trigger_record.tgname;
    END LOOP;
END $$;

-- Step 2: Find and drop ALL audit triggers on admins
DO $$ 
DECLARE
    trigger_record RECORD;
BEGIN
    FOR trigger_record IN 
        SELECT tgname 
        FROM pg_trigger 
        WHERE tgrelid = 'admins'::regclass 
        AND tgname LIKE '%audit%'
    LOOP
        EXECUTE 'DROP TRIGGER IF EXISTS ' || trigger_record.tgname || ' ON admins';
        RAISE NOTICE 'Dropped trigger: %', trigger_record.tgname;
    END LOOP;
END $$;

-- Step 3: Also drop specific known triggers
DROP TRIGGER IF EXISTS audit_blog_posts_changes ON blog_posts;
DROP TRIGGER IF EXISTS audit_admins_changes ON admins;
DROP TRIGGER IF EXISTS log_blog_posts_changes ON blog_posts;
DROP TRIGGER IF EXISTS log_admins_changes ON admins;
DROP TRIGGER IF EXISTS audit_trail_trigger ON blog_posts;
DROP TRIGGER IF EXISTS audit_trail_trigger ON admins;

-- Step 4: Delete blog posts by this admin FIRST
DELETE FROM blog_posts 
WHERE created_by_id = 'cece608e-fef2-4e07-bb76-79285c2c0144';

-- Step 5: Delete from admins table
DELETE FROM admins 
WHERE id = 'cece608e-fef2-4e07-bb76-79285c2c0144';

-- Step 6: Delete from auth.users
DELETE FROM auth.users 
WHERE id = 'cece608e-fef2-4e07-bb76-79285c2c0144';

-- Step 7: Verify deletion
SELECT 'Admin deleted successfully!' as status;
SELECT COUNT(*) as remaining_admins FROM admins;
SELECT COUNT(*) as remaining_blog_posts FROM blog_posts;

-- Step 8: Show what triggers remain
SELECT 
    n.nspname as schema_name,
    c.relname as table_name,
    t.tgname as trigger_name
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_namespace n ON c.relnamespace = n.oid
WHERE c.relname IN ('blog_posts', 'admins')
AND n.nspname = 'public'
AND NOT t.tgisinternal;
