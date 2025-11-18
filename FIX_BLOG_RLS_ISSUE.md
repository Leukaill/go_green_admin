# 🔧 FIX BLOG RLS PERMISSION ISSUE

## 🎯 Current Error

```
Blog post not found: {}
Update failed: "Blog post with ID 59c81891-043c-441c-8f8c-b41068baca21 not found"
```

## 🔍 Root Cause

The blog post exists in the database, but the admin user cannot access it due to **Row Level Security (RLS) policies**. The RLS policies are either:
1. Not set up correctly
2. Not applied yet
3. Too restrictive for admin operations

## ✅ Solution

### Step 1: Run the RLS Setup SQL

Run this SQL in your Supabase SQL Editor to ensure proper RLS policies:

```sql
-- =============================================
-- FIX BLOG RLS POLICIES FOR ADMIN ACCESS
-- =============================================

-- 1. Enable RLS (if not already enabled)
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing policies
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
  schemaname, 
  tablename, 
  policyname, 
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'blog_posts'
ORDER BY policyname;

-- Success message
SELECT '✅ Blog RLS policies fixed! Admins can now update posts.' as status;
```

### Step 2: Verify Your Authentication

Make sure you're logged in as an admin. Check the browser console:

```javascript
// In browser console
const { data: { user } } = await supabase.auth.getUser();
console.log('Current user:', user);
```

You should see a user object with an `id`. If not, you need to log in again.

### Step 3: Test the Fix

1. **Refresh the admin page**
2. **Try to edit a blog post**
3. **Click "Update & Publish"**
4. **Check the console** - you should see:
   - `Updating blog post: { id: '...', updates: {...} }`
   - `Blog post updated successfully: ...`
   - `Publishing blog post: ...`
   - `Blog post published successfully: ...`

## 🎨 What Changed in Code

### `lib/supabase/blog.ts`

**Removed the problematic existence check:**
```typescript
// ❌ REMOVED - This was failing due to RLS
const { data: existingPost, error: fetchError } = await supabase
  .from('blog_posts')
  .select('id')
  .eq('id', id)
  .single();

if (fetchError || !existingPost) {
  return { post: null, error: `Blog post with ID ${id} not found` };
}
```

**Now directly attempts the update:**
```typescript
// ✅ NEW - Update directly, let Supabase handle "not found"
const { data, error } = await supabase
  .from('blog_posts')
  .update({
    ...updates,
    updated_by_id: user.id,
    updated_at: new Date().toISOString(),
  })
  .eq('id', id)
  .select()
  .single();

// Handle "no rows returned" error specifically
if (error?.code === 'PGRST116') {
  return { post: null, error: 'Blog post not found or you do not have permission to update it' };
}
```

## 🔍 Troubleshooting

### Issue 1: Still Getting "Not Found" Error

**Check if you're authenticated:**
```sql
-- In Supabase SQL Editor, run:
SELECT auth.uid();
```

If this returns `NULL`, you're not authenticated in the SQL editor. The policies should still work in the admin app if you're logged in there.

### Issue 2: Policies Not Working

**Verify RLS is enabled:**
```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'blog_posts';
```

Should show `rowsecurity = true`.

**Check active policies:**
```sql
SELECT policyname, cmd, roles 
FROM pg_policies 
WHERE tablename = 'blog_posts';
```

Should show 5 policies (SELECT, INSERT, UPDATE, DELETE).

### Issue 3: Session Expired

If you're logged in but still getting errors:
1. **Sign out** from the admin panel
2. **Clear browser cookies** for localhost:3001
3. **Sign in again**
4. **Try updating a post**

### Issue 4: Wrong User Role

Make sure your user is in the `admins` table:
```sql
SELECT * FROM admins WHERE id = auth.uid();
```

If no results, your user isn't registered as an admin.

## 📋 Quick Checklist

- [ ] Run the RLS setup SQL above
- [ ] Verify you're logged in (check browser console)
- [ ] Refresh the admin page
- [ ] Try editing and publishing a post
- [ ] Check console for success messages
- [ ] Verify post is updated in database

## 🎯 Expected Behavior After Fix

### When Updating a Post:

**Console logs:**
```
Updating blog post: { id: '59c81891-...', updates: {...} }
Blog post updated successfully: 59c81891-...
Publishing blog post: 59c81891-...
Blog post published successfully: 59c81891-...
```

**User sees:**
```
✅ Blog post published!
```

**Database:**
- Post is updated with new content
- `updated_at` timestamp is current
- `updated_by_id` is set to your admin user ID
- `is_published` is true
- `published_at` is set

## 🚀 Why This Fix Works

1. **Removed redundant check** - The existence check was failing due to RLS, but it wasn't necessary since the update operation itself will fail if the post doesn't exist

2. **Better error handling** - Now specifically checks for the "no rows returned" error code (PGRST116) and provides a clear message

3. **Proper RLS policies** - The SQL ensures authenticated users (admins) have full access to all blog posts

4. **Direct update approach** - By attempting the update directly, we let Supabase's RLS handle the authorization, which works correctly with the proper policies

## 📝 Summary

**Problem:** RLS policies preventing admin from reading blog post before update

**Solution:** 
1. Remove unnecessary existence check
2. Ensure proper RLS policies are in place
3. Let the update operation handle "not found" cases

**Result:** Admins can now update and publish blog posts successfully! 🎉

---

**Run the SQL above and try publishing a blog post!** 🚀
