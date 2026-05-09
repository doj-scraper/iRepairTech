'use client';

import Link from "next/link";
import { ArrowUpRight, LogIn, LogOut, Menu, Phone, ShoppingCart, User as UserIcon } from "lucide-react";
import { usePathname } from "next/navigation";
import { useCart } from "@/store/cart";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { getSupabaseClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { CartDrawer } from "@/components/CartDrawer";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { BrandMark } from "@/components/brand/BrandMark";
import { Badge } from "@/components/ui/badge";

const NAV = [
  { to: "/", label: "Home" },
  { to: "/shop/catalog", label: "Catalog" },
  { to: "/contact", label: "Contact" },
];

export function Header() {
  const { items } = useCart();
  const [user, setUser] = useState<User | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const pathname = usePathname();

  const count = items.reduce((a, i) => a + i.quantity, 0);
  const opsPills = ["Houston Stocked", "Wholesale Only", "Dispatch Cutoff 3 PM CT"];

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

  const handleSignOut = async () => {
    const supabase = getSupabaseClient();
    await supabase.auth.signOut();
  };

  return (
    <>
      <header className="sticky top-4 z-40 px-4">
        <div className="container">
          <div className="shell-frame">
            <div className="shell-core flex items-center justify-between gap-4 px-4 py-4 md:px-6">
              <div className="flex min-w-0 items-center gap-4">
                <Sheet>
                  <SheetTrigger asChild>
                    <button
                      type="button"
                      className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-border/70 bg-background text-primary transition-smooth hover:border-accent/30 hover:bg-secondary/60 md:hidden"
                      aria-label="Open navigation"
                    >
                      <Menu className="h-5 w-5" strokeWidth={1.75} />
                    </button>
                  </SheetTrigger>
                  <SheetContent side="left" className="border-r border-border/70 bg-background/95 px-5 py-6">
                    <SheetHeader className="items-start text-left">
                      <BrandMark />
                      <SheetTitle className="sr-only">Navigation</SheetTitle>
                      <SheetDescription>
                        Built for wholesale repair shops, dispatch-ready inventory, and fast trade checkout.
                      </SheetDescription>
                    </SheetHeader>
                    <div className="mt-8 space-y-6">
                      <div className="flex flex-wrap gap-2">
                        {opsPills.map((pill) => (
                          <Badge key={pill} variant="secondary">
                            {pill}
                          </Badge>
                        ))}
                      </div>
                      <nav className="flex flex-col gap-2" aria-label="Mobile navigation">
                        {NAV.map((item) => (
                          <Link
                            key={item.to}
                            href={item.to}
                            className={cn(
                              "rounded-[1.2rem] border border-transparent px-4 py-3 font-medium transition-smooth hover:border-border/70 hover:bg-secondary/70",
                              pathname === item.to && "border-accent/25 bg-secondary/80 text-primary",
                            )}
                          >
                            {item.label}
                          </Link>
                        ))}
                      </nav>
                      <div className="rounded-[1.5rem] border border-border/70 bg-card p-4">
                        <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                          Trade Support
                        </p>
                        <a
                          href="tel:+17135550199"
                          className="mt-2 flex items-center gap-2 font-medium text-primary"
                        >
                          <Phone className="h-4 w-4" strokeWidth={1.75} />
                          (713) 555-0199
                        </a>
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>
                <BrandMark compact className="min-w-0" />
              </div>

              <nav className="hidden items-center gap-1 md:flex" aria-label="Main navigation">
                {NAV.map((n) => (
                  <Link
                    key={n.to}
                    href={n.to}
                    className={cn(
                      "rounded-full px-4 py-2.5 text-sm font-medium text-muted-foreground transition-smooth hover:bg-secondary/70 hover:text-primary",
                      pathname === n.to && "bg-secondary text-primary shadow-soft",
                    )}
                  >
                    {n.label}
                  </Link>
                ))}
              </nav>

              <div className="hidden items-center gap-2 xl:flex">
                {opsPills.map((pill) => (
                  <Badge key={pill} variant="secondary">
                    {pill}
                  </Badge>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <a
                  href="tel:+17135550199"
                  className="hidden items-center gap-2 rounded-full border border-border/70 bg-background px-4 py-2 text-sm text-muted-foreground transition-smooth hover:border-accent/30 hover:text-primary lg:inline-flex"
                >
                  <Phone className="h-4 w-4" strokeWidth={1.75} />
                  (713) 555-0199
                </a>

                <button
                  onClick={() => setCartOpen(true)}
                  className="relative inline-flex h-11 w-11 items-center justify-center rounded-full border border-border/70 bg-background text-muted-foreground transition-smooth hover:border-accent/30 hover:bg-secondary/70 hover:text-primary"
                  aria-label={`Open cart, ${count} items`}
                >
                  <ShoppingCart className="h-[18px] w-[18px]" strokeWidth={1.75} />
                  {count > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-[20px] min-w-[20px] items-center justify-center rounded-full bg-accent px-1.5 text-[10px] font-bold text-accent-foreground shadow-elegant">
                      {count}
                    </span>
                  )}
                </button>

                {user ? (
                  <div className="hidden items-center gap-2 md:flex">
                    <Link href="/dashboard">
                      <Button variant="outline" size="sm" className="gap-2">
                        <UserIcon className="h-3.5 w-3.5" />
                        Dashboard
                      </Button>
                    </Link>
                    <Button
                      onClick={handleSignOut}
                      variant="ghost"
                      size="sm"
                      className="gap-2"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      Sign Out
                    </Button>
                  </div>
                ) : (
                  <Link href="/auth" className="hidden md:block">
                    <Button size="sm" className="gap-2">
                      <LogIn className="h-3.5 w-3.5" />
                      Trade Login
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}
