# iRepair Technologies v2.5

Production-grade B2B e-commerce platform for wholesale iPhone and cell phone repair parts. Targets professional repair shops in the Houston, TX market. Built with Next.js 14 App Router, Supabase, Stripe, and Tailwind CSS v4.

## Features

- 🎨 Custom design system — bay-blue + teal palette, `shell-frame`/`shell-core` card system, Radix UI primitives
- 🔐 Supabase Auth with middleware-enforced protected routes
- 💳 Stripe Checkout with server-side session creation and webhook-driven order finalization
- 📦 Inventory management with minimum order quantities (MOQ), advisory locks, and oversell protection
- 🔄 Async webhook processing via a dedicated worker process
- 🚀 SSR catalog — products rendered server-side for instant first load and SEO indexing
- ⚡ Static homepage — served from Vercel CDN edge at ~0ms TTFB
- ♿ WCAG AA compliant — skip links, semantic landmarks, Radix focus management
- 📝 Wide-event structured logging on all API routes

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router), React 18, TypeScript 5 (strict) |
| Styling | Tailwind CSS v4, CVA (class-variance-authority), tailwind-merge |
| UI Primitives | Radix UI (Checkbox, Dialog, Select, Accordion, Avatar, Label, Slot, Separator) |
| Backend | Supabase (PostgreSQL + Auth + RLS + RPCs) |
| Payments | Stripe Checkout + Webhooks |
| State | Zustand (persisted cart) |
| Forms | React Hook Form + Zod |
| Icons | Lucide React |
| Toasts | Sonner |
| Testing | Vitest (unit), Playwright (e2e) |

## Prerequisites

- Node.js **≥ 20** (set in `engines` field)
- pnpm ≥ 9
- Supabase project
- Stripe account

## Environment Variables

Copy `.env.example` to `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
STRIPE_SECRET_KEY=your_stripe_secret
STRIPE_WEBHOOK_SECRET=your_webhook_secret   # from: stripe listen --forward-to ...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

> **Note:** `STRIPE_WEBHOOK_SECRET` must come from the Stripe CLI (`stripe listen`) or the Vercel dashboard webhook endpoint — it is not a static value.
>
> Public browser-safe values are validated in `src/lib/config/public.ts`. Server-only secrets are validated in `src/lib/config/server.ts` so they are never pulled into client bundles.

## Getting Started

```bash
# Install dependencies
pnpm install

# Start the Next.js dev server
pnpm dev

# In a second terminal — start the webhook worker
cd worker && pnpm dev

