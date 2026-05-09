-- =========================================================
-- Security and inventory-reservation hardening
-- =========================================================

-- Profiles need an explicit role column for admin checks.
alter table public.profiles
add column if not exists role text;

update public.profiles
set role = coalesce(role, 'customer');

alter table public.profiles
alter column role set default 'customer';

alter table public.profiles
alter column role set not null;

alter table public.profiles
drop constraint if exists profiles_role_check;

alter table public.profiles
add constraint profiles_role_check
check (role in ('customer', 'admin'));

-- Inventory reservations capture stock at checkout time so payment finalization
-- cannot lose inventory to a race with another order.
create table if not exists public.inventory_reservations (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  part_id uuid not null references public.inventory_parts(id),
  quantity integer not null check (quantity > 0),
  status text not null default 'reserved' check (status in ('reserved', 'released', 'consumed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (order_id, part_id)
);

alter table public.inventory_reservations enable row level security;
alter table public.order_state_transitions enable row level security;
alter table public.order_state_history enable row level security;

create or replace function public.reserve_inventory_for_order(p_order_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_item record;
begin
  if not exists (
    select 1
    from public.orders
    where id = p_order_id
  ) then
    raise exception 'ORDER_NOT_FOUND';
  end if;

  if exists (
    select 1
    from public.inventory_reservations
    where order_id = p_order_id
      and status = 'reserved'
  ) then
    return;
  end if;

  for v_item in
    select
      oi.part_id,
      oi.quantity,
      p.stock_count,
      p.moq,
      p.name
    from public.order_items_parts oi
    join public.inventory_parts p
      on p.id = oi.part_id
    where oi.order_id = p_order_id
    order by oi.part_id
    for update of p
  loop
    if v_item.quantity < v_item.moq then
      raise exception 'MOQ_VIOLATION: %', v_item.name;
    end if;

    if v_item.stock_count < v_item.quantity then
      raise exception 'INSUFFICIENT_STOCK: %', v_item.name;
    end if;
  end loop;

  update public.inventory_parts p
  set stock_count = p.stock_count - oi.quantity
  from public.order_items_parts oi
  where oi.order_id = p_order_id
    and oi.part_id = p.id;

  insert into public.inventory_reservations (order_id, part_id, quantity, status)
  select oi.order_id, oi.part_id, oi.quantity, 'reserved'
  from public.order_items_parts oi
  where oi.order_id = p_order_id
  on conflict (order_id, part_id) do update
    set quantity = excluded.quantity,
        status = 'reserved',
        updated_at = now();
end;
$$;

create or replace function public.release_inventory_for_order(p_order_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.inventory_parts p
  set stock_count = p.stock_count + r.quantity
  from public.inventory_reservations r
  where r.order_id = p_order_id
    and r.status = 'reserved'
    and r.part_id = p.id;

  update public.inventory_reservations
  set status = 'released',
      updated_at = now()
  where order_id = p_order_id
    and status = 'reserved';
end;
$$;

create or replace function public.finalize_order(p_session_id text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order_id uuid;
begin
  select id into v_order_id
  from public.orders
  where stripe_session_id = p_session_id
  for update;

  if not found then
    raise exception 'ORDER_NOT_FOUND';
  end if;

  if exists (
    select 1
    from public.orders
    where stripe_session_id = p_session_id
      and status = 'paid'
  ) then
    return;
  end if;

  perform public.transition_order_state(v_order_id, 'paid');

  update public.inventory_reservations
  set status = 'consumed',
      updated_at = now()
  where order_id = v_order_id
    and status = 'reserved';
end;
$$;

-- Function privileges: service role only.
revoke execute on function public.reserve_inventory_for_order(uuid) from public, anon, authenticated;
grant execute on function public.reserve_inventory_for_order(uuid) to service_role;

revoke execute on function public.release_inventory_for_order(uuid) from public, anon, authenticated;
grant execute on function public.release_inventory_for_order(uuid) to service_role;

revoke execute on function public.finalize_order(text) from public, anon, authenticated;
grant execute on function public.finalize_order(text) to service_role;

revoke execute on function public.transition_order_state(uuid, order_status) from public, anon, authenticated;
grant execute on function public.transition_order_state(uuid, order_status) to service_role;

drop policy if exists orders_delete_own on public.orders;
drop policy if exists orders_insert_own on public.orders;
drop policy if exists orders_update_own on public.orders;
drop policy if exists user_read_orders on public.orders;
drop policy if exists orders_select_own on public.orders;

create policy "orders_select_own"
on public.orders
for select
using (auth.uid() = user_id);

drop policy if exists profiles_select_own on public.profiles;
drop policy if exists profiles_update_own on public.profiles;
drop policy if exists user_read_profile on public.profiles;

create policy "profiles_select_own"
on public.profiles
for select
using (id = auth.uid());

create policy "profiles_update_own"
on public.profiles
for update
using (id = auth.uid())
with check (id = auth.uid() and role = 'customer');

create policy "user_insert_profile"
on public.profiles
for insert
with check (auth.uid() = id and role = 'customer');

create policy "user_read_profile"
on public.profiles
for select
using (auth.uid() = id);

create policy "admin_read_order_state_transitions"
on public.order_state_transitions
for select
using (
  exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'admin'
  )
);

create policy "admin_read_order_state_history"
on public.order_state_history
for select
using (
  exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'admin'
  )
);

create policy "user_read_own_order_state_history"
on public.order_state_history
for select
using (
  order_id in (
    select id from public.orders where user_id = auth.uid()
  )
);
