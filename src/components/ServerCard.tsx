import { Database, formatNumber, getServerOverallStatus } from '@/data/mockBackupData';
import { EnvironmentBadge } from './EnvironmentBadge';
import { CheckCircle2, XCircle, Clock, ChevronRight, AlertTriangle, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';

interface ServerCardProps {
  database: Database;
  onClick: () => void;
  index: number;
}

function PhaseStatus({ phase, label }: { phase: Database['preUpdate']; label: string }) {
  const isComplete = phase.status === 'success' && phase.recordsBacked === phase.totalRecords;
  const isIncomplete = phase.status === 'success' && phase.recordsBacked < phase.totalRecords;
  const isFailed = phase.status === 'failed';
  const isPending = phase.status === 'pending';
  
  const progressPercent = phase.totalRecords > 0 ? (phase.recordsBacked / phase.totalRecords) * 100 : 0;

  const getStatusIcon = () => {
    if (isComplete) return <CheckCircle2 className="h-4 w-4 text-success" />;
    if (isFailed) return <XCircle className="h-4 w-4 text-destructive" />;
    if (isPending) return <Minus className="h-4 w-4 text-muted-foreground" />;
    return <AlertTriangle className="h-4 w-4 text-warning" />;
  };

  const getStatusLabel = () => {
    if (isComplete) return 'Complete';
    if (isFailed) return 'Failed';
    if (isPending) return 'Pending';
    return 'Incomplete';
  };

  return (
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-1.5 mb-1.5">
        {getStatusIcon()}
        <span className="text-xs font-medium text-foreground">{label}</span>
        <span className={cn(
          'text-xs font-semibold ml-auto',
          isComplete ? 'text-success' : isFailed ? 'text-destructive' : isPending ? 'text-muted-foreground' : 'text-warning'
        )}>
          {getStatusLabel()}
        </span>
      </div>
      <Progress 
        value={progressPercent} 
        className={cn(
          'h-1.5',
          isComplete ? '[&>div]:bg-success' : isFailed ? '[&>div]:bg-destructive' : isPending ? '[&>div]:bg-muted' : '[&>div]:bg-warning'
        )}
      />
      <p className="text-xs text-muted-foreground mt-1">
        {formatNumber(phase.recordsBacked)} / {formatNumber(phase.totalRecords)}
      </p>
    </div>
  );
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

  const overallStatus = getServerOverallStatus(database);
  
  const getStatusInfo = () => {
    switch (overallStatus) {
      case 'failed':
        return {
          label: 'Backup Failed',
          icon: XCircle,
          colorClass: 'text-destructive',
          bgClass: 'bg-destructive/10 text-destructive',
          borderClass: 'border-destructive/20 hover:border-destructive/40',
        };
      case 'warning':
        return {
          label: 'Backup Incomplete',
          icon: AlertTriangle,
          colorClass: 'text-warning',
          bgClass: 'bg-warning/10 text-warning',
          borderClass: 'border-warning/20 hover:border-warning/40',
        };
      default:
        return {
          label: 'Fully Backed Up',
          icon: CheckCircle2,
          colorClass: 'text-success',
          bgClass: 'bg-success/10 text-success',
          borderClass: 'border-success/20 hover:border-success/40',
        };
    }
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
          <StatusIcon className={cn('h-6 w-6', overallStatus === 'failed' && 'animate-pulse-slow')} />
        </div>

        {/* Main Content */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-3">
            <h3 className="truncate text-lg font-semibold text-foreground">
              {database.name}
            </h3>
            <EnvironmentBadge environment={database.environment} />
            <span className={cn('ml-auto text-sm font-semibold', status.colorClass)}>
              {status.label}
            </span>
          </div>

          {/* Pre-Update and Post-Update Progress */}
          <div className="flex gap-6">
            <PhaseStatus phase={database.preUpdate} label="Pre-Update" />
            <PhaseStatus phase={database.postUpdate} label="Post-Update" />
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              Last: {formatTimestamp(database.postUpdate.lastBackupTimestamp || database.preUpdate.lastBackupTimestamp)}
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
