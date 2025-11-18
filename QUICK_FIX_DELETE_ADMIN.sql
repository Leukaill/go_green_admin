-- =====================================================
-- QUICK FIX: Delete Admin User
-- Temporarily disables trigger, deletes admin, re-enables trigger
-- =====================================================

-- Step 1: Disable the audit trigger temporarily
ALTER TABLE admins DISABLE TRIGGER audit_admins_changes;

-- Step 2: Delete the admin user (replace with actual email)
DELETE FROM admins WHERE email = 'admin@example.com';

-- Also delete from auth.users if needed
DELETE FROM auth.users WHERE email = 'admin@example.com';

-- Step 3: Re-enable the audit trigger
ALTER TABLE admins ENABLE TRIGGER audit_admins_changes;

-- Verify deletion
SELECT email, created_at FROM admins;
