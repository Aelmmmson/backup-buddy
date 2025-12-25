import { Database, BackupAttempt } from '@/data/mockBackupData';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { EnvironmentBadge } from './EnvironmentBadge';
import { CheckCircle2, XCircle, Clock, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DatabaseDetailModalProps {
  database: Database | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DatabaseDetailModal({ database, open, onOpenChange }: DatabaseDetailModalProps) {
  if (!database) return null;

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-border bg-card sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            {database.name}
            <EnvironmentBadge environment={database.environment} />
          </DialogTitle>
        </DialogHeader>

        <div className="mt-4">
          <div
            className={cn(
              'flex items-center gap-3 rounded-lg p-4',
              database.isBackedUpToday
                ? 'bg-success/10 text-success'
                : 'bg-destructive/10 text-destructive'
            )}
          >
            {database.isBackedUpToday ? (
              <CheckCircle2 className="h-6 w-6" />
            ) : (
              <XCircle className="h-6 w-6" />
            )}
            <span className="text-lg font-semibold">
              {database.isBackedUpToday ? 'Backed Up Today' : 'Not Backed Up Today'}
            </span>
          </div>

          <div className="mt-6">
            <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Last 3 Backup Attempts
            </h4>
            <div className="space-y-3">
              {database.backupHistory.map((attempt, index) => (
                <BackupAttemptRow key={index} attempt={attempt} />
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function BackupAttemptRow({ attempt }: { attempt: BackupAttempt }) {
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div
      className={cn(
        'rounded-lg border p-3',
        attempt.status === 'success'
          ? 'border-success/20 bg-success/5'
          : 'border-destructive/20 bg-destructive/5'
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {attempt.status === 'success' ? (
            <CheckCircle2 className="h-4 w-4 text-success" />
          ) : (
            <XCircle className="h-4 w-4 text-destructive" />
          )}
          <span
            className={cn(
              'font-medium',
              attempt.status === 'success' ? 'text-success' : 'text-destructive'
            )}
          >
            {attempt.status === 'success' ? 'Success' : 'Failed'}
          </span>
        </div>
        <span className="flex items-center gap-1 text-sm text-muted-foreground">
          <Clock className="h-3.5 w-3.5" />
          {formatTimestamp(attempt.timestamp)}
        </span>
      </div>
      {attempt.errorMessage && (
        <div className="mt-2 flex items-start gap-2 text-sm text-destructive/80">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
          <span>{attempt.errorMessage}</span>
        </div>
      )}
    </div>
  );
}
