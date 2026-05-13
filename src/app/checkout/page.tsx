import type { Metadata } from 'next';
import { CheckoutClient } from './CheckoutClient';

export const metadata: Metadata = {
  title: 'Checkout | iRepair Technologies',
  description:
    'Review wholesale repair parts, confirm purchasing terms, and send your order to Stripe from a real Houston trade checkout flow.',
  keywords: 'wholesale checkout, repair parts checkout, Houston wholesale parts, Stripe checkout',
  openGraph: {
    title: 'Checkout | iRepair Technologies',
    description:
      'A professional wholesale checkout for repair shops buying Houston-stocked cellphone parts and service workflows.',
    type: 'website',
  },
};

export default function CheckoutPage() {
  return <CheckoutClient />;
}
