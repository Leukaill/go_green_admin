-- ============================================
-- DIAGNOSE: Find ALL triggers causing the issue
-- ============================================

-- 1. Check ALL triggers on products table
SELECT 
    trigger_name,
    event_manipulation,
    action_timing,
    action_statement
FROM information_schema.triggers
WHERE event_object_table = 'products'
ORDER BY trigger_name;

-- 2. Check ALL functions that might reference products
SELECT 
    routine_name,
    routine_definition
FROM information_schema.routines
WHERE routine_definition LIKE '%order_number%'
  AND routine_type = 'FUNCTION'
ORDER BY routine_name;

-- 3. Check if there are any triggers on OTHER tables that might affect products
SELECT 
    event_object_table,
    trigger_name,
    action_statement
FROM information_schema.triggers
WHERE action_statement LIKE '%order_number%'
ORDER BY event_object_table, trigger_name;

-- 4. List ALL audit-related functions
SELECT 
    routine_name,
    routine_type
FROM information_schema.routines
WHERE routine_name LIKE '%audit%'
   OR routine_name LIKE '%log%'
ORDER BY routine_name;
