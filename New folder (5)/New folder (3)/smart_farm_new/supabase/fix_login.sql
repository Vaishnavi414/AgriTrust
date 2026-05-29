-- Run this in Supabase SQL Editor to fix login

-- Drop existing function if exists
DROP FUNCTION IF EXISTS public.get_profile_by_email(text);

-- Create the function
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
    p.id,
    p.email,
    p.full_name,
    p.user_type,
    p.phone,
    p.address,
    p.wallet_balance,
    p.farmer_wallet_address,
    p.created_at
  FROM profiles p
  WHERE p.email = email_input;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.get_profile_by_email TO anon;
GRANT EXECUTE ON FUNCTION public.get_profile_by_email TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_profile_by_email TO service_role;

-- Verify it works
SELECT * FROM public.get_profile_by_email('test@test.com');