-- Migration: Add web3 fields to book_orders
-- Date: 2026-04-11

ALTER TABLE book_orders
  ADD COLUMN tx_hash        TEXT UNIQUE
    CHECK (tx_hash IS NULL OR tx_hash ~* '^0x[0-9a-f]{64}$'),
  ADD COLUMN wallet_address TEXT
    CHECK (wallet_address IS NULL OR wallet_address ~* '^0x[0-9a-fA-F]{40}$'),
  ADD COLUMN amazon_tracking TEXT,
  ADD COLUMN amount_u       NUMERIC;

CREATE INDEX idx_book_orders_tx_hash ON book_orders(tx_hash) WHERE tx_hash IS NOT NULL;
CREATE INDEX idx_book_orders_wallet  ON book_orders(wallet_address) WHERE wallet_address IS NOT NULL;
