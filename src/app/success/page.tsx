'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';

function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [order, setOrder] = useState<any>(null);

  useEffect(() => {
    if (sessionId) {
      setOrder({ sessionId, status: 'paid' });
    }
  }, [sessionId]);

  return (
    <div className="max-w-2xl mx-auto text-center">
      <div className="text-6xl mb-4">✓</div>
      <h1 className="text-4xl font-bold mb-4 text-success">
        Payment Successful!
      </h1>
      <p className="text-lg text-muted mb-8">
        Your order has been confirmed and is being processed.
      </p>

      {order && (
        <div className="bg-muted p-6 rounded-lg mb-8 text-left">
          <p className="mb-2">
            <strong>Session ID:</strong> {order.sessionId}
          </p>
          <p>
            <strong>Status:</strong>{' '}
            <span className="text-success font-semibold">{order.status}</span>
          </p>
        </div>
      )}

      <div className="flex gap-4 justify-center">
        <Link
          href="/dashboard"
          className="bg-primary text-white px-6 py-3 rounded font-semibold hover:opacity-90"
        >
          View Orders
        </Link>
        <Link
          href="/shop/catalog"
          className="border border-primary text-primary px-6 py-3 rounded font-semibold hover:bg-primary hover:text-white"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <div className="min-h-screen bg-background p-8">
      <Suspense fallback={<div className="p-8">Loading...</div>}>
        <SuccessContent />
      </Suspense>
    </div>
  );
}

