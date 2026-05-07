# Data Models

## Database Tables

### `profiles`
| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | Matches `auth.uid()` |
| `email` | text | |
| `role` | text | `'customer'` (default) or `'admin'` |

### `inventory_parts`
| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `name` | text | |
| `sku` | text | |
| `price_cents` | int | Must be > 0 (constraint) |
| `stock_count` | int | Must be ≥ 0 (constraint) |
| `moq` | int | Minimum order quantity |
| `is_active` | boolean | Controls public visibility |
| `image_url` | text | |
| `description` | text | |
| `device_model` | text | Added in migration 008 |
| `component_type` | text | Added in migration 008 |
| `quality_tier` | text | Added in migration 008 |
| `compatibility` | text | Added in migration 008 |
| `brightness` | int | Added in migration 008 (B2B spec) |
| `color_gamut` | text | Added in migration 008 (B2B spec) |
| `failure_rate_estimate` | numeric(5,2) | Added in migration 008 (B2B spec) |

### `repair_services`
| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `name` | text | |
| `sku` | text | |
| `price_cents` | int | Must be > 0 (constraint) |
| `is_active` | boolean | Controls public visibility |
| `description` | text | |
| `service_type` | text | Added in migration 008 |
| `turnaround_class` | text | Added in migration 008 |

### `orders`
| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `user_id` | uuid FK → profiles | Nullable (guest checkout) |
| `stripe_session_id` | text UNIQUE | Initially `'draft_<uuid>'`, updated after Stripe session creation |
| `total_cents` | int | |
| `status` | order_status | Enum, enforced by state machine |
| `accepted_terms` | boolean | Default false (migration 008) |
| `accepted_terms_at` | timestamptz | (migration 008) |
| `terms_version` | text | (migration 008) |
| `created_at` | timestamptz | |
| `updated_at` | timestamptz | |

### `order_items_parts`
| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `order_id` | uuid FK → orders | CASCADE delete |
| `part_id` | uuid FK → inventory_parts | |
| `quantity` | int | Must be > 0 (constraint) |
| `price_cents` | int | Snapshot at time of order |

### `order_items_services`
| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `order_id` | uuid FK → orders | CASCADE delete |
| `service_id` | uuid FK → repair_services | |
| `price_cents` | int | Snapshot at time of order |

### `stripe_events`
| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `event_id` | text UNIQUE | Stripe event ID (idempotency key) |
| `type` | text | e.g. `checkout.session.completed` |
| `payload` | jsonb | Full Stripe event object |
| `processed` | boolean | Default false; worker sets to true |
| `created_at` | timestamptz | |

### `order_state_transitions`
| Column | Type | Notes |
|---|---|---|
| `from_state` | order_status | Composite PK |
| `to_state` | order_status | Composite PK |

Valid transitions seeded in migration 009 (see workflows.md).

### `order_state_history`
| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `order_id` | uuid FK → orders | CASCADE delete |
| `from_state` | order_status | |
| `to_state` | order_status | |
| `changed_at` | timestamptz | |
| `metadata` | jsonb | |

---

## Enums

### `order_status`
Defined in migration 009 (replaces the simpler enum from migration 002):

```
pending → paid → awaiting_device → device_received → in_repair → qa → shipped → completed
pending → failed
paid → refunded
awaiting_device → refunded
device_received → refunded
in_repair → refunded
qa → in_repair  (rework loop)
```

> **Note**: `expired` is **not** in this enum. The worker's `pollQueue.ts` sets `status = 'expired'` for `checkout.session.expired` events, which will fail against the enforced state machine. See `review_notes.md`.

---

## TypeScript Types

### `CartItem` (`src/lib/schema.ts`)
```typescript
interface CartItem {
  id: string;
  type: 'part' | 'service';
  quantity: number;
}
```

### `SemanticEntity` (`src/lib/semantic/types.ts`)
```typescript
interface SemanticEntity {
  ui_state: UIState;      // 'neutral' | 'success' | 'warning' | 'danger' | 'muted'
  ui_intent: UIIntent;    // 'sellable' | 'service' | 'low_stock' | 'out_of_stock' | 'processing' | 'completed'
  severity: Severity;     // 'normal' | 'low' | 'high' | 'critical'
}
```

Semantic mapping rules (from `mapToUI.ts`):
- `stock_count === 0` → `danger / out_of_stock / critical`
- `stock_count <= 3` → `warning / low_stock / high`
- otherwise → `neutral / sellable / normal`
