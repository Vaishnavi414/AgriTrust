-- Add indexes for better query performance
-- Run these in Supabase SQL Editor

-- Products table indexes
CREATE INDEX IF NOT EXISTS idx_products_status_created_at ON public.products(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_products_farmer_id ON public.products(farmer_id);

-- Transactions table indexes
CREATE INDEX IF NOT EXISTS idx_transactions_buyer_id ON public.transactions(buyer_id);
CREATE INDEX IF NOT EXISTS idx_transactions_farmer_id ON public.transactions(farmer_id);
CREATE INDEX IF NOT EXISTS idx_transactions_product_id ON public.transactions(product_id);

-- Purchases table indexes (if exists)
CREATE INDEX IF NOT EXISTS idx_purchases_buyer_id ON public.purchases(buyer_id);
CREATE INDEX IF NOT EXISTS idx_purchases_farmer_id ON public.purchases(farmer_id);
CREATE INDEX IF NOT EXISTS idx_purchases_product_id ON public.purchases(product_id);

-- Bids table indexes
CREATE INDEX IF NOT EXISTS idx_bids_product_id ON public.bids(product_id);
CREATE INDEX IF NOT EXISTS idx_bids_buyer_id ON public.bids(buyer_id);
CREATE INDEX IF NOT EXISTS idx_bids_status ON public.bids(status);

-- Faster email lookup for profile
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
