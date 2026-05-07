# Dependencies

## Next.js App (`/package.json`)

### Runtime Dependencies

| Package | Version | Usage |
|---|---|---|
| `next` | ^14.0.0 | App framework, App Router, API routes |
| `react` / `react-dom` | ^18.2.0 | UI rendering |
| `zustand` | ^4.4.0 | Client-side cart state |
| `@supabase/supabase-js` | ^2.38.0 | DB access, Auth, RPC calls |
| `stripe` | ^14.0.0 | Checkout session creation, webhook verification |

### Dev Dependencies

| Package | Version | Usage |
|---|---|---|
| `typescript` | ^5.4.0 | Type checking |
| `tsx` | ^4.0.0 | TypeScript execution (dev) |
| `tailwindcss` | ^3.4.1 | Utility CSS |
| `vitest` | ^1.0.0 | Unit testing (no tests written yet) |
| `@playwright/test` | ^1.40.0 | E2E testing (no tests written yet) |
| `concurrently` | ^8.2.0 | Run web + worker together via `pnpm dev` |

---

## Worker (`/worker/package.json`)

### Runtime Dependencies

| Package | Version | Usage |
|---|---|---|
| `@supabase/supabase-js` | ^2.38.0 | DB polling and RPC calls (service role) |

### Dev Dependencies

| Package | Version | Usage |
|---|---|---|
| `typescript` | ^5.4.0 | Type checking |
| `tsx` | ^4.0.0 | `tsx watch src/index.ts` for dev |

---

## External Services

| Service | Purpose | Config |
|---|---|---|
| Supabase | PostgreSQL DB, Auth, RLS, RPCs | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` |
| Stripe | Payment processing, webhooks | `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` |

---

## Environment Variables

### `.env.local` (Next.js)
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### `.env` (Worker)
```
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
```

The worker uses `SUPABASE_URL` (not `NEXT_PUBLIC_SUPABASE_URL`) and the service role key, which bypasses RLS and the `UPDATE` revocation on `orders`.
