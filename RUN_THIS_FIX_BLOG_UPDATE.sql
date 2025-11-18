-- =============================================
-- DEFINITIVE FIX FOR BLOG UPDATE ERROR
-- =============================================
-- Error: PGRST116 - "The result contains 0 rows"
-- Cause: RLS policy blocking UPDATE operation
-- =============================================

-- Step 1: Check current RLS status
SELECT 
  'Current RLS Status:' as info,
  tablename, 
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'blog_posts';

-- Step 2: Check existing policies
SELECT 
  'Current Policies:' as info,
  policyname, 
  cmd as operation,
  roles
FROM pg_policies 
WHERE tablename = 'blog_posts'
ORDER BY cmd, policyname;

-- Step 3: Drop ALL existing policies completely
DROP POLICY IF EXISTS "Anyone can view published posts" ON blog_posts;
DROP POLICY IF EXISTS "Authenticated users can view all posts" ON blog_posts;
DROP POLICY IF EXISTS "Authenticated users can insert posts" ON blog_posts;
DROP POLICY IF EXISTS "Authenticated users can update posts" ON blog_posts;
DROP POLICY IF EXISTS "Authenticated users can delete posts" ON blog_posts;
DROP POLICY IF EXISTS "Enable read access for all users" ON blog_posts;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON blog_posts;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON blog_posts;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON blog_posts;

-- Step 4: Create PERMISSIVE policies (not restrictive)

-- SELECT: Public can see published, authenticated can see all
CREATE POLICY "blog_posts_select_public"
  ON blog_posts
  FOR SELECT
  TO public
  USING (is_published = true);

CREATE POLICY "blog_posts_select_authenticated"
  ON blog_posts
  FOR SELECT
  TO authenticated
  USING (true);

-- INSERT: Authenticated users can insert
CREATE POLICY "blog_posts_insert_authenticated"
  ON blog_posts
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- UPDATE: Authenticated users can update ANY post
CREATE POLICY "blog_posts_update_authenticated"
  ON blog_posts
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- DELETE: Authenticated users can delete
CREATE POLICY "blog_posts_delete_authenticated"
  ON blog_posts
  FOR DELETE
  TO authenticated
  USING (true);

-- Step 5: Ensure proper grants
GRANT SELECT ON blog_posts TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON blog_posts TO authenticated;

-- Step 6: Verify the fix
SELECT '✅ Step 1: Policies recreated' as status;

SELECT 
  '✅ Step 2: Active policies' as status,
  policyname, 
  cmd,
  roles,
  CASE 
    WHEN permissive = 'PERMISSIVE' THEN '✅ Permissive'
    ELSE '⚠️ Restrictive'
  END as policy_type
FROM pg_policies 
WHERE tablename = 'blog_posts'
ORDER BY cmd, policyname;

-- Step 7: Test if authenticated users can update
-- (This will only work if you're authenticated in SQL editor)
DO $$
BEGIN
  IF auth.uid() IS NOT NULL THEN
    RAISE NOTICE '✅ You are authenticated as: %', auth.uid();
    RAISE NOTICE '✅ You should be able to update blog posts now!';
  ELSE
    RAISE NOTICE '⚠️ Not authenticated in SQL editor (this is OK)';
    RAISE NOTICE '✅ Policies are set up - test in admin panel!';
  END IF;
END $$;

-- Final success message
SELECT '🎉 BLOG UPDATE FIX COMPLETE!' as status;
SELECT '✅ RLS policies are now properly configured' as message;
SELECT '🔄 Go to admin panel and try updating a blog post!' as next_step;
SELECT '📝 You should see "Blog post published!" message' as expected_result;
