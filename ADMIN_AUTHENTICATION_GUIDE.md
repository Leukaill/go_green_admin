# Admin Authentication System Guide

## 🔐 Authentication Overview

The Go Green Rwanda Admin Dashboard supports **three types of admin users**:

1. **Super Admin** 👑 - Full system access, can create other admins
2. **Admin** 🎯 - Standard admin privileges
3. **Moderator** ⭐ - Limited admin access

---

## 🎯 How It Works

### **Super Admin**
- **Can**: Create other admins (Super Admin, Admin, Moderator)
- **Can**: Log in to the admin dashboard
- **Can**: Access all features
- **First Time Setup**: Creates their own account via the signup form

### **Admin & Moderator**
- **Can**: Log in to the admin dashboard
- **Cannot**: Create their own accounts
- **Must**: Be created by a Super Admin through the Admin Management page

---

## 🚀 Initial Setup (First Time)

### Step 1: Create Super Admin Account
1. Navigate to `http://localhost:3001/login`
2. Click **"First time? Create Super Admin Account"**
3. Fill in:
   - Full Name
   - Email Address
   - Password (min 8 characters)
   - Phone Number (optional)
4. Click **"Create Super Admin Account"**
5. Account is created instantly
6. You can now log in

### Step 2: Log In as Super Admin
1. Enter your email and password
2. Click **"Admin Sign In"**
3. You'll see: "Welcome, Super Admin [Your Name]! 👑"
4. Redirected to dashboard

---

## 👥 Creating Additional Admins

### As a Super Admin:

1. **Navigate to Admin Management**
   - Go to `http://localhost:3001/admin-management`
   - Or click "Admin Management" in the sidebar

2. **Click "Add Admin" Button**
   - Dialog opens with form

3. **Fill in Admin Details**
   - **Name**: Full name of the admin
   - **Email**: Their email address (used for login)
   - **Role**: Select from dropdown
     - Super Admin (full access)
     - Admin (standard access)
     - Moderator (limited access)
   - **Status**: Select from dropdown
     - Active (can log in)
     - Suspended (cannot log in)

4. **Click "Add Admin"**
   - Admin account is created
   - They receive their credentials
   - They can now log in

---

## 🔑 Login Process

### For All Admin Types (Super Admin, Admin, Moderator):

1. **Go to Login Page**
   - Navigate to `http://localhost:3001/login`

2. **Enter Credentials**
   - Email: Your admin email
   - Password: Your password
   - Optional: Check "Remember me"

3. **Click "Admin Sign In"**
   - System authenticates you
   - Verifies you're an admin in the database
   - Checks your status is "active"

4. **Success Messages**
   - Super Admin: "Welcome, Super Admin [Name]! 👑"
   - Admin: "Welcome, Admin [Name]! 🎯"
   - Moderator: "Welcome, Moderator [Name]! ⭐"

5. **Redirected to Dashboard**
   - Full page reload ensures session is loaded
   - You're now logged in

---

## 🚫 What Regular Admins CANNOT Do

Regular admins (Admin & Moderator) **cannot**:
- ❌ Create their own accounts via the signup form
- ❌ See the "Create Super Admin Account" button (it's disabled after first super admin)
- ❌ Self-register through any means

They **must** be created by a Super Admin through the Admin Management page.

---

## 🔒 Security Features

### 1. **Account Creation Restrictions**
- Only Super Admins can create admin accounts
- Signup form is disabled after first Super Admin exists
- Regular admins cannot self-register

### 2. **Authentication Checks**
```typescript
// System verifies:
1. User exists in Supabase Auth
2. User has record in 'admins' table
3. User status is 'active'
4. User has valid role (super_admin, admin, or moderator)
```

### 3. **Session Management**
- Sessions stored in secure cookies
- Middleware checks authentication on every request
- Auto-refresh tokens for seamless experience

### 4. **Access Control**
- Protected routes require authentication
- Public routes: `/login` only
- All other routes require valid session

---

## 📋 Admin Roles & Permissions

### Super Admin 👑
- Create/Edit/Delete admins
- Access all features
- View all data
- Manage system settings
- Full control

### Admin 🎯
- Manage products
- Manage orders
- Manage customers
- View analytics
- Cannot create other admins

### Moderator ⭐
- View-only access to most features
- Can update order statuses
- Can respond to customer inquiries
- Limited editing capabilities

---

## 🛠️ Technical Implementation

### Authentication Flow:

```typescript
// 1. User submits login form
loginAdmin(email, password)

// 2. Authenticate with Supabase
supabase.auth.signInWithPassword({ email, password })

// 3. Verify admin record exists
supabase.from('admins').select('*').eq('id', user.id)

// 4. Check status is 'active'
if (admin.status !== 'active') → Reject

// 5. Update last login
supabase.from('admins').update({ last_login: now })

// 6. Cache role in localStorage
localStorage.setItem('admin-role', admin.role)

// 7. Redirect to dashboard
window.location.href = '/'
```

### Middleware Protection:

```typescript
// On every request:
1. Get session from cookies
2. If no session && not public route → Redirect to /login
3. If session && on /login → Redirect to /
4. Allow request to proceed
```

---

## 🔧 Troubleshooting

### Issue: "Access denied. This account is not registered as an admin"
**Cause**: User exists in Supabase Auth but not in `admins` table
**Solution**: Super Admin must create the admin account through Admin Management

### Issue: "Account is suspended"
**Cause**: Admin status is set to 'suspended'
**Solution**: Super Admin must activate the account in Admin Management

### Issue: "Cannot create admin account"
**Cause**: Trying to use signup form when Super Admin already exists
**Solution**: Ask Super Admin to create your account through Admin Management

### Issue: "Session expired" or keeps redirecting to login
**Cause**: Session cookies not being set properly
**Solution**: 
- Clear browser cookies
- Try logging in again
- Check if middleware is working correctly

---

## 📝 Best Practices

### For Super Admins:
1. ✅ Create admin accounts through Admin Management
2. ✅ Set appropriate roles based on responsibilities
3. ✅ Suspend accounts instead of deleting (for audit trail)
4. ✅ Regularly review admin access
5. ✅ Use strong passwords

### For All Admins:
1. ✅ Never share login credentials
2. ✅ Log out when finished
3. ✅ Use "Remember me" only on secure devices
4. ✅ Report suspicious activity
5. ✅ Keep password secure

---

## 🎯 Quick Reference

### Login URL:
```
http://localhost:3001/login
```

### Admin Management URL:
```
http://localhost:3001/admin-management
```

### Dashboard URL:
```
http://localhost:3001
```

---

## ✅ Summary

- **Super Admin**: Creates their own account first time, then creates other admins
- **Regular Admins**: Cannot self-register, must be created by Super Admin
- **All Admins**: Use the same login page with their credentials
- **Security**: Multi-layer authentication with role-based access control
- **Session**: Secure cookie-based sessions with auto-refresh

---

**The system is designed to be secure, scalable, and easy to manage!** 🚀
