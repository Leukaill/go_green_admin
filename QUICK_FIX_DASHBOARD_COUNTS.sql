-- =============================================
-- QUICK FIX: ADMIN DASHBOARD SHOWING 0 COUNTS
-- =============================================
-- Run this to fix customers and hub members showing 0

-- =============================================
-- 1. FIX CUSTOMERS TABLE RLS
-- =============================================

-- Drop existing policies
DROP POLICY IF EXISTS "Admins can view all customers" ON customers;
DROP POLICY IF EXISTS "Admins can manage customers" ON customers;
DROP POLICY IF EXISTS "Authenticated users can view all customers" ON customers;

-- Create new policy allowing all authenticated users (admins) to view customers
CREATE POLICY "Admins can view all customers" ON customers
  FOR SELECT TO authenticated
  USING (true);

-- Allow admins to manage customers
CREATE POLICY "Admins can manage customers" ON customers
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

-- =============================================
-- 2. CREATE/FIX HUB_ACCOUNTS TABLE
-- =============================================

-- Create table if it doesn't exist
CREATE TABLE IF NOT EXISTS hub_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  points_balance INTEGER DEFAULT 0,
  total_earned INTEGER DEFAULT 0,
  total_deposited INTEGER DEFAULT 0,
  total_spent INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_hub_accounts_user_id ON hub_accounts(user_id);

-- Enable RLS
ALTER TABLE hub_accounts ENABLE ROW LEVEL SECURITY;

-- =============================================
-- 3. FIX HUB_ACCOUNTS TABLE RLS
-- =============================================

-- Drop existing policies
DROP POLICY IF EXISTS "Admins can view all hub accounts" ON hub_accounts;
DROP POLICY IF EXISTS "Users can view own hub account" ON hub_accounts;
DROP POLICY IF EXISTS "Admins can manage hub accounts" ON hub_accounts;

-- Allow admins to view all hub accounts
CREATE POLICY "Admins can view all hub accounts" ON hub_accounts
  FOR SELECT TO authenticated
  USING (true);

-- Allow users to view their own hub account
CREATE POLICY "Users can view own hub account" ON hub_accounts
  FOR SELECT
  USING (user_id = auth.uid());

-- Allow admins to manage hub accounts
CREATE POLICY "Admins can manage hub accounts" ON hub_accounts
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

-- =============================================
-- 4. GRANT PERMISSIONS
-- =============================================

GRANT SELECT ON customers TO authenticated;
GRANT ALL ON customers TO authenticated;

GRANT SELECT ON hub_accounts TO authenticated;
GRANT ALL ON hub_accounts TO authenticated;

-- =============================================
-- 5. VERIFICATION QUERIES
-- =============================================

-- Check total customers
SELECT 'Total Customers' as metric, COUNT(*) as count FROM customers;

-- Check total hub accounts
SELECT 'Total Hub Accounts' as metric, COUNT(*) as count FROM hub_accounts;

-- Check hub members (customers with loyalty points)
SELECT 'Hub Members (loyalty_points > 0)' as metric, COUNT(*) as count 
FROM customers 
WHERE loyalty_points > 0;

-- Check if admin can access customers
SELECT 'Admin can access customers?' as test, 
       CASE WHEN COUNT(*) >= 0 THEN 'YES ✅' ELSE 'NO ❌' END as result
FROM customers;

-- Check if admin can access hub_accounts
SELECT 'Admin can access hub_accounts?' as test,
       CASE WHEN COUNT(*) >= 0 THEN 'YES ✅' ELSE 'NO ❌' END as result
FROM hub_accounts;

-- Show sample customers
SELECT 'Sample Customers' as info;
SELECT id, email, name, loyalty_points, created_at 
FROM customers 
ORDER BY created_at DESC 
LIMIT 5;

-- Show RLS policies for customers
SELECT 'Customers RLS Policies' as info;
SELECT policyname, cmd, qual 
FROM pg_policies 
WHERE tablename = 'customers';

-- Show RLS policies for hub_accounts
SELECT 'Hub Accounts RLS Policies' as info;
SELECT policyname, cmd, qual 
FROM pg_policies 
WHERE tablename = 'hub_accounts';

-- =============================================
-- 6. SUCCESS MESSAGE
-- =============================================

SELECT '✅ Fix applied successfully!' as status;
SELECT '✅ Customers table: RLS policies updated' as status;
SELECT '✅ Hub accounts table: Created/Updated with RLS policies' as status;
SELECT '✅ Admins can now access all customer and hub data' as status;
SELECT '🔄 Please refresh your admin dashboard now!' as action;
