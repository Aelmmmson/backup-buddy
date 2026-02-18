import api from '@/lib/api';
import { DashboardResponse, Database, BackupPhase } from './apiTypes';

export type { Database };

export async function fetchDashboardData(): Promise<DashboardResponse> {
  const response = await api.get<DashboardResponse>('/get-dashboard-details-optimized');
  return response.data;
}

function getEnvironmentFromHost(host: string): 'Production' | 'DR' | 'UAT' {
  const lowerHost = host.toLowerCase();
  if (lowerHost.includes('dr')) return 'DR';
  if (lowerHost.includes('uat')) return 'UAT';
  return 'Production'; // Default to Production
}

function calculateAgeInHours(timestamp: string | null): number | null {
  if (!timestamp) return null;
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  return diffMs / (1000 * 60 * 60);
}

/**
 * Map a phase's API status string to internal status.
 * null  → 'pending' (backup required but not done yet)
 * 'SUCCESS' → 'success'
 * 'FAILED'  → 'failed'
 * anything else → 'pending'
 */
function mapPhaseStatus(apiStatus: string | null | undefined): 'success' | 'failed' | 'pending' {
  if (apiStatus === 'SUCCESS') return 'success';
  if (apiStatus === 'FAILED') return 'failed';
  return 'pending';
}

/**
 * Normalize errors field — API sometimes returns a string "[]" instead of an actual array.
 */
function normalizeErrors(errors: string[] | string | null | undefined): string[] | null {
  if (!errors) return null;
  if (typeof errors === 'string') {
    try {
      const parsed = JSON.parse(errors);
      return Array.isArray(parsed) ? parsed : null;
    } catch {
      return [errors];
    }
  }
  return errors.length > 0 ? errors : null;
}

export function mapApiResponseToDatabases(apiResponse: DashboardResponse): Database[] {
  return apiResponse.latest_backup_list.map((item, index) => {
    const environment = getEnvironmentFromHost(item.host);

    // Determine if each phase exists:
    // - Key present in data (even if null) → phase is applicable → create BackupPhase
    // - Key missing entirely → phase not applicable → set to null
    const hasPrePhase = 'pre_status' in item;
    const hasPostPhase = 'post_status' in item;

    let prePhase: BackupPhase | null = null;
    if (hasPrePhase) {
      prePhase = {
        status: mapPhaseStatus(item.pre_status),
        dumpExists: item.pre_dump_exists === true,
        dumpSizeKb: item.pre_dump_size_mb ?? null,
        lastBackupTimestamp: item.last_activity,
        errors: normalizeErrors(item.pre_errors),
      };
    }

    let postPhase: BackupPhase | null = null;
    if (hasPostPhase) {
      postPhase = {
        status: mapPhaseStatus(item.post_status),
        dumpExists: item.post_dump_exists === true,
        dumpSizeKb: item.post_dump_size_mb ?? null,
        lastBackupTimestamp: item.last_activity,
        errors: normalizeErrors(item.post_errors),
      };
    }

    // Build backup history from available data
    const history = [];
    if (hasPostPhase && item.post_status) {
      history.push({
        timestamp: item.last_activity,
        status: (item.post_status === 'SUCCESS' ? 'success' : 'failed') as 'success' | 'failed',
        errorMessage: normalizeErrors(item.post_errors)?.[0],
      });
    }
    if (hasPrePhase && item.pre_status) {
      history.push({
        timestamp: item.last_activity,
        status: (item.pre_status === 'SUCCESS' ? 'success' : 'failed') as 'success' | 'failed',
        errorMessage: normalizeErrors(item.pre_errors)?.[0],
      });
    }

    return {
      id: `${item.host}-${item.database_name}`,
      name: item.database_name,
      host: item.host,
      environment,
      preUpdate: prePhase,
      postUpdate: postPhase,
      backupAgeHours: calculateAgeInHours(item.last_activity),
      backupHistory: history,
      uiStatus: item.ui_status,
    };
  });
}

export function getBackupStats(databases: Database[]) {
  const total = databases.length;

  // Pre-Update stats — only count databases that have a pre phase
  const dbsWithPre = databases.filter(db => db.preUpdate !== null);
  const preUpdateSuccess = dbsWithPre.filter(db => db.preUpdate!.status === 'success').length;
  const preUpdateIncomplete = dbsWithPre.filter(db => db.preUpdate!.status === 'pending').length;
  const preUpdateFailed = dbsWithPre.filter(db => db.preUpdate!.status === 'failed').length;

  // Post-Update stats — only count databases that have a post phase
  const dbsWithPost = databases.filter(db => db.postUpdate !== null);
  const postUpdateSuccess = dbsWithPost.filter(db => db.postUpdate!.status === 'success').length;
  const postUpdateIncomplete = dbsWithPost.filter(db => db.postUpdate!.status === 'pending').length;
  const postUpdateFailed = dbsWithPost.filter(db => db.postUpdate!.status === 'failed').length;

  // Overall stats — use getServerOverallStatus for accuracy
  // Count only servers that have actual issues (failed or warning), excluding pending/success
  const hasIssues = databases.filter(db => {
    const status = getServerOverallStatus(db);
    return status === 'failed' || status === 'warning';
  }).length;

  const fullyBacked = databases.filter(db => getServerOverallStatus(db) === 'success').length;

  return {
    total,
    fullyBacked,
    hasIssues,
    preUpdate: { success: preUpdateSuccess, incomplete: preUpdateIncomplete, failed: preUpdateFailed },
    postUpdate: { success: postUpdateSuccess, incomplete: postUpdateIncomplete, failed: postUpdateFailed }
  };
}

export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(0) + 'K';
  }
  return num.toString();
}

/**
 * Derive overall server status from the API's ui_status field.
 * This is more reliable than computing it from phase data, since the
 * backend knows which phases are required for each server.
 */
export function getServerOverallStatus(db: Database): 'success' | 'warning' | 'failed' | 'pending' {
  const uiStatus = (db.uiStatus || '').toLowerCase();
  if (uiStatus === 'fully backed up') return 'success';
  if (uiStatus.includes('fail')) return 'failed';
  if (uiStatus === 'pending') return 'pending';
  // 'Backup Incomplete' or anything else
  return 'warning';
}
