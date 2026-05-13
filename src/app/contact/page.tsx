import type { Metadata } from 'next';
import { ContactClient } from './ContactClient';

export const metadata: Metadata = {
  title: 'Contact | iRepair Technologies',
  description:
    'Contact iRepair Technologies for wholesale cellphone repair parts, trade account questions, and Houston-area order support.',
  keywords: 'contact wholesale parts, Houston repair support, trade account contact, cellphone repair supplier',
  openGraph: {
    title: 'Contact | iRepair Technologies',
    description:
      'Wholesale support for repair shops buying cellphone repair parts from a Houston supplier.',
    type: 'website',
  },
};

export default function ContactPage() {
  return <ContactClient />;
}
