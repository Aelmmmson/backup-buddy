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
        "flex items-center justify-center gap-2 rounded-full px-4 h-10 text-center text-sm font-medium animate-in fade-in slide-in-from-top-1 duration-300 transition-all shadow-sm",
        active
          ? "bg-destructive text-white shadow-destructive/20 active:scale-95"
          : "bg-destructive/10 text-destructive hover:bg-destructive/20"
      )}
    >
      <AlertTriangle className={cn("h-4 w-4", active ? "animate-none" : "animate-pulse-slow")} />
      <span className="whitespace-nowrap">
        {count} {count === 1 ? 'database has' : 'databases have'} not been backed up today
      </span>
      <span className="ml-2 text-[10px] opacity-70 italic whitespace-nowrap border-l border-current pl-2 hidden sm:inline">
        Click to filter
      </span>
    </button>
  );
}
