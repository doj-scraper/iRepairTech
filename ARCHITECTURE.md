# Architecture

## System Overview

iRepair Technologies v2.5 is a five-layer B2B e-commerce system for wholesale cell phone repair parts.

```
┌──────────────────────────────────────────────────────────────────┐
│  Browser (React + Zustand)                                        │
│  - Cart state (persisted to localStorage)                         │
│  - Client Components: CatalogClient, CartDrawer, CheckoutPage    │
└──────────────────────────────────────────────────────────────────┘
                          ↓ HTTP / RSC
┌──────────────────────────────────────────────────────────────────┐
│  Next.js 14 App Router (BFF + UI)                                │
│  - Static pages: / (homepage), /checkout, /contact, /error       │
│  - SSR pages:  /shop/catalog, /dashboard, /admin, /success       │
│  - API Routes: POST /api/checkout, POST /api/webhook/stripe      │
│  - Middleware: auth guard on /dashboard and /admin               │
└──────────────────────────────────────────────────────────────────┘
                          ↓ supabase-js (server client)
┌──────────────────────────────────────────────────────────────────┐
│  Supabase PostgreSQL                                              │
│  - RLS policies (anon, authenticated, service_role)              │
│  - State machine RPCs (transition_order_state, finalize_order)   │
│  - Advisory lock RPCs (reserve/release_inventory_for_order)      │
│  - Versioned migrations in supabase/migrations/                  │
└──────────────────────────────────────────────────────────────────┘
                          ↑ Poll every 2s
┌──────────────────────────────────────────────────────────────────┐
│  Worker Process (Async Reconciliation)                            │
│  - Polls stripe_events WHERE processed = false                   │
│  - Calls finalize_order RPC on checkout.session.completed        │
│  - Emits structured JSON logs per job                            │
└──────────────────────────────────────────────────────────────────┘
                          ↓ Webhook POST
┌──────────────────────────────────────────────────────────────────┐
│  Stripe (Checkout + Webhooks)                                     │
└──────────────────────────────────────────────────────────────────┘
```

## Key Design Decisions

### 1. Webhook Enqueue-Only Pattern
The Next.js webhook handler (`POST /api/webhook/stripe`) only:
- Verifies Stripe signature
- Upserts event into `stripe_events` table
- Returns 200 OK

All processing is delegated to the worker. This ensures:
- Fast webhook response (< 100ms)
- No lost events if worker is down
- Automatic retry on worker restart

### 2. Worker Polling (Not Message Queue)
The worker polls `stripe_events WHERE processed = false` every 2 seconds.

**Why not a message queue?**
- Simpler deployment (no Redis/RabbitMQ)
- Database is already the source of truth
- Queue survives worker crashes
- Easy to inspect and debug

### 3. Database-Level State Machine
Order status transitions are enforced via `transition_order_state` RPC:
- `pending` → `paid` → `completed`
- `pending` → `expired` / `failed`

Direct `UPDATE` on `orders.status` is revoked from `anon` and `authenticated` roles.

### 4. Row-Level Security (RLS)
- Public users can read active catalog items
- Users can only read their own orders
- Admins (role = 'admin') can manage inventory
- Service role bypasses RLS for backend operations

### 5. Semantic Projection Layer
`src/lib/semantic/mapToUI.ts` translates DB state to UI display state:
- `ui_state`: "neutral" | "warning" | "danger" | "success" | "muted"
- `ui_intent`: "sellable" | "low_stock" | "out_of_stock" | "service"
- `severity`: "normal" | "high" | "critical"

UI components consume these derived fields, not raw DB values.

### 6. Advisory Lock Inventory Reservation
Before creating a Stripe session, the checkout handler calls `reserve_inventory_for_order` RPC, which acquires a Postgres advisory lock keyed on each part ID. This prevents two concurrent checkouts from both seeing sufficient stock and both succeeding, causing oversell.

## Data Flow

### Checkout Flow
```
1. User builds cart (Zustand store, persisted to localStorage)
2. User reviews cart + accepts terms on /checkout
3. POST /api/checkout
   - Validates inventory & MOQ (authoritative Supabase prices)
   - Creates draft Order record (status: pending)
   - Inserts order_items_parts / order_items_services
   - Calls reserve_inventory_for_order RPC (advisory lock)
   - Creates Stripe Checkout session
   - Attaches stripe_session_id to order
4. User completes payment on Stripe hosted checkout
5. Stripe sends checkout.session.completed to /api/webhook/stripe
6. Webhook handler verifies signature, upserts to stripe_events
7. Worker polls stripe_events, picks up unprocessed event
8. Worker calls finalize_order RPC
9. RPC: order status pending → paid, inventory decremented
10. User sees /success page
```

