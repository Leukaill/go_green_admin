# 🔧 FIXES NEEDED

## Issue 1: Promotions Not Showing on Website ❌

**Problem:** Promotions save but don't appear on website banner

**Possible Causes:**
1. Website not refreshing/reloading
2. Promotion dates incorrect
3. `show_on_homepage` not set to true
4. Browser cache

**Quick Fix:**
- Check if promotion has `show_on_homepage = true`
- Check if dates are valid (start_date <= now <= end_date)
- Hard refresh website (Ctrl+Shift+R)

---

## Issue 2: Announcements Not Appearing ❌

**Problem:** Seasonal/Info/Alert save successfully but don't appear anywhere

**Root Cause:** Admin page only loads PROMOTIONS, not ANNOUNCEMENTS!

**The Fix:**
1. ✅ Admin page needs to load BOTH promotions AND announcements
2. ✅ Display them in separate tabs or combined list
3. ✅ Website needs announcement banner component

---

## 🚀 SOLUTION

### **Fix 1: Update Admin Page to Load Both**

The admin page currently only calls:
```typescript
const { promotions: data } = await getAllPromotions();
```

It needs to ALSO load announcements:
```typescript
const { announcements: announcementData } = await getAllAnnouncements();
```

### **Fix 2: Display Both Types**

Add tabs or sections:
- **Promotions** tab (discounts)
- **Announcements** tab (seasonal/info/alert)

### **Fix 3: Website Banner for Announcements**

Create `AnnouncementBanner.tsx` for the website to show seasonal/info/alert messages

---

## ⚡ QUICK IMPLEMENTATION

I'll create:
1. ✅ Updated admin page with tabs for both types
2. ✅ Announcement banner for website
3. ✅ Combined display logic

**ETA: 15 minutes**

Ready to implement? 🎯
