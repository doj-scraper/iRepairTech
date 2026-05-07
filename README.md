# iRepair v2.5 — Wholesale Cell Phone Repair Parts

Production-grade e-commerce platform for wholesale iPhone repair parts. Built with Next.js 14, Supabase, Stripe, and Tailwind CSS v4.

## Features

- 🎨 Modern design system with bay-blue + teal palette
- 🔐 Supabase authentication and RLS
- 💳 Stripe checkout integration
- 📦 Real-time inventory management
- 🔄 Async webhook processing with worker
- 📱 Fully responsive design
- ♿ WCAG AA compliant
- 🚀 Optimized for B2B wholesale

## Tech Stack

- **Frontend:** Next.js 14 (App Router), React 18, TypeScript
- **Styling:** Tailwind CSS v4, shadcn/ui components
- **Backend:** Supabase (PostgreSQL + Auth + RLS)
- **Payments:** Stripe Checkout + Webhooks
- **State:** Zustand
- **Forms:** React Hook Form + Zod
- **Icons:** Lucide React

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm
- Supabase account
- Stripe account

### Installation

```bash
pnpm install
```

### Environment Variables

Create `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
STRIPE_SECRET_KEY=your_stripe_secret
STRIPE_WEBHOOK_SECRET=your_webhook_secret
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### Database Setup

Run migrations:

```bash
# Using Supabase CLI
supabase db push

# Or manually run migrations in supabase/migrations/
```

### Development

```bash
# Start Next.js dev server
pnpm dev

# Start worker (separate terminal)
cd worker && pnpm dev
```

Visit [http://localhost:3000](http://localhost:3000)

### Production Build

```bash
pnpm build
pnpm start
```

## Project Structure

```
/
├── src/
│   ├── app/              # Next.js App Router pages
│   ├── components/       # React components
│   ├── lib/              # Utilities (supabase, stripe, etc.)
│   └── store/            # Zustand stores
├── supabase/
│   ├── migrations/       # Database migrations
│   └── functions/        # Edge functions (stubs)
├── worker/               # Async webhook processor
└── public/               # Static assets
```

## Deployment

### Vercel (Recommended)

```bash
vercel deploy
```

Configure environment variables in Vercel dashboard.

### Manual Deployment

1. Build the application: `pnpm build`
2. Start the server: `pnpm start`
3. Deploy worker separately
4. Configure Stripe webhook endpoint

## Key Features

### Checkout Flow

1. User adds items to cart
2. Validates inventory and MOQ
3. Creates Stripe checkout session
4. Redirects to Stripe
5. Webhook processes payment
6. Worker finalizes order

### State Machine

Orders follow strict state transitions enforced at database level:
- `pending` → `paid` → `completed`
- `pending` → `expired` / `failed`

### Security

- Row-level security (RLS) on all tables
- Service role for backend operations
- Webhook signature verification
- Advisory locks for inventory

## License

Proprietary - iRepair Technologies

## Support

Contact: sales@irepairtech.com
