-- Add withdrawn column to purchases table
-- Run this in Supabase SQL Editor

ALTER TABLE public.purchases ADD COLUMN IF NOT EXISTS withdrawn boolean DEFAULT false;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_purchases_farmer_withdrawn 
ON public.purchases (farmer_address, withdrawn) 
WHERE withdrawn = false;