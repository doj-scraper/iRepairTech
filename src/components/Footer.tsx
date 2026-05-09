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
    <footer className="bg-footer text-footer-foreground">
      <div className="bg-line-accent h-[2px] w-full" aria-hidden="true" />

      <div className="container py-16">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr]">
          <div className="space-y-6">
            <div className="space-y-4">
              <span className="eyebrow border-white/10 bg-white/5 text-white/80">Built for trade accounts</span>
              <div>
                <h2 className="max-w-xl font-display text-4xl font-semibold tracking-[-0.05em] text-white">
                  A believable wholesale brand, ready for inventory, dispatch, and repeat buyers.
                </h2>
                <p className="mt-4 max-w-xl text-base leading-relaxed text-footer-foreground/72">
                  iRepair Technologies is designed to feel like a real Houston operation: stocked parts,
                  volume pricing, account access, and the operational polish trade buyers expect.
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {["Houston inventory", "Wholesale pricing", "Fast dispatch workflow"].map((item) => (
                <div key={item} className="rounded-[1.4rem] border border-white/10 bg-white/5 px-4 py-4 text-sm text-white/84">
                  {item}
                </div>
              ))}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <a
                href="tel:+17135550199"
                className="rounded-[1.6rem] border border-white/10 bg-white/5 px-5 py-4 transition-smooth hover:bg-white/10"
              >
                <p className="text-[11px] uppercase tracking-[0.22em] text-white/50">Trade Support</p>
                <p className="mt-2 flex items-center gap-2 text-lg font-medium text-white">
                  <Phone className="h-4 w-4" strokeWidth={1.75} />
                  (713) 555-0199
                </p>
              </a>
              <a
                href="mailto:sales@irepairtech.com"
                className="rounded-[1.6rem] border border-white/10 bg-white/5 px-5 py-4 transition-smooth hover:bg-white/10"
              >
                <p className="text-[11px] uppercase tracking-[0.22em] text-white/50">Sales Desk</p>
                <p className="mt-2 flex items-center gap-2 text-lg font-medium text-white">
                  <Mail className="h-4 w-4" strokeWidth={1.75} />
                  sales@irepairtech.com
                </p>
              </a>
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div className="rounded-[1.8rem] border border-white/10 bg-white/5 p-6">
              <h3 className="mb-4 text-[11px] font-bold uppercase tracking-[0.18em] text-white/50">
                Navigate
              </h3>
              <ul className="space-y-3 text-sm">
                {NAV_LINKS.map(({ href, label }) => (
                  <li key={href}>
                    <Link
                      href={href}
                      className="inline-flex items-center gap-2 text-white/72 transition-smooth hover:text-white"
                    >
                      {label}
                      <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={1.5} />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-[1.8rem] border border-white/10 bg-white/5 p-6">
              <h3 className="mb-4 text-[11px] font-bold uppercase tracking-[0.18em] text-white/50">
                Operations
              </h3>
              <ul className="space-y-3 text-sm">
                {CONTACT.map(({ Icon, text }) => (
                  <li key={text} className="flex items-start gap-2.5 text-white/72">
                    <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-line-accent" strokeWidth={1.75} />
                    {text}
                  </li>
                ))}
                <li className="flex items-start gap-2.5 text-white/72">
                  <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-line-accent" strokeWidth={1.75} />
                  Trade accounts, service flows, and Stripe-ready checkout
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-start justify-between gap-3 border-t border-white/8 pt-6 text-xs text-footer-foreground/40 sm:flex-row sm:items-center">
          <p>© {new Date().getFullYear()} iRepair Technologies. All rights reserved.</p>
          <p className="uppercase tracking-wider">Wholesale only · Volume pricing available · Houston, Texas</p>
        </div>
      </div>
    </footer>
  );
}
