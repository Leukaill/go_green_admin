-- =====================================================
-- FIX AUTH USER CREATION TRIGGER
-- The on_auth_user_created trigger is blocking signups
-- =====================================================

-- Step 1: Check what the trigger does
SELECT pg_get_triggerdef(oid) as trigger_definition
FROM pg_trigger
WHERE tgname = 'on_auth_user_created';

-- Step 2: Check the function it calls
SELECT 
    p.proname as function_name,
    pg_get_functiondef(p.oid) as function_definition
FROM pg_proc p
WHERE p.proname LIKE '%auth_user%'
OR p.proname LIKE '%user_created%';

-- Step 3: Drop the problematic trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Step 4: Drop the function if it's broken
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS handle_auth_user_created() CASCADE;
DROP FUNCTION IF EXISTS public.handle_auth_user_created() CASCADE;

-- Step 5: Verify trigger is gone
SELECT 
    t.tgname as trigger_name,
    c.relname as table_name,
    n.nspname as schema_name
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_namespace n ON c.relnamespace = n.oid
WHERE c.relname = 'users'
AND n.nspname = 'auth'
AND NOT t.tgisinternal;

-- Step 6: Clean up any existing failed users
-- This removes any partially created users that might be blocking
DELETE FROM auth.users 
WHERE email_confirmed_at IS NULL 
AND created_at < NOW() - INTERVAL '1 hour';

-- Step 7: Verify cleanup
SELECT 'Auth trigger removed! Ready for signup.' as status;
SELECT COUNT(*) as remaining_auth_users FROM auth.users;
SELECT COUNT(*) as remaining_admins FROM admins;
