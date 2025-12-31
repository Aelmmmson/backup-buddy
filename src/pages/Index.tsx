import { useState, useMemo } from 'react';
import { mockDatabases, getBackupStats, Database } from '@/data/mockBackupData';
import { SummaryCard } from '@/components/SummaryCard';
import { WarningBanner } from '@/components/WarningBanner';
import { ServerCard } from '@/components/ServerCard';
import { ServerTable } from '@/components/ServerTable';
import { DatabaseDetailModal } from '@/components/DatabaseDetailModal';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Server, ArrowDownToLine, ArrowUpFromLine, Clock, Shield, LayoutGrid, Table } from 'lucide-react';
import { cn } from '@/lib/utils';

type FilterType = 'all' | 'preUpdate' | 'postUpdate' | 'pending' | 'issues';
type ViewType = 'cards' | 'table';

const Index = () => {
  const [selectedDatabase, setSelectedDatabase] = useState<Database | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [filter, setFilter] = useState<FilterType>('all');
  const [viewType, setViewType] = useState<ViewType>('cards');

  const stats = getBackupStats(mockDatabases);

  // Calculate pending backups (servers where either pre or post is still pending)
  const pendingCount = mockDatabases.filter(db => 
    db.preUpdate.status === 'pending' || db.postUpdate.status === 'pending'
  ).length;

  const filteredDatabases = useMemo(() => {
    switch (filter) {
      case 'preUpdate':
        return mockDatabases.filter(db => 
          db.preUpdate.status === 'success' && 
          db.preUpdate.recordsBacked === db.preUpdate.totalRecords
        );
      case 'postUpdate':
        return mockDatabases.filter(db => 
          db.postUpdate.status === 'success' && 
          db.postUpdate.recordsBacked === db.postUpdate.totalRecords
        );
      case 'pending':
        return mockDatabases.filter(db => 
          db.preUpdate.status === 'pending' || db.postUpdate.status === 'pending'
        );
      case 'issues':
        return mockDatabases.filter(db => {
          const preComplete = db.preUpdate.status === 'success' && db.preUpdate.recordsBacked === db.preUpdate.totalRecords;
          const postComplete = db.postUpdate.status === 'success' && db.postUpdate.recordsBacked === db.postUpdate.totalRecords;
          return !(preComplete && postComplete);
        });
      default:
        return mockDatabases;
    }
  }, [filter]);

  const handleDatabaseClick = (database: Database) => {
    setSelectedDatabase(database);
    setModalOpen(true);
  };

  const handleFilterClick = (newFilter: FilterType) => {
    setFilter(filter === newFilter ? 'all' : newFilter);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 dark:bg-white">
                {/* <Shield className="h-5 w-5 text-primary" /> */}
                <img src="/usg-logo-O.png" alt="Logo" className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-foreground">Backup Monitor</h1>
                <p className="text-xs text-muted-foreground">
                  Server backup status dashboard
                </p>
              </div>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-14 py-8">
        {/* Summary Section */}
        <section className="mb-8">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <SummaryCard
              title="Total Servers"
              value={stats.total}
              variant="default"
              icon={<Server className="h-6 w-6" />}
              active={filter === 'all'}
              onClick={() => handleFilterClick('all')}
            />
            <SummaryCard
              title="Pre-Update Complete"
              value={stats.preUpdate.success}
              variant="success"
              icon={<ArrowDownToLine className="h-6 w-6" />}
              active={filter === 'preUpdate'}
              onClick={() => handleFilterClick('preUpdate')}
              subtitle={`${stats.preUpdate.failed} failed · ${stats.preUpdate.incomplete} incomplete`}
            />
            <SummaryCard
              title="Post-Update Complete"
              value={stats.postUpdate.success}
              variant="success"
              icon={<ArrowUpFromLine className="h-6 w-6" />}
              active={filter === 'postUpdate'}
              onClick={() => handleFilterClick('postUpdate')}
              subtitle={`${stats.postUpdate.failed} failed · ${stats.postUpdate.incomplete} incomplete`}
            />
            <SummaryCard
              title="Pending Backups"
              value={pendingCount}
              variant={pendingCount > 0 ? 'warning' : 'default'}
              icon={<Clock className="h-6 w-6" />}
              active={filter === 'pending'}
              onClick={() => handleFilterClick('pending')}
              subtitle="Awaiting backup completion"
            />
          </div>
        </section>

        {/* Warning Banner */}
        <WarningBanner 
          count={stats.hasIssues} 
          active={filter === 'issues'}
          onClick={() => handleFilterClick('issues')}
        />

        {/* Server List */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">
              All Servers
              {filter !== 'all' && (
                <span className="ml-2 text-sm font-normal text-muted-foreground">
                  (showing {filteredDatabases.length} of {stats.total})
                </span>
              )}
            </h2>
            <div className="flex items-center gap-3">
              {filter !== 'all' && (
                <button
                  onClick={() => setFilter('all')}
                  className="text-sm text-primary hover:underline"
                >
                  Show all
                </button>
              )}
              {/* View Toggle */}
              <div className="flex items-center rounded-lg border border-border bg-muted/50 p-1">
                <button
                  onClick={() => setViewType('cards')}
                  className={cn(
                    'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-all',
                    viewType === 'cards' 
                      ? 'bg-background text-foreground shadow-sm' 
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  <LayoutGrid className="h-4 w-4" />
                  Cards
                </button>
                <button
                  onClick={() => setViewType('table')}
                  className={cn(
                    'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-all',
                    viewType === 'table' 
                      ? 'bg-background text-foreground shadow-sm' 
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  <Table className="h-4 w-4" />
                  Table
                </button>
              </div>
            </div>
          </div>
          
          {viewType === 'cards' ? (
            <div className="space-y-3">
              {filteredDatabases.map((database, index) => (
                <ServerCard
                  key={database.id}
                  database={database}
                  onClick={() => handleDatabaseClick(database)}
                  index={index}
                />
              ))}
              {filteredDatabases.length === 0 && (
                <div className="rounded-lg border border-border bg-card p-8 text-center">
                  <p className="text-muted-foreground">No servers match this filter</p>
                </div>
              )}
            </div>
          ) : (
            <ServerTable 
              databases={filteredDatabases} 
              onRowClick={handleDatabaseClick} 
            />
          )}
        </section>
      </main>

      {/* Detail Modal */}
      <DatabaseDetailModal
        database={selectedDatabase}
        open={modalOpen}
        onOpenChange={setModalOpen}
      />
    </div>
  );
};

export default Index;
