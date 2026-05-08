-- =========================================
-- ENABLE RLS
-- =========================================

alter table public.inventory_parts enable row level security;
alter table public.repair_services enable row level security;
alter table public.orders enable row level security;
alter table public.order_items_parts enable row level security;
alter table public.order_items_services enable row level security;
alter table public.profiles enable row level security;

alter table public.profiles
drop constraint if exists profiles_role_check;

alter table public.profiles
add constraint profiles_role_check
check (role in ('customer', 'admin'));

-- =========================================
-- PUBLIC READ (CATALOG)
-- =========================================

create policy "public_read_parts"
on public.inventory_parts
for select
using (is_active = true);

create policy "public_read_services"
on public.repair_services
for select
using (is_active = true);

-- =========================================
-- ADMIN ACCESS
-- =========================================

create policy "admin_read_parts"
on public.inventory_parts
for select
using (
  exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'admin'
  )
);

create policy "admin_read_services"
on public.repair_services
for select
using (
  exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'admin'
  )
);

create policy "admin_update_parts"
on public.inventory_parts
for update
using (
  exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'admin'
  )
)
with check (
  exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'admin'
  )
);

create policy "admin_update_services"
on public.repair_services
for update
using (
  exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'admin'
  )
)
with check (
  exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'admin'
  )
);

-- =========================================
-- USER OWNERSHIP (ORDERS)
-- =========================================

create policy "user_read_orders"
on public.orders
for select
using (auth.uid() = user_id);

create policy "user_read_order_items_parts"
on public.order_items_parts
for select
using (
  order_id in (
    select id from public.orders where user_id = auth.uid()
  )
);

create policy "user_read_order_items_services"
on public.order_items_services
for select
using (
  order_id in (
    select id from public.orders where user_id = auth.uid()
  )
);

-- =========================================
-- PROFILES
-- =========================================

create policy "user_read_profile"
on public.profiles
for select
using (auth.uid() = id);

create policy "user_insert_profile"
on public.profiles
for insert
with check (auth.uid() = id and role = 'customer');
