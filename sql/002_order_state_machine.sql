-- =========================================
-- ORDER STATE ENUM
-- =========================================

create type public.order_status as enum (
  'pending',
  'paid',
  'fulfilled',
  'refunded',
  'expired'
);

-- =========================================
-- ORDERS
-- =========================================

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id),
  stripe_session_id text unique not null,
  total_cents integer not null,
  status order_status not null default 'pending',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_orders_user on public.orders(user_id);
create index idx_orders_status on public.orders(status);
create index idx_orders_stripe_session on public.orders(stripe_session_id);

-- =========================================
-- ORDER ITEMS (PARTS)
-- =========================================

create table public.order_items_parts (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.orders(id) on delete cascade,
  part_id uuid references public.inventory_parts(id),
  quantity integer not null check (quantity > 0),
  price_cents integer not null
);

create index idx_order_items_parts_order on public.order_items_parts(order_id);

-- =========================================
-- ORDER ITEMS (SERVICES)
-- =========================================

create table public.order_items_services (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.orders(id) on delete cascade,
  service_id uuid references public.repair_services(id),
  price_cents integer not null
);

create index idx_order_items_services_order on public.order_items_services(order_id);
