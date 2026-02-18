import { useState, useMemo, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  fetchDashboardData,
  mapApiResponseToDatabases,
  getBackupStats,
  getServerOverallStatus,
  Database,
} from "@/data/apiService";
import { SummaryCard } from "@/components/SummaryCard";
import { WarningBanner } from "@/components/WarningBanner";
import { ServerCard } from "@/components/ServerCard";
import type { VisiblePhase } from "@/components/ServerCard";
import { ServerTable } from "@/components/ServerTable";
import { DatabaseDetailModal } from "@/components/DatabaseDetailModal";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useNavigate } from "react-router-dom";
import { logout } from "@/lib/auth";
import {
  AlertCircle,
  ShieldPlus,
  ShieldCheck,
  Timer,
  Activity,
  Settings,
  LogOut,
  LayoutGrid,
  Table,
  Search,
  ArrowUp,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";

import { cn } from "@/lib/utils";

type FilterType = "all" | "preUpdate" | "postUpdate" | "pending" | "issues";
type ViewType = "cards" | "table";

const Index = () => {
  const [selectedDatabase, setSelectedDatabase] = useState<Database | null>(
    null,
  );
  const [modalOpen, setModalOpen] = useState(false);
  const [filter, setFilter] = useState<FilterType>("all");
  const [viewType, setViewType] = useState<ViewType>("cards");
  const [searchQuery, setSearchQuery] = useState("");
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Scroll to top button visibility
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  // Fetch data from API
  const {
    data: apiResponse,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["dashboardData"],
    queryFn: fetchDashboardData,
    refetchInterval: 3600000, // Refetch every 1 hour
  });

  // Map API response to databases (memoized)
  const databases = useMemo(
    () => (apiResponse ? mapApiResponseToDatabases(apiResponse) : []),
    [apiResponse],
  );

  const stats = useMemo(() => getBackupStats(databases), [databases]);

  // Calculate pending backups
  const pendingCount = useMemo(
    () =>
      databases.filter(
        (db) =>
          db.preUpdate?.status === "pending" ||
          db.postUpdate?.status === "pending",
      ).length,
    [databases],
  );

  // Derive visible phase from filter
  const visiblePhase: VisiblePhase = useMemo(() => {
    if (filter === "preUpdate") return "pre";
    if (filter === "postUpdate") return "post";
    return "both";
  }, [filter]);

  // Filter logic
  const filteredDatabases = useMemo(() => {
    let result: Database[];
    switch (filter) {
      case "preUpdate":
        result = databases.filter((db) => db.preUpdate !== null);
        break;
      case "postUpdate":
        result = databases.filter((db) => db.postUpdate !== null);
        break;
      case "pending":
        result = databases.filter(
          (db) =>
            db.preUpdate?.status === "pending" ||
            db.postUpdate?.status === "pending",
        );
        break;
      case "issues":
        result = databases.filter((db) => {
          const status = getServerOverallStatus(db);
          return status === 'failed' || status === 'warning';
        });
        break;
      default:
        result = databases;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (db) =>
          db.name.toLowerCase().includes(q) ||
          db.host.toLowerCase().includes(q),
      );
    }

    return result;
  }, [filter, databases, searchQuery]);

  const sectionSubHeading = useMemo(() => {
    if (filter === "issues") return "Showing only servers with backup failures or incomplete status";
    if (searchQuery) return `Showing results for "${searchQuery}"`;
    return null;
  }, [filter, searchQuery]);

  const sectionHeading = useMemo(() => {
    switch (filter) {
      case "preUpdate": return "Pre-Backup Servers";
      case "postUpdate": return "Post-Backup Servers";
      case "pending": return "Pending Backups";
      case "issues": return "Servers with Issues";
      default: return "All Servers";
    }
  }, [filter]);

  const handleDatabaseClick = (database: Database) => {
    setSelectedDatabase(database);
    setModalOpen(true);
  };

  const handleFilterClick = (newFilter: FilterType) => {
    setFilter(filter === newFilter ? "all" : newFilter);
  };

  const navigate = useNavigate();

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
                <h1 className="text-lg font-bold text-foreground">
                  Backup Monitor
                </h1>
                <p className="text-xs text-muted-foreground">
                  Server backup status dashboard
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/users")}
                className="hidden sm:flex"
              >
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={logout}
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>

              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-32 py-8">
        {isLoading ? (
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-20 rounded-lg bg-muted animate-pulse" />
              ))}
            </div>
            <div className="h-40 rounded-lg bg-muted animate-pulse" />
          </div>
        ) : (
          <>
            {/* Summary Section */}
            <section className="mb-8">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <SummaryCard
                  title="Total Servers"
                  value={stats.total}
                  variant="default"
                  icon={<Activity className="h-6 w-6" />}
                  active={filter === "all"}
                  onClick={() => handleFilterClick("all")}
                />
                <SummaryCard
                  title="Pre-Backup Completed"
                  value={stats.preUpdate.success}
                  variant="success"
                  icon={<ShieldPlus className="h-6 w-6" />}
                  active={filter === "preUpdate"}
                  onClick={() => handleFilterClick("preUpdate")}
                  subtitle={`${stats.preUpdate.failed} failed · ${stats.preUpdate.incomplete} pending`}
                />
                <SummaryCard
                  title="Post-Backup Completed"
                  value={stats.postUpdate.success}
                  variant="success"
                  icon={<ShieldCheck className="h-6 w-6" />}
                  active={filter === "postUpdate"}
                  onClick={() => handleFilterClick("postUpdate")}
                  subtitle={`${stats.postUpdate.failed} failed · ${stats.postUpdate.incomplete} pending`}
                />
                <SummaryCard
                  title="Pending Backups"
                  value={pendingCount}
                  variant={pendingCount > 0 ? "warning" : "default"}
                  icon={<Timer className="h-6 w-6" />}
                  active={filter === "pending"}
                  onClick={() => handleFilterClick("pending")}
                  subtitle={<span className="italic">Awaiting backup completion</span>}
                />
              </div>
            </section>

            {/* Server List */}
            <section>
              {/* Toolbar Section: 3-Column Layout */}
              <div className="mb-6 grid grid-cols-1 items-end gap-6 md:grid-cols-[1fr_auto_1fr]">
                {/* 1. Left: Heading */}
                <div className="flex flex-col">
                  <h2 className="text-xl font-bold tracking-tight text-foreground">
                    {sectionHeading}
                    {filter !== "all" && (
                      <span className="ml-2 text-sm font-normal text-muted-foreground">
                        ({filteredDatabases.length} of {stats.total})
                      </span>
                    )}
                  </h2>
                  {sectionSubHeading && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {sectionSubHeading}
                    </p>
                  )}
                </div>

                {/* 2. Center: Warning Banner */}
                <div className="flex flex-col items-center justify-center">
                  {error ? (
                    <div className="flex items-center gap-2 rounded-full bg-destructive/10 px-4 py-1.5 text-sm font-medium text-destructive">
                      <AlertCircle className="h-4 w-4" />
                      <span>Error: {error instanceof Error ? error.message : "Failed to fetch"}</span>
                    </div>
                  ) : (
                    <WarningBanner
                      count={stats.hasIssues}
                      active={filter === "issues"}
                      onClick={() => handleFilterClick("issues")}
                    />
                  )}
                </div>

                {/* 3. Right: Search (top) + View Toggle (bottom) */}
                <div className="flex flex-col items-end gap-3">
                  {/* Search Input */}
                  <div className="relative w-full max-w-[240px]">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Search servers..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="h-9 w-full rounded-lg border border-border bg-background pl-8 pr-8 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery("")}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    {filter !== "all" && (
                      <button
                        onClick={() => setFilter("all")}
                        className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                      >
                        Show all
                      </button>
                    )}

                    {/* View Toggle */}
                    <div className="flex items-center rounded-lg border border-border bg-muted/20 p-1">
                      <button
                        onClick={() => setViewType("cards")}
                        className={cn(
                          "flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-medium transition-all",
                          viewType === "cards"
                            ? "bg-background text-foreground shadow-sm"
                            : "text-muted-foreground hover:text-foreground",
                        )}
                      >
                        <LayoutGrid className="h-3.5 w-3.5" />
                        <span>Cards</span>
                      </button>
                      <button
                        onClick={() => setViewType("table")}
                        className={cn(
                          "flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-medium transition-all",
                          viewType === "table"
                            ? "bg-background text-foreground shadow-sm"
                            : "text-muted-foreground hover:text-foreground",
                        )}
                      >
                        <Table className="h-3.5 w-3.5" />
                        <span>Table</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* List Content */}
              {viewType === "cards" ? (
                <div className="space-y-3">
                  {filteredDatabases.map((database, index) => (
                    <ServerCard
                      key={database.id}
                      database={database}
                      onClick={() => handleDatabaseClick(database)}
                      index={index}
                      visiblePhase={visiblePhase}
                    />
                  ))}
                  {filteredDatabases.length === 0 && (
                    <div className="rounded-lg border border-border bg-card p-8 text-center">
                      <p className="text-muted-foreground">
                        {searchQuery
                          ? `No servers match "${searchQuery}"`
                          : "No servers match this filter"}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <ServerTable
                  databases={filteredDatabases}
                  onRowClick={handleDatabaseClick}
                  visiblePhase={visiblePhase}
                />
              )}
            </section>
          </>
        )}
      </main>

      {/* Detail Modal */}
      <DatabaseDetailModal
        database={selectedDatabase}
        open={modalOpen}
        onOpenChange={setModalOpen}
      />

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-xl animate-in fade-in slide-in-from-bottom-2"
          aria-label="Scroll to top"
        >
          <ArrowUp className="h-5 w-5" />
        </button>
      )}
    </div>
  );
};

export default Index;
