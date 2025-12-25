import { AlertTriangle } from 'lucide-react';

interface WarningBannerProps {
  count: number;
}

export function WarningBanner({ count }: WarningBannerProps) {
  if (count === 0) return null;

  return (
    <div className="animate-fade-in mb-6 flex items-center gap-3 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3">
      <AlertTriangle className="h-5 w-5 animate-pulse-slow text-destructive" />
      <p className="font-medium text-destructive">
        {count} {count === 1 ? 'database has' : 'databases have'} not been backed up today
      </p>
    </div>
  );
}
