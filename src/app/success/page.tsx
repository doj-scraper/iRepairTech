import Link from 'next/link';
import { ArrowRight, CheckCircle2, ClipboardList, ShieldCheck } from 'lucide-react';
import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/formatters';
import { stripe } from '@/lib/stripe/client';

export const dynamic = 'force-dynamic';

type SuccessPageProps = {
  searchParams?: {
    session_id?: string | string[];
  };
};

function getSessionId(searchParams?: SuccessPageProps['searchParams']) {
  const value = searchParams?.session_id;
  return Array.isArray(value) ? value[0] : value;
}

export default async function SuccessPage({ searchParams }: SuccessPageProps) {
  const sessionId = getSessionId(searchParams);
  let paymentStatus = 'unavailable';
  let sessionStatus = 'unavailable';
  let customerEmail: string | null = null;
  let totalCents = 0;

  if (sessionId) {
    try {
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      paymentStatus = session.payment_status;
      sessionStatus = session.status ?? 'unknown';
      customerEmail = session.customer_details?.email ?? session.customer_email ?? null;
      totalCents = session.amount_total ?? 0;
    } catch {
      paymentStatus = 'verification unavailable';
      sessionStatus = 'verification unavailable';
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main id="main-content" className="px-4 py-8 md:px-6 md:py-12">
        <div className="container space-y-8">
          <section className="shell-frame overflow-hidden">
            <div className="shell-core grid gap-8 px-5 py-6 sm:px-6 sm:py-8 md:grid-cols-[1.05fr_0.95fr] md:px-10 md:py-12">
              <div className="space-y-5">
                <Badge variant="success">Payment confirmed</Badge>
                <div className="inline-flex h-14 w-14 items-center justify-center rounded-full border border-primary/20 bg-primary/10 text-primary">
                  <CheckCircle2 className="h-7 w-7" />
                </div>
                <h1 className="page-title text-primary md:text-6xl">
                  Your order is now in the system and ready for fulfillment flow.
                </h1>
                <p className="max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base sm:leading-8 md:text-lg">
                  Your order has been confirmed and is visible in your dashboard. Our trade team will review stock allocation and prepare fulfillment.
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {[
                    { icon: ClipboardList, title: 'Dashboard ready', body: 'Customers can move directly into their order history and account view.' },
                    { icon: ShieldCheck, title: 'Confirmation locked in', body: 'Payment confirmation, account follow-through, and next-step guidance stay in one branded state.' },
                  ].map((item) => (
                    <div key={item.title} className="rounded-[1.5rem] border border-hairline/70 bg-secondary/35 p-4">
                      <item.icon className="h-5 w-5 text-accent" />
                      <h2 className="mt-4 font-semibold text-primary">{item.title}</h2>
                      <p className="mt-2 text-sm text-muted-foreground">{item.body}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="shell-frame bg-transparent">
                <div className="shell-core h-full px-5 py-6 sm:px-6 sm:py-8">
                  <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Order confirmation</p>
                  <div className="mt-6 space-y-4">
                    <div className="rounded-[1.5rem] border border-hairline/70 bg-secondary/35 p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Confirmation email</p>
                      <p className="mt-2 font-semibold text-primary">{customerEmail ?? 'Sent to the address used during checkout'}</p>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="rounded-[1.5rem] border border-hairline/70 bg-secondary/35 p-4">
                        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Payment confirmation</p>
                        <p className="mt-2 font-semibold capitalize text-primary">{paymentStatus}</p>
                      </div>
                      <div className="rounded-[1.5rem] border border-hairline/70 bg-secondary/35 p-4">
                        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Processing state</p>
                        <p className="mt-2 font-semibold capitalize text-primary">{sessionStatus}</p>
                      </div>
                    </div>
                    <div className="rounded-[1.5rem] border border-hairline/70 bg-secondary/35 p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Captured total</p>
                      <p className="mt-2 font-semibold text-primary">{formatCurrency(totalCents)}</p>
                    </div>
                    <div className="rounded-[1.5rem] border border-hairline/70 bg-secondary/35 p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">What happens next</p>
                      <p className="mt-2 text-sm text-muted-foreground">
                        Trade support will review stock allocation, prepare fulfillment, and keep the order visible in your dashboard for follow-up.
                      </p>
                    </div>
                  </div>

                  <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                    <Button asChild className="sm:flex-1">
                      <Link href="/dashboard">
                        View dashboard
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button asChild className="sm:flex-1" variant="outline">
                      <Link href="/shop/catalog">Continue shopping</Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
