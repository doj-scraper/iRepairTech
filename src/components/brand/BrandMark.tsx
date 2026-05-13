import Link from 'next/link';
import { cn } from '@/lib/utils';

type BrandMarkProps = {
  className?: string;
  href?: string;
  compact?: boolean;
};

export function BrandMark({ className, href = '/', compact = false }: BrandMarkProps) {
  const content = (
    <span className={cn('inline-flex items-center gap-2.5 sm:gap-3', className)}>
      <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-[1rem] border border-white/10 bg-primary text-[11px] font-bold uppercase tracking-[0.18em] text-primary-foreground shadow-elegant sm:h-11 sm:w-11 sm:text-xs sm:tracking-[0.22em]">
        IR
      </span>
      <span className="flex min-w-0 flex-col">
        <span className="font-display text-base font-semibold tracking-[-0.04em] text-primary sm:text-lg md:text-[1.35rem]">
          iRepair Technologies
        </span>
        {!compact ? (
          <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground sm:text-[11px] sm:tracking-[0.24em]">
            Houston Wholesale Parts
          </span>
        ) : null}
      </span>
    </span>
  );

  return href ? (
    <Link href={href} className="link-reset inline-flex items-center text-inherit no-underline hover:no-underline" aria-label="iRepair Technologies home">
      {content}
    </Link>
  ) : (
    content
  );
}
