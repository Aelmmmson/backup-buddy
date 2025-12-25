import { useState } from 'react';
import { mockDatabases, getBackupStats, Database } from '@/data/mockBackupData';
import { SummaryCard } from '@/components/SummaryCard';
import { WarningBanner } from '@/components/WarningBanner';
import { DatabaseCard } from '@/components/DatabaseCard';
import { DatabaseDetailModal } from '@/components/DatabaseDetailModal';
import { Database as DatabaseIcon, CheckCircle2, XCircle, Shield } from 'lucide-react';

const Index = () => {
  const [selectedDatabase, setSelectedDatabase] = useState<Database | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const stats = getBackupStats(mockDatabases);

  const handleDatabaseClick = (database: Database) => {
    setSelectedDatabase(database);
    setModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Backup Monitor</h1>
              <p className="text-sm text-muted-foreground">
                Database backup status dashboard
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Summary Section */}
        <section className="mb-8">
          <div className="grid gap-4 sm:grid-cols-3">
            <SummaryCard
              title="Total Databases"
              value={stats.total}
              variant="default"
              icon={<DatabaseIcon className="h-6 w-6" />}
            />
            <SummaryCard
              title="Backed Up Today"
              value={stats.backedUp}
              variant="success"
              icon={<CheckCircle2 className="h-6 w-6" />}
            />
            <SummaryCard
              title="Not Backed Up"
              value={stats.notBackedUp}
              variant={stats.notBackedUp > 0 ? 'danger' : 'default'}
              icon={<XCircle className="h-6 w-6" />}
            />
          </div>
        </section>

        {/* Warning Banner */}
        <WarningBanner count={stats.notBackedUp} />

        {/* Database List */}
        <section>
          <h2 className="mb-4 text-lg font-semibold text-foreground">
            All Databases
          </h2>
          <div className="space-y-3">
            {mockDatabases.map((database, index) => (
              <DatabaseCard
                key={database.id}
                database={database}
                onClick={() => handleDatabaseClick(database)}
                index={index}
              />
            ))}
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
