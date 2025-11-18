# 🎯 Adding Seasonal, Info, and Alert Types

## ✅ Quick Solution: Add Type Selector to Existing Button

I'll modify the **existing "Create Promotion" button** to show a type selector first, then adapt the form based on selection.

---

## 🎨 How It Will Work

### **Step 1: Click "Create Promotion"**
Shows a modal with 4 cards to choose from:

```
┌─────────────────────────────────────────────────────┐
│  What would you like to create?                     │
├─────────────────────────────────────────────────────┤
│                                                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────┐│
│  │ 💰       │  │ 🎄       │  │ ℹ️        │  │ ⚠️    ││
│  │Promotion │  │ Seasonal │  │   Info   │  │ Alert ││
│  │          │  │          │  │          │  │       ││
│  │Discounts │  │ Holiday  │  │ Updates  │  │Notice ││
│  │& Codes   │  │Messages  │  │          │  │       ││
│  └──────────┘  └──────────┘  └──────────┘  └──────┘│
│                                                      │
└─────────────────────────────────────────────────────┘
```

### **Step 2: Form Adapts**

**If "Promotion" selected:**
- Shows discount fields
- Shows promo code
- Shows usage limits
- 4 steps wizard

**If "Seasonal/Info/Alert" selected:**
- Shows message field (multilingual)
- Shows icon picker
- No discount fields
- 3 steps wizard

---

## 📝 Implementation Steps

### **Option 1: Modify Button Label** (Simplest)

Change the button text from "Create Promotion" to "Create New":

```tsx
<Button onClick={handleCreateNew} size="lg">
  <Plus className="h-5 w-5 mr-2" />
  Create New
</Button>
```

### **Option 2: Add Type Selector in Editor** (Recommended)

Add this as **Step 0** in the promotion editor:

```tsx
// At the very beginning of the form
{currentStep === 0 && (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
    <TypeCard
      type="promotion"
      icon={Percent}
      title="Promotion"
      desc="Discounts & codes"
      onClick={() => {
        setAnnouncementType('promotion');
        setCurrentStep(1);
      }}
    />
    <TypeCard
      type="seasonal"
      icon={Snowflake}
      title="Seasonal"
      desc="Holiday messages"
      onClick={() => {
        setAnnouncementType('seasonal');
        setCurrentStep(1);
      }}
    />
    <TypeCard
      type="info"
      icon={Info}
      title="Information"
      desc="General updates"
      onClick={() => {
        setAnnouncementType('info');
        setCurrentStep(1);
      }}
    />
    <TypeCard
      type="alert"
      icon={AlertTriangle}
      title="Alert"
      desc="Important notices"
      onClick={() => {
        setAnnouncementType('alert');
        setCurrentStep(1);
      }}
    />
  </div>
)}
```

---

## 🔧 What Needs to Change

### **1. Update Interface**
```typescript
// Add announcement_type to form data
const [formData, setFormData] = useState({
  announcement_type: 'promotion', // NEW
  title: '',
  message: '', // NEW - for non-promotion types
  // ... rest of fields
});
```

### **2. Conditional Fields**
```typescript
// Only show discount fields if type is 'promotion'
{formData.announcement_type === 'promotion' && (
  <>
    <DiscountTypeSelector />
    <DiscountValueInput />
    <PromoCodeInput />
  </>
)}

// Show message field for other types
{formData.announcement_type !== 'promotion' && (
  <MessageInput />
)}
```

### **3. Save to Correct Table**
```typescript
if (formData.announcement_type === 'promotion') {
  // Save to promotions table
  await createPromotion(data);
} else {
  // Save to announcements table
  await createAnnouncement(data);
}
```

---

## 🎯 Simpler Alternative: Separate Buttons

If you prefer separate buttons, add this to the header:

```tsx
<div className="flex gap-3">
  <Button onClick={() => handleCreate('promotion')} size="lg">
    <Percent className="h-5 w-5 mr-2" />
    Create Promotion
  </Button>
  
  <Button onClick={() => handleCreate('seasonal')} size="lg" variant="outline">
    <Snowflake className="h-5 w-5 mr-2" />
    Seasonal
  </Button>
  
  <Button onClick={() => handleCreate('info')} size="lg" variant="outline">
    <Info className="h-5 w-5 mr-2" />
    Info
  </Button>
  
  <Button onClick={() => handleCreate('alert')} size="lg" variant="outline">
    <AlertTriangle className="h-5 w-5 mr-2" />
    Alert
  </Button>
</div>
```

---

## ✅ My Recommendation

**Use Option 2** (Type selector in editor):

**Pros:**
- ✅ Clean UI - one button
- ✅ User sees all options
- ✅ Professional wizard flow
- ✅ Easy to maintain

**Steps:**
1. Add type selector as Step 0
2. Adapt form based on selection
3. Save to correct table

---

## 🚀 Quick Implementation

Want me to:
1. ✅ Add type selector to the editor?
2. ✅ Make form adapt to type?
3. ✅ Handle saving to both tables?

Just say "yes" and I'll implement it! 🎉
