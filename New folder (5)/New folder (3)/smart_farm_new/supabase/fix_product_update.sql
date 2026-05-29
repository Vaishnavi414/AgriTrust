-- Fix for product quantity update issue
-- Run this in Supabase SQL Editor

-- 1. First, let's check if RLS is enabled on products table
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'products';

-- 2. Check current policies on products table
SELECT * FROM pg_policies WHERE tablename = 'products';

-- 3. Disable RLS on products table (for testing - more secure: add proper policies)
ALTER TABLE products DISABLE ROW LEVEL SECURITY;

-- 4. Or add update permission for all users (if you want to keep RLS)
-- Drop existing update policies if they exist
DROP POLICY IF EXISTS "Allow all users to update products" ON products;

-- Create a policy that allows authenticated users to update any product
CREATE POLICY "Allow all authenticated users to update products" ON products
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- 5. Also ensure insert and select work
DROP POLICY IF EXISTS "Allow all users to select products" ON products;
CREATE POLICY "Allow all users to select products" ON products
    FOR SELECT
    TO authenticated
    USING (true);

DROP POLICY IF EXISTS "Allow all users to insert products" ON products;
CREATE POLICY "Allow all users to insert products" ON products
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- 6. Test if update works now - run this in SQL Editor:
-- UPDATE products SET quantity = 4 WHERE crop_name = 'pumpkin';
-- SELECT * FROM products WHERE crop_name = 'pumpkin';