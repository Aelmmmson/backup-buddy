import { Database, BackupAttempt } from "@/data/apiTypes";
import { formatNumber } from "@/data/apiService";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EnvironmentBadge } from "./EnvironmentBadge";
import {
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  AlertTriangle,
  Minus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

interface DatabaseDetailModalProps {
  database: Database | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function PhaseDetailCard({
  phase,
  label,
}: {
  phase: Database["preUpdate"];
  label: string;
}) {
  const isComplete =
    phase.status === "success" && phase.recordsBacked === phase.totalRecords;
  const isIncomplete =
    phase.status === "success" && phase.recordsBacked < phase.totalRecords;
  const isFailed = phase.status === "failed";
  const isPending = phase.status === "pending";

  // Show 100% for failed/pending with no data, otherwise show real progress
  let progressPercent = 0;
  if ((isFailed || isPending) && phase.recordsBacked === 0) {
    progressPercent = 100;
  } else if (phase.totalRecords > 0) {
    progressPercent = (phase.recordsBacked / phase.totalRecords) * 100;
  }

  const formatTimestamp = (timestamp: string | null) => {
    if (!timestamp) return "N/A";
    const date = new Date(timestamp);
    return date.toLocaleString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getAgeDisplay = (timestamp: string | null) => {
    if (!timestamp) return "N/A";
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) {
      return `${diffDays}d ago`;
    } else if (diffHours > 0) {
      return `${diffHours}h ago`;
    } else {
      const diffMins = Math.floor(diffMs / (1000 * 60));
      return `${diffMins}m ago`;
    }
  };

  const getBgClass = () => {
    if (isComplete) return "bg-success/10 border-success/20";
    if (isFailed) return "bg-destructive/10 border-destructive/20";
    if (isPending) return "bg-muted/50 border-border";
    return "bg-warning/10 border-warning/20";
  };

  const getStatusIcon = () => {
    if (isComplete) return <CheckCircle2 className="h-5 w-5 text-success" />;
    if (isFailed) return <XCircle className="h-5 w-5 text-destructive" />;
    if (isPending) return <Minus className="h-5 w-5 text-muted-foreground" />;
    return <AlertTriangle className="h-5 w-5 text-warning" />;
  };

  const getStatusLabel = () => {
    if (isComplete) return "Complete";
    if (isFailed) return "Failed";
    if (isPending) return "Pending";
    return "Incomplete";
  };

  const getProgressColor = () => {
    if (isComplete) return "bg-success";
    if (isFailed) return "bg-destructive";
    if (isPending) return "bg-warning";
    return "bg-warning";
  };

  return (
    <div className={cn("rounded-lg border p-4", getBgClass())}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-semibold text-foreground">{label}</span>
        <div className="flex items-center gap-1.5">
          {getStatusIcon()}
          <span
            className={cn(
              "text-sm font-semibold",
              isComplete
                ? "text-success"
                : isFailed
                  ? "text-destructive"
                  : isPending
                    ? "text-muted-foreground"
                    : "text-warning",
            )}
          >
            {getStatusLabel()}
          </span>
        </div>
      </div>

      <Progress
        value={progressPercent}
        className="h-2 mb-2"
        indicatorClassName={getProgressColor()}
      />

      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">
          {formatNumber(phase.recordsBacked)} /{" "}
          {formatNumber(phase.totalRecords)} mb
        </span>
        <span
          className={cn(
            "font-medium",
            isComplete
              ? "text-success"
              : isFailed
                ? "text-destructive"
                : isPending
                  ? "text-muted-foreground"
                  : "text-warning",
          )}
        >
          {progressPercent.toFixed(0)}%
        </span>
      </div>

      <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          <span>{formatTimestamp(phase.lastBackupTimestamp)}</span>
        </div>
        <span className="font-medium">
          {getAgeDisplay(phase.lastBackupTimestamp)}
        </span>
      </div>
    </div>
  );
}

export function DatabaseDetailModal({
  database,
  open,
  onOpenChange,
}: DatabaseDetailModalProps) {
  if (!database) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-border bg-card sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            {database.name}
            <EnvironmentBadge environment={database.environment} />
          </DialogTitle>
        </DialogHeader>

        <div className="mt-4 space-y-4">
          {/* Pre-Update and Post-Update Cards */}
          <div className="grid gap-4 sm:grid-cols-2">
            <PhaseDetailCard
              phase={database.preUpdate}
              label="Pre-Update Backup"
            />
            <PhaseDetailCard
              phase={database.postUpdate}
              label="Post-Update Backup"
            />
          </div>

          {/* Backup History */}
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
    return date.toLocaleString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div
      className={cn(
        "rounded-lg border p-3",
        attempt.status === "success"
          ? "border-success/20 bg-success/5"
          : "border-destructive/20 bg-destructive/5",
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {attempt.status === "success" ? (
            <CheckCircle2 className="h-4 w-4 text-success" />
          ) : (
            <XCircle className="h-4 w-4 text-destructive" />
          )}
          <span
            className={cn(
              "font-medium",
              attempt.status === "success"
                ? "text-success"
                : "text-destructive",
            )}
          >
            {attempt.status === "success" ? "Success" : "Failed"}
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