### Authentication Flow
```
1. User visits /auth
2. Supabase Auth UI (email/password)
3. On success → redirect to / (or ?redirectTo= param)
4. middleware.ts enforces auth on /dashboard and /admin
5. Unauthenticated → redirect to /auth?redirectTo=/dashboard
```

## Database Schema

### Core Tables
- `inventory_parts`: Products (SKU, price_cents, stock_count, MOQ, active flag)
- `repair_services`: Services (name, description, price_cents, duration_hours)
- `orders`: Order records (status, total_cents, stripe_session_id, accepted_terms)
- `order_items_parts`: Line items for parts (order_id, part_id, quantity, price_cents)
- `order_items_services`: Line items for services (order_id, service_id, price_cents)
- `stripe_events`: Webhook event log (event_id, type, payload, processed)
- `profiles`: User profiles (id = auth.users.id, role: 'buyer' | 'admin')
- `contact_submissions`: Contact form submissions

### Order State Machine
```sql
CREATE TYPE order_status AS ENUM (
  'pending',
  'paid',
  'expired',
  'failed',
  'awaiting_device',
  'device_received',
  'in_repair',
  'qa',
  'shipped',
  'completed'
);
```

## Rendering Strategy

### Page Rendering Modes
| Route | Mode | Reason |
|-------|------|--------|
| `/` | ○ Static (SSG) | No dynamic data — served from CDN edge |
| `/shop/catalog` | ƒ Dynamic (SSR) | Fetches live inventory from Supabase per request |
| `/dashboard` | ƒ Dynamic (SSR) | Auth-gated, user-specific order history |
| `/admin` | ƒ Dynamic (SSR) | Auth-gated, admin-only data |
| `/success` | ƒ Dynamic (SSR) | Stripe session lookup per request |
| `/checkout`, `/contact`, `/error` | ○ Static (SSG) | Client-side interactivity only |

### Catalog Page — Server/Client Split
`/shop/catalog` uses a two-file pattern to enable SSR with interactive cart:

- **`page.tsx`** (Server Component) — Fetches `inventory_parts` and `repair_services` from Supabase at request time using the server Supabase client. Maps raw DB rows through the semantic projection layer. Passes typed `MappedPart[]` and `RepairService[]` to the client shell as props.
- **`CatalogClient.tsx`** (Client Component, `'use client'`) — Receives pre-fetched data as props. Handles all interactive behavior: `useCart` hook, add-to-cart callbacks, UI state. No data fetching.

This eliminates the loading skeleton for first-time visitors and makes catalog products indexable by search engines.

### Supabase Query Discipline
All Supabase queries use explicit column selects rather than `select('*')` to minimise payload size. Column lists match the TypeScript types in `src/lib/database.types.ts`. This also prevents accidental exposure of new columns added to the DB schema.

## Logging

### Wide-Event Pattern
All API routes emit exactly **one structured JSON log line per request**, written to stdout in the `finally` block. This is the canonical log line (wide event) — a single record that contains all context needed to debug, alert on, and analyse the request.

**Logger singleton:** `src/lib/logger.ts` — import this everywhere. Do not create additional logger instances.

```typescript
import { logger } from '@/lib/logger';

export async function POST(req: Request) {
  const startTime = Date.now();
  const wideEvent: Record<string, unknown> = {
    method: 'POST',
    path: '/api/checkout',
  };

  try {
    // ... add context to wideEvent as work progresses ...
    wideEvent.user_id = user?.id ?? 'guest';
    wideEvent.total_cents = total_cents;
    wideEvent.order_id = orderId;
    wideEvent.outcome = 'success';
    wideEvent.status_code = 200;
    return NextResponse.json({ ... });
  } catch (error) {
    wideEvent.outcome = 'error';
    wideEvent.error_type = (error as Error).name;
    wideEvent.error_message = (error as Error).message;
    return NextResponse.json({ error: ... }, { status: 400 });
  } finally {
    wideEvent.duration_ms = Date.now() - startTime;
    logger.info(wideEvent);   // ← one line, all context
  }
}
```

### Standard Fields (All Events)
| Field | Source | Example |
|-------|--------|---------|
| `level` | logger | `"info"` / `"error"` |
| `service` | `npm_package_name` | `"irepair-v2"` |
| `version` | `npm_package_version` | `"2.5.0"` |
| `region` | `VERCEL_REGION` | `"iad1"` |
| `commit` | `VERCEL_GIT_COMMIT_SHA` (8 chars) | `"a1b2c3d4"` |
| `timestamp` | runtime | ISO 8601 |

