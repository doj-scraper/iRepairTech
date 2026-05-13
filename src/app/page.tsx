import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Building2, CheckCircle2, ShieldCheck, Truck, Warehouse } from 'lucide-react';
import { AnnouncementMarquee } from '@/components/AnnouncementMarquee';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { BrandMark } from '@/components/brand/BrandMark';
import { SectionHeading } from '@/components/brand/SectionHeading';
import { Badge } from '@/components/ui/badge';

export const metadata: Metadata = {
  title: 'iRepair Technologies | Wholesale Cell Phone Repair Parts',
  description:
    'Houston wholesale cellphone repair parts for professional shops. Stocked screens, batteries, assemblies, and trade account ordering.',
  keywords: 'wholesale cellphone parts, Houston repair parts, repair shop supply, iPhone screens, wholesale trade account',
  openGraph: {
    title: 'iRepair Technologies | Wholesale Cell Phone Repair Parts',
    description:
      'Wholesale cellphone repair parts for repair shops and trade buyers. Houston-stocked inventory and professional order flow.',
    type: 'website',
  },
};

const operatingSignals = [
  'Houston-stocked screens, batteries, and assemblies',
  'Volume pricing and MOQ tiers for professional repair shops',
  'Trade account portal with order history and re-ordering',
];

const whyIRepair = [
  {
    title: 'Wholesale stock depth',
    description:
      'Screens, batteries, charging ports, cameras, and assemblies for major models, organized for repeat purchasing.',
    icon: Warehouse,
  },
  {
    title: 'Professional trade pricing',
    description:
      'Pricing, MOQ guidance, and account language that fits the needs of repair shops buying at volume.',
    icon: ShieldCheck,
  },
  {
    title: 'Fulfillment continuity',
    description:
      'Catalog, checkout, and dashboard all move through the same company frame so buyers know exactly where they are.',
    icon: Truck,
  },
];

const serviceLines = [
  'OEM-grade screens and assemblies',
  'Batteries and charging components',
  'Account-based ordering and history',
  'Fast Houston dispatch cadence',
];

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />

      <main id="main-content" className="flex-1">
        <section className="section-space px-4 pt-8">
          <div className="container">
            <AnnouncementMarquee className="mb-6" />

            <div className="shell-frame overflow-hidden">
              <div className="shell-core grid gap-8 px-5 py-6 sm:px-6 sm:py-8 lg:grid-cols-[1.03fr_0.97fr] lg:items-center lg:px-10 lg:py-10">
                <div className="space-y-7">
                  <div className="space-y-5">
                    <Badge variant="accent">Houston wholesale supply</Badge>
                    <div className="space-y-4">
                      <h1 className="page-title max-w-3xl text-primary sm:text-5xl lg:text-6xl">
                        Wholesale cellphone repair parts for real repair businesses.
                      </h1>
                      <p className="max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8 md:text-xl">
                        iRepair Technologies supplies professional repair shops with screens, batteries,
                        and assemblies. The site is built like a real wholesaler in Houston, Texas,
                        with trade pricing, order history, and buyer-focused account flow.
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row">
                    <Button asChild size="lg" className="w-full sm:w-auto">
                      <Link href="/shop/catalog">
                        Browse catalog
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button
                      asChild
                      size="lg"
                      variant="outline"
                      className="w-full border-border/70 bg-background/85 text-primary hover:bg-secondary/70 sm:w-auto"
                    >
                      <Link href="/auth">
                        Trade login
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-3">
                    {[
                      ['Houston', 'stocked and shipped locally'],
                      ['Wholesale', 'pricing and MOQ language'],
                      ['Accounts', 'orders and re-ordering history'],
                    ].map(([value, label]) => (
                      <div key={value} className="rounded-[1.5rem] border border-hairline/70 bg-secondary/35 px-4 py-4">
                        <p className="text-2xl font-semibold text-primary">{value}</p>
                        <p className="mt-1 text-sm text-muted-foreground">{label}</p>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {operatingSignals.map((signal) => (
                      <Badge key={signal} variant="secondary">
                        {signal}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="relative overflow-hidden rounded-[2rem] border border-border/70 bg-primary text-primary-foreground shadow-elegant">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(184,138,59,0.18),transparent_34%),linear-gradient(180deg,rgba(255,255,255,0.08),transparent_54%)]" />
                    <Image
                      src="/iphone-screen-incell.png"
                      alt="Wholesale cellphone repair screen assembly"
                      width={960}
                      height={720}
                      priority
                      className="h-full w-full object-cover object-center opacity-100"
                    />
                    <div className="absolute inset-x-0 bottom-0 border-t border-white/10 bg-primary/74 p-5 backdrop-blur-sm">
                      <div className="grid gap-3 sm:grid-cols-3">
                        <div>
                          <p className="text-[11px] uppercase tracking-[0.2em] text-white/65">Operation</p>
                          <p className="mt-1 text-sm font-semibold">iRepair Technologies</p>
                        </div>
                        <div>
                          <p className="text-[11px] uppercase tracking-[0.2em] text-white/65">Fulfillment</p>
                          <p className="mt-1 text-sm font-semibold">Houston dispatch</p>
                        </div>
                        <div>
                          <p className="text-[11px] uppercase tracking-[0.2em] text-white/65">Buyer lane</p>
                          <p className="mt-1 text-sm font-semibold">Wholesale only</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-[1.5rem] border border-hairline/70 bg-secondary/35 p-4">
                      <Building2 className="h-5 w-5 text-accent" />
                      <p className="mt-4 text-xs uppercase tracking-[0.18em] text-muted-foreground">Company signal</p>
                      <p className="mt-2 text-sm text-primary">
                        Presented as a real wholesale supplier with a clear company identity.
                      </p>
                    </div>
                    <div className="rounded-[1.5rem] border border-hairline/70 bg-secondary/35 p-4">
                      <CheckCircle2 className="h-5 w-5 text-accent" />
                      <p className="mt-4 text-xs uppercase tracking-[0.18em] text-muted-foreground">Buyer clarity</p>
                      <p className="mt-2 text-sm text-primary">
                        Product, account, and order flows stay consistent across the site.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="section-space px-4 pt-0">
          <div className="container space-y-10">
            <SectionHeading
              eyebrow="Operating model"
              title="Everything a repair shop needs, in one place."
              description="The site now reads like a wholesale operations business with inventory depth, a clear buyer experience, and small consistent brand touches across every page."
            />

            <div className="grid gap-5 lg:grid-cols-3">
              {whyIRepair.map((item) => (
                <div key={item.title} className="shell-frame">
                  <div className="shell-core h-full p-6">
                    <item.icon className="h-5 w-5 text-accent" />
                    <p className="mt-4 text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                      Operational advantage
                    </p>
                    <h2 className="mt-3 font-display text-2xl font-semibold tracking-[-0.05em] text-primary sm:text-3xl">
                      {item.title}
                    </h2>
                    <p className="mt-4 text-sm leading-7 text-muted-foreground">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section-space px-4 pt-0">
          <div className="container grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
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
                    iRepair Technologies gives buyers a simple way to source parts and keep procurement
                    moving with a credible company presence, clear ordering flow, and consistent support.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {serviceLines.map((line) => (
                <div key={line} className="rounded-[1.75rem] border border-border/70 bg-card p-6 shadow-card">
                  <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">Service line</p>
                  <h3 className="mt-3 font-display text-xl font-semibold tracking-[-0.05em] text-primary sm:text-2xl">
                    {line}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-muted-foreground">
                    Built to support repair shops that need dependable supply, clear product language,
                    and quick order progression.
                  </p>
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
