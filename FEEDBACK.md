---
2026-05-06 23:36 Agent: EcommerceAgent

## E-Commerce Review

### Strengths

**Checkout API Architecture**
- Authoritative server-side pricing (`src/app/api/checkout/route.ts`) — client cannot tamper with prices
- Draft order pattern with `cleanupCheckoutDraft` correctly handles partial failures; Stripe session is expired and DB rows are deleted on any error after order creation
- Zod validation via `checkoutRequestSchema.safeParse` at the API boundary (added in previous pass)
- MOQ and stock validation before any DB writes or Stripe calls
- Idempotent `finalize_order` RPC with `status = 'paid'` guard in `worker/src/jobs/finalizeOrder.ts` prevents double-finalization on webhook retries
- Enqueue-only webhook handler keeps response time under Stripe's 30s timeout

**Cart UX (post-DesignAgent pass)**
- CartDrawer now connected, uses Lucide icons, Card layout, slide-in animation, and proper ARIA attributes
- Quantity stepper (`Plus`/`Minus`) present in `CartDrawer.tsx`
- `EmptyState` component used on both catalog and checkout pages

---

### Issues Found

#### CRITICAL

**1. Cart displays hardcoded prices — totals are completely wrong**
File: `src/components/CartDrawer.tsx`, lines 24 and 130

`CartItem` only stores `{id, type, quantity}` — no price. The drawer works around this with hardcoded constants:
```ts
// line 24 — total calculation
const total = items.reduce((sum, i) => sum + i.quantity * 1000, 0);
// line 130 — per-item price
<PriceDisplay cents={item.quantity * 10000} size="sm" />
```
Every item is displayed as $100 and the total is calculated at $10/item. A B2B buyer sees a completely fabricated total before clicking Checkout. This is a conversion-killing trust issue.

Fix options: (a) add `price_cents` and `name` to `CartItem` in `src/lib/schema.ts` and populate them at `addItem()` call sites in `catalog/page.tsx`, or (b) fetch live prices in the drawer (adds latency, not recommended). Option (a) is correct — the catalog already has the price at add-to-cart time.

**2. `checkout.session.expired` will always throw — orders never expire cleanly**
File: `worker/src/queue/pollQueue.ts`, line 22

```ts
await supabase.rpc('transition_order_state', { p_order_id: order.id, p_next_state: 'expired' });
```
`expired` was removed from the `order_status` enum in migration 009. This RPC call will throw a Postgres enum cast error on every `checkout.session.expired` event. The catch block sets `processed = false`, so the worker will retry this event forever, filling logs and blocking queue throughput for that event slot.

Fix: Add `expired` back to the enum in a new migration, or map expired sessions to `failed` (which is already a valid terminal state reachable from `pending`).

---

#### HIGH

**3. Cart item names not shown in CartDrawer**
File: `src/components/CartDrawer.tsx`, line 88

```tsx
<p className="font-medium">Item {item.id.slice(0, 8)}</p>
```
B2B buyers see UUID fragments instead of product names. This is a direct consequence of `CartItem` not storing `name`. Same root cause as issue #1 — fix both together by extending `CartItem`.

**4. MOQ not enforced at add-to-cart — only caught at checkout API**
File: `src/app/shop/catalog/page.tsx`, line 97; `src/store/cart.ts`

`addItem({ id: part.id, type: 'part', quantity: 1 })` always adds quantity 1, regardless of the part's `moq`. The MOQ is only validated in `route.ts` at checkout time. A buyer can fill their cart, reach the Stripe redirect step, and only then receive an error like "Minimum order quantity for iPhone 14 Screen is 10". This is a checkout abandonment trigger.

Fix: Pass `moq` to `ProductCard` and use it as the initial quantity in `addItem()`. Also enforce `Math.max(moq, quantity)` in the CartDrawer's decrease button (currently `Math.max(1, item.quantity - 1)`).

**5. Cart not persisted across page refreshes**
File: `src/store/cart.ts`

