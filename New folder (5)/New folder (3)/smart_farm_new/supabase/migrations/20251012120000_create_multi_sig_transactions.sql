-- Migration script to add multi_sig_transactions table for multi-signature transaction support

CREATE TABLE multi_sig_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id varchar(255) NOT NULL,
  buyer_id varchar(255) NOT NULL,
  product_id varchar(255) NOT NULL,
  crop_name varchar(255) NOT NULL,
  quantity int NOT NULL,
  final_price numeric NOT NULL,
  required_signatures int NOT NULL,
  collected_signatures text[] DEFAULT '{}',
  status varchar(10) NOT NULL DEFAULT 'pending', -- pending, approved, rejected
  transaction_hash varchar(64) NOT NULL,
  created_at timestamptz NOT NULL DEFAULT NOW(),
  updated_at timestamptz NOT NULL DEFAULT NOW()
);

-- Index on status for efficient querying
CREATE INDEX idx_multi_sig_status ON multi_sig_transactions(status);
