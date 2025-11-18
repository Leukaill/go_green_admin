# 🔐 Secure Admin Account Creation System

## 🎯 Overview

The Go Green Rwanda Admin Panel has a **secure, role-based admin creation system** that ensures only authorized super admins can create new admin accounts.

---

## 🛡️ Security Features

### **1. Super Admin Only Access**
- ✅ Only **super admins** can create new admin accounts
- ✅ Regular admins cannot create other admins
- ✅ API validates the requesting user's role before proceeding

### **2. Server-Side Validation**
- ✅ All admin creation happens server-side via API routes
- ✅ Uses Supabase Service Role Key (never exposed to client)
- ✅ No direct client-side user creation
- ✅ Validates all input before processing

### **3. Auto-Confirmed Accounts**
- ✅ Admin accounts are auto-confirmed (no email verification needed)
- ✅ Admins can login immediately after creation
- ✅ No public signup page - only super admins can create accounts

### **4. Password Security**
- ✅ Minimum 8 characters required
- ✅ Passwords are hashed by Supabase Auth
- ✅ Passwords never stored in plain text
- ✅ Passwords never returned in API responses

### **5. Atomic Operations**
- ✅ If admin table insert fails, auth user is automatically deleted
- ✅ Prevents orphaned auth users
- ✅ Maintains database consistency

---

## 🚀 How Super Admins Create Admin Accounts

### **Method 1: Via Admin Panel UI (Recommended)**

1. **Login as Super Admin**
   - Go to `http://localhost:3001/login`
   - Login with super admin credentials

2. **Navigate to Admin Management**
   - Click **"Admin Management"** in the sidebar
   - This page is only visible to super admins

3. **Click "Add Admin" Button**
   - A dialog will open

4. **Fill in the Form**
   - **Name**: Full name of the admin
   - **Email**: Work email (e.g., `admin@gogreen.rw`)
   - **Password**: Strong password (min 8 characters)
   - **Phone**: Optional phone number
   - **Role**: Select from:
     - `Admin` - Regular admin permissions
     - `Super Admin` - Full system access
     - `Moderator` - Limited permissions

5. **Click "Create Admin"**
   - The system will:
     - Validate your super admin status
     - Create the Supabase Auth user
     - Insert the admin record
     - Auto-confirm the email
     - Return success or error

6. **New Admin Can Login**
   - The new admin can immediately login with their credentials
   - No email confirmation required

---

### **Method 2: Via API (For Programmatic Access)**

```typescript
// Only works if you have a super admin auth token

const response = await fetch('/api/admin/create', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${superAdminToken}`,
  },
  body: JSON.stringify({
    email: 'newadmin@gogreen.rw',
    password: 'SecurePass123!',
    name: 'New Admin',
    role: 'admin',
    phone: '+250787399228', // Optional
  }),
});

const result = await response.json();
```

**Response on Success:**
```json
{
  "success": true,
  "admin": {
    "id": "uuid-here",
    "email": "newadmin@gogreen.rw",
    "name": "New Admin",
    "role": "admin",
    "status": "active"
  }
}
```

**Response on Error:**
```json
{
  "error": "Only active super admins can create admin accounts"
}
```

---

## 🔒 Security Flow

```
1. Super Admin clicks "Add Admin"
   ↓
2. Form validation (client-side)
   ↓
3. Request sent to /api/admin/create
   ↓
4. API verifies requesting user is super admin
   ↓
5. API validates input data
   ↓
6. Supabase Auth creates user (with service role key)
   ↓
7. User is auto-confirmed
   ↓
8. Admin record inserted into admins table
   ↓
9. If insert fails, auth user is deleted (rollback)
   ↓
10. Success response returned
   ↓
11. New admin can login immediately
```

---

## 🔑 Environment Variables Required

Add this to your `.env.local`:

```env
# Public keys (safe for client)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

# Service role key (SERVER-SIDE ONLY - never expose to client!)
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

⚠️ **CRITICAL**: The `SUPABASE_SERVICE_ROLE_KEY` must **NEVER** be exposed to the client. It's only used in API routes (server-side).

---

## 🎯 API Endpoint Details

### **POST /api/admin/create**

**Authentication Required**: Yes (Super Admin only)

**Headers:**
```
Content-Type: application/json
Authorization: Bearer {super_admin_token}
```

**Request Body:**
```json
{
  "email": "string (required)",
  "password": "string (required, min 8 chars)",
  "name": "string (required)",
  "role": "super_admin | admin | moderator (required)",
  "phone": "string (optional)"
}
```

