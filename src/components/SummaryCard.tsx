import { cn } from '@/lib/utils';
import { useCounter } from '@/hooks/useCounter';

interface SummaryCardProps {
  title: string;
  value: number;
  variant?: 'default' | 'success' | 'danger' | 'warning';
  icon: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
  subtitle?: string;
}

export function SummaryCard({ 
  title, 
  value, 
  variant = 'default', 
  icon, 
  active, 
  onClick,
  subtitle
}: SummaryCardProps) {
  const animatedValue = useCounter(value, 800);
  
  return (
    <button
      onClick={onClick}
      className={cn(
        'relative overflow-hidden rounded-lg border bg-card transition-all duration-300 hover:scale-[1.02] text-left w-full p-5',
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
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-medium text-muted-foreground">{title}</p>
          <p
            className={cn(
              'mt-1 text-3xl font-bold tracking-tight tabular-nums',
              variant === 'success' && 'text-success',
              variant === 'danger' && 'text-destructive',
              variant === 'warning' && 'text-warning',
              variant === 'default' && 'text-foreground'
            )}
          >
            {animatedValue}
          </p>
          
          {/* Subtitle */}
          {subtitle && (
            <p className="mt-2 text-xs text-muted-foreground italic">
              {subtitle}
            </p>
          )}
        </div>
        <div
          className={cn(
            'flex h-12 w-12 items-center justify-center rounded-full',
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
