-- =============================================
-- DIAGNOSE DASHBOARD SHOWING 0 CUSTOMERS/HUB MEMBERS
-- =============================================
-- Run this to check why admin dashboard shows 0

-- 1. Check if customers table exists and has data
SELECT 'Customers Table Check' as test;
SELECT COUNT(*) as total_customers FROM customers;
SELECT * FROM customers LIMIT 5;

-- 2. Check if hub_accounts table exists and has data
SELECT 'Hub Accounts Table Check' as test;
SELECT COUNT(*) as total_hub_accounts FROM hub_accounts;
SELECT * FROM hub_accounts LIMIT 5;

-- 3. Check RLS policies on customers table
SELECT 'Customers RLS Policies' as test;
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'customers';

-- 4. Check RLS policies on hub_accounts table
SELECT 'Hub Accounts RLS Policies' as test;
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'hub_accounts';

-- 5. Check if RLS is enabled
SELECT 'RLS Status' as test;
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename IN ('customers', 'hub_accounts');

-- 6. Test query as authenticated user (what admin dashboard does)
SELECT 'Test Customer Query' as test;
SELECT COUNT(*) as customer_count FROM customers;

-- 7. Test hub members query (customers with loyalty points > 0)
SELECT 'Test Hub Members Query' as test;
SELECT COUNT(*) as hub_members_count 
FROM customers 
WHERE loyalty_points > 0;

-- 8. Check if there are any customers with loyalty points
SELECT 'Customers with Loyalty Points' as test;
SELECT id, email, name, loyalty_points 
FROM customers 
WHERE loyalty_points > 0
LIMIT 10;

-- 9. Show all customers (to see what data exists)
SELECT 'All Customers Data' as test;
SELECT id, email, name, phone, loyalty_points, created_at 
FROM customers 
ORDER BY created_at DESC
LIMIT 10;

-- 10. Check if admin user can access the data
SELECT 'Current User Info' as test;
SELECT 
  auth.uid() as current_user_id,
  auth.role() as current_role;

-- 11. Check if current user is in admins table
SELECT 'Is Current User an Admin?' as test;
SELECT * FROM admins WHERE id = auth.uid();

-- 12. Summary
SELECT '=== SUMMARY ===' as summary;
SELECT 
  (SELECT COUNT(*) FROM customers) as total_customers,
  (SELECT COUNT(*) FROM hub_accounts) as total_hub_accounts,
  (SELECT COUNT(*) FROM customers WHERE loyalty_points > 0) as hub_members,
  (SELECT COUNT(*) FROM admins) as total_admins;
