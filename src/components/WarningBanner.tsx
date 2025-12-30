import { AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WarningBannerProps {
  count: number;
  active?: boolean;
  onClick?: () => void;
}

export function WarningBanner({ count, active, onClick }: WarningBannerProps) {
  if (count === 0) return null;

  return (
    <button
      onClick={onClick}
      className={cn(
        "animate-fade-in mb-6 flex items-center gap-3 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 w-full text-left transition-all duration-200 hover:bg-destructive/15 hover:border-destructive/50",
        active && "ring-2 ring-destructive bg-destructive/20"
      )}
    >
      <AlertTriangle className="h-5 w-5 animate-pulse-slow text-destructive" />
      <p className="font-medium text-destructive">
        {count} {count === 1 ? 'database has' : 'databases have'} not been backed up today
      </p>
      <span className="ml-auto text-xs text-destructive/70 italic">Click to filter</span>
    </button>
  );
}
