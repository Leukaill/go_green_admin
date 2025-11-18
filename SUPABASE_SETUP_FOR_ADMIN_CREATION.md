# Supabase Setup for Admin Creation

## ⚙️ Required Supabase Settings

To allow Super Admin to create admin accounts directly, you need to configure Supabase:

---

## 1. Disable Email Confirmation (Required)

By default, Supabase requires email confirmation for new users. We need to disable this for admin accounts.

### Steps:

1. Go to your **Supabase Dashboard**
2. Navigate to **Authentication** → **Providers** → **Email**
3. Find **"Confirm email"** setting
4. **Uncheck** "Enable email confirmations"
5. Click **Save**

**OR** keep it enabled and add this SQL policy:

```sql
-- Auto-confirm users created by admins
CREATE OR REPLACE FUNCTION auto_confirm_admin_users()
RETURNS TRIGGER AS $$
BEGIN
  -- Auto-confirm if created by an admin
  NEW.email_confirmed_at = NOW();
  NEW.confirmed_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_admin_user_created
  BEFORE INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION auto_confirm_admin_users();
```

---

## 2. RLS Policies for Admins Table

Make sure the `admins` table has proper Row Level Security policies:

```sql
-- Enable RLS
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to insert (they'll insert their own admin record)
CREATE POLICY "Allow authenticated insert"
ON admins
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- Allow admins to view all admins
CREATE POLICY "Admins can view all admins"
ON admins
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM admins
    WHERE admins.id = auth.uid()
    AND admins.status = 'active'
  )
);

-- Allow super admins to update any admin
CREATE POLICY "Super admins can update admins"
ON admins
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM admins
    WHERE admins.id = auth.uid()
    AND admins.role = 'super_admin'
    AND admins.status = 'active'
  )
);

-- Allow super admins to delete admins
CREATE POLICY "Super admins can delete admins"
ON admins
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM admins
    WHERE admins.id = auth.uid()
    AND admins.role = 'super_admin'
    AND admins.status = 'active'
  )
);
```

---

## 3. How It Works Now

### **Simple Flow:**

1. **Super Admin fills form** with new admin details
2. **Frontend calls** `supabase.auth.signUp()` to create auth user
3. **Frontend inserts** admin record into `admins` table
4. **New admin can log in** immediately with their credentials
5. **Done!** ✅

### **No API Route Needed:**
- ✅ Direct Supabase calls from frontend
- ✅ Simpler code
- ✅ Fewer moving parts
- ✅ Easier to debug

---

## 4. Testing

After setup:

1. **Log in as Super Admin**
2. **Go to Admin Management**
3. **Click "Add Admin"**
4. **Fill in:**
   - Name: Test Admin
   - Email: test@gogreen.rw
   - Password: password123
   - Role: Admin
   - Status: Active
5. **Click "Add Admin"**
6. **Should see:** ✅ Admin created! Email: test@gogreen.rw
7. **Log out and try logging in** with the new credentials

---

## 5. Troubleshooting

### **Error: "User already registered"**
- Email is already in use
- Try a different email

### **Error: "Database error: new row violates row-level security policy"**
- RLS policy is blocking the insert
- Run the SQL policies above
- Make sure the policy allows `auth.uid() = id`

### **Error: "Email confirmations are enabled"**
- Disable email confirmations in Supabase settings
- Or use the auto-confirm trigger above

### **New admin can't log in**
- Check if email confirmation is required
- Verify admin record exists in `admins` table
- Check admin status is 'active'

---

## ✅ Checklist

Before creating admins:

- [ ] Email confirmation disabled (or auto-confirm trigger added)
- [ ] RLS policies set up on `admins` table
- [ ] `admins` table has correct schema
- [ ] Super Admin is logged in
- [ ] Password is at least 8 characters

---

## 🎉 Benefits of This Approach

1. **Simpler** - No API route needed
2. **Faster** - Direct database calls
3. **Easier to debug** - All code in one place
4. **More transparent** - Can see exactly what's happening
5. **Fewer dependencies** - No service role key needed

---

That's it! Super Admin can now create admin accounts directly! 🚀
