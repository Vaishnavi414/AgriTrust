-- Migration to add onchain_hash column to transactions table

ALTER TABLE transactions
ADD COLUMN onchain_hash text;
