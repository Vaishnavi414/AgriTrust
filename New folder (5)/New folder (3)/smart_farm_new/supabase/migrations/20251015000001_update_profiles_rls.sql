-- Migration to adjust RLS policies on profiles table to allow inserts

-- Drop existing policies if any
DROP POLICY IF EXISTS "Allow individual users to insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow individual users to select their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow individual users to update their own profile" ON public.profiles;

-- Enable Row Level Security (RLS) if not enabled
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to insert their own profile
CREATE POLICY "Allow users to insert their own profile"
    ON public.profiles
    FOR INSERT
    WITH CHECK (auth.uid() = id);

-- Create policy to allow users to select their own profile
CREATE POLICY "Allow users to select their own profile"
    ON public.profiles
    FOR SELECT
    USING (auth.uid() = id);

-- Create policy to allow users to update their own profile
CREATE POLICY "Allow users to update their own profile"
    ON public.profiles
    FOR UPDATE
    USING (auth.uid() = id);
