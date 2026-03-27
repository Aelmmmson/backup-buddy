import { useState } from "react";
import { Database, BackupAttempt, BackupPhase } from "@/data/apiTypes";
import { formatNumber } from "@/data/apiService";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { EnvironmentBadge } from "./EnvironmentBadge";
import {
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  AlertTriangle,
  Minus,
  ChevronRight,
  ArrowLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

interface DatabaseDetailModalProps {
  database: Database | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface LogViewState {
  title: string;
  logs: string[];
  isWarning: boolean;
}

function PhaseDetailCard({
  phase,
  label,
  onViewLogs,
}: {
  phase: BackupPhase;
  label: string;
  onViewLogs: (view: LogViewState) => void;
}) {
  const isComplete = phase.status === "success" && phase.dumpExists;
  const isFailed = phase.status === "failed";
  const isPending = phase.status === "pending";

  let progressPercent = 0;
  if (isComplete || isFailed) {
    progressPercent = 100;
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
    if (isPending) return "bg-muted-foreground/30";
    return "bg-warning";
  };

  const getSizeDisplay = () => {
    if (isPending) return <span className="animate-pulse italic">Awaiting backup</span>;
    if (isFailed) return phase.errors?.length ? "Backup failed" : "Backup failed";
    if (phase.dumpSizeKb !== null && phase.dumpSizeKb > 0) {
      return `${formatNumber(phase.dumpSizeKb)} kb`;
    }
    return "No data";
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
          {getSizeDisplay()}
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

      {phase.errors && phase.errors.length > 0 && (
        <div className="mt-3 border-t border-border pt-3">
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full justify-between bg-background/50 hover:bg-background/80"
            onClick={() => onViewLogs({
              title: `${label} Logs`,
              logs: phase.errors!,
              isWarning: isComplete || (!isComplete && !isFailed)
            })}
          >
            <span className="flex items-center gap-2">
              <AlertTriangle className={cn("h-4 w-4", (isComplete || (!isComplete && !isFailed)) ? "text-warning" : "text-destructive")} />
              <span className={(isComplete || (!isComplete && !isFailed)) ? "text-warning" : "text-destructive"}>
                {(isComplete || (!isComplete && !isFailed)) ? "View Warnings" : "View Errors"} ({phase.errors.length})
              </span>
            </span>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </Button>
        </div>
      )}
    </div>
  );
}

export function DatabaseDetailModal({
  database,
  open,
  onOpenChange,
}: DatabaseDetailModalProps) {
  const [viewLogs, setViewLogs] = useState<LogViewState | null>(null);

  if (!database) return null;

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      onOpenChange(false);
      setTimeout(() => setViewLogs(null), 200);
    } else {
      onOpenChange(isOpen);
    }
  };

  const hasPre = database.preUpdate !== null;
  const hasPost = database.postUpdate !== null;
  const phaseCount = (hasPre ? 1 : 0) + (hasPost ? 1 : 0);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className={cn(
        "border-border bg-card transition-all duration-300",
        viewLogs ? "sm:max-w-4xl h-[85vh] flex flex-col pt-5" : "sm:max-w-lg"
      )}>
        {!viewLogs ? (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-xl">
                {database.name}
                <EnvironmentBadge environment={database.environment} />
              </DialogTitle>
            </DialogHeader>

            <div className="mt-4 space-y-4">
              <div className={cn(
                "grid gap-4",
                phaseCount === 2 ? "sm:grid-cols-2" : "grid-cols-1",
              )}>
                {hasPre && (
                  <PhaseDetailCard
                    phase={database.preUpdate!}
                    label="Pre-Update Backup"
                    onViewLogs={setViewLogs}
                  />
                )}
                {hasPost && (
                  <PhaseDetailCard
                    phase={database.postUpdate!}
                    label="Post-Update Backup"
                    onViewLogs={setViewLogs}
                  />
                )}
                {!hasPre && !hasPost && (
                  <div className="rounded-lg border border-border p-4 text-center text-sm text-muted-foreground italic">
                    No backup phases configured for this server
                  </div>
                )}
              </div>

              {database.backupHistory.length > 0 && (
                <div className="mt-6">
                  <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                    Last {database.backupHistory.length} Backup Attempt{database.backupHistory.length !== 1 ? 's' : ''}
                  </h4>
                  <div className="space-y-3">
                    {database.backupHistory.map((attempt, index) => (
                      <BackupAttemptRow key={index} attempt={attempt} onViewLogs={setViewLogs} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <DialogHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={() => setViewLogs(null)} className="-ml-2 h-8 w-8">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <DialogTitle className="flex items-center gap-2 text-xl">
                  {viewLogs.title}
                  <EnvironmentBadge environment={database.environment} />
                </DialogTitle>
              </div>
            </DialogHeader>
            <div className="flex-1 min-h-0 overflow-y-auto mt-2 rounded-lg border bg-muted/30 p-4">
              <div className="space-y-2">
                {viewLogs.logs.map((log, i) => (
                  <div 
                    key={i} 
                    className={cn(
                      "flex items-start gap-2.5 p-3 rounded-md text-sm border", 
                      viewLogs.isWarning 
                        ? "text-warning bg-warning/10 border-warning/20" 
                        : "text-destructive bg-destructive/10 border-destructive/20"
                    )}
                  >
                    {viewLogs.isWarning ? (
                      <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                    ) : (
                      <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                    )}
                    <span className="font-mono text-xs leading-relaxed break-all whitespace-pre-wrap">{log}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function BackupAttemptRow({ attempt, onViewLogs }: { attempt: BackupAttempt; onViewLogs: (view: LogViewState) => void }) {
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

  const isWarning = attempt.status === "success";

  return (
    <div
      className={cn(
        "rounded-lg border p-3 flex flex-col gap-2.5",
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

      {attempt.errorMessages && attempt.errorMessages.length > 0 && (
        <div className="pt-0.5">
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full justify-between h-8 px-2 bg-background/50 hover:bg-background/80"
            onClick={() => onViewLogs({
              title: "Attempt Logs",
              logs: attempt.errorMessages!,
              isWarning: isWarning
            })}
          >
            <span className="flex items-center gap-2">
              {isWarning ? (
                <AlertTriangle className="h-3.5 w-3.5 text-warning" />
              ) : (
                <AlertCircle className="h-3.5 w-3.5 text-destructive" />
              )}
              <span className={isWarning ? "text-warning" : "text-destructive"}>
                {isWarning ? "View Warnings" : "View Errors"} ({attempt.errorMessages.length})
              </span>
            </span>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </Button>
        </div>
      )}
    </div>
  );
}
