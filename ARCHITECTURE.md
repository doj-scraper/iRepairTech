# Architecture

## System Overview

iRepair v2.5 is a five-layer e-commerce system for wholesale cell phone repair parts.

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
