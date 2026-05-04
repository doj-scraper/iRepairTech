-- Core schema
create table inventory (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  price_cents int not null,
  stock_count int not null default 0,
  created_at timestamp default now()
);

create table orders (
  id uuid primary key default gen_random_uuid(),
  status text not null default 'pending',
  stripe_session_id text,
  email text,
  total_cents int,
  created_at timestamp default now()
);

create table order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references orders(id),
  inventory_id uuid references inventory(id),
  quantity int not null,
  price_cents int not null
);

-- System tables
create table webhook_events (
  id uuid primary key default gen_random_uuid(),
  stripe_event_id text unique,
  event_type text,
  payload jsonb,
  status text default 'pending',
  last_error text,
  created_at timestamp default now()
);

create table inventory_reservations (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references orders(id),
  inventory_id uuid references inventory(id),
  quantity int not null,
  status text default 'reserved',
  created_at timestamp default now()
);

-- Indexes
create index idx_webhook_events_status on webhook_events(status);
create index idx_orders_status on orders(status);
create index idx_inventory_reservations_order on inventory_reservations(order_id);
