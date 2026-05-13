
'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { XCircle } from 'lucide-react';
import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

function ErrorContent() {
  const searchParams = useSearchParams();
  const reason = searchParams.get('reason') || 'Payment failed';

  return (
    <section className="shell-frame overflow-hidden">
      <div className="shell-core grid gap-8 px-5 py-6 sm:px-6 sm:py-8 md:grid-cols-[1.05fr_0.95fr] md:px-10 md:py-12">
        <div className="space-y-5">
          <Badge variant="destructive">Payment issue</Badge>
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-full border border-destructive/20 bg-destructive/10 text-destructive">
            <XCircle className="h-7 w-7" />
          </div>
          <h1 className="page-title text-primary md:text-6xl">
            Payment could not be completed.
          </h1>
          <p className="max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base sm:leading-8 md:text-lg">{reason}</p>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Your cart and product selection are still available, so you can review payment details and submit the order again without starting over.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild className="sm:flex-1">
              <Link href="/checkout">Try Again</Link>
            </Button>
            <Button asChild className="sm:flex-1" variant="outline">
              <Link href="/shop/catalog">Back to Catalog</Link>
            </Button>
          </div>
        </div>

        <div className="shell-frame bg-transparent">
          <div className="shell-core h-full px-5 py-6 sm:px-6 sm:py-8">
            <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Payment recovery</p>
            <div className="mt-6 space-y-4">
              <div className="rounded-[1.5rem] border border-hairline/70 bg-secondary/35 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Reported issue</p>
                <p className="mt-2 font-semibold text-destructive">{reason}</p>
              </div>
              <div className="rounded-[1.5rem] border border-hairline/70 bg-secondary/35 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Recommended next step</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Confirm billing details, retry the payment, or return to the catalog if you need to adjust the order before checkout.
                </p>
              </div>
              <div className="rounded-[1.5rem] border border-hairline/70 bg-secondary/35 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Order status</p>
                <p className="mt-2 font-semibold text-primary">No payment was captured for this attempt.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function ErrorPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main id="main-content" className="px-4 py-8 md:px-6 md:py-12">
        <div className="container space-y-8">
          <Suspense fallback={<div className="shell-frame overflow-hidden"><div className="shell-core px-6 py-8 text-sm text-muted-foreground">Loading payment status...</div></div>}>
            <ErrorContent />
          </Suspense>
        </div>
      </main>
      <Footer />
    </div>
  );
}
