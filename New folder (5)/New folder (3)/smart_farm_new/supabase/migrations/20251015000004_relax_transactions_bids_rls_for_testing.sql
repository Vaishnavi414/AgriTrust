-- Temporary migration to relax RLS policies on transactions and bids tables for testing

-- Drop existing policies for transactions
DROP POLICY IF EXISTS "Users can view own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Buyers can create transactions" ON public.transactions;

-- Allow all selects on transactions for testing
CREATE POLICY "Allow all selects on transactions for testing"
  ON public.transactions
  FOR SELECT
  USING (true);

-- Allow all inserts on transactions for testing
CREATE POLICY "Allow all inserts on transactions for testing"
  ON public.transactions
  FOR INSERT
  WITH CHECK (true);

-- Allow all updates on transactions for testing
CREATE POLICY "Allow all updates on transactions for testing"
  ON public.transactions
  FOR UPDATE
  USING (true);

-- Drop existing policies for bids
DROP POLICY IF EXISTS "Buyers can create bids" ON public.bids;
DROP POLICY IF EXISTS "Users can view bids on their products or own bids" ON public.bids;
DROP POLICY IF EXISTS "Farmers can update bids on their products" ON public.bids;

-- Allow all selects on bids for testing
CREATE POLICY "Allow all selects on bids for testing"
  ON public.bids
  FOR SELECT
  USING (true);

-- Allow all inserts on bids for testing
CREATE POLICY "Allow all inserts on bids for testing"
  ON public.bids
  FOR INSERT
  WITH CHECK (true);

-- Allow all updates on bids for testing
CREATE POLICY "Allow all updates on bids for testing"
  ON public.bids
  FOR UPDATE
  USING (true);
