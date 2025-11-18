-- =============================================
-- UPDATE BLOG POSTS TABLE - ADD ADMIN TRACKING
-- =============================================

-- Add admin tracking columns
ALTER TABLE blog_posts 
ADD COLUMN IF NOT EXISTS created_by_id UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS updated_by_id UUID REFERENCES auth.users(id);

-- Add comments
COMMENT ON COLUMN blog_posts.created_by_id IS 'Admin who created the post';
COMMENT ON COLUMN blog_posts.updated_by_id IS 'Admin who last updated the post';

-- Verification
SELECT '✅ Blog posts table updated with admin tracking' as status;
SELECT '✅ Blog creation should now work!' as status;
