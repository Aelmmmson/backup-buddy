import {
  Database,
  formatNumber,
  getServerOverallStatus,
} from "@/data/apiService";
import { BackupPhase } from "@/data/apiTypes";
import { EnvironmentBadge } from "./EnvironmentBadge";
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Minus,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { VisiblePhase } from './ServerCard';

interface ServerTableProps {
  databases: Database[];
  onRowClick: (database: Database) => void;
  visiblePhase?: VisiblePhase;
}

function StatusBadge({
  status,
}: {
  status: "success" | "failed" | "pending";
}) {
  if (status === "pending") {
    return (
      <span className="inline-flex items-center gap-1 text-xs italic text-muted-foreground">
        <Minus className="h-3 w-3" />
        <span className="border-b border-dashed border-muted-foreground/50">
          Pending
        </span>
      </span>
    );
  }
  if (status === "failed") {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-destructive">
        <XCircle className="h-3 w-3" />
        <span className="border-b border-dashed border-destructive/50">
          Failed
        </span>
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

function ProgressCell({ phase }: { phase: BackupPhase | null }) {
  // Phase not applicable for this server
  if (phase === null) {
    return (
      <div className="text-xs italic text-muted-foreground/60">
        N/A
      </div>
    );
  }

  const getSizeDisplay = () => {
    if (phase.status === "pending") return <span className="animate-pulse italic">Awaiting backup</span>;
    if (phase.status === "failed") return "Backup failed";
    if (phase.dumpSizeKb !== null && phase.dumpSizeKb > 0) {
      return `${formatNumber(phase.dumpSizeKb)} kb`;
    }
    return "No data";
  };

  return (
    <div className="space-y-1">
      <StatusBadge status={phase.status} />
      <div className="text-xs text-muted-foreground">
        <span
          className={cn(
            "font-medium",
            phase.status === "success"
              ? "text-success"
              : phase.status === "failed"
                ? "text-destructive"
                : "text-muted-foreground",
          )}
        >
          {getSizeDisplay()}
        </span>
      </div>
    </div>
  );
}

export function ServerTable({ databases, onRowClick, visiblePhase = 'both' }: ServerTableProps) {
  const formatTimestamp = (timestamp: string | null) => {
    if (!timestamp)
      return <span className="italic text-muted-foreground/60">—</span>;
    const date = new Date(timestamp);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatAge = (hours: number | null) => {
    if (hours === null)
      return <span className="italic text-muted-foreground/60">—</span>;

    let totalMinutes = Math.round(hours * 60);
    const d = Math.floor(totalMinutes / (24 * 60));
    totalMinutes %= (24 * 60);
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;

    const parts = [];
    if (d > 0) parts.push(`${d} ${d === 1 ? "day" : "days"}`);
    if (h > 0) parts.push(`${h} ${h === 1 ? "hour" : "hours"}`);
    if (m > 0 || parts.length === 0) parts.push(`${m} ${m === 1 ? "minute" : "minutes"}`);

    return parts.join(", ");
  };

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden animate-fade-in">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50 hover:bg-muted/50">
            <TableHead className="font-semibold">Server Name</TableHead>
            <TableHead className="font-semibold">Environment</TableHead>
            {(visiblePhase === 'both' || visiblePhase === 'pre') && (
              <TableHead className="font-semibold">Pre-Backup</TableHead>
            )}
            {(visiblePhase === 'both' || visiblePhase === 'post') && (
              <TableHead className="font-semibold">Post-Backup</TableHead>
            )}
            <TableHead className="font-semibold">Last Backup</TableHead>
            <TableHead className="font-semibold text-right">Age</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {databases.map((database, index) => {
            const overallStatus = getServerOverallStatus(database);
            const lastTimestamp =
              database.postUpdate?.lastBackupTimestamp ||
              database.preUpdate?.lastBackupTimestamp;

            return (
              <TableRow
                key={database.id}
                onClick={() => onRowClick(database)}
                className={cn(
                  "cursor-pointer transition-all duration-200 hover:bg-muted/70",
                  index % 2 === 0 ? "bg-background" : "bg-muted/20",
                  overallStatus === "failed" && "hover:bg-destructive/5",
                  overallStatus === "warning" && "hover:bg-warning/5",
                )}
                style={{ animationDelay: `${index * 30}ms` }}
              >
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    {overallStatus === "success" && (
                      <CheckCircle2 className="h-4 w-4 text-success" />
                    )}
                    {overallStatus === "warning" && (
                      <AlertTriangle className="h-4 w-4 text-warning" />
                    )}
                    {overallStatus === "failed" && (
                      <XCircle className="h-4 w-4 text-destructive animate-pulse-slow" />
                    )}
                    {overallStatus === "pending" && (
                      <Minus className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span className="truncate max-w-[200px]">
                      {database.name}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <EnvironmentBadge environment={database.environment} />
                </TableCell>
                {(visiblePhase === 'both' || visiblePhase === 'pre') && (
                  <TableCell>
                    <ProgressCell phase={database.preUpdate} />
                  </TableCell>
                )}
                {(visiblePhase === 'both' || visiblePhase === 'post') && (
                  <TableCell>
                    <ProgressCell phase={database.postUpdate} />
                  </TableCell>
                )}
                <TableCell>
                  <span className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" />
                    {formatTimestamp(lastTimestamp)}
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
              <TableCell
                colSpan={6}
                className="text-center py-8 text-muted-foreground"
              >
                No servers match this filter
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
