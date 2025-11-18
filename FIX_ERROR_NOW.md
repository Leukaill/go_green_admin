# Fix "Error fetching featured products" - URGENT

## The Problem
Your main website is trying to fetch products with columns (`is_featured`, `is_available`, `unit`, `origin`) that don't exist in your database yet.

## The Solution - 3 Steps

### Step 1: Check Current State (Optional)
1. Go to **Supabase Dashboard** → **SQL Editor**
2. Open `CHECK_PRODUCTS_TABLE.sql`
3. Run it to see what columns you currently have

### Step 2: Fix the Database (REQUIRED)
1. Go to **Supabase Dashboard** → **SQL Editor**
2. Open `RUN_THIS_IN_SUPABASE_NOW.sql`
3. **Click "Run"**
4. Wait for success message
5. You should see a table showing all columns at the end

### Step 3: Verify It Works
1. Refresh your **main website**
2. The error should be gone! ✅

## What the Script Does

✅ Adds missing columns:
- `unit` (e.g., "per kg")
- `origin` ("local" or "imported")
- `is_featured` (true/false)
- `is_available` (true/false)
- `category_id` (optional)

✅ Sets default values for existing products

✅ Creates indexes for better performance

✅ Enables public read access (so website can fetch products)

✅ Keeps admin write access

## After Running the Script

Your products table will have this structure:

```
id              | uuid
name            | text
description     | text
price           | numeric
stock           | integer
category        | text (will be 'fruits' or 'vegetables')
unit            | text (NEW!)
origin          | text (NEW!)
image_url       | text
is_featured     | boolean (NEW!)
is_available    | boolean (NEW!)
category_id     | uuid (NEW!)
created_at      | timestamp
updated_at      | timestamp
```

## Troubleshooting

### If you still get errors after running the script:

1. **Clear browser cache** and refresh
2. **Check Supabase logs** in Dashboard → Logs
3. **Verify RLS is enabled** on products table
4. **Check if script ran successfully** - you should see output at the end

### If script fails:

- Make sure you're using the **SQL Editor** in Supabase Dashboard
- Make sure you have **admin access** to the database
- Check for any error messages and share them

## Quick Test

After running the script, test in Supabase SQL Editor:

```sql
-- This should return products without error
SELECT * FROM products WHERE is_featured = true LIMIT 5;

-- This should work from the website (public access)
SELECT id, name, price, category, is_featured, is_available 
FROM products 
WHERE is_available = true;
```

## Done! 🎉

Once the script runs successfully:
- ✅ Main website will load products
- ✅ Admin panel will work with full schema
- ✅ All 3 portals will be in harmony