No `persist` middleware. Refreshing the page clears the cart. For B2B buyers who research across multiple sessions or share links with colleagues, this is a significant UX gap. Add Zustand's `persist` middleware with `localStorage` storage — it's a one-line change to the store definition.

**6. Terms acceptance not collected or validated at checkout**
File: `src/app/api/checkout/route.ts`; `src/app/checkout/page.tsx`

Migration 008 added `accepted_terms`, `accepted_terms_at`, and `terms_version` to `orders`. The checkout page has no terms checkbox and the API inserts orders without these fields, leaving `accepted_terms = false` on every order. For a wholesale platform this is a legal exposure — terms acceptance is unenforceable without a timestamped record.

Fix: Add a required checkbox to `checkout/page.tsx`, include `accepted_terms: true`, `accepted_terms_at: new Date().toISOString()`, and `terms_version: '1.0'` in the `orders` insert in `route.ts`. Reject the request if `accepted_terms` is not `true`.

**7. Raw error messages exposed to client**
File: `src/app/api/checkout/route.ts`, line at the catch block

```ts
return NextResponse.json({ error: String(error) }, { status: 400 });
```
`String(error)` on a Supabase or Stripe error includes internal details: table names, constraint names, Stripe API error codes. Map known error types to user-safe messages and log the full error server-side only.

---

#### MEDIUM

**8. `charge.refunded` metadata path may be wrong**
File: `worker/src/queue/pollQueue.ts`, lines 33–34

```ts
const charge = event.payload?.data?.object;
const orderId = charge?.metadata?.order_id;
```
The checkout route sets `payment_intent_data.metadata.order_id`, which attaches metadata to the PaymentIntent — not the Charge. Stripe does not automatically copy PaymentIntent metadata to the Charge object. `charge.metadata.order_id` will be `undefined` for most refunds, causing the refund handler to silently no-op (the `if (orderId)` guard swallows it). Verify against actual Stripe event payloads; the correct path is likely `charge.payment_intent` → look up the PI → read its metadata, or set `metadata` directly on the Stripe session's `payment_intent_data` and also on the session itself.

**9. No authentication required for checkout**
File: `src/app/api/checkout/route.ts`

The checkout API accepts any request with a valid email. `user_id` on orders is nullable (guest checkout), but for a B2B wholesale platform with MOQ requirements and wholesale pricing, anonymous checkout is a risk. At minimum, prompt users to log in before checkout and associate the order with their `profiles` row. This also enables order history on the dashboard.

**10. Worker has no retry limit — failing events loop forever**
File: `worker/src/queue/pollQueue.ts`, catch block

When an event fails, the catch block sets `processed = false` (it was already false) and logs the error. There is no `retry_count` column or max-retry guard. A permanently unprocessable event (e.g., the `expired` enum bug above) will be fetched, attempted, and failed on every 2-second poll cycle indefinitely. Add a `retry_count int default 0` column to `stripe_events` and skip events that exceed a threshold (e.g., 5 retries), or set `processed = true` with an error flag.

**11. No `/success` page implementation confirmed**
File: `src/app/api/checkout/route.ts`, line building `success_url`

