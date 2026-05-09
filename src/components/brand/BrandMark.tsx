import Link from 'next/link';
import { cn } from '@/lib/utils';

type BrandMarkProps = {
  className?: string;
  href?: string;
  compact?: boolean;
};

export function BrandMark({ className, href = '/', compact = false }: BrandMarkProps) {
  const content = (
    <span className={cn('inline-flex items-center gap-3', className)}>
      <span className="inline-flex h-11 w-11 items-center justify-center rounded-[1.1rem] border border-white/10 bg-primary text-sm font-bold uppercase tracking-[0.22em] text-primary-foreground shadow-elegant">
        IR
      </span>
      <span className="flex min-w-0 flex-col">
        <span className="font-display text-lg font-semibold tracking-[-0.05em] text-primary md:text-xl">
          iRepair Technologies
        </span>
        {!compact ? (
          <span className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
            Houston Wholesale Parts
          </span>
        ) : null}
      </span>
    </span>
  );

  return href ? (
    <Link href={href} className="inline-flex items-center" aria-label="iRepair Technologies home">
      {content}
    </Link>
  ) : (
    content
  );
}
