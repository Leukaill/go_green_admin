-- =====================================================
-- CHECK ADMIN DEPENDENCIES BEFORE DELETION
-- Run this first to see what's blocking the deletion
-- =====================================================

-- Replace with the admin ID you want to delete
-- ADMIN_ID: 'cece608e-fef2-4e07-bb76-79285c2c0144'

-- Check admin info
SELECT 
  id,
  email,
  created_at,
  'Admin to delete' as note
FROM admins 
WHERE id = 'cece608e-fef2-4e07-bb76-79285c2c0144';

-- Check blog posts by this admin
SELECT 
  COUNT(*) as blog_posts_count,
  'Blog posts that will be affected' as note
FROM blog_posts 
WHERE created_by_id = 'cece608e-fef2-4e07-bb76-79285c2c0144';

-- List all blog posts by this admin
SELECT 
  id,
  title,
  status,
  created_at
FROM blog_posts 
WHERE created_by_id = 'cece608e-fef2-4e07-bb76-79285c2c0144'
ORDER BY created_at DESC;

-- Check if there are other admins to reassign to
SELECT 
  id,
  email,
  created_at,
  'Available admins for reassignment' as note
FROM admins 
WHERE id != 'cece608e-fef2-4e07-bb76-79285c2c0144'
ORDER BY created_at DESC;

-- Check orders (if any)
SELECT 
  COUNT(*) as orders_count,
  'Orders that might be affected' as note
FROM orders 
WHERE created_by IS NOT NULL 
  AND created_by::text = 'cece608e-fef2-4e07-bb76-79285c2c0144';

-- Check audit logs
SELECT 
  COUNT(*) as audit_logs_count,
  'Audit logs by this admin' as note
FROM audit_logs 
WHERE actor_id = 'cece608e-fef2-4e07-bb76-79285c2c0144';
