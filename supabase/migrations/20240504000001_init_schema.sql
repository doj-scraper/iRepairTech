-- =========================================
-- INVENTORY
-- =========================================

create table public.inventory_parts (
  id uuid primary key default gen_random_uuid(),
  sku text unique not null,
  name text not null,
  description text,
  image_url text,
  price_cents integer not null check (price_cents > 0),
  stock_count integer not null default 0 check (stock_count >= 0),
  moq integer not null default 1 check (moq >= 1),
  is_active boolean not null default true,
  created_at timestamptz default now()
);

create table public.repair_services (
  id uuid primary key default gen_random_uuid(),
  sku text unique not null,
  name text not null,
  description text,
  image_url text,
  price_cents integer not null check (price_cents > 0),
  estimated_hours numeric(4,2),
  is_active boolean not null default true,
  created_at timestamptz default now()
);

-- =========================================
-- PROFILES
-- =========================================

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  role text not null default 'customer',
  created_at timestamptz default now()
);
