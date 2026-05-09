import { cn } from '@/lib/utils';
import { PackageOpen } from 'lucide-react';

export type EmptyStateProps = {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
};

export function EmptyState({
  title,
  description,
  icon,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn('shell-frame mx-auto max-w-xl', className)}>
      <div className="shell-core flex flex-col items-center justify-center px-6 py-12 text-center">
      <div className="mb-4 text-muted-foreground">
        {icon || <PackageOpen className="h-12 w-12" />}
      </div>
      <h3 className="mb-2 font-display text-2xl font-semibold text-foreground">{title}</h3>
      {description && (
        <p className="mb-4 max-w-sm text-sm text-muted-foreground">{description}</p>
      )}
      {action && <div className="mt-2">{action}</div>}
      </div>
    </div>
  );
}
