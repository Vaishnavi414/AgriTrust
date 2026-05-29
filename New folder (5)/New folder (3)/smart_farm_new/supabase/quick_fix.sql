-- Run this in Supabase SQL Editor - FULL FIX

-- 1. Disable RLS on profiles table (quick fix)
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- 2. Verify it's disabled
SELECT relname, relrowsecurity FROM pg_class WHERE relname = 'profiles';

-- 3. Test querying
SELECT * FROM profiles LIMIT 1;