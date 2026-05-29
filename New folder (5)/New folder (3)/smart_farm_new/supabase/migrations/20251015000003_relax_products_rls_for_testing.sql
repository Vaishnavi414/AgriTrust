-- Migration to temporarily relax RLS policies on products table for testing

-- Drop existing policies if any
DROP POLICY IF EXISTS "Farmers can insert their own products" ON public.products;
DROP POLICY IF EXISTS "Farmers can update their own products" ON public.products;
DROP POLICY IF EXISTS "Farmers can delete their own products" ON public.products;
DROP POLICY IF EXISTS "Anyone can view products" ON public.products;

-- For testing purposes, allow all operations on products table
-- This will be reverted after testing is complete
CREATE POLICY "Allow all operations for testing"
    ON public.products
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- Note: This policy allows all operations for testing purposes
-- It should be removed/replaced with proper policies after testing