### Business Fields (Checkout)
`method`, `path`, `user_id`, `item_count`, `part_count`, `service_count`, `total_cents`, `order_id`, `stripe_session_id`, `outcome`, `status_code`, `duration_ms`

### Business Fields (Webhook)
`method`, `path`, `stripe_event_id`, `stripe_event_type`, `outcome`, `status_code`, `duration_ms`

## CI/CD

### GitHub Actions
`.github/workflows/ci.yml` runs on every push and pull request to `main`:
- `tsc --noEmit` — type-check without emitting output
- `pnpm lint` — Next.js ESLint

Vercel auto-deploys on push to `main`. Set **"Require checks to pass before deploying"** in Vercel → Project Settings → Git.

## Deployment

### Vercel (Recommended)
`vercel.json` specifies build commands and maps env var secret aliases:
1. Connect GitHub repo in Vercel dashboard
2. Add secrets: `@supabase_url`, `@supabase_anon_key`, `@supabase_service_role_key`, `@stripe_secret_key`, `@stripe_webhook_secret`, `@site_url`
3. Push to `main` — CI runs, then Vercel deploys

### Manual (EC2)
1. Build: `pnpm build`
2. Start: `pnpm start`
3. Deploy worker separately: `cd worker && pnpm build && node dist/index.js`
4. Register webhook endpoint in Stripe dashboard

## Security

- All Supabase queries use RLS
- Stripe webhooks verified via HMAC signature (`STRIPE_WEBHOOK_SECRET`)
- Service role key never exposed to browser (`NEXT_PUBLIC_` prefix absent)
- Advisory locks prevent inventory race conditions
- Response headers: `X-Frame-Options: SAMEORIGIN`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy`

## Performance

- Static homepage served from Vercel CDN edge (~0ms TTFB)
- Catalog SSR eliminates client-side loading skeleton
- Explicit Supabase column selects reduce payload size
- Cart persisted to localStorage (no DB reads on mount)
- Stripe webhooks respond in < 100ms (enqueue-only, no processing)

## Monitoring

- **Vercel Runtime Logs** — structured wide events from API routes (JSON, queryable)
- **Supabase dashboard** — DB metrics, RLS audit logs
- **Stripe dashboard** — payment events, webhook delivery
- **Worker stdout** — structured JSON per `finalizeOrder` job

## Future Enhancements

- [ ] Email notifications on order state transitions
- [ ] Admin order fulfillment workflow (ship → complete)
- [ ] Cart persistence in Supabase (cross-device)
- [ ] Inventory low-stock alerts
- [ ] Analytics dashboard
- [ ] Multi-currency support

```
┌─────────────────────────────────────────────────────────┐
│  Browser (React + Zustand)                              │
└─────────────────────────────────────────────────────────┘
                         ↓ HTTP
┌─────────────────────────────────────────────────────────┐
│  Next.js 14 App Router (BFF + UI)                       │
│  - Pages: Home, Catalog, Contact, Auth                  │
│  - API Routes: /api/checkout, /api/webhook/stripe       │
└─────────────────────────────────────────────────────────┘
                         ↓ supabase-js
┌─────────────────────────────────────────────────────────┐
│  Supabase PostgreSQL                                     │
│  - RLS policies                                          │
│  - State machine RPCs                                    │
│  - Migrations                                            │
└─────────────────────────────────────────────────────────┘
                         ↑ Poll every 2s
┌─────────────────────────────────────────────────────────┐
│  Worker Process (Async Reconciliation)                   │
│  - Polls stripe_events table                             │
│  - Finalizes orders                                      │
│  - Updates inventory                                     │
└─────────────────────────────────────────────────────────┘
                         ↓ Webhook POST
┌─────────────────────────────────────────────────────────┐
│  Stripe (Checkout + Webhooks)                            │
└─────────────────────────────────────────────────────────┘
```

## Key Design Decisions

### 1. Webhook Enqueue-Only Pattern
The Next.js webhook handler (`POST /api/webhook/stripe`) only:
- Verifies Stripe signature
- Upserts event into `stripe_events` table
- Returns 200 OK

All processing is delegated to the worker. This ensures:
- Fast webhook response (< 100ms)
- No lost events if worker is down
- Automatic retry on worker restart

### 2. Worker Polling (Not Message Queue)
The worker polls `stripe_events WHERE processed = false` every 2 seconds.

**Why not a message queue?**
- Simpler deployment (no Redis/RabbitMQ)
- Database is already the source of truth
- Queue survives worker crashes
- Easy to inspect and debug

### 3. Database-Level State Machine
Order status transitions are enforced via `transition_order_state` RPC:
- `pending` → `paid` → `completed`
- `pending` → `expired` / `failed`

Direct `UPDATE` on `orders.status` is revoked from `anon` and `authenticated` roles.

### 4. Row-Level Security (RLS)
- Public users can read active catalog items
- Users can only read their own orders
- Admins (role = 'admin') can manage inventory
- Service role bypasses RLS for backend operations

### 5. Semantic Projection Layer
`src/lib/semantic/mapToUI.ts` translates DB state to UI display state:
- `ui_state`: "In Stock", "Low Stock", "Out of Stock"
- `ui_intent`: "success", "warning", "error"
- `severity`: 0-100

UI components consume these derived fields, not raw DB values.

## Data Flow

### Checkout Flow
```
1. User adds items to cart (Zustand store)
2. User clicks checkout
3. POST /api/checkout
   - Validates inventory & MOQ
   - Creates draft order
   - Creates Stripe session
   - Returns checkout URL
