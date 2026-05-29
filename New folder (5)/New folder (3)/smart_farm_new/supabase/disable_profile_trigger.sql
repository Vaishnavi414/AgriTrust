-- Drop the automatic profile creation trigger
-- This can cause slow sign-ups or deadlocks in some cases.
-- We now create profiles directly from the client after sign-up.
-- Run this in Supabase SQL Editor.

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
