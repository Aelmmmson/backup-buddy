import { Database } from '@/data/mockBackupData';
import { EnvironmentBadge } from './EnvironmentBadge';
import { CheckCircle2, XCircle, Clock, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DatabaseCardProps {
  database: Database;
  onClick: () => void;
  index: number;
}

export function DatabaseCard({ database, onClick, index }: DatabaseCardProps) {
  const formatTimestamp = (timestamp: string | null) => {
    if (!timestamp) return 'Never';
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatAge = (hours: number | null) => {
    if (hours === null) return 'N/A';
    if (hours < 1) return '< 1 hour';
    if (hours < 24) return `${hours} ${hours === 1 ? 'hour' : 'hours'}`;
    const days = Math.floor(hours / 24);
    return `${days} ${days === 1 ? 'day' : 'days'}`;
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        'group w-full animate-fade-in rounded-lg border bg-card p-5 text-left transition-all duration-200 hover:bg-accent/50',
        database.isBackedUpToday
          ? 'border-success/20 hover:border-success/40'
          : 'border-destructive/20 hover:border-destructive/40'
      )}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="flex items-center gap-4">
        {/* Status Icon */}
        <div
          className={cn(
            'flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full',
            database.isBackedUpToday
              ? 'bg-success/10 text-success'
              : 'bg-destructive/10 text-destructive'
          )}
        >
          {database.isBackedUpToday ? (
            <CheckCircle2 className="h-6 w-6" />
          ) : (
            <XCircle className="h-6 w-6 animate-pulse-slow" />
          )}
        </div>

        {/* Main Content */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-lg font-semibold text-foreground">
              {database.name}
            </h3>
            <EnvironmentBadge environment={database.environment} />
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
            <span
              className={cn(
                'font-semibold',
                database.isBackedUpToday ? 'text-success' : 'text-destructive'
              )}
            >
              {database.isBackedUpToday ? 'Backed Up Today' : 'Not Backed Up Today'}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {formatTimestamp(database.lastBackupTimestamp)}
            </span>
            <span className="text-muted-foreground/70">
              Age: {formatAge(database.backupAgeHours)}
            </span>
          </div>
        </div>

        {/* Arrow */}
        <ChevronRight className="h-5 w-5 flex-shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1" />
      </div>
    </button>
  );
}
