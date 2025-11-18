-- =====================================================
-- DELETE ADMIN WITH DEPENDENCIES (DROP BROKEN TRIGGERS)
-- =====================================================

-- Replace with your admin ID
-- ADMIN_ID: 'cece608e-fef2-4e07-bb76-79285c2c0144'

-- Step 1: Drop the broken audit triggers temporarily
DROP TRIGGER IF EXISTS audit_blog_posts_changes ON blog_posts;
DROP TRIGGER IF EXISTS audit_admins_changes ON admins;

-- Step 2: Delete blog posts by this admin FIRST (child records)
DELETE FROM blog_posts 
WHERE created_by_id = 'cece608e-fef2-4e07-bb76-79285c2c0144';

-- Step 3: Delete from admins table
DELETE FROM admins 
WHERE id = 'cece608e-fef2-4e07-bb76-79285c2c0144';

-- Step 4: Delete from auth.users
DELETE FROM auth.users 
WHERE id = 'cece608e-fef2-4e07-bb76-79285c2c0144';

-- Step 5: Verify deletion
SELECT 'Admin deleted successfully' as status;
SELECT COUNT(*) as remaining_admins FROM admins;
SELECT COUNT(*) as remaining_blog_posts FROM blog_posts;

-- Note: The audit triggers were dropped because they had errors.
-- You may want to recreate them properly later.
