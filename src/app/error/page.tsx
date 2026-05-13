import type { Metadata } from 'next';
import { ErrorClient } from './ErrorClient';

export const metadata: Metadata = {
  title: 'Payment Error | iRepair Technologies',
  description:
    'A payment error occurred while placing a wholesale repair parts order. Review the issue and try again.',
  keywords: 'payment error, checkout error, wholesale order, Stripe issue',
  openGraph: {
    title: 'Payment Error | iRepair Technologies',
    description:
      'An order payment could not be completed for iRepair Technologies checkout.',
    type: 'website',
  },
};

export default function ErrorPage() {
  return <ErrorClient />;
}
