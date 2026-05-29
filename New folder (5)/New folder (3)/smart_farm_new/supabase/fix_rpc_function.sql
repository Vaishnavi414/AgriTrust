-- Run this in Supabase SQL Editor - FIX FUNCTION

-- 1. Remove old broken function
DROP FUNCTION IF EXISTS public.get_profile_by_email(text);

-- 2. Create correct function with proper type casting (ID IS UUID → CAST TO TEXT)
CREATE FUNCTION public.get_profile_by_email(email_input text)
RETURNS TABLE (
  id text,
  email text,
  full_name text,
  user_type text,
  phone text,
  address text,
  wallet_balance numeric,
  farmer_wallet_address text,
  created_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id::text,  -- ✅ FIX: cast uuid to text
    p.email,
    p.full_name,
    p.user_type,
    p.phone,
    p.address,
    p.wallet_balance,
    p.farmer_wallet_address,
    p.created_at
  FROM profiles p
  WHERE LOWER(p.email) = LOWER(email_input);
END;
$$;

-- 3. Grant permissions
GRANT EXECUTE ON FUNCTION public.get_profile_by_email TO anon;
GRANT EXECUTE ON FUNCTION public.get_profile_by_email TO authenticated;

-- 4. Test it
SELECT * FROM public.get_profile_by_email('veena@gmail.com');