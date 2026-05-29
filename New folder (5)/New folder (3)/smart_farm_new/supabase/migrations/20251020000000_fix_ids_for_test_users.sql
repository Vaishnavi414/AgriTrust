-- Fix for user IDs and products table
-- Run this in Supabase SQL Editor

DROP TABLE IF EXISTS public.bids CASCADE;
DROP TABLE IF EXISTS public.transactions CASCADE;
DROP TABLE IF EXISTS public.products CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

CREATE TABLE public.profiles (
    id text PRIMARY KEY,
    email text UNIQUE NOT NULL,
    full_name text,
    user_type text CHECK (user_type IN ('farmer', 'buyer')),
    phone text,
    address text,
    wallet_balance numeric DEFAULT 0,
    created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.products (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    farmer_id text REFERENCES public.profiles(id),
    farmer_wallet_address text,
    location text,
    category text,
    upload_date timestamp with time zone DEFAULT now(),
    crop_name text NOT NULL,
    quantity integer NOT NULL,
    unit text NOT NULL,
    ai_suggested_price numeric NOT NULL,
    farmer_price numeric NOT NULL,
    image_url text,
    description text,
    status text CHECK (status IN ('available', 'sold', 'pending')) NOT NULL DEFAULT 'available',
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.transactions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    farmer_id text REFERENCES public.profiles(id),
    buyer_id text REFERENCES public.profiles(id),
    product_id uuid REFERENCES public.products(id),
    crop_name text NOT NULL,
    quantity integer NOT NULL,
    final_price numeric NOT NULL,
    status text CHECK (status IN ('pending', 'completed', 'cancelled')) NOT NULL DEFAULT 'pending',
    transaction_hash text NOT NULL,
    previous_hash text,
    onchain_hash text,
    created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.bids (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id uuid REFERENCES public.products(id),
    buyer_id text REFERENCES public.profiles(id),
    bid_amount numeric NOT NULL,
    status text CHECK (status IN ('pending', 'accepted', 'rejected')) NOT NULL DEFAULT 'pending',
    created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.products DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.bids DISABLE ROW LEVEL SECURITY;