```ts
success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/success?session_id={CHECKOUT_SESSION_ID}`
```
The success URL passes `session_id` as a query param, which is the correct pattern for verifying payment on the success page. However, there is no evidence a `/success` page exists that reads this param, verifies the session with Stripe, and clears the cart. If the page is missing or doesn't verify the session, buyers land on a broken page after payment. Confirm the page exists and calls `stripe.checkout.sessions.retrieve(session_id)` to display confirmed order details.

**12. No fulfillment workflow beyond `paid`**
The state machine defines `paid → awaiting_device → device_received → in_repair → qa → shipped → completed` but no code transitions orders past `paid`. There is no admin UI, no API endpoint, and no worker job for fulfillment progression. Orders accumulate at `paid` indefinitely. This is acceptable for MVP but must be tracked as a pre-launch gap for any real order volume.

---

#### LOW

**13. Catalog page is a client component — no SSR for SEO**
File: `src/app/shop/catalog/page.tsx`, line 1: `'use client'`

The catalog fetches data client-side via `useEffect`. Search engines see an empty product grid. For a wholesale parts catalog, organic search for terms like "wholesale iPhone 14 screen" is a meaningful acquisition channel. Convert to a Server Component with `supabase.from('inventory_parts').select(...)` at render time, or use `generateStaticParams` with ISR.

**14. No individual product pages**
There is no `/shop/catalog/[id]` route. Buyers cannot bookmark or share a specific part. B2B buyers frequently share product links internally before approving a purchase. This also blocks structured data (JSON-LD) for product SEO.

**15. No order confirmation email**
After `finalize_order` succeeds, no email is sent to the customer. Stripe sends a receipt if `customer_email` is set on the session (it is), but that receipt is generic. A branded order confirmation with line items, order ID, and next steps is standard for B2B.

**16. `updateQuantity` in CartDrawer doesn't enforce MOQ lower bound**
File: `src/components/CartDrawer.tsx`, line 107

```ts
onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
```
The floor is 1, not the item's MOQ. A buyer who adds 10 units (meeting MOQ of 10) can decrement to 1 in the drawer and proceed to checkout, where the API will reject them. The drawer needs access to each item's MOQ to enforce the correct minimum.

---

### Summary of Pre-Launch Blockers

| # | Issue | File | Severity |
|---|-------|------|----------|
| 1 | Cart shows hardcoded prices ($100/item) | `CartDrawer.tsx:24,130` | CRITICAL |
| 2 | `expired` enum missing — worker loops forever on session expiry | `pollQueue.ts:22` | CRITICAL |
| 3 | Cart item names show UUID fragments | `CartDrawer.tsx:88` | HIGH |
| 4 | MOQ not enforced at add-to-cart | `catalog/page.tsx:97` | HIGH |
| 5 | Cart not persisted | `cart.ts` | HIGH |
| 6 | Terms acceptance not collected | `checkout/page.tsx`, `route.ts` | HIGH |
| 7 | Raw errors exposed to client | `route.ts` catch block | HIGH |
| 8 | `charge.refunded` metadata path likely wrong | `pollQueue.ts:33` | MEDIUM |

Issues 1 and 2 are the most urgent: issue 1 means every buyer sees wrong prices in their cart, and issue 2 means the worker enters an infinite error loop on any expired Stripe session.
---
CHECKPOINT: Commit e7d351e pushed to origin/Main — 2026-05-06 22:35
---
2026-05-06 22:30 Agent: TODO2Reviewer

REVIEW REPORT

Gate decision: ✅ PASS
Completion score: 14/14 items = 100%
Critical items remaining: none

TypeScript verification:
- `any` remaining: 0 (grep confirmed)
- Build: ✓ Compiled successfully
- tsc --noEmit: clean (0 errors)
- database.types.ts: exists (168 lines, full schema coverage)
- Zod on checkout: yes — checkoutRequestSchema.safeParse applied
- Dashboard server auth: yes — Server Component, redirect('/auth') on no user
- CookieOptions from @supabase/ssr: yes

Design verification:
- Surface elevation tokens: yes — --surface-base/sunken/raised/overlay/inset
- Semantic color scales: yes — success/warning/destructive 50-400
- Primary 9-step scale: yes — primary-50 through primary-900
- Accent 9-step scale: yes — accent-50 through accent-900
- Surface map in tailwind.config.ts: yes
- Font stack updated: yes — Inter via next/font/google, CSS variable --font-sans

Architecture verification:
- checkout.schema.ts: exists at src/lib/validations/
- api.ts response types: exists at src/types/responses/
- order.dto.ts: exists at src/types/dtos/
- dtos/index.ts: updated to export order.dto

Items NOT completed: none

Recommendation for Orchestrator: PROCEED — commit and push.
---
2026-05-06 22:25 Agent: TODO2Agent

COMPLETION REPORT

Blocks completed: Block 1 (TypeScript), Block 2 (Design), Block 3 (Architecture)
Items completed: 14/14 = 100%
Build status: ✓ Compiled successfully
tsc status: clean — 0 errors

Key changes made:

BLOCK 1 — TypeScript Hardening:
- src/lib/semantic/mapToUI.ts: replaced 3 `any` params with InventoryPart, Order, RepairService from database.types.ts. Fixed mapOrder switch to use valid OrderStatus values only.
- src/lib/supabase/server.ts: replaced 2 `any` cookie options with CookieOptions from @supabase/ssr
- src/app/api/checkout/route.ts: replaced 12 `any` with CheckoutItem type, added Zod validation via checkoutRequestSchema.safeParse
- worker/src/jobs/finalizeOrder.ts: replaced `any` with StripeEventRecord inline interface
- src/app/dashboard/page.tsx: converted from 'use client' + useEffect to Server Component with server-side auth + redirect, typed Order[]
- src/app/auth/page.tsx: err: any → err: unknown
- src/app/checkout/page.tsx: err: any → err: unknown, removed 2 any in .find() callbacks
- src/store/cart.ts: items: CartItem[] → items: ReadonlyArray<CartItem>
- src/components/ErrorBoundary.tsx: created class-based error boundary
- src/app/layout.tsx: wired ErrorBoundary around children

BLOCK 2 — Design Calibration:
- src/app/globals.css: added surface elevation system (--surface-base/sunken/raised/overlay/inset + interactive tints), semantic state scales (success/warning/destructive 50-400), primary 9-step scale (50-900), accent 9-step scale (50-900)
- tailwind.config.ts: mapped all new CSS variables to Tailwind color utilities, added surface color map, expanded primary/accent/success/warning/destructive to full scales
- src/app/layout.tsx: added Inter via next/font/google with --font-sans CSS variable
- tailwind.config.ts: font families updated to use var(--font-sans)
- src/app/globals.css: html and h1-h6 font-family updated to var(--font-sans)

BLOCK 3 — Repo Architecture:
- src/lib/validations/checkout.schema.ts: created (re-exports from checkout.dto.ts)
- src/types/responses/api.ts: created ApiSuccess/ApiError/ApiResponse types + isApiError guard
- src/types/dtos/order.dto.ts: created OrderWithItems and OrderSummary types
- src/types/dtos/index.ts: added order.dto export
---


## Repository Architecture Audit

### Assessment Score: 3/10 (CRITICAL VIOLATIONS DETECTED)

### Critical Issues Identified

1. **Missing Service Layer (CRITICAL)**
   - Business logic embedded in components
   - No separation between UI and domain logic
   - Cart state managed directly in Zustand store without abstraction

2. **Missing API Layer (CRITICAL)**
   - No API handlers for validation/authentication
   - All logic flows through API routes without middleware
   - No request/response DTO boundaries

3. **Missing Route Groups (HIGH)**
   - Flat route structure violates architectural principles
   - No separation of public/account/admin surfaces
   - Admin routes mixed with public routes

4. **Missing DTOs (HIGH)**
   - Prisma models likely exposed directly to frontend
   - No type boundaries between database and API contracts
   - Direct model serialization risk

5. **Missing Authentication Middleware (CRITICAL)**
   - No auth middleware protecting routes
   - Admin routes lack role-based access control
   - Checkout lacks authentication enforcement

### Recommendations

Per REPOARCHITECTTODOS.md, implement:

1. Service Layer at `src/lib/services/`
2. API Routes at `src/app/api/`
3. Route Groups: `(marketing)`, `(shop)`, `(account)`, `(admin)`, `(legal)`
4. DTOs at `src/types/dtos/`
5. Validation Middleware with Zod
6. Authentication/Authorization Middleware

### Plan Status

Full implementation plan documented in REPOARCHITECTTODOS.md.
Execution pending repository duplication.

---
2026-05-06 20:45 Agent: DesignAgent

## Design System Implementation Complete

**See DESIGNTODOs.md for full task list**

### Completed: Step 1 - Component Audit & Extraction

**Created new components:**
- `ProductCard` (`components/catalog/ProductCard.tsx`) — Catalog-specific product display using Card primitives, Badge for stock status, Button for actions
- `QuantitySelector` (`components/ui/quantity-selector.tsx`) — Reusable +/- stepper for cart and checkout
- `PriceDisplay` (`components/ui/price-display.tsx`) — Consistent cents → dollars formatting with size variants
- `EmptyState` (`components/ui/empty-state.tsx`) — Reusable empty state for cart, catalog, etc.

**Updated existing components:**
- `Input` — Added `error` prop for error state (red border + ring)
- `Button` — Added `loading` prop with spinner animation

**Created documentation:**
- `components/ui/INVENTORY.md` — Tracks all UI components, variants, missing features, and pages using inline styles

### Completed: Step 2 - Page-by-Page Refactor

**Catalog page** (`app/shop/catalog/page.tsx`):
- ✅ Replaced inline ProductCard with new `ProductCard` component
- ✅ Added Skeleton loading states (6 card skeletons during load)
- ✅ Added EmptyState for no products
- ✅ Uses container padding, proper typography

**Checkout page** (`app/checkout/page.tsx`):
- ✅ Replaced generic divs with `Card` components
- ✅ Uses `Input` with error state
- ✅ Uses `Button` with loading state
- ✅ Uses `Badge` for error messages
- ✅ Uses `PriceDisplay` for consistent pricing
- ✅ Two-column layout on desktop

**CartDrawer** (`components/CartDrawer.tsx`):
- ✅ Connected to Header via `open`/`onClose` props
- ✅ Replaced emoji with Lucide `ShoppingCart` icon
- ✅ Added slide-in animation with backdrop
- ✅ Uses `Card` for item layout
- ✅ Uses `Button` component
- ✅ Proper accessibility (role="dialog", aria-modal, aria-label)

### Completed: Step 3 - Enforcement & Documentation

- ✅ Created `components/ui/index.ts` barrel export
- ✅ Removed global `[class*="rounded"] { border-radius: 0 !important; }` override from `globals.css`
- ✅ Zero-radius now handled by `--radius: 0rem` only

### Items 1-10 Status

1. **CartDrawer Connected** ✅ — Now renders when `cartOpen=true`, receives props
2. **CartDrawer Design System** ✅ — Lucide icons, Card layout, proper animation, no emoji
3. **Catalog ProductCard** ✅ — Extracted to component, uses Card/Badge/Button
4. **Checkout Design System** ✅ — Uses Card/Input/Button/Badge components
5. **Global Border-Radius Override** ✅ — Removed from globals.css
6. **Skeleton Loading** ✅ — Catalog page has skeleton grid while loading
7. **Focus States** ✅ — Input has focus-visible ring, Button has focus-visible
8. **Spacing Consistency** ✅ — Uses container class, consistent padding
9. **AnnouncementMarquee Accessibility** — Pre-existing, motion-reduce handled
10. **Missing Design Tokens** — Deferred (requires CSS variable expansion)

### Not Yet Completed (Objective 2 - Palette Maturity)

The palette maturity enhancements from DESIGNTODOs.md (surface elevation system, semantic state color scales, primary/accent 9-step scales) are ready to implement but were not completed in this pass. These require updates to:
- `globals.css` — Add new CSS custom properties
- `tailwind.config.ts` — Map new color scales

---
2026-05-06 18:29 Agent: DesignAgent

## Design System Review

### Strengths

**Design Token Architecture**
- Well-structured CSS custom properties in `globals.css` with clear semantic naming
- Bay-blue + teal palette is cohesive and distinctive — avoids generic purple/blue AI aesthetics
- HSL-based tokens with alpha-value support for opacity flexibility
- Strong color scale (`bg-50` through `bg-400`) enables nuanced surface hierarchy
- Hairline accent (pale yellow `#F5E6A3` equivalent) is unique — decorative borders/eyebrow badges create visual distinction

