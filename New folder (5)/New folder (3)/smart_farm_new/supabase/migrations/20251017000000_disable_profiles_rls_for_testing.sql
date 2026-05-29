-- Migration to disable RLS on profiles table for testing purposes
-- This allows test users to be created without authentication issues

ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- Note: RLS will be re-enabled after testing is complete
-- Re-enable with: ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
