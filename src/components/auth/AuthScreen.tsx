'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, Boxes, ShieldCheck, Truck, Wrench } from 'lucide-react';
import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header';
import { BrandMark } from '@/components/brand/BrandMark';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getSupabaseClient } from '@/lib/supabase/client';

type AuthScreenProps = {
  redirectTo?: string;
};

export function AuthScreen({ redirectTo }: AuthScreenProps) {
  const router = useRouter();
  const nextRoute = redirectTo?.startsWith('/') ? redirectTo : '/dashboard';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const ensureProfile = async (userId: string, emailAddress: string) => {
    const supabase = getSupabaseClient();
    const { error: profileError } = await supabase.from('profiles').upsert(
      {
        id: userId,
        email: emailAddress,
        role: 'customer',
      },
      {
        onConflict: 'id',
        ignoreDuplicates: true,
      },
    );

    if (profileError) {
      throw profileError;
    }
  };

  const handleAuth = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    setNotice('');

    const supabase = getSupabaseClient();

    try {
      if (isSignUp) {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        });

        if (signUpError) {
          throw signUpError;
        }

        if (data.user) {
          await ensureProfile(data.user.id, email);
        }

        setNotice('Check your email to confirm your account and unlock the trade dashboard.');
        return;
      }

      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        throw signInError;
      }

      if (data.user) {
        await ensureProfile(data.user.id, data.user.email || email);
      }

      router.push(nextRoute);
      router.refresh();
    } catch (authError: unknown) {
      setError(authError instanceof Error ? authError.message : 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main id="main-content" className="flex-1 px-4 py-8 md:px-6 md:py-12">
        <div className="container grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <section className="shell-frame overflow-hidden">
            <div className="shell-core relative flex h-full flex-col justify-between gap-8 px-6 py-8 md:px-10 md:py-10">
              <div className="space-y-6">
                <Badge variant="accent">Trade access</Badge>
                <BrandMark />
                <div className="space-y-4">
                  <h1 className="font-display text-4xl font-semibold tracking-[-0.06em] text-primary md:text-6xl">
                    Sign in to manage orders, quotes, and bench-ready inventory.
                  </h1>
                  <p className="max-w-2xl text-base text-muted-foreground md:text-lg">
                    iRepair Technologies is positioned like a real Houston wholesale operation, and the account area now matches that standard with stronger trust, clearer access, and a smoother customer journey.
                  </p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {[
                  {
                    icon: Boxes,
                    title: 'Wholesale visibility',
                    description: 'Track replenishment-ready parts, MOQ requirements, and catalog pricing from one login.',
                  },
                  {
                    icon: Wrench,
                    title: 'Service continuity',
                    description: 'Keep part and repair workflows connected so the business feels unified from quote to bench.',
                  },
                  {
                    icon: Truck,
                    title: 'Order follow-through',
                    description: 'Send customers into a clean history view after Stripe checkout completes.',
                  },
                  {
                    icon: ShieldCheck,
                    title: 'Protected access',
                    description: 'Dashboard and admin routes now honor authenticated access before rendering.',
                  },
                ].map((item) => (
                  <div key={item.title} className="rounded-[1.6rem] border border-hairline/70 bg-secondary/30 p-5">
                    <item.icon className="h-5 w-5 text-accent" />
                    <h2 className="mt-4 font-display text-xl text-primary">{item.title}</h2>
                    <p className="mt-2 text-sm text-muted-foreground">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="shell-frame">
            <div className="shell-core px-6 py-8 md:px-10 md:py-10">
              <div className="mb-8 space-y-3">
                <Badge variant="outline">{isSignUp ? 'Create customer account' : 'Customer sign in'}</Badge>
                <h2 className="font-display text-3xl text-primary md:text-4xl">
                  {isSignUp ? 'Open a buyer account.' : 'Return to your operations view.'}
                </h2>
                <p className="text-sm text-muted-foreground">
                  Use your account to manage customer history, procurement flow, and order tracking without leaving the branded experience.
                </p>
              </div>

              <form className="space-y-5" onSubmit={handleAuth}>
                <div className="space-y-2">
                  <Label htmlFor="email">Work email</Label>
                  <Input
                    autoComplete="email"
                    id="email"
                    placeholder="buyer@irepairtechnologies.com"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    autoComplete={isSignUp ? 'new-password' : 'current-password'}
                    id="password"
                    minLength={8}
                    placeholder="Enter at least 8 characters"
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                  />
                </div>

                {error ? (
                  <div className="rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive" role="alert">
                    {error}
                  </div>
                ) : null}

                {notice ? (
                  <div className="rounded-2xl border border-primary/25 bg-primary/10 px-4 py-3 text-sm text-primary" role="status">
                    {notice}
                  </div>
                ) : null}

                <Button className="w-full" loading={loading} size="lg" type="submit">
                  {isSignUp ? 'Create account' : 'Enter dashboard'}
                  {!loading ? <ArrowRight className="h-4 w-4" /> : null}
                </Button>
              </form>

              <div className="mt-6 flex flex-col gap-4 border-t border-hairline/70 pt-6 text-sm text-muted-foreground">
                <button
                  className="text-left font-medium text-accent transition hover:text-primary"
                  onClick={() => {
                    setIsSignUp((current) => !current);
                    setError('');
                    setNotice('');
                  }}
                  type="button"
                >
                  {isSignUp ? 'Already have an account? Sign in instead.' : 'Need a buyer account? Create one here.'}
                </button>

                <Link className="inline-flex items-center gap-2 text-muted-foreground transition hover:text-primary" href="/shop/catalog">
                  Continue to the catalog
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