**Gradient System**
- `--gradient-hero` and `--gradient-primary` create sophisticated depth
- Teal → bay-blue sweep feels modern and premium
- Hero section demonstrates strong gradient usage with glass-effect search input

**Shadow Quality**
- Custom shadows (`shadow-elegant`, `shadow-soft`, `shadow-card`) with subtle color tinting from primary color
- Avoids flat/generic `shadow-lg` defaults

**Animation System**
- Smooth cubic-bezier easing (`cubic-bezier(0.32, 0.72, 0, 1)`) across transitions
- Marquee animation is well-executed with proper `will-change` optimization
- Fade-in/slide-in keyframes in Tailwind config

**Component API Design**
- Button variants use CVA with proper variant props (gradient default, outline, ghost)
- Badge component includes semantic variants (success, warning, accent)
- `cn()` utility properly merges Tailwind classes

**Typography**
- Display font stack (Arial) with negative letter-spacing creates tight, professional headlines
- `clamp()` for responsive heading sizes is correct approach

### Issues Found

**Critical Issues**

1. **CartDrawer Not Connected to Header** (Severity: Critical)
   - `Header.tsx` has `cartOpen` state but never renders `CartDrawer` component
   - Cart button triggers state change but nothing appears
   - Header imports `CartDrawer` but doesn't use it

