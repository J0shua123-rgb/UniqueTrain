-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create menu_items table
CREATE TABLE IF NOT EXISTS menu_items (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('All', 'Pastries', 'Savory Snacks', 'Sweet Treats', 'Drinks & Sides')),
  price NUMERIC NOT NULL CHECK (price >= 0),
  description TEXT NOT NULL,
  image_url TEXT NOT NULL,
  in_stock BOOLEAN NOT NULL DEFAULT true,
  is_popular BOOLEAN DEFAULT false,
  preparation_time TEXT,
  order_count INTEGER DEFAULT 0 CHECK (order_count >= 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create store_settings table
CREATE TABLE IF NOT EXISTS store_settings (
  id TEXT PRIMARY KEY DEFAULT 'default',
  shop_name TEXT NOT NULL,
  tagline TEXT NOT NULL,
  whatsapp_number TEXT NOT NULL,
  address TEXT NOT NULL,
  opening_hours TEXT NOT NULL,
  currency_symbol TEXT NOT NULL DEFAULT 'GH₵',
  delivery_fee NUMERIC NOT NULL DEFAULT 0 CHECK (delivery_fee >= 0),
  admin_pin TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on category for faster filtering
CREATE INDEX IF NOT EXISTS idx_menu_items_category ON menu_items(category);

-- Create index on in_stock for faster filtering
CREATE INDEX IF NOT EXISTS idx_menu_items_in_stock ON menu_items(in_stock);

-- Create index on order_count for popularity sorting
CREATE INDEX IF NOT EXISTS idx_menu_items_order_count ON menu_items(order_count DESC);

-- Enable Row Level Security
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_settings ENABLE ROW LEVEL SECURITY;

-- Allow public read access for menu items (for customers)
CREATE POLICY "Allow public read access to menu items"
  ON menu_items FOR SELECT
  TO public
  USING (true);

-- Allow public read access to store settings (for customers)
CREATE POLICY "Allow public read access to store settings"
  ON store_settings FOR SELECT
  TO public
  USING (true);

-- Allow service_role to insert/update/delete menu items (for admin via server-side)
-- Note: For client-side admin, you would create specific policies with auth checks
CREATE POLICY "Allow service role full access to menu items"
  ON menu_items FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow service role full access to store settings"
  ON store_settings FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Insert default store settings
INSERT INTO store_settings (id, shop_name, tagline, whatsapp_number, address, opening_hours, currency_symbol, delivery_fee, admin_pin)
VALUES (
  'default',
  'UniqueTrain',
  'Freshly Baked Pastries & Crunchy Local Snacks',
  '+233557448975',
  'Diamond-City, Happy Home',
  'Mon - Sat: 8:00 AM - 8:30 PM',
  'GH₵',
  15.0,
  '1234'
)
ON CONFLICT (id) DO NOTHING;

-- Insert initial menu items
INSERT INTO menu_items (id, name, category, price, description, image_url, in_stock, is_popular, preparation_time, order_count) VALUES
  ('snack-1', 'Flaky Beef Meat Pie', 'Pastries', 18.0, 'Golden-baked golden crust stuffed with savory minced beef, potatoes, carrots, and aromatic spices.', 'https://images.unsplash.com/photo-1621236378699-8597fee6a1ce?auto=format&fit=crop&w=800&q=80', true, true, 'Ready', 142),
  ('snack-2', 'Sugar-Glazed Jam Doughnut', 'Sweet Treats', 12.0, 'Soft, fluffy ring doughnut with sweet powdered sugar glaze and a rich strawberry jam center.', 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=800&q=80', true, true, 'Ready', 118),
  ('snack-3', 'Choc-Chip Chunk Cookies (Pack of 3)', 'Sweet Treats', 15.0, 'Chewy in the center, crisp at the edges, loaded with dark chocolate chunks and a touch of vanilla.', 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?auto=format&fit=crop&w=800&q=80', true, false, 'Ready', 86),
  ('snack-4', 'Crispy Seasoned Potato Chips', 'Savory Snacks', 10.0, 'Crunchy golden hand-cut potato crisps dusted with house spiced paprika and sea salt seasoning.', 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?auto=format&fit=crop&w=800&q=80', true, true, '5 mins', 165),
  ('snack-5', 'Spiced Plantain Chips (Kelewele Style)', 'Savory Snacks', 12.0, 'Crispy fried ripe plantain slices tossed with crushed ginger, chili pepper, and aromatic cloves.', 'https://images.unsplash.com/photo-1528751014936-863e6e7a319c?auto=format&fit=crop&w=800&q=80', true, true, 'Ready', 198),
  ('snack-6', 'Crisp Beef Spring Rolls (3 pcs)', 'Savory Snacks', 20.0, 'Ultra-crispy wrapper filled with seasoned shredded beef, spring onions, and sweet cabbage.', 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80', true, false, '8 mins', 74),
  ('snack-7', 'Golden Puff Sausage Roll', 'Pastries', 14.0, 'Succulent seasoned beef sausage wrapped in flaky, buttery golden puff pastry layers.', 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80', false, false, 'Ready', 62),
  ('snack-8', 'Traditional Warm Bofrot (4 pcs)', 'Sweet Treats', 10.0, 'Golden fried West African puff-puff with a sweet cardamom-nutmeg aroma, pillowy and warm.', 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=800&q=80', true, true, 'Ready', 210),
  ('snack-9', 'Chilled Spiced Sobolo Juice', 'Drinks & Sides', 10.0, 'Cold-pressed hibiscus tea infused with fresh ginger, pineapple essence, and natural cloves.', 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=800&q=80', true, false, 'Chilled', 95)
ON CONFLICT (id) DO NOTHING;
