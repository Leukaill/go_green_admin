# Setup Product Images Storage in Supabase

## Create Storage Bucket

1. Go to your **Supabase Dashboard**
2. Navigate to **Storage** in the left sidebar
3. Click **"New bucket"**
4. Configure the bucket:
   - **Name**: `product-images`
   - **Public bucket**: ✅ **Enable** (so images are publicly accessible)
   - **File size limit**: 5MB
   - **Allowed MIME types**: `image/*`
5. Click **"Create bucket"**

## Set Storage Policies (Optional - for more control)

If you want to restrict who can upload:

```sql
-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload product images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'product-images');

-- Allow everyone to read (public access)
CREATE POLICY "Public can read product images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'product-images');

-- Allow authenticated users to delete their uploads
CREATE POLICY "Authenticated users can delete product images"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'product-images');
```

## How It Works

1. **Admin uploads image** → File is selected from computer
2. **Image is optimized** → Resized to max 1200px width, compressed to 85% quality
3. **Uploaded to Supabase** → Stored in `product-images/products/` folder
4. **Public URL generated** → Automatically accessible on the web
5. **Saved to database** → URL stored in `products.image_url`

## Image Optimization Details

- **Max width**: 1200px (maintains aspect ratio)
- **Format**: JPEG
- **Quality**: 85%
- **Max file size**: 5MB (before optimization)
- **Responsive**: Works perfectly on mobile and desktop

## Benefits

✅ **Automatic optimization** - Images are compressed for fast loading
✅ **Responsive** - Works on all devices
✅ **CDN delivery** - Fast loading from Supabase CDN
✅ **No external services** - Everything in Supabase
✅ **Easy management** - View/delete images in Supabase dashboard

## Testing

1. Go to Products page
2. Click "Add Product"
3. Fill in product details
4. Click "Choose File" under Product Image
5. Select an image from your computer
6. See preview appear
7. Click "Add Product"
8. Image will be uploaded, optimized, and saved! 🎉

Done! Your product images are now stored securely and optimized automatically!
