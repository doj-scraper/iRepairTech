# AGENTS.md — iRepair Technologies

This file governs how AI agents (GitHub Copilot, Claude, Cursor, etc.) contribute to this codebase. Read it before writing any code.

---

## 🏛️ Architectural Rules (NEVER Violate)

### Design System
- **Every page MUST include `<Header />` and `<Footer />`** — no exceptions, including error pages.
- **Every page MUST have `<main id="main-content">`** — required for the skip navigation link.
- **Use `shell-frame` + `shell-core` for all card/panel containers.** Do not invent new card structures or use raw `border bg-card` classes directly.
- **Use Lucide React for all icons.** Do not add emoji icons, inline SVGs, or other icon libraries.
- **Use design token CSS variables** (`--accent`, `--foreground`, etc.) — never hardcode hex colors.
- **Use the existing `ui/` components** (`Button`, `Badge`, `Card`, `Checkbox`, `Input`, etc.) — do not install shadcn/ui again or create parallel primitives.

### TypeScript
- **Strict mode is on.** All variables must be typed before use. `any` is banned.
- **Never use `// @ts-ignore` or `// @ts-expect-error`** without a comment explaining why it's unavoidable.
- **Use types from `src/lib/database.types.ts`** for all Supabase table shapes — do not define your own duplicates.

### Supabase
- **Never use `select('*')`.** Always specify an explicit column list matching the TypeScript type.
- **Use `src/lib/supabase/server.ts`** in Server Components and API routes.
- **Use `src/lib/supabase/service.ts`** for privileged backend mutations (inventory, orders). Never expose the service role key to the browser.
- **Use `src/lib/supabase/client.ts`** only in Client Components (`'use client'`).
- **Never write direct `UPDATE orders SET status = ...`** — always use the `transition_order_state` RPC to enforce the state machine.

### Rendering
- **Do not add `export const dynamic = 'force-dynamic'`** to pages that have no dynamic data. The homepage is static; keep it static.
- **Do not add `'use client'`** to pages that can be Server Components. Prefer the server/client split pattern (see `shop/catalog/`).
- **Do not wrap pages in `useEffect` + `fetch`** when the data can be fetched server-side in a Server Component.

### Cart and State
- **Use `useCart` from `src/store/cart.ts`** — do not create additional Zustand stores or duplicate cart logic.
- **Do not persist sensitive data** in Zustand or localStorage.

### API Routes
- **Every API route handler MUST use the wide-event logging pattern** — one `logger.info(wideEvent)` call in the `finally` block.
- **Import `logger` from `src/lib/logger.ts`** — do not use `console.log` or `console.error` directly in route handlers.
- **Always clean up draft orders** on checkout failure via `cleanupCheckoutDraft`.

### Copy and Content
- **No developer/template language in user-visible UI.** Never write copy like: "protected by middleware", "template with premium operations-focused merchandising", "dashboard access is now protected".
- **All user-facing copy must be buyer-facing.** The audience is professional repair shop operators, not developers.

---

## 🧠 Hard-Learned Lessons (Do Not Repeat)

- **All variables must be typed before pushing.** TypeScript strict mode catches untyped vars in CI, but locally is faster.
- **Merge conflicts in page files break the build silently.** After any git merge/rebase, grep for `<<<<<<` before building.
- **`force-dynamic` on static pages adds ~300ms TTFB.** Only use it when the page actually reads dynamic data at request time.
- **`select('*')` exposes future schema columns automatically.** Always select explicit columns.
- **The Stripe webhook secret from `stripe listen` is ephemeral.** It changes every CLI restart. Never commit it; always pull from the environment.

---

## 🛡️ Global Safety Rules

- **NEVER run `rm -rf`, `del /s`, `rmdir`, or any command that deletes files without explicit user approval.**
- **NEVER run `DROP TABLE`, `DELETE FROM`, `TRUNCATE`, or any destructive DB operation without backup confirmation.**
- **NEVER run `git push --force` or `git reset --hard` — these rewrite shared history.**
- **NEVER run `npm publish`, `docker rm`, `terraform destroy`, or any irreversible deployment command.**
- **NEVER pipe remote scripts to shell (`curl | bash`, `wget | sh`).**
- **NEVER commit `.env.local`, `.env`, or any file containing secrets.**
- **When in doubt — show the command and wait for approval before running anything that modifies system state.**

---

## 🧭 Technology Boundaries

| Concern | Correct Tool | Do NOT Use |
|---------|-------------|------------|
| Icons | Lucide React | Heroicons, react-icons, emoji |
| Styling | Tailwind CSS v4 + CVA | CSS modules, styled-components, inline styles |
| UI primitives | Existing `src/components/ui/` | Install shadcn/ui again, create parallel components |
| DB types | `src/lib/database.types.ts` | Manual type definitions duplicating DB shape |
| Logging | `src/lib/logger.ts` | `console.log`, `console.error`, third-party loggers |
| Supabase (server) | `src/lib/supabase/server.ts` | Client Supabase in Server Components |
| Supabase (browser) | `src/lib/supabase/client.ts` | Service client in browser code |
| Forms | React Hook Form + Zod | Formik, uncontrolled inputs |
| Toast notifications | Sonner (`src/components/ui/sonner.tsx`) | `alert()`, other toast libraries |
| Cart state | `useCart` from `src/store/cart.ts` | New Zustand stores, Context API |

---

## 📋 Current Project State

**Version:** 2.5.0  
**Last updated:** May 2026  
**Build status:** ✅ Clean (`pnpm build` passes, 0 type errors)

### What Is Implemented
- Full e-commerce storefront: product catalog, cart, checkout, order history
- Supabase Auth with middleware-enforced protected routes (`/dashboard`, `/admin`)
- Stripe Checkout with server-side session creation and webhook-driven finalization
- Async worker process (`/worker`) for order processing
- Admin inventory management board
- Contact form with Supabase storage
- CI pipeline (GitHub Actions: type-check + lint on every push/PR)
- Vercel deployment config with secret aliases (`vercel.json`)
- Structured JSON logging on all API routes (wide-event pattern)
- Security response headers (X-Frame-Options, X-Content-Type-Options, Referrer-Policy)

### What Is Not Yet Implemented
- Email notifications on order state transitions
- Admin order fulfillment workflow (ship → complete)
- Cross-device cart persistence (currently localStorage only)
- Inventory low-stock alerts
- Analytics dashboard

---

*Maintained by the iRepair Technologies engineering team.*
