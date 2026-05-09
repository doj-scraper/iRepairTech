# REPO ARCHITECTURE REFINEMENT PLAN
## Updated: 2026-05-06

## 📋 EXECUTIVE SUMMARY

This plan addresses real gaps identified in the codebase audit. The project already has a solid, intentional architecture (Next.js BFF + Supabase + Stripe + async worker). The goal is to harden what exists — not restructure it. Changes are scoped to TypeScript safety, validation, auth correctness, and route organization.

---

## 🔴 PHASE 1: TYPESCRIPT HARDENING (HIGH PRIORITY)

The project has `src/lib/database.types.ts` with proper types. The `any` usages need to be replaced with these types.

### 1.1 `src/app/api/checkout/route.ts` — 12 `any` usages

Replace item filtering/mapping `any` with the `CartItem` discriminated union from `src/types/dtos/cart.dto.ts` and DB types from `database.types.ts`.

```typescript
// Replace: items.filter((i: any) => i.type === 'part')
// With:
import type { CartItem } from '@/types/dtos/cart.dto';
// items is CartItem[] after Zod parse (see Phase 2)
```

Key replacements:
- `items: any[]` → `items: CartItem[]`
- `(i: any) => i.type === 'part'` → type-narrowed with `i.type === 'part'`
- `parts.find(p => p.id === i.id)` → typed as `InventoryPart | undefined`

### 1.2 `src/lib/semantic/mapToUI.ts` — 3 `any` parameters

```typescript
// Replace:
export function mapInventoryPart(part: any)
export function mapOrder(order: any)
export function mapRepairService(service: any)

// With:
import type { InventoryPart, Order, RepairService } from '@/lib/database.types';
export function mapInventoryPart(part: InventoryPart)
export function mapOrder(order: Order)
export function mapRepairService(service: RepairService)
```

### 1.3 `worker/src/jobs/finalizeOrder.ts` — 1 `any` parameter

```typescript
// Replace: export async function finalizeOrder(event: any)
// With:
import type { StripeEvent } from '../../types'; // or inline the shape
interface FinalizeEvent {
  payload: { data: { object: { id: string; metadata: { order_id?: string } } } };
}
export async function finalizeOrder(event: FinalizeEvent)
```

### 1.4 `src/lib/supabase/server.ts` — `any` cookie options

```typescript
// Replace: options: any
// With:
import type { CookieOptions } from '@supabase/ssr';
set(name: string, value: string, options: CookieOptions)
remove(name: string, options: CookieOptions)
```

### 1.5 `src/app/dashboard/page.tsx` — `any` state types

```typescript
// Replace:
const [orders, setOrders] = useState<any[]>([]);
const [user, setUser] = useState<any>(null);

// With:
import type { Order } from '@/lib/database.types';
import type { User } from '@supabase/supabase-js';
const [orders, setOrders] = useState<Order[]>([]);
const [user, setUser] = useState<User | null>(null);
```

---

## 🟡 PHASE 2: ZOD VALIDATION ON API ROUTES (MEDIUM PRIORITY)

Add Zod schemas to validate request bodies before any processing.

### 2.1 Create `src/lib/validations/checkout.schema.ts`

```typescript
import { z } from 'zod';

export const CartItemSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('part'), id: z.string().uuid(), quantity: z.number().int().positive() }),
  z.object({ type: z.literal('service'), id: z.string().uuid(), quantity: z.number().int().positive() }),
]);

export const CheckoutRequestSchema = z.object({
  items: z.array(CartItemSchema).min(1),
  email: z.string().email(),
});

export type CheckoutRequest = z.infer<typeof CheckoutRequestSchema>;
```

### 2.2 Apply to `src/app/api/checkout/route.ts`

```typescript
const body = await req.json();
const parsed = CheckoutRequestSchema.safeParse(body);
if (!parsed.success) {
  return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
}
const { items, email } = parsed.data; // fully typed, no any
```

