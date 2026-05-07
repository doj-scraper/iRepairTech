-- Seed iPhone Screen INCELL product
-- Covers iPhone 8 through iPhone 17 Pro Max

INSERT INTO public.inventory_parts (
  sku,
  name,
  description,
  image_url,
  price_cents,
  stock_count,
  moq,
  is_active
) VALUES (
  'IPHONE-SCREEN-INCELL-001',
  'iPhone Screen INCELL',
  'High-quality INCELL display replacement for iPhone 8, 8 Plus, X, XR, XS, XS Max, 11, 11 Pro, 11 Pro Max, 12, 12 Mini, 12 Pro, 12 Pro Max, 13, 13 Mini, 13 Pro, 13 Pro Max, 14, 14 Plus, 14 Pro, 14 Pro Max, 15, 15 Plus, 15 Pro, 15 Pro Max, 16, 16 Plus, 16 Pro, 16 Pro Max, 17, 17 Plus, 17 Pro, and 17 Pro Max. Premium INCELL technology with excellent color accuracy and touch sensitivity.',
  '/iphone-screen-incell.png',
  8500,
  250,
  10,
  true
) ON CONFLICT (sku) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  image_url = EXCLUDED.image_url,
  price_cents = EXCLUDED.price_cents,
  stock_count = EXCLUDED.stock_count,
  moq = EXCLUDED.moq,
  is_active = EXCLUDED.is_active;
