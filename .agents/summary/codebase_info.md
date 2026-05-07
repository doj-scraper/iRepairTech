# Codebase Info

## Project

- **Name**: iRepair v2.5
- **Type**: E-commerce platform for device repair parts and services
- **Languages**: TypeScript (primary)
- **Runtime**: Node.js 18+

## Repository Layout

```
ecommerce/
├── src/                  # Next.js 14 app (App Router)
│   ├── app/              # Pages + API routes
│   ├── components/       # React components
│   ├── lib/              # Supabase, Stripe, locks, semantic layer
│   └── store/            # Zustand cart store
├── worker/               # Standalone async reconciliation process
│   └── src/
│       ├── jobs/         # Job handlers (finalizeOrder)
│       ├── queue/        # Queue poller
│       └── db/           # Supabase client
├── supabase/
│   ├── migrations/       # Applied Supabase migrations
│   └── functions/        # Edge function stubs (empty)
├── sql/                  # Migration source of truth (9 files)
└── .agents/summary/      # This documentation
```

## Technology Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router), React 18, Tailwind CSS |
| State | Zustand 4 |
| Backend | Next.js API Routes (BFF) |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| Payments | Stripe Checkout |
| Worker | Node.js + tsx (standalone process) |
| Testing | Vitest, Playwright (configured, no tests written) |

## Package Structure

Two separate `package.json` files — this is **not** a monorepo with shared packages despite the README mentioning one:

- `/package.json` — Next.js app
- `/worker/package.json` — Worker process

The `packages/` directory referenced in the README does not exist.
