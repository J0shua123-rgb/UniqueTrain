-- Create orders table for tracking customer orders
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_name TEXT NOT NULL,
  momo_reference TEXT NOT NULL,
  phone TEXT,
  order_type TEXT DEFAULT 'pickup' CHECK (order_type IN ('pickup', 'delivery')),
  delivery_address TEXT,
  special_instructions TEXT,
  total_amount NUMERIC NOT NULL CHECK (total_amount >= 0),
  items JSONB NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on status for filtering
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);

-- Create index on created_at for sorting
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);

-- Create index on momo_reference for quick lookup
CREATE INDEX IF NOT EXISTS idx_orders_momo_reference ON orders(momo_reference);

-- Enable Row Level Security
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Allow public read access for orders (for admin dashboard via client-side)
-- Note: In production, you should restrict this to authenticated admin users
CREATE POLICY "Allow public read access to orders"
  ON orders FOR SELECT
  TO public
  USING (true);

-- Allow public insert access to orders (for checkout process)
CREATE POLICY "Allow public insert access to orders"
  ON orders FOR INSERT
  TO public
  WITH CHECK (true);

-- Allow service role full access to orders
CREATE POLICY "Allow service role full access to orders"
  ON orders FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
