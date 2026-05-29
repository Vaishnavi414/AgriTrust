/*
  # Smart Farming Marketplace Database Schema

  ## Overview
  This migration creates the complete database structure for the AI-Enhanced Smart Farming Marketplace.
  It includes tables for user management, product listings, transactions, and blockchain ledger simulation.

  ## New Tables

  ### 1. `profiles`
  Stores user profile information for both farmers and buyers
  - `id` (uuid, primary key) - Links to auth.users
  - `email` (text) - User email
  - `full_name` (text) - User's full name
  - `user_type` (text) - Either 'farmer' or 'buyer'
  - `phone` (text) - Contact number
  - `address` (text) - Physical address
  - `created_at` (timestamptz) - Account creation timestamp

  ### 2. `products`
  Stores crop listings created by farmers
  - `id` (uuid, primary key)
  - `farmer_id` (uuid) - References profiles
  - `crop_name` (text) - Name of the crop
  - `quantity` (numeric) - Amount available (in kg)
  - `unit` (text) - Unit of measurement (default: kg)
  - `ai_suggested_price` (numeric) - AI-generated fair price
  - `farmer_price` (numeric) - Farmer's final asking price
  - `image_url` (text) - Product image URL
  - `description` (text) - Product description
  - `status` (text) - available, sold, pending
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 3. `transactions`
  Records all purchase transactions
  - `id` (uuid, primary key)
  - `farmer_id` (uuid) - References profiles
  - `buyer_id` (uuid) - References profiles
  - `product_id` (uuid) - References products
  - `crop_name` (text) - Crop name snapshot
  - `quantity` (numeric) - Amount purchased
  - `final_price` (numeric) - Agreed upon price
  - `status` (text) - pending, completed, cancelled
  - `transaction_hash` (text) - Simulated blockchain hash
  - `previous_hash` (text) - Links to previous transaction
  - `created_at` (timestamptz)

  ### 4. `bids`
  Stores buyer bid offers on products
  - `id` (uuid, primary key)
  - `product_id` (uuid) - References products
  - `buyer_id` (uuid) - References profiles
  - `bid_amount` (numeric) - Offered price
  - `status` (text) - pending, accepted, rejected
  - `created_at` (timestamptz)

  ## Security
  - Enable RLS on all tables
  - Users can only view their own profile data
  - Farmers can create/edit their own products
  - Buyers can view all available products
  - Users can view transactions they're involved in
  - Buyers can create bids, farmers can view bids on their products
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  user_type text NOT NULL CHECK (user_type IN ('farmer', 'buyer')),
  phone text,
  address text,
  created_at timestamptz DEFAULT now()
);

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  farmer_wallet_address text,
  location text,
  category text,
  upload_date timestamptz DEFAULT now(),
  crop_name text NOT NULL,
  quantity numeric NOT NULL CHECK (quantity > 0),
  unit text DEFAULT 'kg',
  ai_suggested_price numeric NOT NULL CHECK (ai_suggested_price >= 0),
  farmer_price numeric NOT NULL CHECK (farmer_price >= 0),
  image_url text,
  description text,
  status text DEFAULT 'available' CHECK (status IN ('available', 'sold', 'pending')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  buyer_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  product_id uuid REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  crop_name text NOT NULL,
  quantity numeric NOT NULL,
  final_price numeric NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled')),
  transaction_hash text UNIQUE NOT NULL,
  previous_hash text,
  created_at timestamptz DEFAULT now()
);

-- Create bids table
CREATE TABLE IF NOT EXISTS bids (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  buyer_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  bid_amount numeric NOT NULL CHECK (bid_amount > 0),
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE bids ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Products policies
CREATE POLICY "Anyone can view available products"
  ON products FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Farmers can create products"
  ON products FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.user_type = 'farmer'
      AND profiles.id = farmer_id
    )
  );

CREATE POLICY "Farmers can update own products"
  ON products FOR UPDATE
  TO authenticated
  USING (farmer_id = auth.uid())
  WITH CHECK (farmer_id = auth.uid());

CREATE POLICY "Farmers can delete own products"
  ON products FOR DELETE
  TO authenticated
  USING (farmer_id = auth.uid());

-- Transactions policies
CREATE POLICY "Users can view own transactions"
  ON transactions FOR SELECT
  TO authenticated
  USING (auth.uid() = farmer_id OR auth.uid() = buyer_id);

CREATE POLICY "Buyers can create transactions"
  ON transactions FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = buyer_id
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.user_type = 'buyer'
    )
  );

-- Bids policies
CREATE POLICY "Buyers can create bids"
  ON bids FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = buyer_id
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.user_type = 'buyer'
    )
  );

CREATE POLICY "Users can view bids on their products or own bids"
  ON bids FOR SELECT
  TO authenticated
  USING (
    auth.uid() = buyer_id
    OR EXISTS (
      SELECT 1 FROM products
      WHERE products.id = bids.product_id
      AND products.farmer_id = auth.uid()
    )
  );

CREATE POLICY "Farmers can update bids on their products"
  ON bids FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM products
      WHERE products.id = bids.product_id
      AND products.farmer_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM products
      WHERE products.id = bids.product_id
      AND products.farmer_id = auth.uid()
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_farmer_id ON products(farmer_id);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_transactions_farmer_id ON transactions(farmer_id);
CREATE INDEX IF NOT EXISTS idx_transactions_buyer_id ON transactions(buyer_id);
CREATE INDEX IF NOT EXISTS idx_bids_product_id ON bids(product_id);
CREATE INDEX IF NOT EXISTS idx_bids_buyer_id ON bids(buyer_id);