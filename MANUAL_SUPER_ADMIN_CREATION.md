# Manual Super Admin Creation (Workaround)

Since the automatic signup is having database trigger conflicts, here's how to create your first super admin manually:

## Step 1: Create Auth User in Supabase Dashboard

1. Go to **Supabase Dashboard** → **Authentication** → **Users**
2. Click **"Add User"**
3. Fill in:
   - **Email**: `leukodelabs@gmail.com` (or your preferred email)
   - **Password**: Create a strong password (min 8 characters)
   - **Auto Confirm User**: ✅ **CHECK THIS BOX**
4. Click **"Create User"**
5. **Copy the User ID** that appears (looks like: `550e8400-e29b-41d4-a716-446655440000`)

## Step 2: Insert into Admins Table

1. Go to **SQL Editor** in Supabase
2. Run this SQL (replace `YOUR-USER-ID` with the ID from Step 1):

```sql
INSERT INTO admins (id, email, name, role, status)
VALUES (
  'YOUR-USER-ID-HERE',  -- Replace with actual user ID from Step 1
  'leukodelabs@gmail.com',
  'Super Admin',
  'super_admin',
  'active'
);
```

## Step 3: Login

1. Go to `http://localhost:3001/login`
2. Enter your email and password
3. Click "Super Admin Sign In"
4. You're in! 🎉

## After Login

Once you're logged in as super admin, you can:
- Use the Admin Management page to create other admins
- The signup button will disappear (since super admin exists)
- Manage the entire system

---

**This is a one-time manual process. After this, you can create other admins through the UI!**
