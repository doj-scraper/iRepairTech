
'use client';

import { useState } from 'react';
import { getSupabaseClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AuthPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const ensureProfile = async (userId: string, emailAddress: string) => {
    const supabase = getSupabaseClient();
    const { error } = await supabase.from('profiles').upsert(
      {
        id: userId,
        email: emailAddress,
        role: 'customer',
      },
      {
        onConflict: 'id',
        ignoreDuplicates: true,
      }
    );

    if (error) {
      throw error;
    }
  };

  const handleAuth = async () => {
    setLoading(true);
    setError('');
    const supabase = getSupabaseClient();

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        if (data.user) {
          await ensureProfile(data.user.id, email);
        }
        setError('Check your email to confirm signup');
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        if (data.user) {
          await ensureProfile(data.user.id, data.user.email || email);
        }
        router.push('/dashboard');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-8 flex items-center justify-center">
      <div className="max-w-md w-full border rounded-lg p-8">
        <h1 className="text-3xl font-bold mb-8 text-center">
          {isSignUp ? 'Sign Up' : 'Sign In'}
        </h1>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border rounded px-4 py-2"
              placeholder="your@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border rounded px-4 py-2"
              placeholder="••••••••"
            />
          </div>

          {error && <div className="text-danger text-sm">{error}</div>}

          <button
            onClick={handleAuth}
            disabled={loading}
            className="w-full bg-primary text-white py-2 rounded font-semibold disabled:opacity-50"
          >
            {loading ? 'Loading...' : isSignUp ? 'Sign Up' : 'Sign In'}
          </button>
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-primary hover:underline"
          >
            {isSignUp
              ? 'Already have an account? Sign In'
              : "Don't have an account? Sign Up"}
          </button>
        </div>

        <div className="mt-6 text-center">
          <Link href="/shop/catalog" className="text-muted hover:text-foreground">
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
