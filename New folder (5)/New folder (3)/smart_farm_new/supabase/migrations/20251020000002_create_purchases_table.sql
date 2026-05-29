-- Create purchases table for blockchain transactions
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS public.purchases (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    buyer_id uuid NOT NULL,
    product_id uuid NOT NULL,
    crop_name text NOT NULL,
    quantity numeric NOT NULL,
    price_paid_eth numeric NOT NULL,
    price_paid_inr numeric NOT NULL,
    transaction_hash text NOT NULL,
    farmer_address text NOT NULL,
    status text DEFAULT 'completed',
    created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;

-- Create policies for all operations
DROP POLICY IF EXISTS "Allow all inserts on purchases" ON public.purchases;
DROP POLICY IF EXISTS "Allow all selects on purchases" ON public.purchases;
DROP POLICY IF EXISTS "Allow all updates on purchases" ON public.purchases;

CREATE POLICY "Allow all inserts on purchases" ON public.purchases FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all selects on purchases" ON public.purchases FOR SELECT USING (true);
CREATE POLICY "Allow all updates on purchases" ON public.purchases FOR UPDATE USING (true);