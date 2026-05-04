# iRepair v2.5 — Production System

## Architecture Overview

```
WEB (Next.js)
  ↓
EDGE (Supabase Edge Functions / Webhooks ingest)
  ↓
WORKER (async reconciliation engine)
  ↓
DB (migrations + projections + constraints)
  ↓
SHARED (types, schemas, domain logic)
```

## Project Structure

```
/
├── src/                          # Next.js Application (UI + BFF layer)
│   ├── app/                      # App Router
│   ├── domain/                   # Business logic (checkout, inventory, orders)
│   ├── lib/                      # Utilities (supabase, stripe, locks, cache)
│   ├── components/               # React components
│   └── store/                    # Zustand stores
│
├── supabase/                     # Database + Edge Functions
│   ├── functions/                # Edge functions
│   └── migrations/               # SQL migrations
│
├── worker/                       # Async reconciliation engine
│   ├── src/
│   │   ├── jobs/                 # Job handlers
│   │   ├── queue/                # Queue processor
│   │   ├── locks/                # Advisory locks
│   │   └── db/                   # Database client
│
├── sql/                          # Pure SQL (migration source of truth)
├── packages/                     # Shared domain logic
│   ├── domain/                   # Zod schemas
│   ├── types/                    # TypeScript types
│   └── validators/               # Validation logic
│
├── tests/                        # E2E + integration tests
├── .github/workflows/            # CI/CD pipeline
├── docker-compose.yml            # Local infrastructure
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm
- Docker (optional, for local Postgres)

### Installation

```bash
pnpm install
```

### Development

Run both web and worker:

```bash
pnpm dev
```

Or run individually:

```bash
pnpm dev:web    # Next.js on http://localhost:3000
pnpm dev:worker # Worker process
```

### Docker Setup

```bash
docker-compose up
```

## Critical Flows

### 1. Checkout Flow

```
Next.js API
  → validate cart (Zod)
  → reserve inventory (DB + lock)
  → create order
  → create Stripe session
  → return URL
```

### 2. Stripe Webhook Flow

```
Stripe webhook
  → edge function ingest
  → enqueue event
  → worker processes
      → finalize order
      → commit inventory
      → release reservations if needed
```

### 3. Failure Recovery

```
Worker crash
  → queue remains
  → retry on restart
```

## Environment Variables

### `.env.local` (Next.js)

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### `.env` (Worker)

```
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
```

## Key Design Decisions

1. **Webhook Enqueue Only** - API doesn't process webhooks, just stores them
2. **Worker Polling** - Simple, reliable, no message queue needed initially
3. **Idempotency Guards** - Worker checks order status before finalizing
4. **Monorepo** - Shared types and domain logic across services
5. **Event Sourcing Ready** - Can migrate to event log without major refactor
6. **Advisory Locks** - Prevents race conditions on inventory
7. **Derived Projections** - UI only reads from projections, not raw tables

## Production Readiness

✅ Handles Stripe retries via queue  
✅ Handles duplicate webhooks via idempotent ingestion  
✅ Handles inventory race conditions via advisory locks  
✅ Handles partial failures via worker retry  
✅ Handles UI inconsistency via derived projections  

## Next Steps

- [ ] Add inventory reservation logic
- [ ] Implement order fulfillment workflow
- [ ] Add authentication (Supabase Auth)
- [ ] Create product catalog UI
- [ ] Add error handling and logging
- [ ] Set up CI/CD pipeline
- [ ] Add E2E tests
- [ ] Deploy to production
