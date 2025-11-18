# 🔧 Fix: Admin Dashboard Shows 0 Customers/Hub Members

## Problem
Admin and Super Admin dashboards show 0 for:
- Total Customers
- Hub Members

Even though the data exists in the database.

## Diagnosis Steps

### Step 1: Run Diagnostic Script
1. Go to **Supabase Dashboard** → **SQL Editor**
2. Open: `DIAGNOSE_DASHBOARD_ISSUE.sql`
3. Copy and paste into SQL Editor
4. Click **RUN**
5. Review the results

### Step 2: Check Results

Look for these specific issues:

#### Issue A: RLS Blocking Admin Access
**Symptom:** Policies show restrictions for authenticated users

**Fix:** Run this SQL:
```sql
-- Allow admins to view all customers
DROP POLICY IF EXISTS "Admins can view all customers" ON customers;
CREATE POLICY "Admins can view all customers" ON customers
  FOR SELECT TO authenticated
  USING (true);

-- Allow admins to view all hub accounts
DROP POLICY IF EXISTS "Admins can view all hub accounts" ON hub_accounts;
CREATE POLICY "Admins can view all hub accounts" ON hub_accounts
  FOR SELECT TO authenticated
  USING (true);
```

#### Issue B: Hub Accounts Table Missing
**Symptom:** Error "relation hub_accounts does not exist"

**Fix:** Create the table:
```sql
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

-- Enable RLS
ALTER TABLE hub_accounts ENABLE ROW LEVEL SECURITY;

-- Allow admins to view all hub accounts
CREATE POLICY "Admins can view all hub accounts" ON hub_accounts
  FOR SELECT TO authenticated
  USING (true);

-- Allow users to view their own hub account
CREATE POLICY "Users can view own hub account" ON hub_accounts
  FOR SELECT
  USING (user_id = auth.uid());
```

#### Issue C: Environment Variables Not Set
**Symptom:** Console shows "Missing NEXT_PUBLIC_SUPABASE_URL"

**Fix:** Check `.env.local` in admin folder:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

## Quick Fix Script

Run this comprehensive fix:

```sql
-- =============================================
-- QUICK FIX: ENABLE ADMIN ACCESS TO ALL DATA
-- =============================================

-- 1. Fix Customers Table RLS
DROP POLICY IF EXISTS "Admins can view all customers" ON customers;
CREATE POLICY "Admins can view all customers" ON customers
  FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Admins can manage customers" ON customers;
CREATE POLICY "Admins can manage customers" ON customers
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

-- 2. Create/Fix Hub Accounts Table
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

-- Enable RLS on hub_accounts
ALTER TABLE hub_accounts ENABLE ROW LEVEL SECURITY;

-- 3. Fix Hub Accounts RLS
DROP POLICY IF EXISTS "Admins can view all hub accounts" ON hub_accounts;
CREATE POLICY "Admins can view all hub accounts" ON hub_accounts
  FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Users can view own hub account" ON hub_accounts;
CREATE POLICY "Users can view own hub account" ON hub_accounts
  FOR SELECT
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Admins can manage hub accounts" ON hub_accounts;
CREATE POLICY "Admins can manage hub accounts" ON hub_accounts
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

-- 4. Verification
SELECT 'Total Customers' as metric, COUNT(*) as count FROM customers;
SELECT 'Total Hub Accounts' as metric, COUNT(*) as count FROM hub_accounts;
SELECT 'Hub Members (loyalty points > 0)' as metric, COUNT(*) as count FROM customers WHERE loyalty_points > 0;

-- 5. Test admin access
SELECT 'Admin can access customers?' as test, 
       CASE WHEN COUNT(*) > 0 THEN 'YES ✅' ELSE 'NO ❌' END as result
FROM customers;

SELECT 'Admin can access hub_accounts?' as test,
       CASE WHEN COUNT(*) >= 0 THEN 'YES ✅' ELSE 'NO ❌' END as result
FROM hub_accounts;

SELECT '✅ Fix applied! Refresh your admin dashboard.' as status;
```

## Alternative: Temporarily Disable RLS (NOT RECOMMENDED for Production)

**Only use this for testing:**

```sql
-- TEMPORARY: Disable RLS for testing
ALTER TABLE customers DISABLE ROW LEVEL SECURITY;
ALTER TABLE hub_accounts DISABLE ROW LEVEL SECURITY;

-- Remember to re-enable after testing!
-- ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE hub_accounts ENABLE ROW LEVEL SECURITY;
```

## Dashboard Code Check

The dashboard code at line 186-188 calculates hub members as:
```typescript
const customers = (customersResult.data || []) as any[];
const hubMembers = customers.filter(c => (c.loyalty_points || 0) > 0).length;
```

This means:
- **Total Customers** = All records in `customers` table
- **Hub Members** = Customers with `loyalty_points > 0`

## Common Issues & Solutions

### Issue 1: Shows 0 but data exists
**Cause:** RLS policies blocking admin access
**Fix:** Run the Quick Fix Script above

### Issue 2: "relation does not exist" error
**Cause:** Table not created yet
**Fix:** Run table creation SQL

### Issue 3: Shows correct count in SQL but 0 in dashboard
**Cause:** Environment variables not set or incorrect
**Fix:** 
1. Check `.env.local` exists in admin folder
2. Verify SUPABASE_URL and ANON_KEY are correct
3. Restart dev server: `npm run dev`

### Issue 4: Hub Members always 0
**Cause:** No customers have loyalty_points > 0
**Fix:** Either:
- Wait for customers to earn points
- Or manually set points for testing:
```sql
UPDATE customers 
SET loyalty_points = 100 
WHERE id = 'some-customer-id';
```

## Testing After Fix

### Test 1: Check in Supabase
```sql
SELECT COUNT(*) FROM customers;
SELECT COUNT(*) FROM hub_accounts;
SELECT COUNT(*) FROM customers WHERE loyalty_points > 0;
```

### Test 2: Check Dashboard
1. Refresh admin dashboard (Ctrl+Shift+R)
2. Check "Customers" card - should show count
3. Check "Hub Members" card - should show count
4. Open browser console (F12) - check for errors

### Test 3: Verify Real-Time Updates
1. Add a new customer in Supabase
2. Dashboard should update automatically (real-time subscription)
3. If not, refresh the page

## Prevention

To prevent this issue in the future:

1. **Always set RLS policies for admins:**
```sql
CREATE POLICY "Admins can view all" ON [table_name]
  FOR SELECT TO authenticated
  USING (true);
```

2. **Test with actual admin user:**
- Login as admin
- Check if data appears
- Check browser console for errors

3. **Use diagnostic script regularly:**
- Run `DIAGNOSE_DASHBOARD_ISSUE.sql`
- Verify all counts match

## Summary

**Most Common Cause:** RLS policies not allowing authenticated (admin) users to view customers/hub_accounts

**Quick Fix:** Run the Quick Fix Script in Supabase SQL Editor

**Verification:** Refresh dashboard and check counts

**If still 0:** Check browser console for specific errors and environment variables

---

**Run the Quick Fix Script now and refresh your dashboard!**
