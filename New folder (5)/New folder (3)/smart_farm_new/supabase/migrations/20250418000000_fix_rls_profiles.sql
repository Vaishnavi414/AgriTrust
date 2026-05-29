-- Fix RLS for profiles table
-- Run this in Supabase SQL Editor

-- 1. First, disable RLS temporarily to test
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- 2. Test login - if works, re-enable with proper policy
-- 3. Then enable with secure policy:

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Delete any existing restrictive policies
DROP POLICY IF EXISTS "profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Allow public read" ON profiles;

-- Create secure policy: user can only read their own profile
CREATE POLICY "Users can read own profile" ON profiles
FOR SELECT
USING (auth.uid() = id);

-- Allow insert (for registration)
CREATE POLICY "Allow insert" ON profiles
FOR INSERT
WITH CHECK (true);

-- Allow update (for profile edits)
CREATE POLICY "Allow update own" ON profiles
FOR UPDATE
USING (auth.uid() = id);