**Validations:**
- ✅ Requesting user must be super admin
- ✅ Requesting user must have active status
- ✅ Email must be valid and unique
- ✅ Password must be at least 8 characters
- ✅ Role must be one of: super_admin, admin, moderator
- ✅ Name is required

**Success Response (200):**
```json
{
  "success": true,
  "admin": {
    "id": "uuid",
    "email": "string",
    "name": "string",
    "role": "string",
    "status": "active"
  }
}
```

**Error Responses:**
- `401`: Unauthorized (no auth token)
- `403`: Forbidden (not a super admin)
- `400`: Bad request (validation failed)
- `500`: Server error

---

## 🛠️ Implementation Details

### **Service Role Key Usage**

The API uses Supabase Service Role Key which:
- ✅ Bypasses Row Level Security (RLS)
- ✅ Can create users without email confirmation
- ✅ Has admin privileges
- ❌ Must NEVER be exposed to client
- ❌ Only used in server-side API routes

```typescript
// Server-side only!
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!, // Service role key
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);
```

### **Auto-Confirmation**

```typescript
const { data: newUser } = await supabaseAdmin.auth.admin.createUser({
  email,
  password,
  email_confirm: true, // Auto-confirm - no email verification needed
  user_metadata: {
    name,
    role,
  },
});
```

### **Atomic Transaction**

```typescript
// Create auth user
const { data: newUser } = await supabaseAdmin.auth.admin.createUser({...});

// Insert admin record
const { error: insertError } = await supabaseAdmin
  .from('admins')
  .insert({...});

// If insert fails, rollback by deleting auth user
if (insertError) {
  await supabaseAdmin.auth.admin.deleteUser(newUser.user.id);
  throw new Error('Failed to create admin');
}
```

---

## 📋 Best Practices

### **For Super Admins:**

1. **Use Strong Passwords**
   - Minimum 8 characters
   - Mix of uppercase, lowercase, numbers, symbols
   - Example: `AdminPass123!@#`

2. **Use Company Emails**
   - ✅ `admin@gogreen.rw`
   - ❌ `personal.email@gmail.com`

3. **Assign Appropriate Roles**
   - Most users should be regular `admin`
   - Only trusted individuals should be `super_admin`
   - Use `moderator` for limited access

4. **Review Regularly**
   - Check active admins monthly
   - Suspend inactive accounts
   - Remove ex-employees immediately

5. **Document Access**
   - Keep a record of who has admin access
   - Note the reason for access level
   - Review permissions quarterly

---

## 🔍 Monitoring & Auditing

### **Check Recent Admin Creations**

```sql
SELECT 
  name, 
  email, 
  role, 
  created_at,
  status
FROM admins
WHERE created_at > NOW() - INTERVAL '7 days'
ORDER BY created_at DESC;
```

### **View All Super Admins**

```sql
SELECT name, email, status, last_login
FROM admins
WHERE role = 'super_admin'
ORDER BY last_login DESC NULLS LAST;
```

### **Count Admins by Role**

```sql
SELECT 
  role,
  COUNT(*) as count,
  COUNT(*) FILTER (WHERE status = 'active') as active_count
FROM admins
GROUP BY role;
```

---

## ❗ Troubleshooting

### **Error: "Only active super admins can create admin accounts"**

**Cause**: You're not logged in as a super admin, or your account is suspended.

**Solution**:
1. Check your role:
```sql
SELECT role, status FROM admins WHERE email = 'your-email@gogreen.rw';
```
2. If role is not `super_admin`, contact another super admin
3. If status is not `active`, contact another super admin to reactivate

### **Error: "Email already exists"**

**Cause**: An admin with that email already exists.

**Solution**:
- Use a different email
- Or delete the existing admin first (if appropriate)

### **Error: "Password must be at least 8 characters"**

**Cause**: Password is too short.

**Solution**: Use a password with at least 8 characters.

### **Error: "Failed to create admin record"**

**Cause**: Database insert failed (possibly due to RLS policies or constraints).

**Solution**:
1. Check Supabase logs
2. Verify RLS policies allow super admins to insert
3. Check for unique constraint violations

---

## 🎉 Summary

The admin creation system is:
- ✅ **Secure** - Only super admins can create accounts
- ✅ **Simple** - Easy UI for account creation
- ✅ **Safe** - Server-side validation and atomic operations
- ✅ **Instant** - No email confirmation needed
- ✅ **Auditable** - All actions are logged

**Super admins have full control over who can access the system!** 🔐
