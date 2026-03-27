import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  fetchDashboardData,
  fetchServerHistory,
  mapApiResponseToDatabases,
  getServerOverallStatus,
} from "@/data/apiService";
import { Database } from "@/data/apiService";
import { HistoryBackupItem } from "@/data/apiTypes";
import { ThemeToggle } from "@/components/ThemeToggle";
import { EnvironmentBadge } from "@/components/EnvironmentBadge";
import { useNavigate } from "react-router-dom";
import { logout } from "@/lib/auth";
import { exportComplianceCSV, exportCompliancePrint } from "@/lib/reportExport";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
  Cell,
} from "recharts";
import { format, parseISO } from "date-fns";
import {
  Activity,
  ArrowLeft,
  LogOut,
  Settings,
  Download,
  Printer,
  TrendingUp,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Search,
  X,
  BarChart2,
  Database as DbIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function mapStatus(s: string | null | undefined): "success" | "failed" | "pending" {
  if (!s) return "pending";
  const u = s.toUpperCase();
  if (u === "SUCCESS" || u === "SUCCESSFUL") return "success";
  if (u === "FAILED") return "failed";
  return "pending";
}

/** Safely extract history array from any API response shape */
function extractHistory(data: unknown): HistoryBackupItem[] {
  if (!data) return [];
  if (Array.isArray(data)) return data as HistoryBackupItem[];
  const d = data as Record<string, unknown>;
  // Real API returns { success, data: [...] }
  if (Array.isArray(d.data)) return d.data as HistoryBackupItem[];
  if (Array.isArray(d.history)) return d.history as HistoryBackupItem[];
  if (Array.isArray(d.backup_history)) return d.backup_history as HistoryBackupItem[];
  return [];
}

// ─── Server History Charts ────────────────────────────────────────────────────

function HistoryCharts({ db }: { db: Database }) {
  const { data: rawData, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["serverHistory", db.host, db.name],
    queryFn: () => fetchServerHistory(db.host, db.name),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  const history = useMemo(() => extractHistory(rawData), [rawData]);

  const chartData = useMemo(() => {
    if (!history.length) return [];
    return [...history]
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
      .map((item) => {
        const st = mapStatus(item.status);
        let dateLabel = item.timestamp ?? "";
        let fullDate = item.timestamp ?? "";
        try {
          const d = parseISO(item.timestamp);
          dateLabel = format(d, "dd MMM");
          fullDate = format(d, "dd MMM yyyy HH:mm");
        } catch { /* keep raw string if parse fails */ }
        return {
          date: dateLabel,
          fullDate,
          success: st === "success" ? 1 : 0,
          failed: st === "failed" ? 1 : 0,
          sizeMb: item.dump_file_size_mb ?? 0,
          status: st,
          message: item.message ?? "",
        };
      });
  }, [history]);

  const totalRuns = chartData.length;
  const successRuns = chartData.filter((d) => d.success === 1).length;
  const failRuns = chartData.filter((d) => d.failed === 1).length;
  const hasSizeData = chartData.some((d) => d.sizeMb > 0);


  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-40 rounded-xl bg-muted animate-pulse" />
        ))}
        <div className="lg:col-span-2 h-56 rounded-xl bg-muted animate-pulse" />
        <div className="h-56 rounded-xl bg-muted animate-pulse" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-destructive/20 bg-destructive/5 p-10 text-center">
        <XCircle className="h-10 w-10 text-destructive/60" />
        <div>
          <p className="font-semibold text-destructive">Failed to load history</p>
          <p className="text-sm text-muted-foreground mt-1">
            {error instanceof Error ? error.message : "API connection error"}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-2">
          <RefreshCw className="h-3.5 w-3.5" />
          Retry
        </Button>
      </div>
    );
  }

  if (!history.length) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-border bg-muted/20 p-10 text-center">
        <BarChart2 className="h-10 w-10 text-muted-foreground/50" />
        <p className="font-medium text-muted-foreground">No history records found</p>
        <p className="text-sm text-muted-foreground/70">The API returned an empty history for this server.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Stat strip — compact inline row */}
      <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-5 py-3">
        {[
          { label: "Total Runs", value: totalRuns, color: "text-primary" },
          { label: "Successful", value: successRuns, color: "text-success" },
          { label: "Failed", value: failRuns, color: "text-destructive" },
        ].map(({ label, value, color }, i) => (
          <div key={label} className={cn("flex items-baseline gap-2", i > 0 && "border-l border-border pl-3")}>
            <span className={cn("text-xl font-bold tabular-nums", color)}>{value}</span>
            <span className="text-xs text-muted-foreground">{label}</span>
          </div>
        ))}
        {successRuns + failRuns > 0 && (
          <div className="ml-auto flex items-center gap-1.5">
            <div
              className="h-1.5 rounded-full bg-success"
              style={{ width: `${Math.round((successRuns / totalRuns) * 80)}px`, minWidth: 4 }}
            />
            <div
              className="h-1.5 rounded-full bg-destructive"
              style={{ width: `${Math.round((failRuns / totalRuns) * 80)}px`, minWidth: failRuns ? 4 : 0 }}
            />
            <span className="text-xs text-muted-foreground ml-1">
              {Math.round((successRuns / totalRuns) * 100)}% success rate
            </span>
          </div>
        )}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* Run Results bar chart */}
        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
            <Activity className="h-4 w-4 text-primary" />
            Run Results Over Time
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
              <Tooltip
                contentStyle={{
                  background: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: 8,
                  fontSize: 12,
                }}
                labelFormatter={(_l, p) => p?.[0]?.payload?.fullDate ?? _l}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="success" name="Successful" fill="hsl(145 65% 42%)" radius={[3, 3, 0, 0]} />
              <Bar dataKey="failed" name="Failed" fill="hsl(0 72% 55%)" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Backup size area chart */}
        {hasSizeData ? (
          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              Backup Size Over Time (KB)
            </h3>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={chartData} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
                <defs>
                  <linearGradient id="gradPost" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(220 70% 55%)" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="hsl(220 70% 55%)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradPre" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(145 65% 42%)" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="hsl(145 65% 42%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                  labelFormatter={(_l, p) => p?.[0]?.payload?.fullDate ?? _l}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Area
                  type="monotone"
                  dataKey="sizeMb"
                  name="Backup Size (KB)"
                  stroke="hsl(220 70% 55%)"
                  fill="url(#gradPost)"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="rounded-xl border border-border bg-muted/20 p-5 flex items-center justify-center">
            <p className="text-sm text-muted-foreground italic">No size data available for this server.</p>
          </div>
        )}
      </div>

      {/* Recent runs log */}
      <div className="rounded-xl border border-border bg-card p-5">
        <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
          <DbIcon className="h-4 w-4 text-primary" />
          Run Log
          <span className="ml-auto text-xs font-normal text-muted-foreground">Sorted newest first</span>
        </h3>
        <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
          {[...history]
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
            .map((item, i) => {
              const st = mapStatus(item.status);
              let dateStr = item.timestamp;
              try { dateStr = format(parseISO(item.timestamp), "dd MMM yyyy HH:mm"); } catch { /* keep raw */ }
              const uniqueErrors = [...new Set(item.errors ?? [])];
              return (
                <div
                  key={item.id ?? i}
                  className={cn(
                    "rounded-lg border px-3 py-2.5 text-xs",
                    st === "success"
                      ? "border-success/20 bg-success/5"
                      : st === "failed"
                        ? "border-destructive/20 bg-destructive/5"
                        : "border-border bg-muted/30"
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {st === "success" ? (
                        <CheckCircle2 className="h-3.5 w-3.5 text-success shrink-0" />
                      ) : st === "failed" ? (
                        <XCircle className="h-3.5 w-3.5 text-destructive shrink-0" />
                      ) : (
                        <AlertTriangle className="h-3.5 w-3.5 text-warning shrink-0" />
                      )}
                      <span className="font-medium text-foreground">{item.message ?? item.status}</span>
                    </div>
                    <span className="shrink-0 text-muted-foreground font-mono">{dateStr}</span>
                  </div>
                  {uniqueErrors.length > 0 && (
                    <div className="mt-2 flex flex-col gap-1">
                      {uniqueErrors.map((e, ei) => (
                        <div key={ei} className="flex items-start gap-1.5 text-warning/90">
                          <AlertTriangle className="h-3 w-3 shrink-0 mt-0.5" />
                          <span className="font-mono leading-relaxed break-all">{e}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}

// ─── Status Breakdown Chart ───────────────────────────────────────────────────

function StatusBreakdown({ databases }: { databases: Database[] }) {
  const counts = useMemo(() => {
    return [
      { name: "Successful", value: databases.filter((d) => getServerOverallStatus(d) === "success").length, fill: "hsl(145 65% 42%)" },
      { name: "Failed", value: databases.filter((d) => getServerOverallStatus(d) === "failed").length, fill: "hsl(0 72% 55%)" },
      { name: "Warning", value: databases.filter((d) => getServerOverallStatus(d) === "warning").length, fill: "hsl(38 92% 50%)" },
      { name: "Pending", value: databases.filter((d) => getServerOverallStatus(d) === "pending").length, fill: "hsl(var(--muted-foreground))" },
    ].filter((d) => d.value > 0);
  }, [databases]);

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
        <Activity className="h-4 w-4 text-primary" />
        Overall Status Breakdown
      </h3>
      <ResponsiveContainer width="100%" height={160}>
        <BarChart data={counts} layout="vertical" margin={{ top: 0, right: 20, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
          <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
          <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} width={80} stroke="hsl(var(--muted-foreground))" />
          <Tooltip
            contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
          />
          <Bar dataKey="value" name="Servers" radius={[0, 4, 4, 0]}>
            {counts.map((entry, i) => (
              <Cell key={i} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

const Analytics = () => {
  const navigate = useNavigate();
  const [selectedDb, setSelectedDb] = useState<Database | null>(null);
  const [search, setSearch] = useState("");

  const { data: apiResponse, isLoading } = useQuery({
    queryKey: ["dashboardData"],
    queryFn: fetchDashboardData,
    staleTime: 5 * 60 * 1000,
  });

  const databases = useMemo(
    () => (apiResponse ? mapApiResponseToDatabases(apiResponse) : []),
    [apiResponse]
  );

  const filtered = useMemo(() => {
    if (!search.trim()) return databases;
    const q = search.toLowerCase();
    return databases.filter(
      (db) => db.name.toLowerCase().includes(q) || db.host.toLowerCase().includes(q)
    );
  }, [databases, search]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 dark:bg-white">
                <img src="/usg-logo-O.png" alt="Logo" className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-foreground">Analytics & Reports</h1>
                <p className="text-xs text-muted-foreground">Backup trends, history charts, and compliance exports</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => navigate("/")} className="hidden sm:flex">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Dashboard
              </Button>
              <Button variant="ghost" size="sm" onClick={() => navigate("/users")} className="hidden sm:flex">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
              <Button variant="ghost" size="sm" onClick={logout} className="text-destructive hover:text-destructive hover:bg-destructive/10">
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 md:px-12 py-8 space-y-6">
        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => <div key={i} className="h-24 rounded-xl bg-muted animate-pulse" />)}
          </div>
        ) : (
          <>
            {/* ── Section 1: Export toolbar (compact single row) ────────── */}
            <div className="flex items-center gap-2 border-b border-border pb-3">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mr-1">Compliance Report</span>
              <span className="text-xs text-muted-foreground/60">{databases.length} servers</span>
              <div className="ml-auto flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 gap-1.5 text-xs px-2.5"
                  onClick={() => exportComplianceCSV(databases)}
                  disabled={databases.length === 0}
                >
                  <Download className="h-3.5 w-3.5" />
                  CSV
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 gap-1.5 text-xs px-2.5"
                  onClick={() => exportCompliancePrint(databases)}
                  disabled={databases.length === 0}
                >
                  <Printer className="h-3.5 w-3.5" />
                  Print / PDF
                </Button>
              </div>
            </div>

            {/* ── Section 2: Server selector — compact pill chips ────────── */}
            <div className="rounded-xl border border-border bg-card px-4 py-3">
              <div className="flex items-center gap-3 mb-2.5">
                <span className="text-xs font-semibold text-foreground whitespace-nowrap">Select Server</span>
                {selectedDb && (
                  <button
                    onClick={() => setSelectedDb(null)}
                    className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <X className="h-3 w-3" />
                    Clear
                  </button>
                )}
                <div className="relative ml-auto">
                  <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                  <input
                    className="h-7 w-40 rounded-md border border-border bg-background pl-6 pr-6 text-xs focus:outline-none focus:ring-1 focus:ring-primary/50"
                    placeholder="Search..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                  {search && (
                    <button onClick={() => setSearch("")} className="absolute right-1.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                      <X className="h-2.5 w-2.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Horizontally scrollable pill row */}
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
                {filtered.map((db) => {
                  const status = getServerOverallStatus(db);
                  const isActive = selectedDb?.id === db.id;
                  return (
                    <button
                      key={db.id}
                      onClick={() => setSelectedDb(isActive ? null : db)}
                      className={cn(
                        "flex items-center gap-1.5 whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-medium transition-all duration-150 shrink-0",
                        isActive
                          ? "border-primary bg-primary text-primary-foreground shadow-sm"
                          : "border-border bg-muted/30 text-foreground hover:bg-muted/70"
                      )}
                    >
                      <span
                        className={cn(
                          "text-xs leading-none",
                          isActive ? "text-primary-foreground" : status === "success" ? "text-success" : status === "failed" ? "text-destructive" : "text-warning"
                        )}
                      >
                        {status === "success" ? "●" : status === "failed" ? "●" : "●"}
                      </span>
                      {db.name}
                    </button>
                  );
                })}
                {filtered.length === 0 && (
                  <span className="text-xs text-muted-foreground italic py-1">No servers match</span>
                )}
              </div>
            </div>

            {/* ── Section 3: Charts area ────────────────────────────────── */}
            {selectedDb ? (
              <div className="space-y-2">
                {/* Selected server header */}
                <div className="flex items-center gap-3 px-1">
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-foreground">{selectedDb.name}</h2>
                    <EnvironmentBadge environment={selectedDb.environment} />
                  </div>
                  <span className="text-sm text-muted-foreground">{selectedDb.host}</span>
                </div>
                <HistoryCharts db={selectedDb} />
              </div>
            ) : (
              /* Overview charts when no server selected */
              <StatusBreakdown databases={databases} />
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default Analytics;