4. User completes payment on Stripe
5. Stripe sends webhook to /api/webhook/stripe
6. Webhook upserts event to stripe_events
7. Worker polls and processes event
8. Worker calls finalize_order RPC
9. Order status → paid
10. Inventory decremented
```

### Authentication Flow
```
1. User clicks "Log in"
2. Redirects to /auth
3. Supabase Auth UI (email/password)
4. On success, redirects to /
5. Header shows "Sign out" button
6. Cart drawer shows checkout button
```

## Database Schema

### Core Tables
- `inventory_parts`: Products (SKU, price, stock, MOQ)
- `repair_services`: Services (name, price, hours)
- `orders`: Order records (status, total, Stripe session)
- `order_items_parts`: Line items for parts
- `order_items_services`: Line items for services
- `stripe_events`: Webhook event log
- `profiles`: User profiles (role)
- `contact_submissions`: Contact form submissions

### State Machine
```sql
CREATE TYPE order_status AS ENUM (
  'pending',
  'paid',
  'expired',
  'failed',
  'awaiting_device',
  'device_received',
  'in_repair',
  'qa',
  'shipped',
  'completed'
);
```

## Rendering Strategy

### Page Rendering Modes
| Route | Mode | Reason |
|-------|------|--------|
| `/` | ○ Static (SSG) | No dynamic data — served from CDN edge |
| `/shop/catalog` | ƒ Dynamic (SSR) | Fetches live inventory from Supabase per request |
| `/dashboard` | ƒ Dynamic (SSR) | Auth-gated, user-specific order history |
| `/admin` | ƒ Dynamic (SSR) | Auth-gated, admin-only data |
| `/success` | ƒ Dynamic (SSR) | Stripe session lookup per request |
| `/checkout`, `/contact`, `/error` | ○ Static (SSG) | Client-side interactivity only |

### Catalog Page — Server/Client Split
`/shop/catalog` uses a two-file pattern to enable SSR with interactive cart:

- **`page.tsx`** (Server Component) — Fetches parts and services from Supabase at request time using the server Supabase client. Maps raw DB rows through the semantic projection layer. Passes typed data to the client shell.
- **`CatalogClient.tsx`** (Client Component) — Receives pre-fetched data as props. Handles all interactive behavior: `useCart` hook, add-to-cart callbacks, UI state. No data fetching.

This eliminates the loading skeleton for first-time visitors and makes catalog products indexable by search engines.

### Supabase Query Discipline
All Supabase queries use explicit column selects rather than `select('*')` to minimise payload size. Column lists match the TypeScript types in `src/lib/database.types.ts`.

## Deployment

### Vercel (Recommended)
1. Connect GitHub repo
2. Set environment variables
3. Deploy

### Manual (EC2)
1. Build: `pnpm build`
2. Start: `pnpm start`
3. Deploy worker separately
4. Configure Stripe webhook endpoint

## Security

- All Supabase queries use RLS
- Stripe webhooks verified via signature
- Service role key never exposed to client
- Advisory locks prevent inventory race conditions
- HTTPS enforced in production

## Performance

- Static pages cached at edge
- Dynamic pages use ISR (Incremental Static Regeneration)
- Database queries use indexes
- Worker processes events in batches
- Stripe webhooks respond in < 100ms

## Monitoring

- Supabase dashboard for DB metrics
- Stripe dashboard for payment events
- Vercel analytics for web vitals
- Worker logs for event processing

## Future Enhancements

- [ ] Cart persistence (localStorage or DB)
- [ ] Order fulfillment workflow
- [ ] Admin dashboard
- [ ] Email notifications
- [ ] SMS notifications
- [ ] Inventory alerts
- [ ] Analytics dashboard
- [ ] Multi-currency support
