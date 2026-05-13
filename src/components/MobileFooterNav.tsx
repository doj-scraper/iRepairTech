'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { getSupabaseClient } from '@/lib/supabase/client';
import { useCart } from '@/store/cart';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Home, LayoutGrid, ShoppingCart, UserRound } from 'lucide-react';
import type { User } from '@supabase/supabase-js';

type NavItem = {
  href: string;
  label: string;
  icon: typeof Home;
  badge?: number;
};

export function MobileFooterNav() {
  const pathname = usePathname();
  const cartCount = useCart((state) => state.items.reduce((sum, item) => sum + item.quantity, 0));
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const supabase = getSupabaseClient();
    supabase.auth.getUser().then(({ data }) => setUser(data.user));

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const navItems: NavItem[] = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/shop/catalog', label: 'Catalog', icon: LayoutGrid },
    { href: '/checkout', label: 'Cart', icon: ShoppingCart, badge: cartCount || undefined },
    { href: user ? '/dashboard' : '/auth', label: user ? 'Account' : 'Trade', icon: UserRound },
  ];

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 md:hidden">
      <div className="px-4 pb-[calc(env(safe-area-inset-bottom)+0.85rem)]">
        <div className="shell-frame border-white/20 bg-background/70 shadow-elegant backdrop-blur-xl">
          <nav className="shell-core grid grid-cols-4 gap-1 px-2 py-2" aria-label="Mobile footer navigation">
            {navItems.map((item) => {
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'relative flex flex-col items-center justify-center gap-1 rounded-[1.25rem] px-2 py-3 text-[11px] font-semibold uppercase tracking-[0.16em] transition-smooth',
                    active ? 'bg-primary text-primary-foreground shadow-soft' : 'text-muted-foreground hover:bg-secondary/70 hover:text-primary',
                  )}
                >
                  <span className="relative inline-flex">
                    <Icon className="h-4 w-4" strokeWidth={1.85} />
                    {item.badge ? (
                      <Badge className="absolute -right-3 -top-2 h-5 min-w-5 justify-center px-1.5 text-[9px]" variant="destructive">
                        {item.badge}
                      </Badge>
                    ) : null}
                  </span>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </div>
  );
}
