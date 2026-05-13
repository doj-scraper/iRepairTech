import Link from "next/link";
import { ArrowUpRight, Mail, MapPin, Phone } from "lucide-react";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/shop/catalog", label: "Catalog" },
  { href: "/contact", label: "Contact" },
  { href: "/auth", label: "Log In" },
];

const CONTACT = [
  { Icon: MapPin, text: "Houston, TX" },
  { Icon: Mail, text: "sales@irepairtech.com" },
  { Icon: Phone, text: "(713) 555-0199" },
];

export function Footer() {
  return (
    <footer className="relative overflow-hidden bg-[hsl(var(--footer-bg))] text-[hsl(var(--footer-fg))]">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(184,138,59,0.18),transparent_34%),radial-gradient(circle_at_82%_4%,rgba(31,111,120,0.22),transparent_28%),linear-gradient(180deg,rgba(255,255,255,0.02),transparent_22%)]"
      />
      <div className="bg-line-accent h-[2px] w-full" aria-hidden="true" />

      <div className="container relative py-12 sm:py-14 lg:py-16">
        <div className="grid gap-10 xl:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-6">
            <div className="space-y-4">
              <span className="eyebrow border-white/10 bg-white/5 text-on-dark-soft">Houston wholesale parts</span>
              <div>
                <h2 className="max-w-2xl font-display text-3xl font-semibold tracking-[-0.05em] text-on-dark sm:text-4xl lg:text-5xl">
                  Wholesale cellphone repair parts, presented like a real operations business.
                </h2>
                <p className="mt-4 max-w-xl text-sm leading-7 text-[hsl(var(--footer-fg)/0.8)] sm:text-base sm:leading-relaxed">
                  iRepair Technologies is shaped for repair shops and regional wholesale buyers: stocked parts, trade pricing, account access, and clean order follow-through.
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {[
                'Houston inventory',
                'Wholesale pricing',
                'Fast dispatch workflow',
              ].map((item) => (
                <div
                  key={item}
                  className="rounded-[1.25rem] border border-white/10 bg-white/5 px-4 py-4 text-sm font-medium text-on-dark-soft backdrop-blur-sm"
                >
                  {item}
                </div>
              ))}
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <a
                href="tel:+17135550199"
                className="rounded-[1.4rem] border border-white/10 bg-white/5 px-5 py-4 transition-smooth hover:-translate-y-0.5 hover:bg-white/10"
              >
                <p className="text-[11px] uppercase tracking-[0.22em] text-[hsl(var(--footer-fg)/0.58)]">Trade Support</p>
                <p className="mt-2 flex items-center gap-2 text-base font-medium text-on-dark sm:text-lg">
                  <Phone className="h-4 w-4" strokeWidth={1.75} />
                  (713) 555-0199
                </p>
              </a>
              <a
                href="mailto:sales@irepairtech.com"
                className="rounded-[1.4rem] border border-white/10 bg-white/5 px-5 py-4 transition-smooth hover:-translate-y-0.5 hover:bg-white/10"
              >
                <p className="text-[11px] uppercase tracking-[0.22em] text-[hsl(var(--footer-fg)/0.58)]">Sales Desk</p>
                <p className="mt-2 flex items-center gap-2 text-base font-medium text-on-dark sm:text-lg">
                  <Mail className="h-4 w-4" strokeWidth={1.75} />
                  sales@irepairtech.com
                </p>
              </a>
              <div className="rounded-[1.4rem] border border-white/10 bg-white/5 px-5 py-4">
                <p className="text-[11px] uppercase tracking-[0.22em] text-[hsl(var(--footer-fg)/0.58)]">Service area</p>
                <p className="mt-2 flex items-center gap-2 text-base font-medium text-on-dark sm:text-lg">
                  <MapPin className="h-4 w-4" strokeWidth={1.75} />
                  Houston, Texas
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5 sm:p-6">
              <h3 className="mb-4 text-[11px] font-bold uppercase tracking-[0.18em] text-[hsl(var(--footer-fg)/0.58)]">
                Navigate
              </h3>
              <ul className="space-y-3 text-sm">
                {NAV_LINKS.map(({ href, label }) => (
                  <li key={href}>
                    <Link
                      href={href}
                      className="inline-flex items-center gap-2 text-[hsl(var(--footer-fg)/0.8)] transition-smooth hover:text-white"
                    >
                      {label}
                      <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={1.5} />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5 sm:p-6">
              <h3 className="mb-4 text-[11px] font-bold uppercase tracking-[0.18em] text-[hsl(var(--footer-fg)/0.58)]">
                Operations
              </h3>
              <ul className="space-y-3 text-sm">
                {CONTACT.map(({ Icon, text }) => (
                  <li key={text} className="flex items-start gap-2.5 text-[hsl(var(--footer-fg)/0.8)]">
                    <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-line-accent" strokeWidth={1.75} />
                    {text}
                  </li>
                ))}
                <li className="flex items-start gap-2.5 text-[hsl(var(--footer-fg)/0.8)]">
                  <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-line-accent" strokeWidth={1.75} />
                  Trade accounts, service flows, and Stripe-ready checkout
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-start justify-between gap-3 border-t border-white/8 pt-6 text-[11px] text-[hsl(var(--footer-fg)/0.58)] sm:flex-row sm:items-center sm:text-xs">
          <p>© {new Date().getFullYear()} iRepair Technologies. All rights reserved.</p>
          <p className="uppercase tracking-wider">Wholesale repair parts · Volume pricing · Houston, Texas</p>
        </div>
      </div>
    </footer>
  );
}