### 2.3 Create `src/lib/validations/contact.schema.ts` (if contact form posts to an API route)

Check `src/app/contact/page.tsx` — if it submits to an API route, add a schema there too.

---

## 🟡 PHASE 3: FIX SERVER-SIDE AUTH IN DASHBOARD (MEDIUM PRIORITY)

`src/app/dashboard/page.tsx` currently fetches the user in `useEffect` on the client. This means unauthenticated users see a flash before redirect, and the auth check is bypassable.

### 3.1 Convert to Server Component

```typescript
// src/app/dashboard/page.tsx
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/auth');

  const { data: orders } = await supabase
    .from('orders')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  // render with orders (typed as Order[])
}
```

Remove `'use client'`, `useEffect`, `useState`. The order list rendering can be a separate Client Component if interactivity is needed.

---

## 🟢 PHASE 4: ROUTE GROUPS (LOW PRIORITY — OPTIONAL CLEANUP)

Reorganize routes into Next.js route groups for layout separation. This is a refactor with no behavior change — do it in one commit.

```
src/app/
├── (marketing)/
│   ├── page.tsx              ← home
│   ├── contact/page.tsx
│   └── catalog/page.tsx
├── (shop)/
│   └── shop/catalog/page.tsx
├── (account)/
│   ├── auth/page.tsx
│   ├── dashboard/page.tsx
│   ├── checkout/page.tsx
│   └── success/page.tsx
├── (admin)/
│   └── admin/page.tsx
├── api/                      ← stays flat, not grouped
├── layout.tsx                ← root layout unchanged
└── error/page.tsx
```

**Note**: Route groups don't change URLs. `/dashboard` stays `/dashboard`. Each group can have its own `layout.tsx` if needed (e.g., admin layout with sidebar).

---

## 🟢 PHASE 5: COMPLETE TYPES DIRECTORY (LOW PRIORITY)

`src/types/dtos/cart.dto.ts` already exists and is well-typed. Extend it:

### 5.1 `src/types/dtos/order.dto.ts`

```typescript
import type { Order, OrderItemPart, OrderItemService } from '@/lib/database.types';

export type OrderWithItems = Order & {
  order_items_parts: OrderItemPart[];
  order_items_services: OrderItemService[];
};
```

### 5.2 `src/types/responses/api.ts`

```typescript
export type ApiSuccess<T> = { data: T };
export type ApiError = { error: string };
export type ApiResponse<T> = ApiSuccess<T> | ApiError;
```

---

## ✅ VALIDATION CHECKLIST

After each phase:
- [ ] `npm run build` passes with no type errors
- [ ] `npm run lint` passes
- [ ] No new `any` introduced

---

## 📈 ROLLBACK PLAN

1. Work on a feature branch: `git checkout -b typescript-hardening`
2. Commit after each phase
3. If a phase breaks the build, revert that commit and investigate before retrying

---

## ⏰ ESTIMATED TIMELINE

| Phase | Task | Time |
|-------|------|------|
| 1 | TypeScript `any` replacements | 1.5 hours |
| 2 | Zod validation on checkout route | 30 minutes |
| 3 | Dashboard server-side auth | 30 minutes |
| 4 | Route groups (optional) | 45 minutes |
| 5 | Complete types directory | 20 minutes |
| **Total** | | **~3.5 hours** |

---

## ❌ WHAT THIS PLAN DOES NOT DO

These were in the original plan but are wrong for this project:

- **No cart API routes** — the cart is intentionally client-side Zustand state. It doesn't need server persistence.
- **No auth API routes** — Supabase Auth handles login/logout/register. Wrapping it adds complexity with no benefit.
- **No service layer** — the BFF pattern (Next.js API routes calling Supabase directly) is correct for this app's scale.
- **No deletion of `src/store/cart.ts`** — the Zustand cart store stays.
- **No Prisma references** — this project uses Supabase, not Prisma.
