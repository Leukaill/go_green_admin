-- =============================================
-- BLOG STORAGE BUCKETS SETUP
-- =============================================

-- 1. CREATE BLOG IMAGES BUCKET
INSERT INTO storage.buckets (id, name, public)
VALUES ('blog-images', 'blog-images', true)
ON CONFLICT (id) DO NOTHING;

-- 2. CREATE BLOG VIDEOS BUCKET (if needed)
INSERT INTO storage.buckets (id, name, public)
VALUES ('blog-videos', 'blog-videos', true)
ON CONFLICT (id) DO NOTHING;

-- 3. SET UP RLS POLICIES FOR BLOG IMAGES
-- Allow public to view blog images
CREATE POLICY "Public can view blog images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'blog-images');

-- Allow authenticated users to upload blog images
CREATE POLICY "Authenticated users can upload blog images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'blog-images');

-- Allow authenticated users to update their blog images
CREATE POLICY "Authenticated users can update blog images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'blog-images');

-- Allow authenticated users to delete blog images
CREATE POLICY "Authenticated users can delete blog images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'blog-images');

-- 4. SET UP RLS POLICIES FOR BLOG VIDEOS
-- Allow public to view blog videos
CREATE POLICY "Public can view blog videos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'blog-videos');

-- Allow authenticated users to upload blog videos
CREATE POLICY "Authenticated users can upload blog videos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'blog-videos');

-- Allow authenticated users to update their blog videos
CREATE POLICY "Authenticated users can update blog videos"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'blog-videos');

-- Allow authenticated users to delete blog videos
CREATE POLICY "Authenticated users can delete blog videos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'blog-videos');

-- 5. VERIFICATION
SELECT '✅ Storage bucket created: blog-images' as status
UNION ALL
SELECT '✅ Storage bucket created: blog-videos'
UNION ALL
SELECT '✅ RLS policies set up for blog storage'
UNION ALL
SELECT '✅ Blog storage ready for use!';

-- 6. TEST QUERY - Check if buckets exist
SELECT 
  id,
  name,
  public,
  created_at
FROM storage.buckets
WHERE id IN ('blog-images', 'blog-videos');
