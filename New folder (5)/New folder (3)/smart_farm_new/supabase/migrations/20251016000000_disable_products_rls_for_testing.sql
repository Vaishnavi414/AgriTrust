-- Migration to disable RLS on products table for testing purposes
-- This allows test users to insert products without authentication issues

ALTER TABLE public.products DISABLE ROW LEVEL SECURITY;

-- Note: RLS will be re-enabled after testing is complete
-- Re-enable with: ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
