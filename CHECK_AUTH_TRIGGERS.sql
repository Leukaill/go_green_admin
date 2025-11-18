-- =====================================================
-- CHECK AUTH.USERS TRIGGERS
-- Find what's blocking user creation
-- =====================================================

-- Step 1: Check all triggers on auth.users table
SELECT 
    t.tgname as trigger_name,
    pg_get_triggerdef(t.oid) as trigger_definition
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_namespace n ON c.relnamespace = n.oid
WHERE c.relname = 'users'
AND n.nspname = 'auth'
AND NOT t.tgisinternal
ORDER BY t.tgname;

-- Step 2: Check if there are any problematic functions
SELECT 
    p.proname as function_name,
    pg_get_functiondef(p.oid) as function_definition
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
AND p.proname LIKE '%audit%'
OR p.proname LIKE '%log%'
ORDER BY p.proname;

-- Step 3: Try to find the specific trigger causing issues
SELECT 
    t.tgname,
    c.relname as table_name,
    n.nspname as schema_name,
    CASE 
        WHEN t.tgenabled = 'O' THEN 'enabled'
        WHEN t.tgenabled = 'D' THEN 'disabled'
        ELSE 'other'
    END as status
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_namespace n ON c.relnamespace = n.oid
WHERE NOT t.tgisinternal
AND (
    c.relname = 'users' AND n.nspname = 'auth'
    OR c.relname = 'admins' AND n.nspname = 'public'
)
ORDER BY n.nspname, c.relname, t.tgname;
