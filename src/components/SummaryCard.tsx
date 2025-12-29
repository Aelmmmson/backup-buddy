import { cn } from '@/lib/utils';

interface SummaryCardProps {
  title: string;
  value: number;
  variant?: 'default' | 'success' | 'danger' | 'warning';
  icon: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
}

export function SummaryCard({ title, value, variant = 'default', icon, active, onClick }: SummaryCardProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'relative overflow-hidden rounded-lg border bg-card p-6 transition-all duration-300 hover:scale-[1.02] text-left w-full',
        variant === 'success' && 'border-success/30',
        variant === 'danger' && 'border-destructive/30',
        variant === 'warning' && 'border-warning/30',
        variant === 'default' && 'border-border',
        active && variant === 'success' && 'ring-2 ring-success status-glow-success',
        active && variant === 'danger' && 'ring-2 ring-destructive status-glow-danger',
        active && variant === 'warning' && 'ring-2 ring-warning',
        active && variant === 'default' && 'ring-2 ring-primary'
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
              variant === 'warning' && 'text-warning',
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
            variant === 'warning' && 'bg-warning/10 text-warning',
            variant === 'default' && 'bg-muted text-muted-foreground'
          )}
        >
          {icon}
        </div>
      </div>
    </button>
  );
}
