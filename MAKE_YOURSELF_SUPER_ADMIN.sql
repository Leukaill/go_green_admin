-- Make yourself a Super Admin
-- Run this in Supabase SQL Editor

-- Step 1: Find your auth user ID
-- Go to Authentication → Users in Supabase Dashboard
-- Copy your user ID (it looks like: 12345678-1234-1234-1234-123456789abc)

-- Step 2: Insert yourself as super admin
-- Replace 'YOUR_USER_ID_HERE' with your actual user ID
-- Replace 'YOUR_EMAIL_HERE' with your actual email
-- Replace 'YOUR_NAME_HERE' with your actual name

INSERT INTO admins (id, email, name, role, status)
VALUES (
  'YOUR_USER_ID_HERE',  -- Replace with your auth user ID
  'YOUR_EMAIL_HERE',     -- Replace with your email
  'YOUR_NAME_HERE',      -- Replace with your name
  'super_admin',
  'active'
)
ON CONFLICT (id) DO UPDATE
SET role = 'super_admin', status = 'active';

-- Done! Now log out and log back in, then try creating an admin again
