export const dynamic = 'force-dynamic';

import Link from "next/link";
import { AnnouncementMarquee } from "@/components/AnnouncementMarquee";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import Image from "next/image";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      
      <main className="flex-1">
        <AnnouncementMarquee className="mb-0" />
        
        {/* Hero Section */}
        <section className="relative gradient-hero py-24 text-white">
          <div className="container">
            <div className="mx-auto max-w-3xl text-center">
              <h1 className="mb-6 text-4xl font-display font-bold leading-tight md:text-5xl lg:text-6xl">
                Wholesale Parts for Repair Professionals
              </h1>
              <p className="mb-8 text-lg text-white/90 md:text-xl">
                Premium iPhone screens, batteries, and components. Sourced direct, stocked in Houston, delivered fast.
              </p>
              
              <div className="mx-auto flex max-w-xl gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="search"
                    placeholder="Search parts..."
                    className="h-12 w-full border border-white/20 bg-white/10 pl-10 pr-4 text-white placeholder:text-white/60 backdrop-blur-sm focus:border-white/40 focus:outline-none focus:ring-2 focus:ring-white/20"
                  />
                </div>
                <Link href="/catalog">
                  <Button size="lg" className="h-12 bg-white text-primary hover:bg-white/90">
                    Browse Catalog
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Product */}
        <section className="py-16 bg-background">
          <div className="container">
            <h2 className="mb-8 text-center text-3xl font-display font-bold">Featured Product</h2>
            <div className="mx-auto max-w-4xl">
              <div className="grid gap-8 md:grid-cols-2 items-center border border-border bg-card p-8 shadow-card">
                <div className="relative aspect-square">
                  <Image
                    src="/iphone-screen-incell.png"
                    alt="iPhone Screen INCELL"
                    fill
                    className="object-contain"
                    loading="lazy"
                  />
                </div>
                <div>
                  <h3 className="mb-4 text-2xl font-display font-semibold">iPhone Screen INCELL</h3>
                  <p className="mb-4 text-muted-foreground">
                    High-quality INCELL display replacement for iPhone 8 through iPhone 17 Pro Max. 
                    Premium INCELL technology with excellent color accuracy and touch sensitivity.
                  </p>
                  <div className="mb-6 flex items-baseline gap-3">
                    <span className="text-3xl font-bold text-primary">$85.00</span>
                    <span className="text-sm text-muted-foreground">MOQ: 10 units</span>
                  </div>
                  <Link href="/catalog">
                    <Button size="lg" className="w-full gradient-primary text-white">
                      View in Catalog
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
