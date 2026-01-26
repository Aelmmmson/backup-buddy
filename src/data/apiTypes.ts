// API Response Types
export interface DashboardSummary {
  total_servers: string;
  pre_update_complete: string;
  post_update_complete: string;
  pending: string;
  failed: string;
}

export interface BackupItem {
  host: string;
  database_name: string;
  ui_status: string;
  last_activity: string;
  pre_status: string;
  pre_dump_exists: boolean;
  pre_dump_size_mb: number;
  pre_errors: string[];
  post_status: string | null;
  post_dump_exists: boolean | null;
  post_dump_size_mb: number | null;
  post_errors: string[] | null;
}

export interface FailedBackup {
  host: string;
  database_name: string;
  last_activity: string;
  post_errors: string[];
  pre_errors: string[];
}

export interface NotBackedUp {
  host: string;
  database_name: string;
  last_activity: string;
}

export interface DashboardResponse {
  success: boolean;
  dashboard_cards_summary: DashboardSummary;
  latest_backup_list: BackupItem[];
  failed_backups_list: FailedBackup[];
  not_backed_up_list: NotBackedUp[];
}

// Internal Database Type (mapped from API)
export interface BackupAttempt {
  timestamp: string;
  status: 'success' | 'failed';
  errorMessage?: string;
}

export interface BackupPhase {
  status: 'success' | 'failed' | 'pending';
  recordsBacked: number;
  totalRecords: number;
  lastBackupTimestamp: string | null;
}

export interface Database {
  id: string;
  name: string;
  host: string;
  environment: 'Production' | 'DR' | 'UAT';
  preUpdate: BackupPhase;
  postUpdate: BackupPhase;
  backupAgeHours: number | null;
  backupHistory: BackupAttempt[];
  uiStatus: string;
}
