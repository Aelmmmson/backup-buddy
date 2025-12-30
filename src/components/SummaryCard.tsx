import { cn } from '@/lib/utils';
import { useCounter } from '@/hooks/useCounter';

interface PhaseStats {
  success: number;
  issues: number;
}

interface SummaryCardProps {
  title: string;
  value: number;
  variant?: 'default' | 'success' | 'danger' | 'warning';
  icon: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
  preUpdate?: PhaseStats;
  postUpdate?: PhaseStats;
}

function MiniStat({ label, success, issues }: { label: string; success: number; issues: number }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[10px] uppercase tracking-wider text-muted-foreground/70">{label}</span>
      <div className="flex items-center gap-2 text-xs">
        <span className="text-success font-medium">{success} ✓</span>
        {issues > 0 && <span className="text-destructive font-medium">{issues} ✗</span>}
      </div>
    </div>
  );
}

export function SummaryCard({ 
  title, 
  value, 
  variant = 'default', 
  icon, 
  active, 
  onClick,
  preUpdate,
  postUpdate
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
          
          {/* Pre/Post Update mini stats */}
          {(preUpdate || postUpdate) && (
            <div className="mt-3 flex gap-4 pt-3 border-t border-border/50">
              {preUpdate && <MiniStat label="Pre-Update" success={preUpdate.success} issues={preUpdate.issues} />}
              {postUpdate && <MiniStat label="Post-Update" success={postUpdate.success} issues={postUpdate.issues} />}
            </div>
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
