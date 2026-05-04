alter table public.profiles
add column if not exists role text not null default 'customer';

update public.profiles
set role = coalesce(role, 'customer');

create policy "user_insert_profile"
on public.profiles
for insert
with check (auth.uid() = id);

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
