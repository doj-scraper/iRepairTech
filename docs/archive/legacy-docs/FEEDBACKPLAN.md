# FEEDBACKPLAN

## Operator Prompt

Follow this document as a strict execution checklist.

Instructions:
- Work top to bottom.
- Complete one TODO at a time.
- Do not skip ahead, batch multiple TODOs, or reorder items.
- Do not start the next TODO until the current one is fully verified.
- Do not treat a TODO as complete based on inspection alone.
- After each code change, run the listed verification command.
- Do not mark a TODO complete unless its completion criterion is true and the verification command passes.
- If a verification command fails, stop and fix that item before moving on.
- Keep changes minimal and scoped to the file(s) named in the TODO.
- Preserve unrelated user changes.
- Prefer the listed order of execution over jumping ahead.
- If you discover a blocker that changes the plan, update this document before continuing.
- If a TODO touches multiple files, edit only the files named in that TODO.
- If a TODO requires a decision, choose the smallest safe change and note the assumption.

Output format for progress:
- `DONE` when a TODO is finished and verified.
- `BLOCKED` when a TODO cannot be completed yet, with the exact reason.
- `NEXT` for the next TODO only after the current one is verified.

Reporting protocol:
- Report only the current TODO status unless a blocker affects the plan.
- Include the TODO number, the file(s) touched, and the verification command result.
- Keep updates short and factual.
- If blocked, include the missing prerequisite or the exact failure.
- If complete, say what changed and confirm the verification command passed.

## Goal

Turn the review in `FEEDBACK.md` into a short execution path that gets the app from “not safe to ship” to “safe enough for real traffic.”

## What matters most

- The codebase has already improved at the TypeScript and UI foundation level.
- The remaining blockers are concentrated in server-side writes, RLS, order-state permissions, and buyer-facing trust flows.
- This is an integration-hardening pass, not a redesign.

## Execution Plan

### Phase 1: Production blockers first

#### File-by-file patch map

1. [ ] Add [src/lib/supabase/service.ts](/home/mya/Desktop/breakpoint%20infinity/ecommerce/src/lib/supabase/service.ts) and move server-only writes off the anon client.
2. [ ] Update [src/app/api/checkout/route.ts](/home/mya/Desktop/breakpoint%20infinity/ecommerce/src/app/api/checkout/route.ts) to use the service-role client for draft order creation and cleanup.
3. [ ] Update [src/app/api/webhook/stripe/route.ts](/home/mya/Desktop/breakpoint%20infinity/ecommerce/src/app/api/webhook/stripe/route.ts) to use the service-role client for inserting `stripe_events`.
4. [ ] Update [worker/src/db/client.ts](/home/mya/Desktop/breakpoint%20infinity/ecommerce/worker/src/db/client.ts) if the worker should use a separate service-role path rather than the current shared client.
5. [ ] Edit [supabase/migrations/20240504000004_stripe_events.sql](/home/mya/Desktop/breakpoint%20infinity/ecommerce/supabase/migrations/20240504000004_stripe_events.sql) to enable RLS on `stripe_events` and avoid public reads.
6. [ ] Edit [supabase/migrations/20240504000008_order_state_enforcement.sql](/home/mya/Desktop/breakpoint%20infinity/ecommerce/supabase/migrations/20240504000008_order_state_enforcement.sql) to tighten `transition_order_state`, restrict `authenticated`, and add history-table protections.
7. [ ] Edit [supabase/migrations/20240504000003_rbac_rls.sql](/home/mya/Desktop/breakpoint%20infinity/ecommerce/supabase/migrations/20240504000003_rbac_rls.sql) and [supabase/migrations/20240504000001_init_schema.sql](/home/mya/Desktop/breakpoint%20infinity/ecommerce/supabase/migrations/20240504000001_init_schema.sql) to constrain `profiles.role`.
8. [ ] Edit [supabase/migrations/20240504000007_admin_roles.sql](/home/mya/Desktop/breakpoint%20infinity/ecommerce/supabase/migrations/20240504000007_admin_roles.sql) so it is safe on a clean database.
9. [ ] Edit [supabase/migrations/20240504000010_add_expired_status.sql](/home/mya/Desktop/breakpoint%20infinity/ecommerce/supabase/migrations/20240504000010_add_expired_status.sql) and confirm the worker’s `expired` transition is valid.

