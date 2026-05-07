# Interfaces

## HTTP API (Next.js BFF)

### `POST /api/checkout`

**Request body:**
```json
{
  "items": [
    { "id": "<uuid>", "type": "part" | "service", "quantity": 1 }
  ],
  "email": "user@example.com"
}
```

**Success response (200):**
```json
{ "url": "<stripe_checkout_url>", "orderId": "<uuid>" }
```

**Error response (400):**
```json
{ "error": "<message>" }
```

**Behavior:**
1. Fetches authoritative prices from DB (never trusts client prices)
2. Validates stock count and MOQ for parts
3. Creates a draft order with `stripe_session_id = 'draft_<uuid>'`
4. Inserts `order_items_parts` and `order_items_services`
5. Creates Stripe Checkout session with `metadata.order_id`
6. Updates order with real `stripe_session_id`
7. On any error: calls `cleanupCheckoutDraft` to delete the order and expire the Stripe session

---

### `POST /api/webhook/stripe`

**Headers required:** `stripe-signature`

**Behavior:**
1. Verifies Stripe signature using `STRIPE_WEBHOOK_SECRET`
2. Upserts event into `stripe_events` with `onConflict: 'event_id'` (idempotent)
3. Returns `{ received: true }` — does **not** process the event

---

## Database RPCs (Supabase PostgreSQL)

### `finalize_order(p_session_id text)`

- Locks the order row (`SELECT ... FOR UPDATE`)
- Idempotency guard: returns early if `status = 'paid'`
- Sets `status = 'paid'`
- Deducts `stock_count` from `inventory_parts` for all `order_items_parts`
- Hard safety check: raises `INVENTORY_UNDERFLOW` if any `stock_count < 0`

### `transition_order_state(p_order_id uuid, p_next_state order_status)`

- Locks the order row
- Validates transition exists in `order_state_transitions` table
- Updates `orders.status`
- Inserts a row into `order_state_history`
- Raises `INVALID_TRANSITION: <from> → <to>` on invalid transitions
- `SECURITY DEFINER` — executes as the function owner

### `pg_advisory_lock(lockid bigint)` / `pg_advisory_unlock(lockid bigint)`

Standard PostgreSQL advisory lock functions, called via Supabase RPC from `src/lib/locks/advisoryLock.ts`. Currently unused in production code paths.

---

## Supabase Auth

- Sign up / sign in via `supabaseClient.auth.signUp` and `signInWithPassword`
- On first login, `ensureProfile` upserts a row into `profiles` with `role = 'customer'`
- Admin access is determined by `profiles.role = 'admin'` (set manually in DB)

---

## Stripe Integration

| Event | Handler |
|---|---|
| `checkout.session.completed` | Worker calls `finalize_order` RPC |
| `checkout.session.expired` | Worker sets `orders.status = 'expired'` |
| `charge.refunded` | Worker sets `orders.status = 'refunded'` |

Stripe session metadata carries `order_id` (UUID) to link back to the DB order.

---

## Supabase Realtime / Client-Side Reads

The catalog page (`/shop/catalog`) and admin page (`/admin`) read directly from Supabase using the browser client (anon key). RLS policies control what each role can see:

- **Public**: `SELECT` on `inventory_parts` and `repair_services` where `is_active = true`
- **Authenticated user**: `SELECT` on their own `orders`, `order_items_parts`, `order_items_services`
- **Admin**: `SELECT` + `UPDATE` on all `inventory_parts` and `repair_services`
