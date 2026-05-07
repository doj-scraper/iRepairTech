# Documentation Index

> **For AI assistants**: Start here. This file contains summaries of all documentation so you can identify which file to read for a given question without loading everything into context.

## How to Use This Documentation

1. Read the summary for each file below to determine relevance
2. Load only the files needed for the current task
3. `review_notes.md` is especially important — it documents known bugs and gaps

---

## Files

### `codebase_info.md`
**Read when**: You need the technology stack, package structure, or directory layout.

Covers: project name and version, language, runtime, directory tree, tech stack table, note that the `packages/` monorepo structure described in README does not exist.

---

### `architecture.md`
**Read when**: You need to understand how the layers connect, why certain design decisions were made, or how deployment works.

Covers: 5-layer architecture diagram (Browser → Next.js → Supabase → Worker → Stripe), webhook enqueue-only pattern, worker polling design, DB-level state machine enforcement, advisory locks (defined but unused), semantic projection layer, RLS overview, EC2 deployment topology.

---

### `components.md`
**Read when**: You need to find where a specific page, API route, or module lives, or understand what a component does.

Covers: all 8 pages with routes and descriptions, 2 implemented API routes + 2 empty stubs, React components (Header, CartDrawer), all `src/lib/` modules, Zustand cart store, worker modules (entry point, queue poller, finalizeOrder job, DB client), edge function stubs (all empty).

---

### `interfaces.md`
**Read when**: You need request/response shapes, RPC signatures, auth behavior, or Stripe event handling.

Covers: `POST /api/checkout` full request/response + 7-step behavior, `POST /api/webhook/stripe` behavior, `finalize_order` RPC contract, `transition_order_state` RPC contract, advisory lock RPCs, Supabase Auth flow, Stripe event → worker handler mapping, RLS policy summary.

---

### `data_models.md`
**Read when**: You need table schemas, column types, constraints, enum values, or TypeScript types.

Covers: all 8 DB tables with columns/types/notes, `order_status` enum with full transition graph, `CartItem` interface, `SemanticEntity` interface, semantic mapping rules (stock thresholds for UI state).

---

### `workflows.md`
**Read when**: You need to trace a user journey or understand a multi-step process end-to-end.

Covers: checkout flow (sequence diagram), Stripe webhook → finalization (sequence diagram), order state machine (state diagram), authentication flow, catalog → cart → checkout flow, worker failure recovery.

---

### `dependencies.md`
**Read when**: You need package versions, environment variable names, or external service configuration.

Covers: Next.js app runtime and dev dependencies with versions and usage, worker dependencies, external services (Supabase, Stripe), all environment variables for both `.env.local` and `.env`.

---

### `review_notes.md`
**Read when**: You encounter unexpected behavior, are fixing a bug, or want to understand known gaps before adding a feature.

Covers:
- **Bug**: `expired` status missing from migration 009 enum — worker will error on `checkout.session.expired` events
- **Bug**: Worker uses direct `UPDATE` for refunds, bypassing state machine audit trail
- Draft order uniqueness constraint behavior
- README monorepo description is inaccurate
- Advisory locks defined but never called
- No tests, no CI/CD, no edge function implementations
- Cart not persisted across page refreshes
- Terms acceptance fields exist in DB but not enforced at checkout
- No fulfillment workflow beyond `paid` state
