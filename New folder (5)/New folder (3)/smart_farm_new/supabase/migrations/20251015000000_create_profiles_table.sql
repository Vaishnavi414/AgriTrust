-- Migration to create the profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
    id uuid PRIMARY KEY NOT NULL,
    email text UNIQUE NOT NULL,
    full_name text,
    user_type text CHECK (user_type IN ('farmer', 'buyer')),
    phone text,
    address text,
    created_at timestamp with time zone DEFAULT now()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policy to allow authenticated users to select their own profile
CREATE POLICY "Allow individual users to select their own profile"
    ON public.profiles
    FOR SELECT
    USING (auth.uid() = id);

-- Create policy to allow authenticated users to insert their own profile
CREATE POLICY "Allow individual users to insert their own profile"
    ON public.profiles
    FOR INSERT
    WITH CHECK (auth.uid() = id);

-- Create policy to allow individual users to update their own profile
CREATE POLICY "Allow individual users to update their own profile"
    ON public.profiles
    FOR UPDATE
    USING (auth.uid() = id);
