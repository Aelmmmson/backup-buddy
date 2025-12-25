import { cn } from '@/lib/utils';

interface EnvironmentBadgeProps {
  environment: 'Production' | 'DR' | 'UAT';
}

export function EnvironmentBadge({ environment }: EnvironmentBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold',
        environment === 'Production' && 'bg-primary/20 text-primary',
        environment === 'DR' && 'bg-warning/20 text-warning',
        environment === 'UAT' && 'bg-muted text-muted-foreground'
      )}
    >
      {environment}
    </span>
  );
}
