import { cn } from '@/lib/utils';

interface SummaryCardProps {
  title: string;
  value: number;
  variant?: 'default' | 'success' | 'danger' | 'warning';
  icon: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
  compact?: boolean;
}

export function SummaryCard({ title, value, variant = 'default', icon, active, onClick, compact = false }: SummaryCardProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'relative overflow-hidden rounded-lg border bg-card transition-all duration-300 hover:scale-[1.02] text-left w-full',
        compact ? 'p-4' : 'p-6',
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
          <p className={cn(
            'font-medium text-muted-foreground',
            compact ? 'text-xs' : 'text-sm'
          )}>{title}</p>
          <p
            className={cn(
              'font-bold tracking-tight',
              compact ? 'mt-1 text-2xl' : 'mt-2 text-4xl',
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
            'flex items-center justify-center rounded-full',
            compact ? 'h-10 w-10' : 'h-14 w-14',
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
