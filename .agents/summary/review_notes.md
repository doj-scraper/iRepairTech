# Review Notes

## Consistency Issues

### 1. `expired` status missing from enforced state machine
**Severity: High**

Migration 009 drops and recreates `order_status` without the `expired` value (present in migration 002). The worker's `pollQueue.ts` handles `checkout.session.expired` by doing:
```typescript
await supabase.from('orders').update({ status: 'expired' }).eq('stripe_session_id', session.id);
```
This direct `UPDATE` will fail because:
- `expired` is not a valid `order_status` enum value in migration 009
- Migration 009 revokes `UPDATE` on `orders` from `authenticated` (the worker uses service role, so the revoke may not apply, but the enum mismatch will still cause an error)

**Recommendation**: Either add `expired` back to the `order_status` enum in a new migration, or change the worker to use `transition_order_state` with a `failed` transition from `pending`.

---

### 2. Worker sets `status = 'refunded'` via direct UPDATE
**Severity: Medium**

`pollQueue.ts` handles `charge.refunded` with a direct `UPDATE orders SET status = 'refunded'`. Migration 009 revokes `UPDATE` on `orders` from `anon` and `authenticated`. The worker uses the service role key, which bypasses this revocation — so this works today. However, it bypasses the state machine and does not log to `order_state_history`.

**Recommendation**: Use `transition_order_state` RPC for all status changes to maintain the audit trail.

---

### 3. Draft order `stripe_session_id` uniqueness constraint
**Severity: Low**

The checkout route creates a draft order with `stripe_session_id = 'draft_<uuid>'`. Migration 002 defines `stripe_session_id text unique not null`. Since each draft uses a fresh UUID, uniqueness is maintained. However, if cleanup fails and a draft order is orphaned, the `stripe_session_id` remains in the table. This is acceptable but worth monitoring.

---

### 4. README references non-existent `packages/` monorepo structure
**Severity: Low**

The README describes a monorepo with `packages/domain`, `packages/types`, and `packages/validators`. These directories do not exist. The project uses two separate `package.json` files with no shared packages.

---

### 5. Advisory locks defined but unused
**Severity: Low**

`src/lib/locks/advisoryLock.ts` implements `acquireAdvisoryLock` / `releaseAdvisoryLock`, but neither function is called anywhere in the codebase. The `finalize_order` RPC uses `SELECT ... FOR UPDATE` row locking instead. The `worker/src/locks/` directory is empty.

---

## Completeness Gaps

### 1. No tests
Vitest and Playwright are configured as dev dependencies but no test files exist in `tests/` or anywhere else.

### 2. Empty edge function stubs
All four Supabase edge function directories are empty:
- `supabase/functions/stripe-webhook-ingest/`
- `supabase/functions/order-events/`
- `supabase/functions/inventory-realtime/`
- `supabase/functions/health-check/`

### 3. Inventory reserve/release API routes not implemented
`src/app/api/inventory/reserve/` and `src/app/api/inventory/release/` directories exist but contain no files.

### 4. No CI/CD workflows
`.github/workflows/` directory exists but is empty.

### 5. Cart is not persisted
The Zustand cart store is in-memory only. Refreshing the page clears the cart. No `persist` middleware is used.

### 6. Terms acceptance not enforced at checkout
Migration 008 adds `accepted_terms`, `accepted_terms_at`, and `terms_version` columns to `orders`, but the checkout API route does not collect or validate these fields. They default to `false` / null.

### 7. No order fulfillment workflow beyond `paid`
The state machine defines states through `completed`, but there is no code that transitions orders beyond `paid`. The `awaiting_device → device_received → in_repair → qa → shipped → completed` path has no implementation.

### 8. `src/lib/db/` and `src/lib/cache/` are empty
These directories exist but contain no files.

### 9. Component subdirectories are empty
`src/components/layout/`, `src/components/catalog/`, `src/components/ui/`, `src/components/cart/` are all empty.

### 10. No error boundary or global error handling
There is an `/error` page but no React error boundary wrapping the app.
