# 🔧 Fix: Storage Bucket Not Found Error

## Problem
When creating a product with an image, you get:
```
StorageApiError: Bucket not found
```

## Root Cause
The `product-images` storage bucket doesn't exist in your Supabase project.

## Solution (1 Minute)

### Step 1: Create the Storage Bucket
1. Go to **Supabase Dashboard** → **SQL Editor**
2. Open file: `CREATE_PRODUCT_IMAGES_BUCKET.sql`
3. Copy ALL contents
4. Paste into SQL Editor
5. Click **RUN**

### Step 2: Verify
After running the script, you should see:
- ✅ Bucket created with name `product-images`
- ✅ Public access enabled (so images can be viewed)
- ✅ 5MB file size limit
- ✅ Allowed image types: JPEG, PNG, GIF, WebP
- ✅ RLS policies for admins to upload/update/delete

### Step 3: Test
1. Go to admin products page
2. Click "Add Product"
3. Fill in product details
4. Upload an image
5. Click "Add Product"
6. Image should upload successfully! ✅

## What the Script Does

### 1. Creates Storage Bucket
```sql
INSERT INTO storage.buckets (id, name, public, ...)
VALUES ('product-images', 'product-images', true, ...)
```

### 2. Sets File Limits
- **Max size:** 5MB per image
- **Allowed types:** JPEG, JPG, PNG, GIF, WebP

### 3. Creates RLS Policies
- **Public:** Can view images (so website can display them)
- **Authenticated:** Can upload, update, delete (admins only)

## Features

### Image Optimization
The admin panel automatically:
- Resizes images to max 1200px width
- Maintains aspect ratio
- Compresses to 85% quality
- Converts to JPEG format
- Uploads to Supabase Storage

### Security
- Only authenticated users (admins) can upload
- Public can only view (read-only)
- File size limited to 5MB
- Only image types allowed

## Alternative: Manual Creation

If you prefer to create the bucket manually:

1. Go to **Supabase Dashboard** → **Storage**
2. Click **New Bucket**
3. Name: `product-images`
4. Public: **Yes** (checked)
5. File size limit: `5242880` (5MB)
6. Allowed MIME types: `image/jpeg, image/jpg, image/png, image/gif, image/webp`
7. Click **Create**

Then add RLS policies:
1. Click on the bucket
2. Go to **Policies** tab
3. Add the policies from the SQL script

## Verification

### Check if bucket exists:
```sql
SELECT * FROM storage.buckets WHERE id = 'product-images';
```

### Check policies:
```sql
SELECT * FROM storage.policies WHERE bucket_id = 'product-images';
```

## Bonus: Stock Field Removed

As requested, the "Stock" field has been removed from:
- ✅ Add Product form
- ✅ Edit Product form
- ✅ Form validation
- ✅ Database inserts/updates (now defaults to 0)

Products are now created without requiring stock input!

---

**Quick Action:** Run `CREATE_PRODUCT_IMAGES_BUCKET.sql` in Supabase SQL Editor now!
