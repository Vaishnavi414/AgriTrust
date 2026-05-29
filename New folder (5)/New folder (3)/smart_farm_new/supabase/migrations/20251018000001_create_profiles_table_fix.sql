-- Complete fix for profiles table
-- Run this in Supabase SQL Editor to fix account creation

-- Drop existing profiles table if it exists (to recreate with correct schema)
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Create profiles table without foreign key constraint to auth.users
CREATE TABLE public.profiles (
    id uuid PRIMARY KEY,
    email text UNIQUE NOT NULL,
    full_name text,
    user_type text CHECK (user_type IN ('farmer', 'buyer')),
    phone text,
    address text,
    wallet_balance numeric DEFAULT 0,
    created_at timestamp with time zone DEFAULT now()
);

-- Disable RLS for testing (allows test users to be created)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies to allow all operations for testing
DROP POLICY IF EXISTS "Allow all inserts on profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow all selects on profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow all updates on profiles" ON public.profiles;

CREATE POLICY "Allow all inserts on profiles" ON public.profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all selects on profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Allow all updates on profiles" ON public.profiles FOR UPDATE USING (true);

-- Verify the table was created
SELECT * FROM public.profiles LIMIT 0;
