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
  // Pre-update fields are OPTIONAL — single-backup servers may not include them at all.
  // If the key is present but value is null → backup required but not done yet.
  // If the key is missing entirely → phase not applicable for this server.
  pre_status?: string | null;
  pre_dump_exists?: boolean | null;
  pre_dump_size_mb?: number | null;
  pre_errors?: string[] | null;
  // Post-update fields are also optional for same reason
  post_status?: string | null;
  post_dump_exists?: boolean | null;
  post_dump_size_mb?: number | null;
  post_errors?: string[] | null;
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
  dumpSizeKb: number | null;
  dumpExists: boolean;
  lastBackupTimestamp: string | null;
  errors: string[] | null;
}

export interface Database {
  id: string;
  name: string;
  host: string;
  environment: 'Production' | 'DR' | 'UAT';
  preUpdate: BackupPhase | null;   // null = phase not applicable for this server
  postUpdate: BackupPhase | null;  // null = phase not applicable for this server
  backupAgeHours: number | null;
  backupHistory: BackupAttempt[];
  uiStatus: string;
}
