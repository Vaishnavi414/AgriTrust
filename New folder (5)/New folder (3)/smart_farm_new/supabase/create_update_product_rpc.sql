-- Create RPC function to update product quantity
-- Run this in Supabase SQL Editor

-- Drop function if exists
DROP FUNCTION IF EXISTS update_product_quantity(uuid, numeric, text);

-- Create function to update product quantity
CREATE OR REPLACE FUNCTION update_product_quantity(
    p_id UUID,
    p_quantity NUMERIC,
    p_status TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE products
    SET quantity = p_quantity, status = p_status, updated_at = NOW()
    WHERE id = p_id;
    
    RETURN FOUND;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION update_product_quantity TO authenticated;
GRANT EXECUTE ON FUNCTION update_product_quantity TO anon;
GRANT EXECUTE ON FUNCTION update_product_quantity TO service_role;

-- Test it:
-- SELECT update_product_quantity('4a2b708e-6cc4-4869-9cb3-9bb87f9e5c1e', 4, 'available');

-- Verify:
-- SELECT * FROM products WHERE id = '4a2b708e-6cc4-4869-9cb3-9bb87f9e5c1e';