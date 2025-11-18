-- =============================================
-- DEBUG: Why is UPDATE returning 0 rows?
-- =============================================

-- Check 1: Does the blog post exist?
SELECT 
  '🔍 Check 1: Post Exists?' as check_name,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM blog_posts 
      WHERE id = '59c81891-043c-441c-8f8c-b41068baca21'
    ) THEN '✅ Post exists in database'
    ELSE '❌ Post NOT found in database'
  END as result;

-- Check 2: Can we see the post details?
SELECT 
  '🔍 Check 2: Post Details' as check_name,
  id,
  title,
  is_published,
  created_by_id,
  updated_by_id
FROM blog_posts 
WHERE id = '59c81891-043c-441c-8f8c-b41068baca21';

-- Check 3: What's your current user ID in SQL editor?
SELECT 
  '🔍 Check 3: Your User ID' as check_name,
  auth.uid() as your_user_id,
  CASE 
    WHEN auth.uid() IS NULL THEN '⚠️ Not authenticated in SQL editor'
    ELSE '✅ Authenticated'
  END as status;

-- Check 4: Test UPDATE with same conditions
-- This simulates what the code is doing
DO $$
DECLARE
  updated_count INTEGER;
BEGIN
  -- Try to update the post
  UPDATE blog_posts 
  SET title = title  -- No actual change, just testing
  WHERE id = '59c81891-043c-441c-8f8c-b41068baca21';
  
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  
  RAISE NOTICE '🔍 Check 4: UPDATE Test';
  RAISE NOTICE 'Rows updated: %', updated_count;
  
  IF updated_count = 0 THEN
    RAISE NOTICE '❌ UPDATE returned 0 rows - RLS is blocking!';
  ELSE
    RAISE NOTICE '✅ UPDATE worked - % row(s) updated', updated_count;
  END IF;
END $$;

-- Check 5: Check UPDATE policy details
SELECT 
  '🔍 Check 5: UPDATE Policy Details' as check_name,
  policyname,
  qual as using_clause,
  with_check as with_check_clause
FROM pg_policies 
WHERE tablename = 'blog_posts' 
AND cmd = 'UPDATE';

-- Check 6: Try to see if there's a restrictive policy
SELECT 
  '🔍 Check 6: Policy Type' as check_name,
  policyname,
  CASE 
    WHEN permissive = 'PERMISSIVE' THEN '✅ Permissive (allows access)'
    ELSE '⚠️ Restrictive (blocks access)'
  END as policy_type,
  cmd
FROM pg_policies 
WHERE tablename = 'blog_posts';

-- SOLUTION: Drop and recreate UPDATE policy with explicit permissions
DO $$
BEGIN
  RAISE NOTICE '🔧 Applying fix...';
  
  -- Drop existing UPDATE policies
  DROP POLICY IF EXISTS "blog_posts_update_authenticated" ON blog_posts;
  DROP POLICY IF EXISTS "Authenticated users can update posts" ON blog_posts;
  DROP POLICY IF EXISTS "Enable update for authenticated users only" ON blog_posts;
  
  -- Create new permissive UPDATE policy
  CREATE POLICY "blog_posts_update_authenticated"
    ON blog_posts
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);
  
  RAISE NOTICE '✅ UPDATE policy recreated';
  
  -- Grant explicit permissions
  GRANT UPDATE ON blog_posts TO authenticated;
  
  RAISE NOTICE '✅ Permissions granted';
  RAISE NOTICE '🎉 Fix applied! Try updating in admin panel now.';
END $$;

-- Verify the fix
SELECT 
  '✅ Verification' as status,
  policyname,
  cmd,
  roles
FROM pg_policies 
WHERE tablename = 'blog_posts' 
AND cmd = 'UPDATE';
