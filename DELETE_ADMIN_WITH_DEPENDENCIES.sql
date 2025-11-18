-- =====================================================
-- DELETE ADMIN WITH ALL DEPENDENCIES
-- Handles foreign key constraints properly
-- =====================================================

-- Replace this with the admin's email you want to delete
-- ADMIN_EMAIL: 'admin@example.com'
-- ADMIN_ID: 'cece608e-fef2-4e07-bb76-79285c2c0144'

-- Step 1: Disable audit trigger temporarily
ALTER TABLE admins DISABLE TRIGGER IF EXISTS audit_admins_changes;
ALTER TABLE blog_posts DISABLE TRIGGER IF EXISTS audit_blog_posts_changes;

-- =====================================================
-- OPTION A: DELETE ALL BLOG POSTS BY THIS ADMIN
-- =====================================================

-- Delete blog posts created by this admin
DELETE FROM blog_posts 
WHERE created_by_id = 'cece608e-fef2-4e07-bb76-79285c2c0144';

-- =====================================================
-- OPTION B: REASSIGN BLOG POSTS TO ANOTHER ADMIN
-- (Comment out Option A and use this instead)
-- =====================================================

-- First, find another admin to reassign to:
-- SELECT id, email FROM admins WHERE id != 'cece608e-fef2-4e07-bb76-79285c2c0144' LIMIT 1;

-- Then reassign the blog posts (replace NEW_ADMIN_ID):
-- UPDATE blog_posts 
-- SET created_by_id = 'NEW_ADMIN_ID'
-- WHERE created_by_id = 'cece608e-fef2-4e07-bb76-79285c2c0144';

-- =====================================================
-- Step 2: Delete from admins table
-- =====================================================

DELETE FROM admins 
WHERE id = 'cece608e-fef2-4e07-bb76-79285c2c0144';

-- =====================================================
-- Step 3: Delete from auth.users
-- =====================================================

DELETE FROM auth.users 
WHERE id = 'cece608e-fef2-4e07-bb76-79285c2c0144';

-- =====================================================
-- Step 4: Re-enable triggers
-- =====================================================

ALTER TABLE admins ENABLE TRIGGER IF EXISTS audit_admins_changes;
ALTER TABLE blog_posts ENABLE TRIGGER IF EXISTS audit_blog_posts_changes;

-- =====================================================
-- Step 5: Verify deletion
-- =====================================================

-- Check admin is deleted
SELECT id, email FROM admins WHERE id = 'cece608e-fef2-4e07-bb76-79285c2c0144';

-- Check blog posts (should be empty or reassigned)
SELECT id, title, created_by_id FROM blog_posts WHERE created_by_id = 'cece608e-fef2-4e07-bb76-79285c2c0144';

-- Show remaining admins
SELECT id, email, created_at FROM admins ORDER BY created_at DESC;
