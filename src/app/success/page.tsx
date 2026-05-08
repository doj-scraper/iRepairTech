import Link from 'next/link';
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
  let paymentStatus = 'unknown';
  let sessionStatus = 'unknown';

  if (sessionId) {
    try {
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      paymentStatus = session.payment_status;
      sessionStatus = session.status ?? 'unknown';
    } catch {
      paymentStatus = 'unavailable';
      sessionStatus = 'unavailable';
    }
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-2xl mx-auto text-center">
        <div className="text-6xl mb-4">✓</div>
        <h1 className="text-4xl font-bold mb-4 text-success">
          Payment Successful!
        </h1>
        <p className="text-lg text-muted mb-8">
          Your order has been confirmed and is being processed.
        </p>

        <div className="bg-muted p-6 rounded-lg mb-8 text-left">
          <p className="mb-2">
            <strong>Session ID:</strong> {sessionId ?? 'missing'}
          </p>
          <p className="mb-2">
            <strong>Payment status:</strong>{' '}
            <span className="text-success font-semibold">{paymentStatus}</span>
          </p>
          <p>
            <strong>Checkout status:</strong> {sessionStatus}
          </p>
        </div>

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
    </div>
  );
}
