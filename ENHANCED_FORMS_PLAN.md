# 🎨 Enhanced Forms for All Types

## 🎯 Goal
Make Seasonal, Info, and Alert forms as professional and engaging as the Promotion form.

---

## 📋 What Each Type Needs

### **1. SEASONAL** 🎄
**Purpose:** Holiday greetings, seasonal events

**Multi-Step Wizard:**
- **Step 1:** Basic Info
  - Title (e.g., "Happy Holidays 2025!")
  - Subtitle/tagline
  - Icon/Emoji picker (🎄, 🎉, 🎊, ❄️, 🌸, 🍂)
  
- **Step 2:** Message & Design
  - Main message (multilingual support)
  - Background color picker
  - Banner image upload
  
- **Step 3:** Call to Action
  - Button text (e.g., "Shop Holiday Gifts")
  - Link URL
  - Product linking (optional)
  
- **Step 4:** Schedule & Display
  - Start/end dates
  - Show on homepage
  - Priority
  - Dismissible

**Preview Card:** Shows how it will look on website

---

### **2. INFO** ℹ️
**Purpose:** General updates, announcements

**Multi-Step Wizard:**
- **Step 1:** Information Details
  - Title (e.g., "New Delivery Hours")
  - Category (Update, News, Feature, Service)
  - Importance level (Low, Medium, High)
  
- **Step 2:** Content
  - Main message
  - Additional details
  - Icon selection
  
- **Step 3:** Actions
  - Call-to-action button (optional)
  - Link to more info
  - Contact information
  
- **Step 4:** Visibility
  - Start/end dates
  - Target audience (All, Customers, New visitors)
  - Display settings

**Preview Card:** Clean info banner preview

---

### **3. ALERT** ⚠️
**Purpose:** Important notices, warnings

**Multi-Step Wizard:**
- **Step 1:** Alert Type
  - Urgency level (Info, Warning, Critical)
  - Alert category (Service, Security, Maintenance, Policy)
  - Icon/color auto-selected based on urgency
  
- **Step 2:** Alert Message
  - Headline (short, impactful)
  - Detailed message
  - Affected services/areas
  
- **Step 3:** Action Required
  - What users should do
  - Contact information
  - Alternative options
  - Link to help/support
  
- **Step 4:** Duration & Display
  - Start/end dates
  - Auto-dismiss after reading
  - Force display (non-dismissible for critical)
  - Priority (alerts show above other content)

**Preview Card:** Alert banner with urgency styling

---

## 🎨 Design Enhancements

### **Common Features for All Types:**

1. **Progress Indicator**
   - Visual step tracker at top
   - Click to jump between steps
   - Completed steps marked

2. **Live Preview**
   - Real-time preview card
   - Shows exactly how it will appear
   - Updates as you type

3. **Smart Validation**
   - Field-specific hints
   - Character counters
   - Required field indicators
   - Helpful error messages

4. **Visual Pickers**
   - Icon/emoji picker with search
   - Color picker for themes
   - Image upload with preview

5. **Pro Tips**
   - Contextual help text
   - Best practices
   - Example content

6. **Summary Step**
   - Review all details
   - Edit any section
   - Final preview before save

---

## 🔧 Technical Implementation

### **State Management:**
```typescript
const [currentStep, setCurrentStep] = useState(1);
const [formData, setFormData] = useState({
  // Type-specific fields
  announcement_type: 'seasonal' | 'info' | 'alert',
  
  // Common fields
  title: '',
  message: '',
  icon: '',
  
  // Seasonal-specific
  subtitle: '',
  background_color: '',
  banner_image_url: '',
  
  // Info-specific
  category: '',
  importance: '',
  additional_details: '',
  
  // Alert-specific
  urgency: '',
  alert_category: '',
  action_required: '',
  affected_areas: '',
  
  // Common
  link_url: '',
  link_text: '',
  start_date: '',
  end_date: '',
  show_on_homepage: true,
  dismissible: true,
  priority: 0,
});
```

### **Step Configuration:**
```typescript
const getSteps = (type: AnnouncementType) => {
  switch(type) {
    case 'seasonal':
      return [
        { title: 'Basic Info', icon: Tag },
        { title: 'Message & Design', icon: Palette },
        { title: 'Call to Action', icon: Link },
        { title: 'Schedule', icon: Calendar },
      ];
    case 'info':
      return [
        { title: 'Information', icon: Info },
        { title: 'Content', icon: FileText },
        { title: 'Actions', icon: Link },
        { title: 'Visibility', icon: Eye },
      ];
    case 'alert':
      return [
        { title: 'Alert Type', icon: AlertTriangle },
        { title: 'Message', icon: MessageSquare },
        { title: 'Action Required', icon: Zap },
        { title: 'Duration', icon: Clock },
      ];
  }
};
```

---

## ✅ Implementation Checklist

- [ ] Add multi-step wizard for Seasonal
- [ ] Add multi-step wizard for Info
- [ ] Add multi-step wizard for Alert
- [ ] Add icon/emoji picker component
- [ ] Add color picker component
- [ ] Add live preview cards
- [ ] Add validation for each type
- [ ] Add helpful hints and tips
- [ ] Add character counters
- [ ] Add summary/review step
- [ ] Test all workflows
- [ ] Add save to announcements table

---

## 🚀 Ready to Implement?

This will make the forms **professional, engaging, and easy to use** - just like the promotion form!

**Estimated time:** 30-45 minutes for complete implementation

**Say "yes" to proceed!** 🎯
