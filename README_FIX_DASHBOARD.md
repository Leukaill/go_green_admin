# ⚡ URGENT: Fix Dashboard Showing 0 Customers/Hub Members

## Problem
Admin dashboard shows **0** for:
- Total Customers
- Hub Members

But data exists in database!

## Solution (2 Minutes)

### Step 1: Run SQL Script
1. **Supabase Dashboard** → **SQL Editor**
2. Open: `QUICK_FIX_DASHBOARD_COUNTS.sql`
3. Copy ALL → Paste → **RUN**

### Step 2: Refresh Dashboard
1. Go to admin dashboard
2. Press **Ctrl + Shift + R** (hard refresh)
3. Counts should now show! ✅

## What the Script Does

✅ Fixes RLS policies on `customers` table
✅ Creates/fixes `hub_accounts` table
✅ Allows admins to view all data
✅ Verifies the fix worked

## Expected Result

**Before:**
```
Total Customers: 0
Hub Members: 0
```

**After:**
```
Total Customers: [actual count]
Hub Members: [actual count]
```

## If Still Shows 0

### Check 1: Environment Variables
File: `.env.local` (in admin folder)
```env
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
```

### Check 2: Restart Dev Server
```bash
# Stop server (Ctrl+C)
npm run dev
```

### Check 3: Browser Console
1. Press F12
2. Check for errors
3. Look for Supabase connection issues

## Diagnostic Script

If you want to investigate first:
1. Run: `DIAGNOSE_DASHBOARD_ISSUE.sql`
2. Review all checks
3. Then run the fix script

## Root Cause

**RLS (Row Level Security) policies** were blocking authenticated admin users from viewing customer and hub account data.

The fix adds proper policies allowing admins to access all data.

---

**Quick Action:** Run `QUICK_FIX_DASHBOARD_COUNTS.sql` now!
