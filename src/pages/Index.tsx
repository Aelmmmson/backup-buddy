import { useState, useMemo } from 'react';
import { mockDatabases, getBackupStats, Database } from '@/data/mockBackupData';
import { SummaryCard } from '@/components/SummaryCard';
import { WarningBanner } from '@/components/WarningBanner';
import { ServerCard } from '@/components/ServerCard';
import { DatabaseDetailModal } from '@/components/DatabaseDetailModal';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Server, CheckCircle2, XCircle, AlertTriangle, Shield } from 'lucide-react';

type FilterType = 'all' | 'backed' | 'notBacked' | 'incomplete';

const Index = () => {
  const [selectedDatabase, setSelectedDatabase] = useState<Database | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [filter, setFilter] = useState<FilterType>('all');

  const stats = getBackupStats(mockDatabases);

  const filteredDatabases = useMemo(() => {
    switch (filter) {
      case 'backed':
        return mockDatabases.filter(db => db.isBackedUpToday && db.recordsBacked === db.totalRecords);
      case 'notBacked':
        return mockDatabases.filter(db => !db.isBackedUpToday);
      case 'incomplete':
        return mockDatabases.filter(db => db.isBackedUpToday && db.recordsBacked < db.totalRecords);
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
              title="Backed Up Today"
              value={stats.backedUp - stats.incomplete}
              variant="success"
              icon={<CheckCircle2 className="h-6 w-6" />}
              active={filter === 'backed'}
              onClick={() => handleFilterClick('backed')}
            />
            <SummaryCard
              title="Incomplete Backups"
              value={stats.incomplete}
              variant={stats.incomplete > 0 ? 'warning' : 'default'}
              icon={<AlertTriangle className="h-6 w-6" />}
              active={filter === 'incomplete'}
              onClick={() => handleFilterClick('incomplete')}
            />
            <SummaryCard
              title="Not Backed Up"
              value={stats.notBackedUp}
              variant={stats.notBackedUp > 0 ? 'danger' : 'default'}
              icon={<XCircle className="h-6 w-6" />}
              active={filter === 'notBacked'}
              onClick={() => handleFilterClick('notBacked')}
            />
          </div>
        </section>

        {/* Warning Banner */}
        <WarningBanner count={stats.notBackedUp} />

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
            {filter !== 'all' && (
              <button
                onClick={() => setFilter('all')}
                className="text-sm text-primary hover:underline"
              >
                Show all
              </button>
            )}
          </div>
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
