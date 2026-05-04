-- Prevent invalid stock states
alter table public.inventory_parts
add constraint stock_non_negative
check (stock_count >= 0);

-- Prevent invalid price states
alter table public.inventory_parts
add constraint price_positive
check (price_cents > 0);

alter table public.repair_services
add constraint service_price_positive
check (price_cents > 0);
