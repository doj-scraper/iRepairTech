alter table public.profiles
add column if not exists role text not null default 'customer';

update public.profiles
set role = coalesce(role, 'customer');

drop policy if exists user_insert_profile on public.profiles;
drop policy if exists admin_read_parts on public.inventory_parts;
drop policy if exists admin_read_services on public.repair_services;
drop policy if exists admin_update_parts on public.inventory_parts;
drop policy if exists admin_update_services on public.repair_services;
drop policy if exists user_read_profile on public.profiles;

create policy "user_read_profile"
on public.profiles
for select
using (auth.uid() = id);

create policy "user_insert_profile"
on public.profiles
for insert
with check (auth.uid() = id and role = 'customer');

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
