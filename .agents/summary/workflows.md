# Workflows

## 1. Checkout Flow

```mermaid
sequenceDiagram
    participant Browser
    participant Next as Next.js /api/checkout
    participant DB as Supabase DB
    participant Stripe

    Browser->>Next: POST /api/checkout {items, email}
    Next->>DB: SELECT inventory_parts, repair_services (prices)
    Next->>Next: Validate stock + MOQ
    Next->>DB: INSERT orders (status='pending', stripe_session_id='draft_<uuid>')
    Next->>DB: INSERT order_items_parts / order_items_services
    Next->>Stripe: Create Checkout Session (metadata.order_id)
    Stripe-->>Next: {id, url}
    Next->>DB: UPDATE orders SET stripe_session_id = session.id
    Next-->>Browser: {url, orderId}
    Browser->>Stripe: Redirect to checkout URL
```

**Error path**: If any step after order creation fails, `cleanupCheckoutDraft` deletes the order items and order, and expires the Stripe session.

---

## 2. Stripe Webhook → Order Finalization

```mermaid
sequenceDiagram
    participant Stripe
    participant Next as Next.js /api/webhook/stripe
    participant DB as Supabase DB
    participant Worker

    Stripe->>Next: POST webhook (checkout.session.completed)
    Next->>Next: Verify stripe-signature
    Next->>DB: UPSERT stripe_events (idempotent on event_id)
    Next-->>Stripe: {received: true}

    loop Every 2 seconds
        Worker->>DB: SELECT stripe_events WHERE processed=false LIMIT 20
        DB-->>Worker: [events]
        Worker->>DB: RPC finalize_order(session_id)
        Note over DB: SELECT orders FOR UPDATE<br/>Idempotency check (status='paid'?)<br/>UPDATE orders SET status='paid'<br/>UPDATE inventory_parts stock_count<br/>Check stock_count >= 0
        DB-->>Worker: OK
        Worker->>DB: UPDATE stripe_events SET processed=true
    end
```

---

## 3. Order State Machine

```mermaid
stateDiagram-v2
    [*] --> pending
    pending --> paid : checkout.session.completed
    pending --> failed
    paid --> awaiting_device
    paid --> refunded
    awaiting_device --> device_received
    awaiting_device --> refunded
    device_received --> in_repair
    device_received --> refunded
    in_repair --> qa
    in_repair --> refunded
    qa --> shipped
    qa --> in_repair : rework
    shipped --> completed
    completed --> [*]
    refunded --> [*]
    failed --> [*]
```

Transitions are enforced by the `transition_order_state(p_order_id, p_next_state)` RPC. Direct `UPDATE` on `orders` is revoked from `anon` and `authenticated` roles (migration 009). The worker uses the service role key.

---

## 4. Authentication Flow

```mermaid
sequenceDiagram
    participant Browser
    participant SupaAuth as Supabase Auth
    participant DB as Supabase DB

    Browser->>SupaAuth: signUp / signInWithPassword
    SupaAuth-->>Browser: {user, session}
    Browser->>DB: UPSERT profiles {id, email, role='customer'}
    Browser->>Browser: router.push('/dashboard')
```

Admin access is granted by manually setting `profiles.role = 'admin'` in the database.

---

## 5. Catalog → Cart → Checkout

```mermaid
flowchart LR
    Catalog["/shop/catalog\nFetch parts + services\nApply mapInventoryPart"]
    Cart["Zustand useCart\n(in-memory)"]
    CartDrawer["CartDrawer\nSlide-out panel"]
    CheckoutPage["/checkout\nFetch live prices\nCollect email"]
    API["POST /api/checkout"]
    Stripe["Stripe Checkout"]

    Catalog -->|"addItem()"| Cart
    Cart --> CartDrawer
    CartDrawer -->|"navigate"| CheckoutPage
    CheckoutPage -->|"POST"| API
    API -->|"redirect URL"| Stripe
```

---

## 6. Worker Failure Recovery

If the worker crashes mid-processing:
- `stripe_events` rows remain with `processed = false`
- On restart, the worker re-fetches and reprocesses them
- `finalize_order` RPC has an idempotency guard (checks `status = 'paid'` before acting)
- Stripe may retry webhooks; the `upsert` with `ignoreDuplicates: true` prevents duplicate rows
