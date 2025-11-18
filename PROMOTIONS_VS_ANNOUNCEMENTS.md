# 🎯 PROMOTIONS vs ANNOUNCEMENTS - Two Separate Systems

## ✅ The Correct Setup

You were absolutely right! These should be **TWO SEPARATE SYSTEMS**:

### **1. PROMOTIONS** 💰
**Purpose:** Discount codes, sales, special offers  
**Table:** `promotions`  
**Features:**
- Discount codes (SUMMER50)
- Percentage or fixed amount discounts
- Usage limits
- Min purchase requirements
- Product linking
- Promo code validation at checkout

**Example:**
```
Title: "Summer Sale"
Code: SUMMER50
Discount: 20% OFF
Min Purchase: RWF 10,000
Usage Limit: 100
```

---

### **2. ANNOUNCEMENTS** 📢
**Purpose:** Info messages, alerts, seasonal greetings  
**Table:** `announcements`  
**Types:**
- **Seasonal** - Holiday greetings, seasonal events
- **Info** - General information, updates
- **Alert** - Important notices, warnings

**Features:**
- Multilingual (English, Kinyarwanda, French)
- Custom icons
- Banner images
- Optional links
- Dismissible
- No discount codes

**Example:**
```
Type: Seasonal
Title: "Happy New Year 2025!"
Message: "Wishing you a prosperous year ahead"
Icon: 🎉
Dismissible: Yes
```

---

## 📊 Comparison Table

| Feature | Promotions | Announcements |
|---------|-----------|---------------|
| **Purpose** | Discounts & Offers | Info & Alerts |
| **Has Discount Code** | ✅ Yes | ❌ No |
| **Has Discount Value** | ✅ Yes | ❌ No |
| **Usage Tracking** | ✅ Yes | ❌ No |
| **Multilingual** | ❌ No | ✅ Yes (EN/RW/FR) |
| **Types** | One type | 3 types (seasonal/info/alert) |
| **Checkout Integration** | ✅ Yes | ❌ No |
| **Homepage Banner** | ✅ Yes | ✅ Yes |
| **Product Linking** | ✅ Yes | ✅ Yes (optional) |
| **Dismissible** | ✅ Yes | ✅ Yes |

---

## 🗂️ Database Structure

### **Promotions Table**
```sql
CREATE TABLE promotions (
  id UUID PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  discount_type TEXT NOT NULL,  -- percentage, fixed_amount, buy_x_get_y
  discount_value DECIMAL NOT NULL,
  code TEXT UNIQUE,  -- Promo code
  min_purchase_amount DECIMAL,
  max_discount_amount DECIMAL,
  usage_limit INTEGER,
  usage_count INTEGER DEFAULT 0,
  product_id UUID,  -- Link to product
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  show_on_homepage BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  ...
);
```

### **Announcements Table**
```sql
CREATE TABLE announcements (
  id UUID PRIMARY KEY,
  announcement_type TEXT NOT NULL,  -- seasonal, info, alert
  title TEXT NOT NULL,
  title_rw TEXT,  -- Kinyarwanda
  title_fr TEXT,  -- French
  message TEXT NOT NULL,
  message_rw TEXT,
  message_fr TEXT,
  icon TEXT,
  link_url TEXT,
  link_text TEXT,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  show_on_homepage BOOLEAN DEFAULT false,
  dismissible BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  ...
);
```

---

## 🚀 Setup Instructions

### **Step 1: Run SQL Files**

```sql
-- 1. Setup Promotions System
SETUP_PROMOTIONS_SYSTEM.sql

-- 2. Add Product Linking
UPDATE_PROMOTIONS_ADD_PRODUCT.sql

-- 3. Setup Announcements System (NEW!)
SETUP_ANNOUNCEMENTS_SYSTEM.sql
```

### **Step 2: Admin Panel Structure**

```
/promotions
  - Create discount codes
  - Manage promo codes
  - Track usage
  - Product linking

/announcements
  - Create info messages
  - Seasonal greetings
  - Alerts & warnings
  - Multilingual content
```

---

## 📱 Website Display

### **Homepage Banner**
Both can show on homepage, but displayed differently:

**Promotion Banner:**
```
┌─────────────────────────────────────┐
│ 🏷️ 50% OFF   Summer Sale            │
│              Code: SUMMER50          │
│              [Shop Now →]  [✕]      │
└─────────────────────────────────────┘
```

**Announcement Banner:**
```
┌─────────────────────────────────────┐
│ 🎄 Happy Holidays!                  │
│    Enjoy the festive season         │
│    [Learn More →]  [✕]              │
└─────────────────────────────────────┘
```

### **Checkout Page**
Only **Promotions** appear here:

```
┌─────────────────────────────────────┐
│ Have a promo code?                  │
│ [Enter code...] [Apply]             │
│                                     │
│ ✅ SUMMER50 applied! -RWF 5,000     │
└─────────────────────────────────────┘
```

---

## 🎨 Use Cases

### **When to Use Promotions:**
- ✅ Black Friday sale
- ✅ First-time customer discount
- ✅ Seasonal sale (20% off)
- ✅ Buy 2 Get 1 Free
- ✅ Free shipping code
- ✅ Loyalty rewards

### **When to Use Announcements:**
- ✅ "Happy New Year 2025!"
- ✅ "New delivery hours"
- ✅ "Website maintenance tonight"
- ✅ "Fresh mangoes in season!"
- ✅ "Store closed on public holiday"
- ✅ "New payment method available"

---

## 📁 Files to Create

### **Admin Panel**

**Promotions:**
- ✅ `app/promotions/page.tsx` (already exists)
- ✅ `components/promotions/promotion-editor.tsx` (already exists)
- ✅ `lib/supabase/promotions.ts` (already exists)

**Announcements:**
- ⏳ `app/announcements/page.tsx` (need to create)
- ⏳ `components/announcements/announcement-editor.tsx` (need to create)
- ⏳ `lib/supabase/announcements.ts` (need to create)

### **Website**

**Promotions:**
- ✅ `components/promotions/promotion-banner.tsx` (already exists)
- ✅ `components/checkout/promo-code-input.tsx` (need to create)

**Announcements:**
- ⏳ `components/announcements/announcement-banner.tsx` (need to create)

---

## ✅ Summary

**Promotions = Money Off** 💰
- Discount codes
- Checkout integration
- Usage tracking
- Single language

**Announcements = Information** 📢
- No discounts
- Info/alerts/seasonal
- Multilingual
- Dismissible messages

**Both can:**
- Show on homepage
- Link to products
- Be scheduled
- Be managed by admins

---

## 🎯 Next Steps

1. ✅ Run `SETUP_ANNOUNCEMENTS_SYSTEM.sql`
2. ⏳ Create announcements admin page
3. ⏳ Create announcement editor
4. ⏳ Create announcement banner for website
5. ⏳ Test both systems separately

**Status:** Promotions ✅ Complete | Announcements ⏳ Database Ready

The two systems are now properly separated! 🎉
