-- Complete database setup for Smart Farm app

-- Create profiles table
DROP TABLE IF EXISTS public.profiles CASCADE;

CREATE TABLE public.profiles (
    id uuid PRIMARY KEY,
    email text UNIQUE NOT NULL,
    full_name text,
    user_type text CHECK (user_type IN ('farmer', 'buyer')),
    phone text,
    address text,
    wallet_balance numeric DEFAULT 0,
    farmer_wallet_address text,
    created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS and create policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all inserts on profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow all selects on profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow all updates on profiles" ON public.profiles;

CREATE POLICY "Allow all inserts on profiles" ON public.profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all selects on profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Allow all updates on profiles" ON public.profiles FOR UPDATE USING (true);

-- Create products table
DROP TABLE IF EXISTS public.products CASCADE;

CREATE TABLE public.products (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    farmer_id uuid REFERENCES public.profiles(id),
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

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all on products" ON public.products;
CREATE POLICY "Allow all on products" ON public.products FOR ALL USING (true);

-- Create transactions table
DROP TABLE IF EXISTS public.transactions CASCADE;

CREATE TABLE public.transactions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    farmer_id uuid REFERENCES public.profiles(id),
    buyer_id uuid REFERENCES public.profiles(id),
    product_id uuid REFERENCES public.products(id),
    crop_name text NOT NULL,
    quantity integer NOT NULL,
    final_price numeric NOT NULL,
    status text CHECK (status IN ('pending', 'completed', 'cancelled')) NOT NULL DEFAULT 'pending',
    transaction_hash text NOT NULL,
    previous_hash text,
    created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all on transactions" ON public.transactions;
CREATE POLICY "Allow all on transactions" ON public.transactions FOR ALL USING (true);

-- Create bids table
DROP TABLE IF EXISTS public.bids CASCADE;

CREATE TABLE public.bids (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id uuid REFERENCES public.products(id),
    buyer_id uuid REFERENCES public.profiles(id),
    bid_amount numeric NOT NULL,
    status text CHECK (status IN ('pending', 'accepted', 'rejected')) NOT NULL DEFAULT 'pending',
    created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.bids ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all on bids" ON public.bids;
CREATE POLICY "Allow all on bids" ON public.bids FOR ALL USING (true);

-- Verify tables created
SELECT 'profiles' as table_name, COUNT(*) as count FROM public.profiles
UNION ALL
SELECT 'products', COUNT(*) FROM public.products
UNION ALL
SELECT 'transactions', COUNT(*) FROM public.transactions
UNION ALL
SELECT 'bids', COUNT(*) FROM public.bids;