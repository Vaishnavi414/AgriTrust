-- Migration to add missing product metadata columns
-- Ensures the products table supports location, category, and upload_date for new uploads.

ALTER TABLE IF EXISTS public.products
  ADD COLUMN IF NOT EXISTS location text,
  ADD COLUMN IF NOT EXISTS category text,
  ADD COLUMN IF NOT EXISTS upload_date timestamptz DEFAULT now();
