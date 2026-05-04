create or replace function public.finalize_order(p_session_id text)
returns void
language plpgsql
as $$

declare
  v_order_id uuid;

begin

  -- Lock order row (prevents concurrent execution)
  select id into v_order_id
  from public.orders
  where stripe_session_id = p_session_id
  for update;

  if not found then
    raise exception 'ORDER_NOT_FOUND';
  end if;

  -- Idempotency guard
  if exists (
    select 1
    from public.orders
    where stripe_session_id = p_session_id
      and status = 'paid'
  ) then
    return;
  end if;

  -- Transition state
  update public.orders
  set status = 'paid',
      updated_at = now()
  where id = v_order_id;

  -- =========================================
  -- INVENTORY DEDUCTION (PARTS ONLY)
  -- =========================================

  update public.inventory_parts p
  set stock_count = p.stock_count - oi.quantity
  from public.order_items_parts oi
  where oi.order_id = v_order_id
    and oi.part_id = p.id;

  -- HARD SAFETY CHECK
  if exists (
    select 1 from public.inventory_parts where stock_count < 0
  ) then
    raise exception 'INVENTORY_UNDERFLOW';
  end if;

end;

$$;
