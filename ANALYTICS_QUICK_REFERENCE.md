# 📊 Analytics Page - Quick Reference Guide

## 🚀 Quick Start

```bash
cd C:\Users\LENOVO\CascadeProjects\go-green-admin
npm run dev
```

Navigate to: **http://localhost:3001/analytics**

---

## 🎯 Features at a Glance

### **Time Range Filters**
- **Today** - Current day data
- **Week** - Last 7 days
- **Month** - Last 30 days (default)
- **Year** - Last 365 days
- **All** - All-time data

### **Export Report**
Click the "Export Report" button to download a JSON file with all analytics data.

---

## 📊 All Metrics (39+ Total)

### **1. Key Metrics** (Top Cards)
| Metric | Source | Calculation |
|--------|--------|-------------|
| Total Revenue | Orders | Sum of order totals |
| Active Customers | Customers | Customers with orders in period |
| Total Orders | Orders | Count of orders in period |
| Active Products | Products | Products with status='active' |

### **2. Revenue Breakdown**
- Revenue by Category (Vegetables, Fruits, Herbs, Other)
- Top 4 Products by Revenue

### **3. Additional Metrics**
- Customer Retention Rate
- Average Order Value
- Conversion Rate

### **4. Order Analytics** (5 Cards)
- Completed (Delivered)
- Processing
- Pending
- Cancelled
- Avg Processing Time

### **5. Customer Insights** (4 Cards)
- VIP Customers (>100K RWF spent)
- Active Customers
- Returning Customers (>1 order)
- Avg Lifetime Value

### **6. Product Performance** (5 Cards)
- Total Products
- In Stock (>10 units)
- Out of Stock (0 units)
- Low Stock (1-10 units)
- Trending (Featured)

### **7. Geographic Distribution** (4 Cards)
- Active Zones
- On-Time Delivery Rate
- Avg Delivery Time
- Top Location

### **8. Traffic & Engagement** (4 Cards)
- Total Visitors
- Page Views
- Bounce Rate
- Avg Session Duration

### **9. Blog & Content** (4 Cards)
- Published Posts
- Total Views
- Avg Read Time
- Engagement Growth

### **10. System Health** (4 Cards)
- System Uptime
- Response Time
- Error Rate
- Active Users Now

---

## 🔄 Real-Time Updates

The page automatically updates when:
- New orders are created
- Products are updated
- Any database change occurs

**Subscribed Tables:**
- `orders`
- `products`

---

## 💡 Understanding the Data

### **Percentage Changes**
- **Green** = Growth/Improvement
- **Red** = Decline/Decrease
- Calculated by comparing current period vs previous period

### **Color-Coded Badges**
- **Green** = Good/Completed/Active
- **Yellow** = Warning/Processing
- **Red** = Error/Cancelled
- **Blue** = Info/Pending
- **Purple** = Special/VIP

### **Geographic Data**
Extracted from order delivery addresses:
- City names from `delivery_address.city`
- Counts orders per location
- Calculates delivery performance

---

## 🎨 Visual Features

- **Hover Effects** - Cards lift on hover
- **Progress Bars** - Revenue by category
- **Live Pulse** - Active users indicator
- **Responsive Grid** - Adapts to screen size
- **Loading States** - Shows "Loading..." or "..."

---

## 📥 Export Format

Exported JSON includes:
```json
{
  "generatedAt": "2025-01-09T...",
  "timeRange": "month",
  "metrics": {
    "totalRevenue": 1234567,
    "totalCustomers": 89,
    "totalOrders": 234,
    ...all other metrics
  }
}
```

---

## 🐛 Troubleshooting

### No Data Showing?
1. Check Supabase connection
2. Verify tables exist (orders, products, customers, blog_posts)
3. Check browser console for errors
4. Ensure RLS policies allow data access

### Percentage Shows "0%"?
- Normal if no previous period data exists
- Will show "+100%" if current has data but previous doesn't

### Geographic Data Empty?
- Requires orders with `delivery_address.city` field
- Will show "N/A" if no location data available

---

## 🔑 Key Files

- **Page**: `app/analytics/page.tsx`
- **Supabase Client**: `lib/supabase/client.ts`
- **Utils**: `lib/utils.ts` (formatPrice function)

---

## 📱 Responsive Breakpoints

- **Mobile**: 1 column
- **Tablet**: 2 columns
- **Desktop**: 4-5 columns

---

## ⚡ Performance Tips

1. Data is fetched once on load
2. Real-time subscriptions only trigger on actual changes
3. Calculations are optimized with efficient array operations
4. Use time filters to reduce data load

---

## 🎓 For Developers

### Adding New Metrics

1. Add to `AnalyticsData` interface
2. Calculate in `fetchAnalyticsData()`
3. Add UI card in return JSX
4. Update documentation

### Modifying Time Ranges

Edit the `getDateRange()` function to add custom ranges.

### Changing Calculations

All calculations are in `fetchAnalyticsData()` - clearly commented and organized by section.

---

## ✅ Verification Checklist

- [ ] All 39+ metrics display correctly
- [ ] Time filters work (Today, Week, Month, Year, All)
- [ ] Percentage changes show correct colors
- [ ] Export button downloads JSON file
- [ ] Real-time updates work
- [ ] Responsive on mobile
- [ ] No console errors
- [ ] Loading states appear briefly
- [ ] All sections have data (or show "No data")

---

## 🎉 Success Indicators

✅ **Working Correctly When:**
- Numbers change when switching time ranges
- Percentages update dynamically
- Export creates timestamped file
- Cards show hover effects
- Active users pulse indicator animates
- All sections load without errors

---

**Need Help?** Check `ANALYTICS_REAL_DATA_COMPLETE.md` for detailed documentation.
