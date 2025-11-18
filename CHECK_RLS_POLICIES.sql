-- =============================================
-- CHECK IF RLS POLICIES ARE CORRECT
-- =============================================
-- Run this to see if you need to run the fix
-- =============================================

-- Check 1: Is RLS enabled?
SELECT 
  '📋 Check 1: RLS Status' as check_name,
  CASE 
    WHEN rowsecurity THEN '✅ RLS is enabled'
    ELSE '❌ RLS is disabled'
  END as status
FROM pg_tables 
WHERE tablename = 'blog_posts';

-- Check 2: How many policies exist?
SELECT 
  '📋 Check 2: Policy Count' as check_name,
  COUNT(*)::text || ' policies found' as status,
  CASE 
    WHEN COUNT(*) >= 5 THEN '✅ Good'
    ELSE '⚠️ Missing policies'
  END as health
FROM pg_policies 
WHERE tablename = 'blog_posts';

-- Check 3: List all policies
SELECT 
  '📋 Check 3: Policy Details' as check_name,
  policyname as policy_name,
  cmd as operation,
  array_to_string(roles, ', ') as roles,
  CASE 
    WHEN permissive = 'PERMISSIVE' THEN '✅'
    ELSE '⚠️'
  END as type
FROM pg_policies 
WHERE tablename = 'blog_posts'
ORDER BY cmd, policyname;

-- Check 4: Is there an UPDATE policy for authenticated users?
SELECT 
  '📋 Check 4: UPDATE Policy' as check_name,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE tablename = 'blog_posts' 
      AND cmd = 'UPDATE' 
      AND 'authenticated' = ANY(roles)
    ) THEN '✅ UPDATE policy exists for authenticated users'
    ELSE '❌ NO UPDATE POLICY - RUN RUN_THIS_FIX_BLOG_UPDATE.sql!'
  END as status;

-- Check 5: Test if you can see the specific blog post
SELECT 
  '📋 Check 5: Can Read Post?' as check_name,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM blog_posts 
      WHERE id = '59c81891-043c-441c-8f8c-b41068baca21'
    ) THEN '✅ Post exists and you can read it'
    ELSE '⚠️ Cannot read post (might not be authenticated in SQL editor)'
  END as status;

-- Final recommendation
SELECT 
  '🎯 RECOMMENDATION' as heading,
  CASE 
    WHEN NOT EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE tablename = 'blog_posts' 
      AND cmd = 'UPDATE' 
      AND 'authenticated' = ANY(roles)
    ) THEN '❌ RUN RUN_THIS_FIX_BLOG_UPDATE.sql NOW!'
    ELSE '✅ Policies look good! If still failing, check authentication.'
  END as action;
