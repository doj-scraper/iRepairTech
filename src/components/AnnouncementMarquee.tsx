'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Cloud, Sparkles } from 'lucide-react';
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
  const [currentDate, setCurrentDate] = useState('');
  const [weather, setWeather] = useState('Houston, TX');

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      setCurrentDate(now.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }));
    };
    
    updateDateTime();
    const interval = setInterval(updateDateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  const items: MarqueeItem[] = [
    {
      label: 'WELCOME',
      detail: 'Premium wholesale parts for repair professionals',
    },
    {
      label: currentDate || 'Loading...',
      detail: weather,
    },
    {
      label: 'NEW PARTS IN STOCK',
      detail: 'iPhone Screen INCELL — 8 through 17 Pro Max',
      href: '/catalog',
    },
  ];

  const loopedItems = [...items, ...items];

  return (
    <section className={cn('overflow-hidden border border-border bg-card shadow-card', className)}>
      <div className="flex items-center justify-between border-b border-border bg-secondary/40 px-4 py-2">
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-bold uppercase tracking-[0.28em] text-primary">
            Bulletin
          </span>
          <span className="hidden text-[10px] uppercase tracking-[0.2em] text-muted-foreground sm:inline">
            Shop floor updates
          </span>
        </div>
        <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
          scrolls forever
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
          className={cn(
            'flex w-max items-stretch gap-3 px-4 py-4 animate-marquee motion-reduce:animate-none',
          )}
          style={{ ['--marquee-duration' as string]: '28s' }}
        >
          {loopedItems.map((item, index) => {
            const content = (
              <div className="flex min-w-max items-center gap-3 border border-border bg-background px-4 py-3 shadow-soft transition-colors hover:border-primary/20 hover:bg-secondary/30">
                <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center border border-border bg-primary text-[10px] font-bold uppercase tracking-[0.2em] text-primary-foreground">
                  {index === 0 || index === 3 ? <Sparkles className="h-3 w-3" /> : 
                   index === 1 || index === 4 ? <Cloud className="h-3 w-3" /> :
                   String((index % items.length) + 1).padStart(2, '0')}
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
    </section>
  );
}
