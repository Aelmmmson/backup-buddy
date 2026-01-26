import { DashboardResponse, Database, BackupPhase } from './apiTypes';

const API_BASE_URL = 'http://10.203.14.169:4000/v1/api/backup_monitor';

export type { Database };

export async function fetchDashboardData(): Promise<DashboardResponse> {
  const response = await fetch(`${API_BASE_URL}/get-dashboard-details-optimized`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch dashboard data: ${response.statusText}`);
  }
  
  return response.json();
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

export function mapApiResponseToDatabases(apiResponse: DashboardResponse): Database[] {
  return apiResponse.latest_backup_list.map((item, index) => {
    const preStatus = item.pre_status === 'SUCCESS' ? 'success' : 'failed';
    const postStatus = item.post_status === 'SUCCESS' ? 'success' : item.post_status === 'FAILED' ? 'failed' : 'pending';
    
    // Infer environment from host name
    const environment = getEnvironmentFromHost(item.host);
    
    const prePhase: BackupPhase = {
      status: preStatus as 'success' | 'failed',
      recordsBacked: item.pre_dump_exists ? item.pre_dump_size_mb : 0,
      totalRecords: item.pre_dump_size_mb || 1,
      lastBackupTimestamp: item.last_activity,
    };
    
    const postPhase: BackupPhase = {
      status: postStatus as 'success' | 'failed' | 'pending',
      recordsBacked: item.post_dump_exists ? item.post_dump_size_mb : 0,
      totalRecords: item.pre_dump_size_mb || 1,
      lastBackupTimestamp: item.last_activity,
    };

    return {
      id: `${item.host}-${item.database_name}`,
      name: item.database_name,
      host: item.host,
      environment,
      preUpdate: prePhase,
      postUpdate: postPhase,
      backupAgeHours: calculateAgeInHours(item.last_activity),
      backupHistory: [
        {
          timestamp: item.last_activity,
          status: postStatus as 'success' | 'failed',
          errorMessage: item.post_errors?.[0],
        },
      ],
      uiStatus: item.ui_status,
    };
  });
}

export function getBackupStats(databases: Database[]) {
  const total = databases.length;
  
  // Pre-Update stats
  const preUpdateSuccess = databases.filter(db => db.preUpdate.status === 'success' && db.preUpdate.recordsBacked === db.preUpdate.totalRecords).length;
  const preUpdateIncomplete = databases.filter(db => db.preUpdate.status === 'success' && db.preUpdate.recordsBacked < db.preUpdate.totalRecords).length;
  const preUpdateFailed = databases.filter(db => db.preUpdate.status === 'failed').length;
  
  // Post-Update stats
  const postUpdateSuccess = databases.filter(db => db.postUpdate.status === 'success' && db.postUpdate.recordsBacked === db.postUpdate.totalRecords).length;
  const postUpdateIncomplete = databases.filter(db => db.postUpdate.status === 'success' && db.postUpdate.recordsBacked < db.postUpdate.totalRecords).length;
  const postUpdateFailed = databases.filter(db => db.postUpdate.status === 'failed' || db.postUpdate.status === 'pending').length;
  
  // Overall stats
  const fullyBacked = databases.filter(db => 
    db.preUpdate.status === 'success' && 
    db.postUpdate.status === 'success' && 
    db.preUpdate.recordsBacked === db.preUpdate.totalRecords &&
    db.postUpdate.recordsBacked === db.postUpdate.totalRecords
  ).length;
  
  const hasIssues = total - fullyBacked;
  
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

export function getServerOverallStatus(db: Database): 'success' | 'warning' | 'failed' {
  const preComplete = db.preUpdate.status === 'success' && db.preUpdate.recordsBacked === db.preUpdate.totalRecords;
  const postComplete = db.postUpdate.status === 'success' && db.postUpdate.recordsBacked === db.postUpdate.totalRecords;
  
  if (preComplete && postComplete) return 'success';
  if (db.preUpdate.status === 'failed' || db.postUpdate.status === 'failed') return 'failed';
  return 'warning';
}