# In a third terminal — forward Stripe webhooks to local dev
stripe listen --forward-to localhost:3000/api/webhook/stripe
```

Visit [http://localhost:3000](http://localhost:3000).

## Production Build

```bash
pnpm build   # type-check + compile
pnpm start   # start production server
```

## Project Structure

```
/
├── src/
│   ├── app/
│   │   ├── page.tsx                    # Landing page (Static/SSG)
│   │   ├── layout.tsx                  # Root layout — global metadata, fonts, Header, Footer
│   │   ├── auth/page.tsx               # Supabase Auth UI
│   │   ├── checkout/page.tsx           # Cart review + Stripe redirect
│   │   ├── contact/page.tsx            # Contact form
│   │   ├── dashboard/page.tsx          # Buyer order history (auth-gated)
│   │   ├── admin/page.tsx              # Inventory management (admin role, auth-gated)
│   │   ├── success/page.tsx            # Post-payment confirmation
│   │   ├── error/page.tsx              # Payment failure / generic error
│   │   └── shop/catalog/
│   │       ├── page.tsx                # Server Component — fetches Supabase data
│   │       └── CatalogClient.tsx       # Client Component — cart interactions
│   │
│   ├── components/
│   │   ├── Header.tsx                  # Site header with nav + cart drawer trigger
│   │   ├── Footer.tsx                  # Site footer
│   │   ├── CartDrawer.tsx              # Slide-out cart (Radix Sheet)
│   │   ├── AnnouncementMarquee.tsx     # Scrolling announcement banner
│   │   ├── ErrorBoundary.tsx           # React error boundary wrapper
│   │   ├── admin/AdminBoard.tsx        # Admin data table
│   │   ├── auth/AuthScreen.tsx         # Auth page wrapper
│   │   ├── brand/
│   │   │   ├── BrandMark.tsx           # Logo component
│   │   │   └── SectionHeading.tsx      # Eyebrow + heading layout
│   │   ├── catalog/ProductCard.tsx     # Product card with add-to-cart
│   │   ├── orders/OrderStatusBadge.tsx # Semantic order status badge
│   │   └── ui/                         # Design system primitives (Button, Badge, Card, etc.)
│   │
│   ├── lib/
│   │   ├── logger.ts                   # Structured JSON logger (wide-event singleton)
│   │   ├── config/
│   │   │   ├── public.ts               # Browser-safe env validation
│   │   │   └── server.ts               # Server-only env validation
│   │   ├── database.types.ts           # Auto-generated Supabase TypeScript types
│   │   ├── formatters.ts               # Currency, date formatters
│   │   ├── schema.ts                   # Shared Zod schemas (CartItem, etc.)
│   │   ├── utils.ts                    # cn() utility (clsx + tailwind-merge)
│   │   ├── locks/advisoryLock.ts       # Postgres advisory lock helpers
│   │   ├── semantic/
│   │   │   ├── mapToUI.ts              # DB state → UI semantics (ui_state, ui_intent, severity)
│   │   │   └── types.ts                # UIState, UIIntent, Severity types
│   │   ├── stripe/
│   │   │   ├── client.ts               # Stripe SDK singleton
│   │   │   └── webhook.ts              # Webhook signature helpers
│   │   ├── supabase/
│   │   │   ├── client.ts               # Browser Supabase client (anon key)
│   │   │   ├── server.ts               # Server Supabase client (cookie-based)
│   │   │   └── service.ts              # Service role client (bypasses RLS)
│   │   └── validations/
│   │       └── checkout.schema.ts      # Checkout request Zod schema
│   │
│   ├── store/
│   │   └── cart.ts                     # Zustand cart store (localStorage-persisted)
│   │
│   └── types/
│       ├── dtos/                        # Data transfer object types
│       └── responses/api.ts            # API response types
│
├── worker/                             # Standalone async webhook processor
│   └── src/
│       ├── index.ts                    # Entry — polls queue every 2s
│       ├── db/client.ts                # Worker Supabase client
│       ├── jobs/finalizeOrder.ts       # Finalizes paid orders
│       └── queue/pollQueue.ts          # Polls stripe_events for unprocessed rows
│
├── supabase/
│   ├── migrations/                     # Versioned SQL migrations
│   └── functions/                      # Edge function stubs
│
├── middleware.ts                       # Auth guard for /dashboard and /admin
├── next.config.js                      # Image hostnames, security headers
├── vercel.json                         # Build config, env var aliases
├── .github/workflows/ci.yml           # CI — type-check + lint on push/PR
└── public/                             # Static assets
```

## Page Rendering Strategy

| Route | Mode | Reason |
|-------|------|--------|
| `/` | ○ Static | No dynamic data — CDN edge, ~0ms TTFB |
| `/shop/catalog` | ƒ Dynamic (SSR) | Live inventory from Supabase per request |
| `/dashboard` | ƒ Dynamic (SSR) | Auth-gated, user-specific order history |
| `/admin` | ƒ Dynamic (SSR) | Auth-gated, admin role required |
| `/success` | ƒ Dynamic (SSR) | Stripe session lookup per request |
| `/auth`, `/checkout`, `/contact`, `/error` | ○ Static | Client-side only |

## Checkout Flow

1. User builds cart in `CartDrawer` (Zustand, persisted to `localStorage`)
2. User reviews cart and accepts wholesale terms on `/checkout`
3. `POST /api/checkout`:
   - Authenticates user (optional — guest checkout supported)
   - Validates inventory & MOQ against Supabase (authoritative prices)
   - Creates draft `Order` record
   - Inserts `order_items_parts` / `order_items_services`
   - Calls `reserve_inventory_for_order` RPC (advisory lock, prevents oversell)
   - Creates Stripe Checkout session
   - Attaches `stripe_session_id` to order
4. User redirected to Stripe hosted checkout
5. On success: Stripe POSTs to `/api/webhook/stripe`
6. Webhook handler verifies signature, upserts event to `stripe_events` (enqueue-only)
7. Worker polls `stripe_events` every 2s, calls `finalize_order` RPC
8. RPC transitions order `pending → paid`, decrements inventory

## Security

- **RLS on all tables** — users only access their own data
- **Service role** for all backend mutations (never exposed to browser)
- **Stripe webhook signature** verified on every inbound event
- **Advisory locks** prevent inventory race conditions during concurrent checkouts
- **Auth middleware** redirects unauthenticated requests from `/dashboard` and `/admin`
- **Security headers** on all responses: `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`

## CI/CD

GitHub Actions runs on every push and PR:

```
Type-check (tsc --noEmit) + Lint (next lint)
```

Vercel auto-deploys on push to `main`. Enable **"Require checks to pass"** in Vercel Project Settings → Git to gate deployments on CI.

## Deployment

`vercel.json` is pre-configured with build commands and env var secret aliases. To deploy:

1. Connect GitHub repo in Vercel dashboard
2. Add secrets to Vercel: `@supabase_url`, `@supabase_anon_key`, `@supabase_service_role_key`, `@stripe_secret_key`, `@stripe_webhook_secret`, `@site_url`
3. Push to `main` — Vercel builds and deploys automatically

For the Stripe webhook endpoint in production, register `https://your-domain.com/api/webhook/stripe` in the Stripe dashboard and copy the signing secret to `@stripe_webhook_secret`.

## License

Proprietary — iRepair Technologies

## Support

Contact: sales@irepairtech.com