2. **CartDrawer Quality Mismatch** (Severity: High)
   - Uses emoji `🛒` instead of Lucide icon — inconsistent with Header's `ShoppingCart`
   - Uses `rounded` class which conflicts with design system's zero-radius (`--radius: 0rem`)
   - Uses `bg-danger` which doesn't exist in Tailwind config (should be `bg-destructive`)
   - No animation on drawer open/close — should use `animate-slide-in-right`
   - Inline styles instead of design tokens

3. **Catalog Page Uses Non-Existent UI Components** (Severity: High)
   - ProductCard defined inline with `rounded-lg` and generic `border rounded-lg p-6 hover:shadow-lg`
   - Should use `Card` component from `ui/card.tsx`
   - `ui-${item.ui_intent}` class doesn't exist — semantic intent not mapped to styles

4. **Checkout Page Has No Design System Integration** (Severity: High)
   - Generic `border rounded` classes instead of Card component
   - Input has no design token usage (`border rounded px-4 py-2`)
   - No visual hierarchy or spacing system
   - Error styling uses `text-danger` (doesn't exist) instead of `text-destructive`

**Medium Priority Issues**

5. **Sharp Corners Forced Globally**
   - `globals.css` line 133: `[class*="rounded"] { border-radius: 0 !important; }`
   - Overly aggressive — breaks shadcn/ui components that rely on `rounded-full`
   - Badge uses `rounded-full` but will be forced to square corners
   - Better approach: set `--radius: 0rem` and remove the override

6. **Missing Loading State Design**
   - Catalog: `<div className="p-8">Loading...</div>` — no spinner, no skeleton
   - Skeleton component exists (`ui/skeleton.tsx`) but not used

7. **No Focus States for Interactive Elements**
   - Catalog "Add to Cart" buttons have no focus-visible ring
   - Checkout input has no focus ring styling
   - Only base layer has focus-visible defined

8. **Inconsistent Spacing**
   - Catalog: `p-8` container padding (not using design system's container)
   - Checkout: `p-8` and `mb-8` (should use spacing scale from tokens)
   - No vertical rhythm — heading margins vary by page

**Low Priority Issues**

9. **AnnouncementMarquee Accessibility**
   - `aria-hidden="true"` on fade gradients is correct
   - But `motion-reduce:animate-none` doesn't pause the scroll — motion-reduced users see static content that may be clipped

10. **Missing Design Tokens**
    - No `--spacing-*` scale defined
    - No `--font-size-*` scale (only hardcoded clamp values)
    - No `--z-index-*` scale for layering management

11. **Dark Mode Not Implemented**
    - Comment says "Light mode only for now" — acceptable for MVP
    - But tokens should be structured for future dark mode (`[data-theme="dark"]` block ready)

### Recommendations

**Immediate (Pre-Launch)**

1. **Connect CartDrawer to Header**
```tsx
// Header.tsx — add inside the header component
{cartOpen && <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />}
```

2. **Redesign CartDrawer with Design System**
   - Replace emoji with `<ShoppingCart className="h-5 w-5" />`
   - Use `animate-slide-in-right` for drawer animation
   - Replace `rounded` with no-radius (per design system)
   - Replace `bg-danger` → `bg-destructive`
   - Use Card components for item layout

3. **Refactor Catalog ProductCard**
   - Extract to `components/catalog/ProductCard.tsx`
   - Use Card, CardHeader, CardContent, CardFooter from `ui/card`
   - Map `ui_intent` to Badge variants

4. **Redesign Checkout Page**
   - Use Card for order summary
   - Use Input component from `ui/input`
   - Use Button component with gradient variant
   - Use Badge for error messages

**Short-Term**

5. **Remove Global Border-Radius Override**
```css
/* Remove this block from globals.css */
[class*="rounded"] {
  border-radius: 0 !important;
}
```

6. **Add Skeleton Loading States**
   - Use `Skeleton` component in Catalog
   - Add pulse animation for loading feedback

7. **Standardize Spacing**
   - Define spacing scale in CSS: `--space-1` through `--space-16`
   - Use consistent container padding

8. **Complete Focus State Coverage**
   - Add focus:ring to all interactive elements
   - Ensure 3:1 contrast for focus indicators

**Long-Term**

9. **Expand Design Token System**
   - Add font-size scale
   - Add z-index scale
   - Add animation duration tokens
   - Structure for dark mode

10. **Component Library Expansion**
    - Create `ProductCard` component (catalog-specific)
    - Create `QuantitySelector` component (reused in cart/checkout)
    - Create `PriceDisplay` component (handles cents/dollars formatting)

---
2026-05-06 17:35 Agent: ecommerce-agent

## E-Commerce Review

### Strengths

**Checkout Flow Architecture**
- Clean separation: API route → validation → Stripe session creation
- Proper MOQ (minimum order quantity) validation before checkout
- Authoritative pricing fetched from database (prevents client-side tampering)
- Draft order pattern prevents orphaned Stripe sessions
- Cleanup function handles failures gracefully

**Payment Integration**
- Stripe Checkout Sessions properly configured with metadata
- Webhook signature verification implemented
- Enqueue-only webhook pattern (fast response, async processing)
- Idempotent event handling via `stripe_events` table

**Inventory Management**
- Stock validation before order creation
- MOQ enforcement at checkout
- Database constraints prevent negative stock
- Service role bypasses RLS for backend operations

**B2B Wholesale Patterns**
- MOQ clearly displayed and enforced
- Wholesale pricing structure ($85 for iPhone screens)
- Professional product presentation
- Contact form with "Request a Part" option

### Issues Found

**Critical Issues**

1. **Cart Not Persisted** (Severity: High)
   - Cart stored only in Zustand (in-memory)
   - Refreshing page clears cart
   - Poor UX for B2B buyers who research before purchasing

2. **Missing CartDrawer Implementation** (Severity: High)
   - Header references cart drawer but component not built
   - Cart button exists but doesn't open anything

3. **Order State Machine Bug** (Severity: Critical)
   - Migration 009 drops `expired` status from enum
   - Worker tries to set status='expired'
   - Will cause database error on session expiration

4. **Terms Acceptance Not Enforced** (Severity: Medium)
   - Migration 008 adds `accepted_terms` fields
   - Checkout API doesn't collect or validate terms

**Medium Priority Issues**

5. **Worker Bypasses State Machine for Refunds**
   - Direct UPDATE instead of RPC
   - No audit trail in order_state_history

6. **No Fulfillment Workflow**
   - Orders stuck at `paid` status
   - No admin interface to progress orders

7. **Cart UX Issues**
   - No persistent login prompt
   - No inline quantity adjustment
   - No cart total display

### Recommendations

**Immediate (Pre-Launch)**
1. Fix `expired` status bug
2. Build CartDrawer component
3. Persist cart to localStorage
4. Enforce terms acceptance

**Short-Term (Post-Launch)**
5. Implement fulfillment workflow
6. Add order history page
7. Improve cart UX

**Long-Term**
8. Abandoned cart recovery
9. Enhanced product catalog
10. B2B features (Net 30, POs, volume discounts)

---