### Phase 2: Buyer trust and route correctness

#### File-by-file patch map

1. [ ] Delete [src/app/catalog/page.tsx](/home/mya/Desktop/breakpoint%20infinity/ecommerce/src/app/catalog/page.tsx).
2. [ ] Update [src/app/page.tsx](/home/mya/Desktop/breakpoint%20infinity/ecommerce/src/app/page.tsx) to point the homepage CTA at `/shop/catalog`.
3. [ ] Update [src/components/Footer.tsx](/home/mya/Desktop/breakpoint%20infinity/ecommerce/src/components/Footer.tsx) to point catalog links at `/shop/catalog`.
4. [ ] Review [src/components/Header.tsx](/home/mya/Desktop/breakpoint%20infinity/ecommerce/src/components/Header.tsx) for any route mismatches after the catalog cleanup.
5. [ ] Replace the success page’s hardcoded paid state in [src/app/success/page.tsx](/home/mya/Desktop/breakpoint%20infinity/ecommerce/src/app/success/page.tsx) with a real server-side Stripe status lookup.
6. [ ] Update [src/app/checkout/page.tsx](/home/mya/Desktop/breakpoint%20infinity/ecommerce/src/app/checkout/page.tsx) and [src/app/shop/catalog/page.tsx](/home/mya/Desktop/breakpoint%20infinity/ecommerce/src/app/shop/catalog/page.tsx) so cart state carries real item price and name data.
7. [ ] Update [src/store/cart.ts](/home/mya/Desktop/breakpoint%20infinity/ecommerce/src/store/cart.ts) and [src/lib/schema.ts](/home/mya/Desktop/breakpoint%20infinity/ecommerce/src/lib/schema.ts) so the cart model can represent real item pricing.

### Phase 3: Type and workflow cleanup

#### File-by-file patch map

1. [ ] Regenerate [src/lib/database.types.ts](/home/mya/Desktop/breakpoint%20infinity/ecommerce/src/lib/database.types.ts) from Supabase.
2. [ ] Update [src/app/admin/page.tsx](/home/mya/Desktop/breakpoint%20infinity/ecommerce/src/app/admin/page.tsx) to remove fallback `any[]` state and use real inventory/profile types.
3. [ ] Update [src/app/shop/catalog/page.tsx](/home/mya/Desktop/breakpoint%20infinity/ecommerce/src/app/shop/catalog/page.tsx) to use typed inventory state.
4. [ ] Update [src/app/success/page.tsx](/home/mya/Desktop/breakpoint%20infinity/ecommerce/src/app/success/page.tsx) to use a typed order/session response instead of `any`.
5. [ ] Review [src/types/dtos/checkout.dto.ts](/home/mya/Desktop/breakpoint%20infinity/ecommerce/src/types/dtos/checkout.dto.ts) and [src/types/dtos/cart.dto.ts](/home/mya/Desktop/breakpoint%20infinity/ecommerce/src/types/dtos/cart.dto.ts) against the generated schema.
6. [ ] Keep [worker/src/jobs/finalizeOrder.ts](/home/mya/Desktop/breakpoint%20infinity/ecommerce/worker/src/jobs/finalizeOrder.ts) aligned with the generated order/status types.

## Suggested order of execution

1. Fix server-side Supabase writes.
2. Lock down RLS and order-state permissions.
3. Make migrations deploy cleanly.
4. Repair the buyer-facing route and success-page trust issues.
5. Reconcile cart and database types.

## Ownership

- Supabase and migration work should be treated as the core blocker path.
- Route cleanup and cart trust issues are the main buyer-facing follow-up.
- Type generation and drift cleanup are supporting work that should happen once the blockers above are in place.

## Acceptance criteria

- Checkout can create and clean up draft orders with the correct database privileges.
- Fresh migrations apply cleanly on a new Supabase database.
- Unauthorized users cannot read Stripe payloads or mutate arbitrary orders.
- The homepage CTA and footer both land on the correct catalog page.
- The success page verifies Stripe state instead of assuming payment succeeded.
- Cart values reflect actual item data rather than hardcoded placeholders.

## Minimal patch sequence

