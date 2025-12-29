import { Database, formatNumber } from '@/data/mockBackupData';
import { EnvironmentBadge } from './EnvironmentBadge';
import { CheckCircle2, XCircle, Clock, ChevronRight, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';

interface ServerCardProps {
  database: Database;
  onClick: () => void;
  index: number;
}

export function ServerCard({ database, onClick, index }: ServerCardProps) {
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

  const progressPercent = database.totalRecords > 0 
    ? (database.recordsBacked / database.totalRecords) * 100 
    : 0;
  const isComplete = database.recordsBacked === database.totalRecords;
  const isIncomplete = database.isBackedUpToday && !isComplete;

  const getStatusInfo = () => {
    if (!database.isBackedUpToday) {
      return {
        label: 'Not Backed Up Today',
        icon: XCircle,
        colorClass: 'text-destructive',
        bgClass: 'bg-destructive/10 text-destructive',
        borderClass: 'border-destructive/20 hover:border-destructive/40',
      };
    }
    if (isIncomplete) {
      return {
        label: 'Backup Incomplete',
        icon: AlertTriangle,
        colorClass: 'text-warning',
        bgClass: 'bg-warning/10 text-warning',
        borderClass: 'border-warning/20 hover:border-warning/40',
      };
    }
    return {
      label: 'Backed Up Today',
      icon: CheckCircle2,
      colorClass: 'text-success',
      bgClass: 'bg-success/10 text-success',
      borderClass: 'border-success/20 hover:border-success/40',
    };
  };

  const status = getStatusInfo();
  const StatusIcon = status.icon;

  return (
    <button
      onClick={onClick}
      className={cn(
        'group w-full animate-fade-in rounded-lg border bg-card p-5 text-left transition-all duration-200 hover:shadow-md',
        status.borderClass
      )}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="flex items-center gap-4">
        {/* Status Icon */}
        <div
          className={cn(
            'flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full',
            status.bgClass
          )}
        >
          <StatusIcon className={cn('h-6 w-6', !database.isBackedUpToday && 'animate-pulse-slow')} />
        </div>

        {/* Main Content */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-lg font-semibold text-foreground">
              {database.name}
            </h3>
            <EnvironmentBadge environment={database.environment} />
          </div>

          {/* Records Progress */}
          <div className="mt-2 space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Records Backed</span>
              <span className={cn(
                'font-medium',
                isComplete ? 'text-success' : isIncomplete ? 'text-warning' : 'text-destructive'
              )}>
                {formatNumber(database.recordsBacked)} / {formatNumber(database.totalRecords)}
              </span>
            </div>
            <Progress 
              value={progressPercent} 
              className={cn(
                'h-1.5',
                isComplete ? '[&>div]:bg-success' : isIncomplete ? '[&>div]:bg-warning' : '[&>div]:bg-destructive'
              )}
            />
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
            <span className={cn('font-semibold', status.colorClass)}>
              {status.label}
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
