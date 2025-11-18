# 🚀 Go Green Admin Panel - Vercel Deployment Guide

## Prerequisites

- ✅ GitHub account
- ✅ Vercel account
- ✅ Supabase project (same as main website)
- ✅ Subdomain for admin (e.g., admin.gogreenrwanda.com)

---

## 📋 Pre-Deployment Checklist

### 1. **Environment Variables Ready**
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (for super admin signup)

### 2. **Database Setup**
- ✅ Admins table created
- ✅ RLS policies fixed (no infinite recursion)
- ✅ Super admin account created
- ✅ All audit triggers working

### 3. **Code Ready**
- ✅ Mobile responsive
- ✅ No build errors
- ✅ All features tested

---

## 🎯 Deployment Steps

### **Step 1: Push to GitHub**

```bash
cd C:\Users\LENOVO\CascadeProjects\go-green-admin
git init
git add .
git commit -m "Admin panel ready for deployment"
git remote add origin https://github.com/YOUR_USERNAME/go-green-admin.git
git branch -M main
git push -u origin main
```

### **Step 2: Deploy to Vercel**

1. **Vercel Dashboard**
   - Click "Add New Project"
   - Import `go-green-admin` repository

2. **Configure Project**
   - Framework: Next.js
   - Root Directory: `./`
   - Build Command: `npm run build`

3. **Environment Variables**
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   NEXT_PUBLIC_SITE_URL=https://admin.gogreenrwanda.com
   ```

4. **Deploy**
   - Click "Deploy"
   - Wait for build completion

### **Step 3: Configure Subdomain**

1. **Add Domain in Vercel**
   - Settings → Domains
   - Add: `admin.gogreenrwanda.com`

2. **DNS Configuration**
   ```
   Type: CNAME
   Name: admin
   Value: cname.vercel-dns.com
   ```

3. **Update Supabase URLs**
   Add to allowed URLs:
   ```
   https://admin.gogreenrwanda.com
   https://your-project.vercel.app
   ```

---

## 🔒 Security Configuration

### **1. Restrict Access**

The admin panel should NOT be publicly indexed:

**Update `robots.txt`** (already created):
```
User-agent: *
Disallow: /
```

### **2. Add Password Protection** (Optional)

In Vercel:
- Settings → Deployment Protection
- Enable "Password Protection"
- Set a strong password

### **3. IP Allowlist** (Optional, Vercel Pro)

Restrict access to specific IPs:
- Settings → Firewall
- Add allowed IP addresses

---

## 🧪 Post-Deployment Testing

### **Critical Features to Test:**

- ✅ Login page loads
- ✅ Super admin can login
- ✅ Dashboard displays correctly
- ✅ Mobile menu works (hamburger)
- ✅ All CRUD operations work:
  - Products
  - Categories
  - Orders
  - Customers
  - Blog posts
  - Promotions
  - WhatsApp settings
- ✅ Super admin features accessible
- ✅ Regular admin features work
- ✅ Logout functions properly

---

## 👥 Creating Additional Admins

### **Method 1: Through Super Admin Panel**
1. Login as super admin
2. Go to "Admin Management"
3. Click "Add New Admin"
4. Fill in details
5. Save

### **Method 2: Direct Database** (if needed)
```sql
-- Create auth user first in Supabase Dashboard
-- Then add to admins table:
INSERT INTO admins (id, email, name, role, status)
VALUES (
  'user-id-from-auth-users',
  'admin@example.com',
  'Admin Name',
  'admin',
  'active'
);
```

---

## 🔄 Continuous Deployment

Auto-deploys on push to main branch:

```bash
git add .
git commit -m "Update admin feature"
git push
# Vercel automatically deploys!
```

---

## 📊 Monitoring

### **Vercel Dashboard**
- View deployment logs
- Monitor performance
- Check error rates

### **Supabase Dashboard**
- Monitor database queries
- Check API usage
- View audit logs

---

## 🐛 Troubleshooting

### **Login Issues**
- Check Supabase URL in environment variables
- Verify admin exists in `admins` table
- Check RLS policies (no infinite recursion)
- Clear browser cache

### **Mobile Menu Not Working**
- Hard refresh (Ctrl+Shift+R)
- Check console for errors
- Verify logo path is correct

### **Permission Errors**
- Check user role in `admins` table
- Verify RLS policies
- Check service role key is set

### **Build Fails**
```bash
# Test locally
npm run build

# Check for TypeScript errors
npm run type-check

# Fix issues and redeploy
```

---

## 🎉 Success Checklist

- ✅ Admin panel is live
- ✅ Login works
- ✅ Dashboard loads correctly
- ✅ Mobile responsive
- ✅ All CRUD operations functional
- ✅ Super admin features work
- ✅ Subdomain configured
- ✅ SSL certificate active
- ✅ Not indexed by search engines
- ✅ Environment variables set
- ✅ Supabase connection working

---

## 🔐 Security Best Practices

1. **Never share service role key**
2. **Use strong passwords for admin accounts**
3. **Enable 2FA on Vercel account**
4. **Regularly update dependencies**
5. **Monitor audit logs for suspicious activity**
6. **Restrict admin panel access (IP allowlist if possible)**
7. **Use password protection in Vercel settings**

---

## 📞 Support Resources

- **Vercel**: https://vercel.com/support
- **Supabase**: https://supabase.com/docs
- **Next.js**: https://nextjs.org/docs

---

**Your Go Green Admin Panel is now live and secure! 🎊**
