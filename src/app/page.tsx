import Link from "next/link";
import Image from "next/image";
import { AnnouncementMarquee } from "@/components/AnnouncementMarquee";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { BrandMark } from "@/components/brand/BrandMark";
import { SectionHeading } from "@/components/brand/SectionHeading";
import { Badge } from "@/components/ui/badge";

const operatingSignals = [
  "Houston-stocked screens, batteries, and assemblies",
  "Volume pricing and MOQ tiers for professional repair shops",
  "Trade account portal with full order history and re-ordering",
];

const whyIRepair = [
  {
    title: "Thousands of SKUs In Stock",
    description:
      "Screens, batteries, charging ports, cameras, and full assemblies for all major brands — ready to ship same day from Houston.",
  },
  {
    title: "Trade Pricing for Repair Shops",
    description:
      "Wholesale tiers, MOQ guidance, and volume discounts built for repair professionals running real operations, not one-off buyers.",
  },
  {
    title: "Your Account, Your History",
    description:
      "Order history, repeat purchasing, and account management built to keep pace with a high-volume repair business.",
  },
];

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main id="main-content" className="flex-1">
        <section className="section-space px-4 pt-8">
          <div className="container">
            <AnnouncementMarquee className="mb-6" />

            <div className="overflow-hidden rounded-[1.75rem] gradient-hero text-white shadow-elegant industrial-grid sm:rounded-[2rem] lg:rounded-[2.5rem]">
              <div className="container grid gap-10 px-5 py-10 sm:px-6 sm:py-12 md:px-10 md:py-16 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
                <div className="relative z-10 space-y-8">
                  <div className="space-y-5">
                    <span className="eyebrow border-white/10 bg-white/5 text-on-dark-soft">
                      Houston wholesale supply
                    </span>
                    <div className="space-y-4">
                        <h1 className="page-title max-w-3xl text-on-dark sm:text-5xl lg:text-6xl">
                          Genuine repair parts. Trade pricing. Ships from Houston.
                        </h1>
                        <p className="max-w-2xl text-base leading-7 text-on-dark-soft sm:text-lg sm:leading-8 md:text-xl">
                          iRepair Technologies supplies professional repair shops with OEM-grade screens,
                          batteries, and components — stocked in Houston and priced for volume buyers.
                        </p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row">
                    <Button asChild size="lg" className="w-full sm:w-auto">
                      <Link href="/shop/catalog">
                        Browse Catalog
                      </Link>
                    </Button>
                    <Button asChild size="lg" variant="outline" className="w-full border-white/20 bg-white/5 text-on-dark hover:bg-white/10 sm:w-auto">
                      <Link href="/auth">
                        Trade Login
                      </Link>
                    </Button>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-3">
                      {[
                        ['4.2K+', 'repair shops targeted'],
                        ['MOQ', 'built into product language'],
                        ['Stripe + RLS', 'operational commerce infrastructure'],
                      ].map(([value, label]) => (
                      <div key={value} className="rounded-[1.5rem] border border-white/10 bg-white/5 px-4 py-4 backdrop-blur-sm">
                        <p className="text-2xl font-semibold text-on-dark">{value}</p>
                        <p className="mt-1 text-sm text-on-dark-soft">{label}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="relative z-10 space-y-4">
                    <div className="shell-frame border-white/10 bg-white/5">
                      <div className="shell-core overflow-hidden bg-white/95 text-primary">
                      <div className="grid gap-0 md:grid-cols-[0.9fr_1.1fr]">
                        <div className="relative min-h-[240px] bg-primary sm:min-h-[280px]">
                          <Image
                            src="/iphone-screen-incell.png"
                            alt="Featured wholesale screen assembly"
                            fill
                            priority
                            className="object-contain p-4 sm:p-6"
                            sizes="(max-width: 1024px) 100vw, 40vw"
                          />
                        </div>
                        <div className="space-y-5 p-5 sm:p-6">
                          <div className="flex flex-wrap gap-2">
                            <Badge variant="accent">Featured inventory</Badge>
                            <Badge variant="success">Houston stocked</Badge>
                          </div>
                          <div>
                            <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                              Hero merch card
                            </p>
                            <h2 className="mt-2 font-display text-2xl font-semibold tracking-[-0.05em] sm:text-3xl">
                              iPhone Screen INCELL
                            </h2>
                            <p className="mt-3 text-sm leading-6 text-muted-foreground">
                              A merchandised product presentation with stock, MOQ, and quick-view behavior
                              built to support real bulk-buying decisions.
                            </p>
                          </div>
                          <div className="grid gap-3 sm:grid-cols-2">
                            <div className="rounded-[1.4rem] border border-border/70 bg-secondary/35 p-4">
                              <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                                In stock
                              </p>
                              <p className="mt-2 font-display text-2xl font-semibold sm:text-3xl">1,240</p>
                            </div>
                            <div className="rounded-[1.4rem] border border-border/70 bg-secondary/35 p-4">
                              <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                                MOQ
                              </p>
                              <p className="mt-2 font-display text-2xl font-semibold sm:text-3xl">10 Units</p>
                            </div>
                          </div>
                          <Button asChild className="w-full">
                            <Link href="/shop/catalog">View Merch System</Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    {operatingSignals.map((signal) => (
                      <div key={signal} className="rounded-[1.5rem] border border-white/10 bg-white/5 px-4 py-4 text-sm text-white/78 backdrop-blur-sm">
                        {signal}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="section-space px-4 pt-0">
          <div className="container space-y-10">
            <SectionHeading
              eyebrow="Why iRepair"
              title="Everything a repair shop needs, in one place."
              description="From single-unit sourcing to bulk procurement — iRepair Technologies gives professional repair shops the inventory depth, pricing structure, and account tools to run a serious operation."
            />

            <div className="grid gap-5 lg:grid-cols-3">
              {whyIRepair.map((item) => (
                <div key={item.title} className="shell-frame">
                  <div className="shell-core h-full p-6">
                    <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">Operational advantage</p>
                    <h3 className="mt-4 font-display text-2xl font-semibold tracking-[-0.05em] text-primary sm:text-3xl">
                      {item.title}
                    </h3>
                    <p className="mt-4 text-sm leading-7 text-muted-foreground">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section-space px-4 pt-0">
          <div className="container grid gap-8 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
            <div className="shell-frame">
              <div className="shell-core p-6 md:p-8">
                <BrandMark href="/" />
                <div className="mt-8 space-y-4">
                  <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                    Trusted by repair shops across Texas
                  </p>
                  <h2 className="section-title text-primary">
                    Stocked, priced, and ready for professional volume.
                  </h2>
                    <p className="text-base leading-8 text-muted-foreground">
                      iRepair Technologies has supplied Houston-area repair shops for years with the
                      parts, pricing tiers, and account tools that keep businesses running without
                      supply chain surprises.
                    </p>
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {[
                ['OEM-grade screens', 'iPhone, Samsung, and Android displays — INCELL and OLED options with warranty coverage.'],
                ['Batteries & power', 'Tested capacity batteries for all major models, packaged for bulk storage and shop use.'],
                ['Charging & ports', 'Lightning, USB-C, and flex cable assemblies stocked for fast turnaround on common repairs.'],
                ['Trade account perks', 'Volume pricing unlocks automatically. Order history, reordering, and net terms available for qualified shops.'],
              ].map(([title, description]) => (
                <div key={title} className="rounded-[1.75rem] border border-border/70 bg-card p-6 shadow-card">
                  <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">Category</p>
                  <h3 className="mt-3 font-display text-xl font-semibold tracking-[-0.05em] text-primary sm:text-2xl">
                    {title}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-muted-foreground">{description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