1. [src/lib/supabase/service.ts](/home/mya/Desktop/breakpoint%20infinity/ecommerce/src/lib/supabase/service.ts)
2. [src/app/api/checkout/route.ts](/home/mya/Desktop/breakpoint%20infinity/ecommerce/src/app/api/checkout/route.ts)
3. [src/app/api/webhook/stripe/route.ts](/home/mya/Desktop/breakpoint%20infinity/ecommerce/src/app/api/webhook/stripe/route.ts)
4. [supabase/migrations/20240504000004_stripe_events.sql](/home/mya/Desktop/breakpoint%20infinity/ecommerce/supabase/migrations/20240504000004_stripe_events.sql)
5. [supabase/migrations/20240504000008_order_state_enforcement.sql](/home/mya/Desktop/breakpoint%20infinity/ecommerce/supabase/migrations/20240504000008_order_state_enforcement.sql)
6. [supabase/migrations/20240504000003_rbac_rls.sql](/home/mya/Desktop/breakpoint%20infinity/ecommerce/supabase/migrations/20240504000003_rbac_rls.sql)
7. [supabase/migrations/20240504000001_init_schema.sql](/home/mya/Desktop/breakpoint%20infinity/ecommerce/supabase/migrations/20240504000001_init_schema.sql)
8. [supabase/migrations/20240504000007_admin_roles.sql](/home/mya/Desktop/breakpoint%20infinity/ecommerce/supabase/migrations/20240504000007_admin_roles.sql)
9. [supabase/migrations/20240504000010_add_expired_status.sql](/home/mya/Desktop/breakpoint%20infinity/ecommerce/supabase/migrations/20240504000010_add_expired_status.sql)
10. [src/app/catalog/page.tsx](/home/mya/Desktop/breakpoint%20infinity/ecommerce/src/app/catalog/page.tsx)
11. [src/app/page.tsx](/home/mya/Desktop/breakpoint%20infinity/ecommerce/src/app/page.tsx)
12. [src/components/Footer.tsx](/home/mya/Desktop/breakpoint%20infinity/ecommerce/src/components/Footer.tsx)
13. [src/app/success/page.tsx](/home/mya/Desktop/breakpoint%20infinity/ecommerce/src/app/success/page.tsx)
14. [src/store/cart.ts](/home/mya/Desktop/breakpoint%20infinity/ecommerce/src/store/cart.ts)
15. [src/lib/schema.ts](/home/mya/Desktop/breakpoint%20infinity/ecommerce/src/lib/schema.ts)
16. [src/lib/database.types.ts](/home/mya/Desktop/breakpoint%20infinity/ecommerce/src/lib/database.types.ts)
17. [src/app/admin/page.tsx](/home/mya/Desktop/breakpoint%20infinity/ecommerce/src/app/admin/page.tsx)
18. [src/app/shop/catalog/page.tsx](/home/mya/Desktop/breakpoint%20infinity/ecommerce/src/app/shop/catalog/page.tsx)
19. [src/types/dtos/checkout.dto.ts](/home/mya/Desktop/breakpoint%20infinity/ecommerce/src/types/dtos/checkout.dto.ts)
20. [src/types/dtos/cart.dto.ts](/home/mya/Desktop/breakpoint%20infinity/ecommerce/src/types/dtos/cart.dto.ts)
21. [worker/src/jobs/finalizeOrder.ts](/home/mya/Desktop/breakpoint%20infinity/ecommerce/worker/src/jobs/finalizeOrder.ts)

## TODO Checklist

### TODO-01: Add service-role Supabase client

- [ ] Create [src/lib/supabase/service.ts](/home/mya/Desktop/breakpoint%20infinity/ecommerce/src/lib/supabase/service.ts).
- [ ] Use `SUPABASE_SERVICE_ROLE_KEY` only in that module.
- [ ] Keep the anon browser/server helpers untouched unless they are being removed from a server-write path.
- [ ] Completion: there is a dedicated service client and no server-write path depends on the anon client.
- [ ] Verification: `rg -n "SUPABASE_SERVICE_ROLE_KEY|createClient\\(" src/lib/supabase src/app/api worker/src`

### TODO-02: Fix checkout draft writes

