# 🔍 DEBUG: Admin Not Showing Announcements

## Current Status

**✅ Working:**
- Announcements save to database
- Announcements show on website
- Admin has "Announcements" tab

**❌ Not Working:**
- Admin "Announcements" tab shows no items (or wrong count)

---

## 🎯 Quick Checks

### **Check 1: Browser Console**

1. Open admin page `/promotions`
2. Press **F12** to open DevTools
3. Go to **Console** tab
4. Look for errors (red text)

**Common errors:**
- `Failed to fetch announcements`
- `permission denied for table announcements`
- `column "announcement_type" does not exist`

**If you see errors, copy them and tell me!**

---

### **Check 2: Network Tab**

1. Keep F12 open
2. Go to **Network** tab
3. Refresh the page (F5)
4. Look for request to `announcements`

**What to check:**
- Is there a request to `/rest/v1/announcements`?
- What's the status code? (Should be 200)
- Click on it → Preview tab → What data is returned?

**If status is 404 or 500, there's a problem!**

---

### **Check 3: Database Query**

Run this in Supabase SQL Editor:

```sql
-- Check if announcements exist
SELECT 
  id, 
  announcement_type, 
  title, 
  message,
  is_active,
  show_on_homepage,
  created_at
FROM announcements
ORDER BY created_at DESC;
```

**Expected:**
- Should show your seasonal/info/alert items
- Check `announcement_type` column exists
- Check data looks correct

**If empty:** No announcements in database
**If error:** Table doesn't exist or wrong schema

---

### **Check 4: Tab Count**

Look at the admin page tabs:

```
[Promotions (3)]  [Announcements (?)]
                                  ↑
                          What number do you see?
```

**If it shows (0):** Announcements not loading
**If it shows correct number:** They're loading but not displaying

---

## 🔧 Quick Fixes

### **Fix 1: Hard Refresh Admin**

```
Ctrl + Shift + R (Windows/Linux)
Cmd + Shift + R (Mac)
```

This clears cache and reloads everything.

---

### **Fix 2: Check RLS Policies**

Run this in Supabase SQL Editor:

```sql
-- Check if you can read announcements
SELECT * FROM announcements LIMIT 1;
```

**If error "permission denied":**
- RLS policies might be blocking you
- Need to check admin permissions

---

### **Fix 3: Verify API Function**

Check if `getAllAnnouncements()` works:

1. Open browser console on admin page
2. Paste this:

```javascript
// Test loading announcements
const testLoad = async () => {
  const response = await fetch('/rest/v1/announcements', {
    headers: {
      'apikey': 'YOUR_ANON_KEY',
      'Authorization': 'Bearer YOUR_TOKEN'
    }
  });
  const data = await response.json();
  console.log('Announcements:', data);
};
testLoad();
```

---

## 📊 Tell Me What You See

**Answer these questions:**

1. **Announcements tab count:** What number is in parentheses?
   - Example: "Announcements (3)" or "Announcements (0)"

2. **Browser console errors:** Any red errors? Copy them.

3. **Database query result:** How many rows returned?
   ```sql
   SELECT COUNT(*) FROM announcements;
   ```

4. **When you click "Announcements" tab:** What do you see?
   - Empty state message?
   - Cards with announcements?
   - Nothing at all?

5. **Network tab:** Do you see a request to `announcements`? What status?

---

## 🎯 Most Likely Issues

### **Issue 1: RLS Policy Blocking**

**Symptom:** Tab shows (0) even though database has data

**Fix:** Check RLS policies allow admins to read announcements

```sql
-- Check existing policies
SELECT * FROM pg_policies WHERE tablename = 'announcements';
```

---

### **Issue 2: Wrong Field Name**

**Symptom:** Console error about missing column

**Fix:** Make sure database has `announcement_type` not `type`

```sql
-- Check column names
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'announcements';
```

---

### **Issue 3: Not Loading**

**Symptom:** No network request at all

**Fix:** Check if `loadAnnouncements()` is being called

Add this to browser console:
```javascript
console.log('Checking announcements state...');
// Should see announcements array in React DevTools
```

---

## ✅ Expected Behavior

**When working correctly:**

1. Page loads
2. Network request to `/rest/v1/announcements` (status 200)
3. Tab shows: "Announcements (3)" (or whatever count)
4. Click tab → See cards with icons and badges
5. Each card shows:
   - Icon (emoji or default)
   - Title
   - Message snippet
   - Type badge (seasonal/info/alert)
   - Active/Inactive badge

---

## 🆘 Report Back

**Tell me:**
1. Tab count number
2. Any console errors
3. Database row count
4. What you see when clicking Announcements tab

Then I can pinpoint the exact issue! 🎯
