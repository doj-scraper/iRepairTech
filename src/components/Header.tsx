'use client';

import Link from "next/link";
import { ShoppingCart, LogIn, LogOut } from "lucide-react";
import { useCart } from "@/store/cart";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { CartDrawer } from "@/components/CartDrawer";

const NAV = [
  { to: "/", label: "Home" },
  { to: "/shop/catalog", label: "Catalog" },
  { to: "/contact", label: "Contact" },
];

export function Header() {
  const { items } = useCart();
  const [user, setUser] = useState<User | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const supabase = createClient();
  
  const count = items.reduce((a, i) => a + i.quantity, 0);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/92 backdrop-blur-sm">
        <div className="container flex h-[60px] items-center justify-between gap-4">
          <Link href="/" className="flex items-center text-xl font-display font-bold text-primary" aria-label="iRepair Technologies home">
            iRepair
          </Link>

          <nav className="hidden items-center gap-0.5 md:flex" aria-label="Main navigation">
            {NAV.map((n) => (
              <Link
                key={n.to}
                href={n.to}
                className={cn(
                  "relative px-3.5 py-2 text-sm font-medium transition-smooth text-muted-foreground hover:bg-secondary/70 hover:text-foreground"
                )}
              >
                {n.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCartOpen(true)}
              className="relative inline-flex h-9 w-9 items-center justify-center text-muted-foreground transition-smooth hover:bg-secondary hover:text-foreground"
              aria-label={`Open cart, ${count} items`}
            >
              <ShoppingCart className="h-[18px] w-[18px]" strokeWidth={2} />
              {count > 0 && (
                <span className="absolute -right-1 -top-1 flex h-[18px] min-w-[18px] items-center justify-center gradient-primary px-1 text-[10px] font-bold text-white shadow-elegant">
                  {count}
                </span>
              )}
            </button>

            {user ? (
              <Button
                onClick={handleSignOut}
                variant="outline"
                size="sm"
                className="hidden md:inline-flex gap-1.5"
              >
                <LogOut className="h-3.5 w-3.5" /> Sign out
              </Button>
            ) : (
              <Link
                href="/auth"
                className="hidden md:inline-flex h-9 items-center gap-1.5 gradient-primary px-4 text-sm font-semibold text-white shadow-elegant transition-smooth hover:opacity-90"
              >
                <LogIn className="h-3.5 w-3.5" />
                Log in
              </Link>
            )}
          </div>
        </div>
      </header>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}
