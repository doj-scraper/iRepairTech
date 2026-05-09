import { cn } from '@/lib/utils';

type SectionHeadingProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: 'left' | 'center';
  className?: string;
  action?: React.ReactNode;
};

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = 'left',
  className,
  action,
}: SectionHeadingProps) {
  const centered = align === 'center';

  return (
    <div
      className={cn(
        'flex flex-col gap-5',
        centered ? 'items-center text-center' : 'items-start text-left',
        className,
      )}
    >
      {eyebrow ? <span className="eyebrow">{eyebrow}</span> : null}
      <div className="space-y-3">
        <h2 className="font-display text-3xl font-semibold tracking-[-0.05em] text-primary md:text-5xl">
          {title}
        </h2>
        {description ? (
          <p className="max-w-2xl text-base text-muted-foreground md:text-lg">{description}</p>
        ) : null}
      </div>
      {action}
    </div>
  );
}
