import { cn } from '@/lib/utils';

interface SummaryCardProps {
  title: string;
  value: number;
  variant?: 'default' | 'success' | 'danger';
  icon: React.ReactNode;
}

export function SummaryCard({ title, value, variant = 'default', icon }: SummaryCardProps) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-lg border bg-card p-6 transition-all duration-300 hover:scale-[1.02]',
        variant === 'success' && 'border-success/30 status-glow-success',
        variant === 'danger' && 'border-destructive/30 status-glow-danger',
        variant === 'default' && 'border-border'
      )}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p
            className={cn(
              'mt-2 text-4xl font-bold tracking-tight',
              variant === 'success' && 'text-success',
              variant === 'danger' && 'text-destructive',
              variant === 'default' && 'text-foreground'
            )}
          >
            {value}
          </p>
        </div>
        <div
          className={cn(
            'flex h-14 w-14 items-center justify-center rounded-full',
            variant === 'success' && 'bg-success/10 text-success',
            variant === 'danger' && 'bg-destructive/10 text-destructive',
            variant === 'default' && 'bg-muted text-muted-foreground'
          )}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}
