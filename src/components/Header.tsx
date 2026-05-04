'use client';

import Link from 'next/link';
import { CartDrawer } from './CartDrawer';
import { useEffect, useState } from 'react';
import { supabaseClient } from '@/lib/supabase/client';

export function Header() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabaseClient.auth.getUser();
      setUser(user);
    };

    getUser();

    const {
      data: { subscription },
    } = supabaseClient.auth.onAuthStateChange(() => {
      getUser();
    });

    return () => subscription?.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabaseClient.auth.signOut();
    setUser(null);
  };

  return (
    <header className="border-b border-border bg-background sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold">
          iRepair
        </Link>

        <nav className="flex gap-6 items-center">
          <Link href="/shop/catalog" className="hover:text-primary">
            Shop
          </Link>
          <Link href="/dashboard" className="hover:text-primary">
            Orders
          </Link>
          {user ? (
            <>
              <span className="text-sm text-muted">{user.email}</span>
              <button
                onClick={handleLogout}
                className="text-sm hover:text-primary"
              >
                Logout
              </button>
            </>
          ) : (
            <Link href="/auth" className="hover:text-primary">
              Sign In
            </Link>
          )}
          <CartDrawer />
        </nav>
      </div>
    </header>
  );
}

