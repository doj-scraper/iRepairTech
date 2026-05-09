import { AuthScreen } from '@/components/auth/AuthScreen';

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
