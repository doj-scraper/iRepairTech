-- =========================================
-- ORDER STATE TRANSITION ENFORCEMENT
-- =========================================
-- Required for: enforced state machine, audit trail, no invalid transitions

-- 1. Extend the existing enum with new states
-- NOTE: PostgreSQL doesn't support removing enum values, only adding
ALTER TYPE order_status ADD VALUE 'awaiting_device';
ALTER TYPE order_status ADD VALUE 'device_received';
ALTER TYPE order_status ADD VALUE 'in_repair';
ALTER TYPE order_status ADD VALUE 'qa';
ALTER TYPE order_status ADD VALUE 'shipped';
ALTER TYPE order_status ADD VALUE 'completed';
ALTER TYPE order_status ADD VALUE 'failed';

-- 2. Transition rules table (valid state graph)
CREATE TABLE IF NOT EXISTS public.order_state_transitions (
  from_state order_status NOT NULL,
  to_state order_status NOT NULL,
  PRIMARY KEY (from_state, to_state)
);

ALTER TABLE public.order_state_transitions ENABLE ROW LEVEL SECURITY;

-- 3. Seed valid transitions
INSERT INTO public.order_state_transitions (from_state, to_state) VALUES
  ('pending', 'paid'),
  ('pending', 'failed'),
  ('paid', 'awaiting_device'),
  ('paid', 'refunded'),
  ('awaiting_device', 'device_received'),
  ('awaiting_device', 'refunded'),
  ('device_received', 'in_repair'),
  ('device_received', 'refunded'),
  ('in_repair', 'qa'),
  ('in_repair', 'refunded'),
  ('qa', 'shipped'),
  ('qa', 'in_repair'),
  ('shipped', 'completed'),
  ('fulfilled', 'refunded'),
  ('expired', 'failed')
ON CONFLICT DO NOTHING;

-- 4. State history table (required for audit trail)
CREATE TABLE IF NOT EXISTS public.order_state_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  from_state order_status,
  to_state order_status,
  changed_at TIMESTAMPTZ DEFAULT now(),
  metadata JSONB
);

ALTER TABLE public.order_state_history ENABLE ROW LEVEL SECURITY;

-- 5. Enforced transition function (ONLY write path)
CREATE OR REPLACE FUNCTION public.transition_order_state(
  p_order_id UUID,
  p_next_state order_status
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_current_state order_status;
BEGIN
  -- Lock row to prevent concurrent transitions
  SELECT status INTO v_current_state
  FROM public.orders
  WHERE id = p_order_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'ORDER_NOT_FOUND';
  END IF;

  -- Validate transition exists in graph
  IF NOT EXISTS (
    SELECT 1 FROM public.order_state_transitions
    WHERE from_state = v_current_state AND to_state = p_next_state
  ) THEN
    RAISE EXCEPTION 'INVALID_TRANSITION: % → %', v_current_state, p_next_state;
  END IF;

  -- Apply transition
  UPDATE public.orders
  SET status = p_next_state,
      updated_at = now()
  WHERE id = p_order_id;

  -- Log to history
  INSERT INTO public.order_state_history (order_id, from_state, to_state)
  VALUES (p_order_id, v_current_state, p_next_state);
END;
$$;

REVOKE EXECUTE ON FUNCTION public.transition_order_state FROM authenticated;
GRANT EXECUTE ON FUNCTION public.transition_order_state TO service_role;

DROP POLICY IF EXISTS admin_read_order_state_transitions ON public.order_state_transitions;
CREATE POLICY admin_read_order_state_transitions
ON public.order_state_transitions
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid()
      AND role = 'admin'
  )
);

DROP POLICY IF EXISTS public_read_order_state_transitions ON public.order_state_transitions;
CREATE POLICY public_read_order_state_transitions
ON public.order_state_transitions
FOR SELECT
USING (true);

DROP POLICY IF EXISTS admin_read_order_state_history ON public.order_state_history;
CREATE POLICY admin_read_order_state_history
ON public.order_state_history
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid()
      AND role = 'admin'
  )
);

DROP POLICY IF EXISTS user_read_own_order_state_history ON public.order_state_history;
CREATE POLICY user_read_own_order_state_history
ON public.order_state_history
FOR SELECT
USING (
  order_id IN (
    SELECT id FROM public.orders WHERE user_id = auth.uid()
  )
);