- [ ] Update [src/app/api/checkout/route.ts](/home/mya/Desktop/breakpoint%20infinity/ecommerce/src/app/api/checkout/route.ts).
- [ ] Use the service client for draft order creation.
- [ ] Use the service client for cleanup/deletion of failed draft orders.
- [ ] Keep request validation and pricing logic intact.
- [ ] Completion: checkout can create and clean up draft orders without RLS blocking the writes.
- [ ] Verification: `sed -n '1,220p' src/app/api/checkout/route.ts`

### TODO-03: Fix webhook event writes

- [ ] Update [src/app/api/webhook/stripe/route.ts](/home/mya/Desktop/breakpoint%20infinity/ecommerce/src/app/api/webhook/stripe/route.ts).
- [ ] Use the service client for inserting into `stripe_events`.
- [ ] Preserve the enqueue-only webhook pattern.
- [ ] Completion: incoming Stripe webhooks are recorded without depending on anon-key access.
- [ ] Verification: `sed -n '1,220p' src/app/api/webhook/stripe/route.ts`

### TODO-04: Lock down Stripe event visibility

- [ ] Edit [supabase/migrations/20240504000004_stripe_events.sql](/home/mya/Desktop/breakpoint%20infinity/ecommerce/supabase/migrations/20240504000004_stripe_events.sql).
- [ ] Enable RLS on `stripe_events`.
- [ ] Do not add public `SELECT` policies.
- [ ] Completion: anonymous users cannot read Stripe payload rows.
- [ ] Verification: `sed -n '1,220p' supabase/migrations/20240504000004_stripe_events.sql`

### TODO-05: Harden order-state transitions

- [ ] Edit [supabase/migrations/20240504000008_order_state_enforcement.sql](/home/mya/Desktop/breakpoint%20infinity/ecommerce/supabase/migrations/20240504000008_order_state_enforcement.sql).
- [ ] Revoke or restrict `GRANT EXECUTE` on `transition_order_state` for `authenticated`.
- [ ] Add an ownership or admin guard if authenticated execution must remain.
- [ ] Add or verify RLS protections on `order_state_history` and `order_state_transitions`.
- [ ] Completion: ordinary authenticated users cannot mutate arbitrary order states or read unrestricted order-history data.
- [ ] Verification: `rg -n "transition_order_state|order_state_history|order_state_transitions|GRANT EXECUTE" supabase/migrations/20240504000008_order_state_enforcement.sql`

### TODO-06: Constrain profile roles

- [ ] Edit [supabase/migrations/20240504000001_init_schema.sql](/home/mya/Desktop/breakpoint%20infinity/ecommerce/supabase/migrations/20240504000001_init_schema.sql).
- [ ] Edit [supabase/migrations/20240504000003_rbac_rls.sql](/home/mya/Desktop/breakpoint%20infinity/ecommerce/supabase/migrations/20240504000003_rbac_rls.sql).
- [ ] Add a database-level constraint for `profiles.role`.
- [ ] Tighten the insert policy so user inserts cannot choose `admin`.
- [ ] Completion: a direct user insert cannot self-promote to admin.
- [ ] Verification: `rg -n "profiles.role|role IN|WITH CHECK|CHECK \\(" supabase/migrations/20240504000001_init_schema.sql supabase/migrations/20240504000003_rbac_rls.sql`

### TODO-07: Make migrations safe on clean deploy

- [ ] Edit [supabase/migrations/20240504000007_admin_roles.sql](/home/mya/Desktop/breakpoint%20infinity/ecommerce/supabase/migrations/20240504000007_admin_roles.sql).
- [ ] Add `DROP POLICY IF EXISTS` before any `CREATE POLICY` that can collide.
- [ ] Re-run the migration sequence mentally or in a clean test database.
- [ ] Completion: a fresh database can apply the migration chain without duplicate-policy errors.
- [ ] Verification: `rg -n "DROP POLICY IF EXISTS|CREATE POLICY" supabase/migrations/20240504000007_admin_roles.sql`

### TODO-08: Restore expired order status handling

- [ ] Edit [supabase/migrations/20240504000010_add_expired_status.sql](/home/mya/Desktop/breakpoint%20infinity/ecommerce/supabase/migrations/20240504000010_add_expired_status.sql).
- [ ] Ensure `expired` exists in `order_status`.
- [ ] Confirm the worker’s `checkout.session.expired` path maps to a valid state transition.
- [ ] Completion: expired sessions no longer trigger an enum-cast failure loop.
- [ ] Verification: `rg -n "expired|order_status|checkout.session.expired" supabase/migrations/20240504000010_add_expired_status.sql worker/src`

