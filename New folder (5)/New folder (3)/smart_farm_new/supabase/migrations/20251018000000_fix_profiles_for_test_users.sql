-- Migration to fix profiles table for test users
-- This removes the foreign key constraint to auth.users and adds wallet_balance

-- Drop foreign key constraint if it exists (PostgreSQL syntax)
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;

-- Add wallet_balance column if it doesn't exist
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS wallet_balance numeric DEFAULT 0;

-- Ensure RLS is disabled for testing
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
