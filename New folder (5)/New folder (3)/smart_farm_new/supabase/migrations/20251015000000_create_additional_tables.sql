-- Migration to create additional tables required for the project

CREATE TABLE IF NOT EXISTS public.products (
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

CREATE TABLE IF NOT EXISTS public.transactions (
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

CREATE TABLE IF NOT EXISTS public.bids (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id uuid REFERENCES public.products(id),
    buyer_id uuid REFERENCES public.profiles(id),
    bid_amount numeric NOT NULL,
    status text CHECK (status IN ('pending', 'accepted', 'rejected')) NOT NULL DEFAULT 'pending',
    created_at timestamp with time zone DEFAULT now()
);

-- Enable Row Level Security (RLS) on these tables as needed

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bids ENABLE ROW LEVEL SECURITY;
