-- Add on-chain purchase ID column to purchases table
-- Run this in Supabase SQL Editor

ALTER TABLE public.purchases ADD COLUMN IF NOT EXISTS purchase_id_onchain text;