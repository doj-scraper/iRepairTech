TYPESCRIPT/NEXTJS SUPABASE TODOS 



Issues & Recommendations ⚠️

COMPLETE 1-9 and then 1-10 

1-9 is typescript hardening, be very thorough please, and careful, you have all of the keys that you need, and use the CLI tools if you have to. you are free to work autonomously, and when you finish, update FEEDBACK.md  as well as this document. 



---
## Improvement Plan

### Phase 1: TypeScript Hardening (High Impact)
1. **Generate Supabase Types** (30 min)
   ```bash
   npx supabase gen types typescript --local > src/lib/database.types.ts
   ```
2. **Replace `any` with Proper Types** (1-2 hrs)
   - Add `CartItem` to API checkout
   - Create `CheckoutItem` type with discriminated union
   - Type the mapToUI functions
3. **Add Zod Validation** (1 hr)
   - Validate checkout request body
   - Validate webhook payloads

### Phase 2: Supabase Best Practices (High Impact)

4. **Server-Side Auth** (1 hr)
   - Move auth check to Server Component or Middleware
   - Use `createClient` with auth cookie handling
5. **Add Rate Limiting** (30 min)
   - Use `upstash/ratelimit` or built-in solution
6. **Strict Null Handling** (30 min)
   - Handle `data: null` from Supabase responses

### Phase 3: Refinements (Optional)

7. Add error boundaries

8. Add loading states with discriminated unions

9. Deep readonly types for cart store
---


SUPABASE AND NEXTJS 

1. Auth in Client Components (src/app/dashboard/page.tsx:16-24)
   - Using supabaseClient.auth.getUser() in client components exposes user data before auth check
   - Fix: Use server actions or Middleware for auth protection

2. Service Role Key Exposure 
   - SUPABASE_SERVICE_ROLE_KEY is in .env.local but should only be used server-side in API routes or background workers, never exposed to client

3. Missing Rate Limiting on checkout API (src/app/api/checkout/route.ts)
   - No protection against abuse; add rate limiting

4. No TypeScript Types for database entities
   - Creating a types/database.ts with generated types from Supabase would improve type safety
Medium Priority

5. Unused next-themes - Added but not visible in code reviewed

6. No input validation on API routes - Consider Zod for request body validation

7. Stripe webhook doesn't process events - Just logs to DB; worker handles async (correct pattern but ensure worker is reliable)

8. Missing error boundaries - Add for better UX
Low Priority

9. Hardcoded currency ('usd') in checkout - Consider from env

10. No caching - Consider Next.js unstable_cache for product fetches




















Good Practices ✅
1. Supabase Client Pattern - Correct separation of server (@supabase/ssr) and browser clients
2. Stripe webhook signature verification - Properly validates webhook signatures
3. Environment variables - Service role key stored separately from anon key
4. Database migrations - Well-organized with sequential versioning
5. RLS policies - Migration shows RBAC setup with 003_rbac_rls.sql


High Priority


TypeScript Issues Found
Issue	Severity	Location
any usage in API routes	High	src/app/api/checkout/route.ts:41-132 (12 occurrences)
any in mapToUI functions	High	src/lib/semantic/mapToUI.ts:8,34,61
any in server cookie options	Medium	src/lib/supabase/server.ts:15,22
any in worker event handler	Medium	worker/src/jobs/finalizeOrder.ts:3
No database types generated	High	Missing Supabase type generation
Missing strict null checks	Medium	API routes don't handle null from Supabase
No discriminated unions	Low	Cart could use status types
Supabase/Next.js Issues (from earlier)
Issue	Severity
Client-side auth in dashboard	High
Service role key in env	Medium
No rate limiting on checkout	Medium
No input validation (Zod)	Medium
No generated DB types	High