### TODO-09: Remove duplicate catalog route

- [ ] Delete [src/app/catalog/page.tsx](/home/mya/Desktop/breakpoint%20infinity/ecommerce/src/app/catalog/page.tsx).
- [ ] Update [src/app/page.tsx](/home/mya/Desktop/breakpoint%20infinity/ecommerce/src/app/page.tsx) to use `/shop/catalog`.
- [ ] Update [src/components/Footer.tsx](/home/mya/Desktop/breakpoint%20infinity/ecommerce/src/components/Footer.tsx) to use `/shop/catalog`.
- [ ] Verify [src/components/Header.tsx](/home/mya/Desktop/breakpoint%20infinity/ecommerce/src/components/Header.tsx) is consistent with the same destination.
- [ ] Completion: every catalog entry point lands on the same full-featured catalog page.
- [ ] Verification: `rg -n '"/catalog"|"/shop/catalog"' src/app src/components`

### TODO-10: Fix success-page trust flow

- [ ] Update [src/app/success/page.tsx](/home/mya/Desktop/breakpoint%20infinity/ecommerce/src/app/success/page.tsx).
- [ ] Remove the hardcoded paid assumption.
- [ ] Add a real Stripe session lookup path.
- [ ] Completion: the success page reflects actual Stripe status, not a guessed paid state.
- [ ] Verification: `sed -n '1,220p' src/app/success/page.tsx`

### TODO-11: Make cart data real

- [ ] Update [src/store/cart.ts](/home/mya/Desktop/breakpoint%20infinity/ecommerce/src/store/cart.ts).
- [ ] Update [src/lib/schema.ts](/home/mya/Desktop/breakpoint%20infinity/ecommerce/src/lib/schema.ts).
- [ ] Add item name and price fields to the cart shape.
- [ ] Completion: cart totals render from stored item data instead of hardcoded placeholder pricing.
- [ ] Verification: `sed -n '1,220p' src/store/cart.ts && sed -n '1,220p' src/lib/schema.ts`

### TODO-12: Regenerate Supabase types

- [ ] Regenerate [src/lib/database.types.ts](/home/mya/Desktop/breakpoint%20infinity/ecommerce/src/lib/database.types.ts).
- [ ] Remove any manual edits that fight the generated schema.
- [ ] Completion: the generated types match the current public schema.
- [ ] Verification: `sed -n '1,260p' src/lib/database.types.ts`

### TODO-13: Remove fallback `any[]` patterns

- [ ] Update [src/app/admin/page.tsx](/home/mya/Desktop/breakpoint%20infinity/ecommerce/src/app/admin/page.tsx).
- [ ] Update [src/app/shop/catalog/page.tsx](/home/mya/Desktop/breakpoint%20infinity/ecommerce/src/app/shop/catalog/page.tsx).
- [ ] Update [src/app/success/page.tsx](/home/mya/Desktop/breakpoint%20infinity/ecommerce/src/app/success/page.tsx).
- [ ] Completion: those pages use real typed state rather than unstructured `any` fallbacks.
- [ ] Verification: `rg -n "useState<any>|useState<any\\[]>|: any" src/app/admin/page.tsx src/app/shop/catalog/page.tsx src/app/success/page.tsx`

### TODO-14: Re-align DTOs with generated schema

- [ ] Review [src/types/dtos/checkout.dto.ts](/home/mya/Desktop/breakpoint%20infinity/ecommerce/src/types/dtos/checkout.dto.ts).
- [ ] Review [src/types/dtos/cart.dto.ts](/home/mya/Desktop/breakpoint%20infinity/ecommerce/src/types/dtos/cart.dto.ts).
- [ ] Review [worker/src/jobs/finalizeOrder.ts](/home/mya/Desktop/breakpoint%20infinity/ecommerce/worker/src/jobs/finalizeOrder.ts).
- [ ] Completion: DTOs and worker code agree with the generated database types and current order/status model.
- [ ] Verification: `sed -n '1,260p' src/types/dtos/checkout.dto.ts && sed -n '1,220p' src/types/dtos/cart.dto.ts && sed -n '1,220p' worker/src/jobs/finalizeOrder.ts`
