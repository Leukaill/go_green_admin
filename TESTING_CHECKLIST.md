# 🧪 TESTING CHECKLIST

## ✅ What I Just Fixed

**Fixed Announcement Interface:**
- Changed `type` → `announcement_type` to match database
- Added missing fields: `icon`, `link_url`, `show_on_homepage`

---

## 🎯 Step-by-Step Testing

### **Test 1: Check Database Table Exists**

1. Go to Supabase Dashboard → SQL Editor
2. Run this query:
```sql
SELECT * FROM announcements LIMIT 5;
```

**Expected Result:**
- Should return empty table or show announcements
- If error "table doesn't exist" → SQL didn't run properly

---

### **Test 2: Create a Seasonal Announcement**

1. Go to admin `/promotions` page
2. Click "Create New" button
3. Click "Seasonal" card (🎄)
4. Fill out the wizard:
   - **Step 1:** Title: "Happy Holidays 2025", Icon: 🎄
   - **Step 2:** Message: "Wishing you joy!", Color: Purple
   - **Step 3:** Skip (optional)
   - **Step 4:** Check "Show on Homepage", Check "Active"
5. Click "Create Seasonal Message"

**Expected Result:**
- Toast message: "Seasonal created!"
- Page refreshes

---

### **Test 3: Check Announcements Tab**

1. On `/promotions` page
2. Click "Announcements" tab (should show count)
3. Look for your seasonal announcement

**Expected Result:**
- Should see card with:
  - 🎄 icon
  - "Happy Holidays 2025" title
  - "Wishing you joy!" message
  - Green "Active" badge
  - Blue "seasonal" badge

**If you see "No announcements found":**
- Announcement didn't save
- Check browser console for errors
- Check Supabase logs

---

### **Test 4: Create Info Announcement**

1. Click "Create New"
2. Choose "Information" (ℹ️)
3. Fill wizard:
   - **Step 1:** Title: "New Hours", Category: Service
   - **Step 2:** Message: "We're open 9-5 now"
   - **Step 3:** Skip
   - **Step 4:** Check "Active"
4. Save

**Expected:** Should appear in Announcements tab

---

### **Test 5: Create Alert**

1. Click "Create New"
2. Choose "Alert" (⚠️)
3. Fill wizard:
   - **Step 1:** Urgency: Warning, Category: Service
   - **Step 2:** Title: "Maintenance", Message: "Site down tomorrow"
   - **Step 3:** Skip
   - **Step 4:** Check "Active"
4. Save

**Expected:** Should appear in Announcements tab

---

### **Test 6: Check Promotions Still Work**

1. Click "Promotions" tab
2. Click "Create New"
3. Choose "Promotion" (💰)
4. Fill wizard:
   - **Step 1:** Title: "Summer Sale"
   - **Step 2:** Type: Percentage, Value: 20
   - **Step 3:** Skip
   - **Step 4:** Check "Show on Homepage", Check "Active"
5. Save

**Expected:** Should appear in Promotions tab

---

## 🔍 Debugging

### **If Announcements Don't Appear in Admin:**

**Check 1: Browser Console**
```
Press F12 → Console tab
Look for errors like:
- "Failed to fetch"
- "permission denied"
- "column does not exist"
```

**Check 2: Network Tab**
```
F12 → Network tab
Reload page
Look for:
- Request to /rest/v1/announcements
- Status should be 200 (not 404 or 500)
- Response should have data
```

**Check 3: Supabase Logs**
```
Supabase Dashboard → Logs
Look for errors when creating announcements
```

---

### **If Promotions Don't Show on Website:**

**Check 1: Promotion Settings**
```sql
SELECT id, title, is_active, show_on_homepage, start_date, end_date 
FROM promotions 
WHERE show_on_homepage = true;
```

Make sure:
- `is_active` = true
- `show_on_homepage` = true
- `start_date` <= NOW()
- `end_date` >= NOW()

**Check 2: Website Component**
- Hard refresh website (Ctrl+Shift+R)
- Check if `PromotionBanner` is in `app/page.tsx`
- Check browser console for errors

---

## 📊 Expected Results Summary

After all tests, you should have:

**Promotions Tab:**
- ✅ 1 promotion: "Summer Sale" (20% OFF)

**Announcements Tab:**
- ✅ 1 seasonal: "Happy Holidays 2025" 🎄
- ✅ 1 info: "New Hours" ℹ️
- ✅ 1 alert: "Maintenance" ⚠️

**Total:** 4 items created

---

## 🆘 If Nothing Works

**Run these SQL queries to check:**

```sql
-- Check if table exists
SELECT table_name FROM information_schema.tables 
WHERE table_name = 'announcements';

-- Check table structure
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'announcements';

-- Try manual insert
INSERT INTO announcements (
  announcement_type, title, message, 
  start_date, end_date, is_active
) VALUES (
  'info', 'Test', 'Test message',
  NOW(), NOW() + INTERVAL '7 days', true
);

-- Check if it saved
SELECT * FROM announcements;
```

If manual insert works but UI doesn't → Check browser console errors
If manual insert fails → SQL setup issue

---

## ✅ Success Criteria

You'll know it's working when:
1. ✅ Can switch between Promotions/Announcements tabs
2. ✅ Can create all 4 types (promotion, seasonal, info, alert)
3. ✅ All items appear in their respective tabs
4. ✅ Can see icons, badges, and details

**Report back what you see!** 🎯
