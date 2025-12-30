import { Database, formatNumber, getServerOverallStatus } from '@/data/mockBackupData';
import { EnvironmentBadge } from './EnvironmentBadge';
import { CheckCircle2, XCircle, AlertTriangle, Minus, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface ServerTableProps {
  databases: Database[];
  onRowClick: (database: Database) => void;
}

function StatusBadge({ status, complete }: { status: 'success' | 'failed' | 'pending'; complete: boolean }) {
  if (status === 'pending') {
    return (
      <span className="inline-flex items-center gap-1 text-xs italic text-muted-foreground">
        <Minus className="h-3 w-3" />
        <span className="border-b border-dashed border-muted-foreground/50">Pending</span>
      </span>
    );
  }
  if (status === 'failed') {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-destructive">
        <XCircle className="h-3 w-3" />
        <span className="border-b border-dashed border-destructive/50">Failed</span>
      </span>
    );
  }
  if (!complete) {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-warning">
        <AlertTriangle className="h-3 w-3" />
        <span className="border-b border-dashed border-warning/50">Incomplete</span>
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-xs font-medium text-success">
      <CheckCircle2 className="h-3 w-3" />
      Complete
    </span>
  );
}

function ProgressCell({ phase }: { phase: Database['preUpdate'] }) {
  const complete = phase.recordsBacked === phase.totalRecords;
  return (
    <div className="space-y-1">
      <StatusBadge status={phase.status} complete={complete} />
      <div className="text-xs text-muted-foreground">
        <span className={cn(
          'font-medium',
          complete ? 'text-success' : phase.status === 'failed' ? 'text-destructive' : 'text-warning'
        )}>
          {formatNumber(phase.recordsBacked)}
        </span>
        <span className="mx-1">/</span>
        <span>{formatNumber(phase.totalRecords)}</span>
      </div>
    </div>
  );
}

export function ServerTable({ databases, onRowClick }: ServerTableProps) {
  const formatTimestamp = (timestamp: string | null) => {
    if (!timestamp) return <span className="italic text-muted-foreground/60">—</span>;
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatAge = (hours: number | null) => {
    if (hours === null) return <span className="italic text-muted-foreground/60">—</span>;
    
    if (hours < 1) {
      const minutes = Math.round(hours * 60);
      return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
    }
    
    const wholeHours = Math.floor(hours);
    const remainingMinutes = Math.round((hours - wholeHours) * 60);
    
    if (wholeHours < 24) {
      if (remainingMinutes === 0) {
        return `${wholeHours} hour${wholeHours !== 1 ? 's' : ''}`;
      }
      return `${wholeHours} hour${wholeHours !== 1 ? 's' : ''} ${remainingMinutes} minute${remainingMinutes !== 1 ? 's' : ''}`;
    }
    
    const days = Math.floor(wholeHours / 24);
    const remainingHours = wholeHours % 24;
    
    if (remainingHours === 0) {
      return `${days} day${days !== 1 ? 's' : ''}`;
    }
    return `${days} day${days !== 1 ? 's' : ''} ${remainingHours} hour${remainingHours !== 1 ? 's' : ''}`;
  };

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden animate-fade-in">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50 hover:bg-muted/50">
            <TableHead className="font-semibold">Server Name</TableHead>
            <TableHead className="font-semibold">Environment</TableHead>
            <TableHead className="font-semibold">Pre-Update</TableHead>
            <TableHead className="font-semibold">Post-Update</TableHead>
            <TableHead className="font-semibold">Last Backup</TableHead>
            <TableHead className="font-semibold text-right">Age</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {databases.map((database, index) => {
            const overallStatus = getServerOverallStatus(database);
            return (
              <TableRow
                key={database.id}
                onClick={() => onRowClick(database)}
                className={cn(
                  'cursor-pointer transition-all duration-200 hover:bg-muted/70',
                  index % 2 === 0 ? 'bg-background' : 'bg-muted/20',
                  overallStatus === 'failed' && 'hover:bg-destructive/5',
                  overallStatus === 'warning' && 'hover:bg-warning/5'
                )}
                style={{ animationDelay: `${index * 30}ms` }}
              >
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    {overallStatus === 'success' && <CheckCircle2 className="h-4 w-4 text-success" />}
                    {overallStatus === 'warning' && <AlertTriangle className="h-4 w-4 text-warning" />}
                    {overallStatus === 'failed' && <XCircle className="h-4 w-4 text-destructive animate-pulse-slow" />}
                    <span className="truncate max-w-[200px]">{database.name}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <EnvironmentBadge environment={database.environment} />
                </TableCell>
                <TableCell>
                  <ProgressCell phase={database.preUpdate} />
                </TableCell>
                <TableCell>
                  <ProgressCell phase={database.postUpdate} />
                </TableCell>
                <TableCell>
                  <span className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" />
                    {formatTimestamp(database.postUpdate.lastBackupTimestamp || database.preUpdate.lastBackupTimestamp)}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <span className="text-sm font-medium text-muted-foreground">
                    {formatAge(database.backupAgeHours)}
                  </span>
                </TableCell>
              </TableRow>
            );
          })}
          {databases.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                No servers match this filter
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
