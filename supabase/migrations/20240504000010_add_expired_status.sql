-- Add 'expired' to order_status enum if not exists and seed transition

ALTER TYPE order_status ADD VALUE IF NOT EXISTS 'expired';

INSERT INTO public.order_state_transitions (from_state, to_state) VALUES
  ('pending', 'expired')
ON CONFLICT DO NOTHING;