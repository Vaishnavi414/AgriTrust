-- DIAGNOSTIC: Run this to see what's wrong
-- Copy output and share it if you need further help

-- Check if profiles table exists and its columns
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'profiles'
ORDER BY ordinal_position;

-- Check RLS status
SELECT tablename, relrowsecurity
FROM pg_class c
JOIN information_schema.tables t ON c.relname = t.table_name
WHERE t.table_name = 'profiles';

-- Check existing RLS policies
SELECT schemaname, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'profiles';

-- Check if any profiles exist
SELECT COUNT(*) as profile_count FROM public.profiles;

-- Try inserting a test profile (will show error if RLS blocks)
INSERT INTO public.profiles (id, email, full_name, user_type, wallet_balance)
VALUES ('00000000-0000-0000-0000-000000000001', 'diagnostic@test.com', 'Diagnostic', 'buyer', 10000)
ON CONFLICT (id) DO NOTHING;

-- Cleanup test
DELETE FROM public.profiles WHERE email = 'diagnostic@test.com';
