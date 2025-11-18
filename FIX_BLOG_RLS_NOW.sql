-- =============================================
-- FIX BLOG RLS POLICIES - RUN THIS NOW!
-- =============================================
-- This fixes the "Blog post not found" error when updating posts
-- =============================================

-- 1. Enable RLS (if not already enabled)
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing policies to start fresh
DROP POLICY IF EXISTS "Anyone can view published posts" ON blog_posts;
DROP POLICY IF EXISTS "Authenticated users can view all posts" ON blog_posts;
DROP POLICY IF EXISTS "Authenticated users can insert posts" ON blog_posts;
DROP POLICY IF EXISTS "Authenticated users can update posts" ON blog_posts;
DROP POLICY IF EXISTS "Authenticated users can delete posts" ON blog_posts;

-- 3. Create new policies that work for admins

-- Allow public to view published posts
CREATE POLICY "Anyone can view published posts"
  ON blog_posts FOR SELECT
  TO public
  USING (is_published = true);

-- Allow authenticated users (admins) to view ALL posts
CREATE POLICY "Authenticated users can view all posts"
  ON blog_posts FOR SELECT
  TO authenticated
  USING (true);

-- Allow authenticated users (admins) to insert posts
CREATE POLICY "Authenticated users can insert posts"
  ON blog_posts FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow authenticated users (admins) to update ANY post
CREATE POLICY "Authenticated users can update posts"
  ON blog_posts FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Allow authenticated users (admins) to delete posts
CREATE POLICY "Authenticated users can delete posts"
  ON blog_posts FOR DELETE
  TO authenticated
  USING (true);

-- 4. Grant permissions
GRANT SELECT ON blog_posts TO anon;
GRANT ALL ON blog_posts TO authenticated;

-- 5. Verify policies are active
SELECT 
  '✅ Policy: ' || policyname as status,
  'Command: ' || cmd as command,
  'Roles: ' || array_to_string(roles, ', ') as roles
FROM pg_policies 
WHERE tablename = 'blog_posts'
ORDER BY policyname;

-- 6. Success message
SELECT '🎉 Blog RLS policies fixed!' as status;
SELECT '✅ Admins can now update and publish blog posts!' as message;
SELECT '🔄 Refresh your admin page and try again!' as next_step;
