-- Migration: Freedom of Money book order submissions
-- Date: 2026-04-10

CREATE TABLE book_orders (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  full_name      TEXT        NOT NULL CHECK (char_length(full_name) BETWEEN 1 AND 200),
  email          TEXT        NOT NULL CHECK (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' AND char_length(email) <= 320),
  phone          TEXT        CHECK (phone IS NULL OR char_length(phone) <= 30),
  address_line1  TEXT        NOT NULL CHECK (char_length(address_line1) BETWEEN 1 AND 300),
  address_line2  TEXT        CHECK (address_line2 IS NULL OR char_length(address_line2) <= 300),
  city           TEXT        NOT NULL CHECK (char_length(city) BETWEEN 1 AND 100),
  state_province TEXT        CHECK (state_province IS NULL OR char_length(state_province) <= 100),
  postal_code    TEXT        NOT NULL CHECK (char_length(postal_code) BETWEEN 1 AND 20),
  country        TEXT        NOT NULL CHECK (char_length(country) BETWEEN 1 AND 100),
  notes          TEXT        CHECK (notes IS NULL OR char_length(notes) <= 1000),
  status         TEXT        NOT NULL DEFAULT 'pending'
                             CHECK (status IN ('pending', 'ordered', 'shipped', 'delivered', 'cancelled'))
);

CREATE INDEX idx_book_orders_created  ON book_orders(created_at DESC);
CREATE INDEX idx_book_orders_status   ON book_orders(status);
CREATE INDEX idx_book_orders_email    ON book_orders(email);

-- Rate limit helper: check if same email submitted in last 60 seconds
CREATE OR REPLACE FUNCTION check_book_order_rate_limit(p_email TEXT)
RETURNS BOOLEAN LANGUAGE sql STABLE AS $$
  SELECT EXISTS (
    SELECT 1 FROM book_orders
    WHERE email = lower(p_email)
      AND created_at > NOW() - INTERVAL '60 seconds'
  );
$$;

-- RLS: only service_role (server) can read/write. No public/anon access.
ALTER TABLE book_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_role_all" ON book_orders
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);
