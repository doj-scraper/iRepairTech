create table public.stripe_events (
  id uuid primary key default gen_random_uuid(),
  event_id text unique not null,
  type text not null,
  payload jsonb not null,
  processed boolean default false,
  created_at timestamptz default now()
);

create index idx_stripe_events_event_id on public.stripe_events(event_id);
create index idx_stripe_events_processed on public.stripe_events(processed);
