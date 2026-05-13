import Link from 'next/link';
import { cn } from '@/lib/utils';

export type MarqueeItem = {
  label: string;
  detail?: string;
  href?: string;
};

type AnnouncementMarqueeProps = {
  className?: string;
};

export function AnnouncementMarquee({ className }: AnnouncementMarqueeProps) {
  const items: MarqueeItem[] = [
    {
      label: 'Houston Stocked',
      detail: 'Same-day dispatch cutoff for trade orders: 3 PM CT',
    },
    {
      label: 'Volume Pricing',
      detail: 'Screen, battery, and assembly bundles available on request',
    },
    {
      label: 'Repair Shop Ready',
      detail: 'Template includes account, admin, Stripe, and Supabase wiring',
    },
    {
      label: 'New Stock Run',
      detail: 'INCELL display inventory refreshed across flagship models',
      href: '/shop/catalog',
    },
  ];

  const loopedItems = [...items, ...items];

  return (
    <section className={cn('shell-frame overflow-hidden', className)}>
      <div className="shell-core overflow-hidden">
        <div className="flex items-center justify-between gap-2 border-b border-border/70 bg-secondary/55 px-4 py-3">
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-bold uppercase tracking-[0.28em] text-primary sm:text-[11px]">
              Bulletin
            </span>
            <span className="hidden text-[10px] uppercase tracking-[0.2em] text-muted-foreground sm:inline">
              Operations & inventory
            </span>
          </div>
          <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            Wholesale only
          </span>
        </div>

        <div className="relative overflow-hidden bg-background">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 left-0 z-10 w-10 bg-gradient-to-r from-background to-transparent"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-gradient-to-l from-background to-transparent"
          />

          <div
            className="flex w-max items-stretch gap-3 px-3 py-4 sm:px-4 animate-marquee motion-reduce:animate-none"
            style={{ ['--marquee-duration' as string]: '28s' }}
          >
            {loopedItems.map((item, index) => {
              const content = (
                <div className="flex min-w-max items-center gap-3 rounded-full border border-border/70 bg-card px-4 py-3 shadow-soft transition-smooth hover:-translate-y-0.5 hover:border-accent/25 hover:bg-secondary/35">
                  <span className="inline-flex h-8 min-w-8 shrink-0 items-center justify-center rounded-full bg-primary px-2 text-[10px] font-bold uppercase tracking-[0.22em] text-primary-foreground">
                    {String((index % items.length) + 1).padStart(2, '0')}
                  </span>
                  <span className="flex min-w-0 flex-col">
                    <span className="text-xs font-semibold uppercase tracking-[0.2em] text-foreground">
                      {item.label}
                    </span>
                    {item.detail ? (
                      <span className="text-[11px] text-muted-foreground">{item.detail}</span>
                    ) : null}
                  </span>
                </div>
              );

              return item.href ? (
                <Link key={`${item.label}-${index}`} href={item.href} className="shrink-0">
                  {content}
                </Link>
              ) : (
                <div key={`${item.label}-${index}`} className="shrink-0">
                  {content}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
