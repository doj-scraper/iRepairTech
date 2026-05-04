'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function ErrorContent() {
  const searchParams = useSearchParams();
  const reason = searchParams.get('reason') || 'Payment failed';

  return (
    <div className="max-w-2xl mx-auto text-center">
      <div className="text-6xl mb-4">✕</div>
      <h1 className="text-4xl font-bold mb-4 text-danger">Payment Failed</h1>
      <p className="text-lg text-muted mb-8">{reason}</p>

      <div className="flex gap-4 justify-center">
        <Link
          href="/checkout"
          className="bg-primary text-white px-6 py-3 rounded font-semibold hover:opacity-90"
        >
          Try Again
        </Link>
        <Link
          href="/shop/catalog"
          className="border border-primary text-primary px-6 py-3 rounded font-semibold hover:bg-primary hover:text-white"
        >
          Back to Shop
        </Link>
      </div>
    </div>
  );
}

export default function ErrorPage() {
  return (
    <div className="min-h-screen bg-background p-8">
      <Suspense fallback={<div className="p-8">Loading...</div>}>
        <ErrorContent />
      </Suspense>
    </div>
  );
}

