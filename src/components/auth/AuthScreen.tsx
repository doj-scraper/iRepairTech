'use client';

import { FormEvent, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, Boxes, Clock3, MapPin, ShieldCheck, Truck, Wrench } from 'lucide-react';
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
        <div className="container grid gap-8 lg:grid-cols-[1.04fr_0.96fr]">
          <section className="shell-frame overflow-hidden">
            <div className="shell-core relative flex h-full flex-col justify-between gap-8 px-5 py-6 sm:px-6 sm:py-8 md:px-10 md:py-10">
              <div className="space-y-6">
                <Badge variant="accent">Trade access</Badge>
                <BrandMark />
                <div className="space-y-4">
                  <h1 className="page-title text-primary md:text-6xl">
                    Open a buyer account built for wholesale ordering.
                  </h1>
                  <p className="max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base sm:leading-8 md:text-lg">
                    iRepair Technologies is presented as a real Houston wholesaler with a trade portal, order history, and a consistent account experience from login to checkout.
                  </p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-[0.95fr_1.05fr]">
                <div className="rounded-[1.6rem] border border-hairline/70 bg-secondary/35 p-4">
                  <div className="flex flex-wrap gap-2">
                    {['Houston, TX', 'Wholesale pricing', 'Trade support'].map((item) => (
                      <Badge key={item} variant="secondary">
                        {item}
                      </Badge>
                    ))}
                  </div>
                  <div className="mt-5 overflow-hidden rounded-[1.4rem] border border-border/70 bg-primary text-primary-foreground">
                    <Image
                      src="/iphone-screen-incell.png"
                      alt="Wholesale repair parts reference image"
                      width={960}
                      height={720}
                      className="h-56 w-full object-cover opacity-90"
                    />
                    <div className="border-t border-white/10 bg-primary/75 p-4">
                      <p className="text-[11px] uppercase tracking-[0.2em] text-white/65">Account view</p>
                      <p className="mt-2 font-display text-2xl font-semibold tracking-[-0.05em]">
                        A cleaner portal for repeat buyers.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
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
                      description: 'Dashboard and admin routes honor authenticated access before rendering.',
                    },
                  ].map((item) => (
                    <div key={item.title} className="rounded-[1.4rem] border border-hairline/70 bg-secondary/30 p-5">
                      <item.icon className="h-5 w-5 text-accent" />
                      <h2 className="mt-4 font-display text-lg text-primary sm:text-xl">{item.title}</h2>
                      <p className="mt-2 text-sm text-muted-foreground">{item.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="shell-frame">
            <div className="shell-core px-5 py-6 sm:px-6 sm:py-8 md:px-10 md:py-10">
              <div className="mb-8 space-y-3">
                <Badge variant="outline">{isSignUp ? 'Create customer account' : 'Customer sign in'}</Badge>
                <h2 className="section-title text-primary">
                  {isSignUp ? 'Open a buyer account.' : 'Return to your operations view.'}
                </h2>
                <p className="text-sm text-muted-foreground">
                  Use your account to manage customer history, procurement flow, and order tracking without leaving the branded experience.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">
                    <MapPin className="h-3.5 w-3.5" />
                    Houston-based trade desk
                  </Badge>
                  <Badge variant="secondary">
                    <Clock3 className="h-3.5 w-3.5" />
                    Fast account access
                  </Badge>
                </div>
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
