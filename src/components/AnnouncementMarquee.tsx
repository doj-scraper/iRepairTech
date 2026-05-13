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

  return (
    <section className={cn('shell-frame overflow-hidden', className)}>
      <div className="shell-core overflow-hidden">
        <div className="flex items-center justify-between gap-2 border-b border-border/70 bg-secondary/50 px-4 py-3 sm:px-5">
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

        <div className="bg-background p-3 sm:p-4">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {items.map((item, index) => {
              const isFeatured = index === items.length - 1;
              const content = (
                <div
                  className={cn(
                    'group h-full rounded-[1.4rem] border border-border/70 bg-card p-4 shadow-soft transition-smooth hover:-translate-y-0.5 hover:border-accent/25 hover:shadow-elegant',
                    isFeatured && 'bg-gradient-to-br from-primary/8 via-card to-accent/8',
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="inline-flex h-8 min-w-8 shrink-0 items-center justify-center rounded-full bg-primary px-2 text-[10px] font-bold uppercase tracking-[0.22em] text-primary-foreground">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <span className={cn(
                      'rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em]',
                      isFeatured ? 'border-accent/20 bg-accent/10 text-accent' : 'border-border/70 bg-secondary/70 text-muted-foreground',
                    )}>
                      {isFeatured ? 'Live' : 'Update'}
                    </span>
                  </div>

                  <div className="mt-4 space-y-2">
                    <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-foreground sm:text-[0.8rem]">
                      {item.label}
                    </h3>
                    {item.detail ? (
                      <p className="text-sm leading-6 text-muted-foreground">
                        {item.detail}
                      </p>
                    ) : null}
                  </div>
                </div>
              );

              return item.href ? (
                <Link key={`${item.label}-${index}`} href={item.href} className="link-reset block h-full text-inherit">
                  {content}
                </Link>
              ) : (
                <div key={`${item.label}-${index}`} className="h-full">
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
