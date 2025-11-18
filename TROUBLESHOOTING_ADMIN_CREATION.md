# Troubleshooting: Admin Account Creation Error

## Error: "Database error creating new user"

This error occurs when trying to create a new admin account. Here are the most common causes and solutions:

---

## 🔍 Common Causes

### 1. **Missing Service Role Key**

**Symptom:** Error message about missing environment variable

**Solution:**
1. Check if you have `SUPABASE_SERVICE_ROLE_KEY` in your `.env.local` file
2. Get the service role key from Supabase Dashboard:
   - Go to your Supabase project
   - Settings → API
   - Copy the `service_role` key (NOT the anon key)
3. Add to `.env.local`:
   ```env
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
   ```
4. Restart the dev server: `npm run dev`

---

### 2. **Row Level Security (RLS) Policies**

**Symptom:** Error about permissions or "new row violates row-level security policy"

**Solution:**
The `admins` table needs proper RLS policies. Run this SQL in Supabase SQL Editor:

```sql
-- Allow service role to insert admins (bypass RLS)
-- This is safe because the service role key is only used server-side

-- First, enable RLS on admins table if not already enabled
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- Policy for service role to insert (used by API)
CREATE POLICY "Service role can insert admins"
ON admins
FOR INSERT
TO service_role
WITH CHECK (true);

-- Policy for service role to select (used by API)
CREATE POLICY "Service role can select admins"
ON admins
FOR SELECT
TO service_role
USING (true);

-- Policy for authenticated admins to view all admins
CREATE POLICY "Admins can view all admins"
ON admins
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM admins
    WHERE admins.id = auth.uid()
    AND admins.status = 'active'
  )
);

-- Policy for super admins to update admins
CREATE POLICY "Super admins can update admins"
ON admins
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM admins
    WHERE admins.id = auth.uid()
    AND admins.role = 'super_admin'
    AND admins.status = 'active'
  )
);

-- Policy for super admins to delete admins
CREATE POLICY "Super admins can delete admins"
ON admins
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM admins
    WHERE admins.id = auth.uid()
    AND admins.role = 'super_admin'
    AND admins.status = 'active'
  )
);
```

---

### 3. **Table Schema Mismatch**

**Symptom:** Error about missing columns or invalid data types

**Solution:**
Verify your `admins` table has these columns:

```sql
-- Check current schema
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'admins';

-- If table doesn't exist or is missing columns, create/update it:
CREATE TABLE IF NOT EXISTS admins (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('super_admin', 'admin', 'moderator')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'inactive')),
  phone TEXT,
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_admins_email ON admins(email);
CREATE INDEX IF NOT EXISTS idx_admins_role ON admins(role);
CREATE INDEX IF NOT EXISTS idx_admins_status ON admins(status);
```

---

### 4. **Authentication Issue**

**Symptom:** Error about "Unauthorized" or "Invalid authentication"

**Solution:**
1. Make sure you're logged in as a Super Admin
2. Check browser console for the full error
3. Try logging out and logging back in
4. Clear browser cache and cookies

---

### 5. **Duplicate Email**

**Symptom:** Error about "duplicate key value violates unique constraint"

**Solution:**
- The email address is already in use
- Try a different email address
- Or delete the existing admin with that email first

---

## 🧪 Testing the Fix

After applying the solutions above:

1. **Restart the dev server:**
   ```bash
   npm run dev
   ```

2. **Open browser console** (F12)

3. **Try creating an admin again**

4. **Check the console for detailed error messages:**
   - Look for "API Error Response:" in the console
   - This will show the exact database error

---

## 📋 Checklist

Before creating an admin, verify:

- [ ] `.env.local` has `SUPABASE_SERVICE_ROLE_KEY`
- [ ] Dev server has been restarted after adding env vars
- [ ] `admins` table exists in Supabase
- [ ] RLS policies are set up correctly
- [ ] You're logged in as a Super Admin
- [ ] Email address is not already in use
- [ ] Password is at least 8 characters

---

## 🔧 Debug Mode

To see more detailed errors:

1. **Check browser console** (F12 → Console tab)
2. **Check terminal** where `npm run dev` is running
3. **Look for these messages:**
   - "API Error Response:" - Shows the exact error from API
   - "Database insert error:" - Shows the database error details
   - "Error creating admin:" - Shows the frontend error

---

## 📞 Still Having Issues?

If you're still getting errors:

1. **Copy the full error message** from browser console
2. **Check Supabase logs:**
   - Go to Supabase Dashboard
   - Logs → API Logs
   - Look for failed requests
3. **Verify environment variables:**
   ```bash
   # In your terminal
   echo $SUPABASE_SERVICE_ROLE_KEY
   ```
4. **Check if service role key is correct:**
   - Should start with `eyJ...`
   - Should be different from anon key
   - Should be very long (hundreds of characters)

---

## ✅ Success Indicators

When it works correctly, you should see:

1. ✅ Toast notification: "Admin account created successfully!"
2. ✅ New admin appears in the table
3. ✅ No errors in console
4. ✅ New admin can log in with their credentials

---

## 🚀 Quick Fix Script

Run this in Supabase SQL Editor to set up everything:

```sql
-- 1. Ensure table exists with correct schema
CREATE TABLE IF NOT EXISTS admins (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('super_admin', 'admin', 'moderator')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'inactive')),
  phone TEXT,
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Enable RLS
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- 3. Drop existing policies (if any)
DROP POLICY IF EXISTS "Service role can insert admins" ON admins;
DROP POLICY IF EXISTS "Service role can select admins" ON admins;
DROP POLICY IF EXISTS "Admins can view all admins" ON admins;
DROP POLICY IF EXISTS "Super admins can update admins" ON admins;
DROP POLICY IF EXISTS "Super admins can delete admins" ON admins;

-- 4. Create new policies
CREATE POLICY "Service role can insert admins"
ON admins FOR INSERT TO service_role WITH CHECK (true);

CREATE POLICY "Service role can select admins"
ON admins FOR SELECT TO service_role USING (true);

CREATE POLICY "Admins can view all admins"
ON admins FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM admins
    WHERE admins.id = auth.uid()
    AND admins.status = 'active'
  )
);

CREATE POLICY "Super admins can update admins"
ON admins FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM admins
    WHERE admins.id = auth.uid()
    AND admins.role = 'super_admin'
    AND admins.status = 'active'
  )
);

CREATE POLICY "Super admins can delete admins"
ON admins FOR DELETE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM admins
    WHERE admins.id = auth.uid()
    AND admins.role = 'super_admin'
    AND admins.status = 'active'
  )
);

-- 5. Add indexes
CREATE INDEX IF NOT EXISTS idx_admins_email ON admins(email);
CREATE INDEX IF NOT EXISTS idx_admins_role ON admins(role);
CREATE INDEX IF NOT EXISTS idx_admins_status ON admins(status);
```

After running this, restart your dev server and try again! 🎉
