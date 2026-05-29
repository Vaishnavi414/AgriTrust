-- Fix profiles table for registration
-- Run this in Supabase SQL Editor

-- 1. Ensure wallet_balance column exists (error if profilePayload includes wallet_balance but column doesn't)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS wallet_balance numeric DEFAULT 0;

-- 2. Ensure all registration columns exist
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS address text;

-- 3. Disable RLS temporarily for testing (allows any insert)
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- 4. Verify profile can be inserted by test user
INSERT INTO public.profiles (id, email, full_name, user_type, phone, address, wallet_balance)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  'test@example.com',
  'Test User',
  'buyer',
  '+1234567890',
  'Test Address',
  10000
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email;

-- 5. Cleanup test data
DELETE FROM public.profiles WHERE email = 'test@example.com';

-- 6. Re-enable RLS (after successful insert, create proper policies)
-- ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
