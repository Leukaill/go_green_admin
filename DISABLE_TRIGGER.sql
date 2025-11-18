-- Disable the trigger that's causing duplicates
-- Run this in Supabase SQL Editor

-- Drop the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Drop the function
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Done! Now the API will handle creating admin records without conflicts
