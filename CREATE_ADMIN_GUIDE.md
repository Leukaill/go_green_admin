# 📘 How to Create Admin & Super Admin Accounts

## 🎯 Overview

This guide shows you how to create admin and super admin accounts for the Go Green Rwanda Admin Panel.

---

## 🚀 Quick Start: Create Your First Super Admin

### **Step 1: Run the SQL Setup**

1. Go to your **Supabase Dashboard**
2. Navigate to **SQL Editor**
3. Open the file `ADMIN_AUTH_SETUP.sql`
4. Copy all the SQL code
5. Paste it into the SQL Editor
6. Click **"Run"**

✅ This creates the `admins` table, policies, and helper functions.

---

### **Step 2: Create Auth User in Supabase**

1. In Supabase Dashboard, go to **Authentication** → **Users**
2. Click **"Add User"** button
3. Fill in the form:
   - **Email**: `superadmin@gogreen.rw` (or your preferred email)
   - **Password**: Create a strong password (e.g., `SuperAdmin123!@#`)
   - **Auto Confirm User**: ✅ **CHECK THIS BOX** (very important!)
4. Click **"Create User"**
5. **Copy the User ID** that appears (you'll need this in the next step)

---

### **Step 3: Insert Admin Record**

1. Go back to **SQL Editor**
2. Run this SQL (replace `YOUR-USER-ID-HERE` with the ID from Step 2):

```sql
INSERT INTO admins (id, email, name, role, status)
VALUES (
  'YOUR-USER-ID-HERE',  -- Replace with actual user ID from Step 2
  'superadmin@gogreen.rw',
  'Super Admin',
  'super_admin',
  'active'
);
```

Example with real ID:
```sql
INSERT INTO admins (id, email, name, role, status)
VALUES (
  '550e8400-e29b-41d4-a716-446655440000',  -- Your actual user ID
  'superadmin@gogreen.rw',
  'Super Admin',
  'super_admin',
  'active'
);
```

---

### **Step 4: Test Login**

1. Go to your admin panel: `http://localhost:3001/login`
2. Enter credentials:
   - **Email**: `superadmin@gogreen.rw`
   - **Password**: The password you set in Step 2
3. Click **"Sign In"**

✅ You should see: **"Welcome, Super Admin [Name]! 👑"**

---

## 👥 Creating Additional Admins

Once you have a super admin account, you can create other admins in two ways:

### **Method 1: Via Admin Panel (Recommended)**

1. Login as **Super Admin**
2. Go to **Admin Management** page
3. Click **"Add Admin"**
4. Fill in the form:
   - Name
   - Email
   - Role (Admin or Super Admin)
   - Status (Active)
5. Click **"Add Admin"**

### **Method 2: Manually via Supabase**

Repeat Steps 2-3 above, but change the role to `'admin'`:

```sql
-- Step 1: Create user in Authentication → Users
-- Step 2: Run this SQL

INSERT INTO admins (id, email, name, role, status)
VALUES (
  'USER-ID-FROM-SUPABASE',
  'admin@gogreen.rw',
  'Admin User',
  'admin',  -- Regular admin role
  'active'
);
```

---

## 🔐 Admin Roles Explained

### **Super Admin** (`super_admin`)
- ✅ Full system access
- ✅ Can manage other admins
- ✅ Can view system settings
- ✅ Can access audit logs
- ✅ Can view analytics
- ✅ All regular admin permissions

### **Admin** (`admin`)
- ✅ Manage products
- ✅ Manage orders
- ✅ Manage customers
- ✅ Create blog posts
- ✅ View basic analytics
- ❌ Cannot manage other admins
- ❌ Cannot access system settings

### **Moderator** (`moderator`)
- ✅ Moderate content
- ✅ View data
- ❌ Limited edit permissions
- ❌ Cannot manage users

---

## 📊 Useful SQL Queries

### **View All Admins**
```sql
SELECT id, email, name, role, status, last_login
FROM admins
ORDER BY created_at DESC;
```

### **Count Admins by Role**
```sql
SELECT * FROM active_admins_count;
```

### **Find Admin by Email**
```sql
SELECT * FROM get_admin_by_email('admin@gogreen.rw');
```

### **Change Admin Role**
```sql
-- Make someone a super admin
UPDATE admins 
SET role = 'super_admin' 
WHERE email = 'admin@gogreen.rw';

-- Downgrade to regular admin
UPDATE admins 
SET role = 'admin' 
WHERE email = 'superadmin@gogreen.rw';
```

### **Suspend an Admin**
```sql
UPDATE admins 
SET status = 'suspended' 
WHERE email = 'admin@gogreen.rw';
```

### **Reactivate an Admin**
```sql
UPDATE admins 
SET status = 'active' 
WHERE email = 'admin@gogreen.rw';
```

### **Delete an Admin**
```sql
-- First delete from admins table
DELETE FROM admins WHERE email = 'admin@gogreen.rw';

-- Then delete from auth.users in Supabase Dashboard → Authentication → Users
```

---

## 🛡️ Security Best Practices

### **Password Requirements**
- ✅ Minimum 8 characters
- ✅ Include uppercase and lowercase
- ✅ Include numbers
- ✅ Include special characters
- ✅ Example: `AdminPass123!@#`

### **Email Recommendations**
- ✅ Use company domain: `admin@gogreen.rw`
- ✅ Descriptive names: `superadmin@gogreen.rw`, `sales@gogreen.rw`
- ❌ Avoid personal emails for admin accounts

### **Role Assignment**
- ✅ Give super_admin only to trusted individuals
- ✅ Most users should be regular admins
- ✅ Review admin access regularly
- ✅ Remove inactive admins

---

## 🔄 Common Tasks

### **Reset Admin Password**

1. Go to Supabase Dashboard → **Authentication** → **Users**
2. Find the user by email
3. Click on the user
4. Click **"Send Password Recovery Email"**
5. Or set a new password directly

### **Check Last Login**

```sql
SELECT email, name, last_login
FROM admins
WHERE status = 'active'
ORDER BY last_login DESC NULLS LAST;
```

### **Bulk Create Admins**

```sql
-- First create users in Supabase Auth, then:

INSERT INTO admins (id, email, name, role, status) VALUES
  ('user-id-1', 'admin1@gogreen.rw', 'Admin One', 'admin', 'active'),
  ('user-id-2', 'admin2@gogreen.rw', 'Admin Two', 'admin', 'active'),
  ('user-id-3', 'admin3@gogreen.rw', 'Admin Three', 'admin', 'active');
```

---

## ❗ Troubleshooting

### **Problem: "Access denied. Admin account not found."**
**Solution**: The user exists in Supabase Auth but not in the `admins` table. Run the INSERT statement.

### **Problem: "Account is suspended."**
**Solution**: Update the status:
```sql
UPDATE admins SET status = 'active' WHERE email = 'your-email@gogreen.rw';
```

### **Problem: "Invalid login credentials"**
**Solution**: 
- Check email and password are correct
- Ensure user was created in Supabase Auth
- Check "Auto Confirm User" was enabled

### **Problem: Can't see super admin features**
**Solution**: Check the role:
```sql
SELECT role FROM admins WHERE email = 'your-email@gogreen.rw';
```
If it's not `super_admin`, update it:
```sql
UPDATE admins SET role = 'super_admin' WHERE email = 'your-email@gogreen.rw';
```

---

## 📋 Checklist: Creating First Super Admin

- [ ] Run `ADMIN_AUTH_SETUP.sql` in Supabase SQL Editor
- [ ] Go to Authentication → Users in Supabase Dashboard
- [ ] Click "Add User"
- [ ] Enter email and password
- [ ] ✅ Check "Auto Confirm User"
- [ ] Copy the generated User ID
- [ ] Run INSERT statement with the User ID
- [ ] Test login at `/login`
- [ ] Verify super admin features are visible

---

## 🎉 Success!

Once you've created your first super admin, you can:
- ✅ Login to the admin panel
- ✅ See super admin exclusive features
- ✅ Create other admin accounts
- ✅ Manage the entire system

**Your admin authentication system is now fully operational!** 🚀
