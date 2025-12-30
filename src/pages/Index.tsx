import { useState, useMemo } from 'react';
import { mockDatabases, getBackupStats, Database } from '@/data/mockBackupData';
import { SummaryCard } from '@/components/SummaryCard';
import { WarningBanner } from '@/components/WarningBanner';
import { ServerCard } from '@/components/ServerCard';
import { ServerTable } from '@/components/ServerTable';
import { DatabaseDetailModal } from '@/components/DatabaseDetailModal';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Server, CheckCircle2, XCircle, AlertTriangle, Shield, LayoutGrid, Table } from 'lucide-react';
import { cn } from '@/lib/utils';

type FilterType = 'all' | 'backed' | 'preSuccess' | 'preFailed' | 'postSuccess' | 'postFailed';
type ViewType = 'cards' | 'table';

const Index = () => {
  const [selectedDatabase, setSelectedDatabase] = useState<Database | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [filter, setFilter] = useState<FilterType>('all');
  const [viewType, setViewType] = useState<ViewType>('cards');

  const stats = getBackupStats(mockDatabases);

  const filteredDatabases = useMemo(() => {
    switch (filter) {
      case 'backed':
        return mockDatabases.filter(db => 
          db.preUpdate.status === 'success' && 
          db.postUpdate.status === 'success' && 
          db.preUpdate.recordsBacked === db.preUpdate.totalRecords &&
          db.postUpdate.recordsBacked === db.postUpdate.totalRecords
        );
      case 'preSuccess':
        return mockDatabases.filter(db => db.preUpdate.status === 'success');
      case 'preFailed':
        return mockDatabases.filter(db => db.preUpdate.status === 'failed' || (db.preUpdate.status === 'success' && db.preUpdate.recordsBacked < db.preUpdate.totalRecords));
      case 'postSuccess':
        return mockDatabases.filter(db => db.postUpdate.status === 'success');
      case 'postFailed':
        return mockDatabases.filter(db => db.postUpdate.status === 'failed' || db.postUpdate.status === 'pending' || (db.postUpdate.status === 'success' && db.postUpdate.recordsBacked < db.postUpdate.totalRecords));
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
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">Backup Monitor</h1>
                <p className="text-sm text-muted-foreground">
                  Server backup status dashboard
                </p>
              </div>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Summary Section */}
        <section className="mb-8">
          {/* Main Stats */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-4">
            <SummaryCard
              title="Total Servers"
              value={stats.total}
              variant="default"
              icon={<Server className="h-6 w-6" />}
              active={filter === 'all'}
              onClick={() => handleFilterClick('all')}
            />
            <SummaryCard
              title="Fully Backed Up"
              value={stats.fullyBacked}
              variant="success"
              icon={<CheckCircle2 className="h-6 w-6" />}
              active={filter === 'backed'}
              onClick={() => handleFilterClick('backed')}
            />
            <SummaryCard
              title="Has Issues"
              value={stats.hasIssues}
              variant={stats.hasIssues > 0 ? 'danger' : 'default'}
              icon={<XCircle className="h-6 w-6" />}
              active={false}
            />
          </div>
          
          {/* Pre-Update / Post-Update Stats */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <SummaryCard
              title="Pre-Update Success"
              value={stats.preUpdate.success}
              variant="success"
              icon={<CheckCircle2 className="h-5 w-5" />}
              active={filter === 'preSuccess'}
              onClick={() => handleFilterClick('preSuccess')}
              compact
            />
            <SummaryCard
              title="Pre-Update Issues"
              value={stats.preUpdate.failed + stats.preUpdate.incomplete}
              variant={stats.preUpdate.failed + stats.preUpdate.incomplete > 0 ? 'danger' : 'default'}
              icon={<XCircle className="h-5 w-5" />}
              active={filter === 'preFailed'}
              onClick={() => handleFilterClick('preFailed')}
              compact
            />
            <SummaryCard
              title="Post-Update Success"
              value={stats.postUpdate.success}
              variant="success"
              icon={<CheckCircle2 className="h-5 w-5" />}
              active={filter === 'postSuccess'}
              onClick={() => handleFilterClick('postSuccess')}
              compact
            />
            <SummaryCard
              title="Post-Update Issues"
              value={stats.postUpdate.failed + stats.postUpdate.incomplete}
              variant={stats.postUpdate.failed + stats.postUpdate.incomplete > 0 ? 'warning' : 'default'}
              icon={<AlertTriangle className="h-5 w-5" />}
              active={filter === 'postFailed'}
              onClick={() => handleFilterClick('postFailed')}
              compact
            />
          </div>
        </section>

        {/* Warning Banner */}
        <WarningBanner count={stats.hasIssues} />

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
