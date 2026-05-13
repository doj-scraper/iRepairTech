import type { Metadata } from 'next';
import { AuthScreen } from '@/components/auth/AuthScreen';

export const metadata: Metadata = {
  title: 'Trade Login | iRepair Technologies',
  description:
    'Sign in to the iRepair Technologies buyer portal to manage wholesale orders, account history, and procurement flow.',
  keywords: 'trade login, wholesale account, repair parts portal, Houston wholesale',
  openGraph: {
    title: 'Trade Login | iRepair Technologies',
    description:
      'Login or create a buyer account for wholesale cellphone repair parts and order tracking.',
    type: 'website',
  },
};

type AuthPageProps = {
  searchParams?: {
    redirectTo?: string | string[];
  };
};

function getRedirectTo(searchParams?: AuthPageProps['searchParams']) {
  const value = searchParams?.redirectTo;
  return Array.isArray(value) ? value[0] : value;
}

export default function AuthPage({ searchParams }: AuthPageProps) {
  return <AuthScreen redirectTo={getRedirectTo(searchParams)} />;
}
