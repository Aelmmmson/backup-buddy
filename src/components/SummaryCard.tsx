import { cn } from '@/lib/utils';
import { useCounter } from '@/hooks/useCounter';
import React from 'react';

interface SummaryCardProps {
  title: string;
  value: number;
  variant?: 'default' | 'success' | 'danger' | 'warning';
  icon: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
  subtitle?: React.ReactNode;
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
        'group relative overflow-hidden rounded-2xl border transition-all duration-500 text-left w-full p-6',
        'bg-card/40 backdrop-blur-md border-border/50',
        'hover:bg-card/60 hover:border-border hover:shadow-xl hover:-translate-y-1',

        // Active State Base
        active && 'translate-y-[-4px] bg-card/80 border-transparent shadow-2xl z-10',

        // Variant Specific Glows (Active)
        active && variant === 'success' && 'shadow-success/20 ring-1 ring-success/20',
        active && variant === 'danger' && 'shadow-destructive/20 ring-1 ring-destructive/20',
        active && variant === 'warning' && 'shadow-warning/20 ring-1 ring-warning/20',
        active && variant === 'default' && 'shadow-primary/20 ring-1 ring-primary/20'
      )}
    >
      {/* Top Accent Border (Active) */}
      <div
        className={cn(
          "absolute top-0 left-0 right-0 h-[4px] transition-all duration-500 opacity-0 scale-x-75",
          active && "opacity-100 scale-x-100",
          variant === 'success' && "bg-success",
          variant === 'danger' && "bg-destructive",
          variant === 'warning' && "bg-warning",
          variant === 'default' && "bg-primary"
        )}
      />

      <div className="flex items-start justify-between relative z-10">
        <div className="flex-1">
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80 mb-1">
            {title}
          </p>
          <div className="flex items-baseline gap-1">
            <span
              className={cn(
                'text-4xl font-extrabold tracking-tight tabular-nums transition-colors duration-300',
                variant === 'success' && 'text-success',
                variant === 'danger' && 'text-destructive',
                variant === 'warning' && 'text-warning',
                variant === 'default' && 'text-foreground',
                active && 'scale-110 origin-left'
              )}
            >
              {animatedValue}
            </span>
          </div>

          {/* Subtitle */}
          {subtitle && (
            <div className="mt-3 text-xs text-muted-foreground/70 font-medium italic">
              {subtitle}
            </div>
          )}
        </div>

        {/* Styled Floating Icon Container */}
        <div
          className={cn(
            'flex h-14 w-14 items-center justify-center rounded-2xl transition-all duration-500 shadow-inner',
            'bg-muted/30 text-muted-foreground/60 group-hover:bg-muted/50',

            variant === 'success' && 'bg-success/5 text-success/60 group-hover:bg-success/15',
            variant === 'danger' && 'bg-destructive/5 text-destructive/60 group-hover:bg-destructive/15',
            variant === 'warning' && 'bg-warning/5 text-warning/60 group-hover:bg-warning/15',
            variant === 'default' && 'bg-primary/5 text-primary/60 group-hover:bg-primary/15',

            // Active Icon Styling
            active && variant === 'success' && 'bg-success text-success-foreground scale-110 rotate-[5deg] shadow-lg shadow-success/30',
            active && variant === 'danger' && 'bg-destructive text-destructive-foreground scale-110 rotate-[5deg] shadow-lg shadow-destructive/30',
            active && variant === 'warning' && 'bg-warning text-white scale-110 rotate-[5deg] shadow-lg shadow-warning/30',
            active && variant === 'default' && 'bg-primary text-primary-foreground scale-110 rotate-[5deg] shadow-lg shadow-primary/30'
          )}
        >
          <div className={cn("transition-transform duration-500", active && "scale-110")}>
            {icon}
          </div>
        </div>
      </div>

      {/* Subtle bottom light effect (Active) */}
      {active && (
        <div
          className={cn(
            "absolute -bottom-12 -left-12 h-24 w-24 blur-[40px] opacity-20 transition-all",
            variant === 'success' && "bg-success",
            variant === 'danger' && "bg-destructive",
            variant === 'warning' && "bg-warning",
            variant === 'default' && "bg-primary"
          )}
        />
      )}
    </button>
  );
}
