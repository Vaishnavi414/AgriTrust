-- Temporary migration to relax RLS policies on profiles table for testing inserts

-- Drop existing policies
DROP POLICY IF EXISTS "Allow users to insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow users to select their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow users to update their own profile" ON public.profiles;

-- Allow all inserts regardless of user - for testing ONLY
CREATE POLICY "Allow all inserts on profiles for testing"  
  ON public.profiles  
  FOR INSERT  
  WITH CHECK (true);

-- Allow all selects for testing
CREATE POLICY "Allow all selects on profiles for testing"  
  ON public.profiles  
  FOR SELECT  
  USING (true);

-- Allow all updates for testing
CREATE POLICY "Allow all updates on profiles for testing"  
  ON public.profiles  
  FOR UPDATE  
  USING (true);
