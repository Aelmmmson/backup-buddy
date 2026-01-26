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
  environment: 'Production' | 'DR' | 'UAT';
  preUpdate: BackupPhase;
  postUpdate: BackupPhase;
  backupAgeHours: number | null;
  backupHistory: BackupAttempt[];
}

const now = new Date();

function hoursAgo(hours: number): string {
  return new Date(now.getTime() - hours * 60 * 60 * 1000).toISOString();
}

export const mockDatabases: Database[] = [
  {
    id: '1',
    name: 'Core Banking System',
    environment: 'Production',
    preUpdate: {
      status: 'success',
      recordsBacked: 1250000,
      totalRecords: 1250000,
      lastBackupTimestamp: hoursAgo(2),
    },
    postUpdate: {
      status: 'success',
      recordsBacked: 1250000,
      totalRecords: 1250000,
      lastBackupTimestamp: hoursAgo(1),
    },
    backupAgeHours: 1,
    backupHistory: [
      { timestamp: hoursAgo(1), status: 'success' },
      { timestamp: hoursAgo(2), status: 'success' },
      { timestamp: hoursAgo(26), status: 'success' },
    ],
  },
  {
    id: '2',
    name: 'PostgreSQL',
    environment: 'Production',
    preUpdate: {
      status: 'success',
      recordsBacked: 892450,
      totalRecords: 892450,
      lastBackupTimestamp: hoursAgo(4),
    },
    postUpdate: {
      status: 'failed',
      recordsBacked: 750000,
      totalRecords: 892450,
      lastBackupTimestamp: hoursAgo(3),
    },
    backupAgeHours: 3,
    backupHistory: [
      { timestamp: hoursAgo(3), status: 'failed', errorMessage: 'Incomplete transfer - network interruption' },
      { timestamp: hoursAgo(4), status: 'success' },
      { timestamp: hoursAgo(28), status: 'success' },
    ],
  },
  {
    id: '3',
    name: 'Document',
    environment: 'Production',
    preUpdate: {
      status: 'failed',
      recordsBacked: 0,
      totalRecords: 5680000,
      lastBackupTimestamp: null,
    },
    postUpdate: {
      status: 'pending',
      recordsBacked: 0,
      totalRecords: 5680000,
      lastBackupTimestamp: null,
    },
    backupAgeHours: 28,
    backupHistory: [
      { timestamp: hoursAgo(28), status: 'failed', errorMessage: 'Connection timeout to primary storage' },
      { timestamp: hoursAgo(52), status: 'success' },
      { timestamp: hoursAgo(76), status: 'success' },
    ],
  },
  {
    id: '4',
    name: 'Imaging',
    environment: 'Production',
    preUpdate: {
      status: 'success',
      recordsBacked: 345000,
      totalRecords: 345000,
      lastBackupTimestamp: hoursAgo(3),
    },
    postUpdate: {
      status: 'success',
      recordsBacked: 345000,
      totalRecords: 345000,
      lastBackupTimestamp: hoursAgo(2),
    },
    backupAgeHours: 2,
    backupHistory: [
      { timestamp: hoursAgo(2), status: 'success' },
      { timestamp: hoursAgo(3), status: 'success' },
      { timestamp: hoursAgo(27), status: 'success' },
    ],
  },
  {
    id: '6',
    name: 'Core Banking System',
    environment: 'DR',
    preUpdate: {
      status: 'success',
      recordsBacked: 1250000,
      totalRecords: 1250000,
      lastBackupTimestamp: hoursAgo(6),
    },
    postUpdate: {
      status: 'success',
      recordsBacked: 980000,
      totalRecords: 1250000,
      lastBackupTimestamp: hoursAgo(5),
    },
    backupAgeHours: 5,
    backupHistory: [
      { timestamp: hoursAgo(5), status: 'success' },
      { timestamp: hoursAgo(6), status: 'success' },
      { timestamp: hoursAgo(30), status: 'success' },
    ],
  },
  {
    id: '5',
    name: 'HR',
    environment: 'DR',
    preUpdate: {
      status: 'failed',
      recordsBacked: 0,
      totalRecords: 892450,
      lastBackupTimestamp: null,
    },
    postUpdate: {
      status: 'pending',
      recordsBacked: 0,
      totalRecords: 892450,
      lastBackupTimestamp: null,
    },
    backupAgeHours: 30,
    backupHistory: [
      { timestamp: hoursAgo(30), status: 'failed', errorMessage: 'Insufficient disk space on backup volume' },
      { timestamp: hoursAgo(54), status: 'failed', errorMessage: 'Network partition detected' },
      { timestamp: hoursAgo(78), status: 'success' },
    ],
  },
  {
    id: '7',
    name: 'Transaction Ledger',
    environment: 'DR',
    preUpdate: {
      status: 'success',
      recordsBacked: 5680000,
      totalRecords: 5680000,
      lastBackupTimestamp: hoursAgo(8),
    },
    postUpdate: {
      status: 'success',
      recordsBacked: 5680000,
      totalRecords: 5680000,
      lastBackupTimestamp: hoursAgo(7),
    },
    backupAgeHours: 7,
    backupHistory: [
      { timestamp: hoursAgo(7), status: 'success' },
      { timestamp: hoursAgo(8), status: 'success' },
      { timestamp: hoursAgo(32), status: 'success' },
    ],
  },
  {
    id: '8',
    name: 'Core Banking System',
    environment: 'UAT',
    preUpdate: {
      status: 'success',
      recordsBacked: 156000,
      totalRecords: 156000,
      lastBackupTimestamp: hoursAgo(12),
    },
    postUpdate: {
      status: 'success',
      recordsBacked: 120000,
      totalRecords: 156000,
      lastBackupTimestamp: hoursAgo(11),
    },
    backupAgeHours: 11,
    backupHistory: [
      { timestamp: hoursAgo(11), status: 'success' },
      { timestamp: hoursAgo(12), status: 'success' },
      { timestamp: hoursAgo(36), status: 'success' },
    ],
  },
  {
    id: '9',
    name: 'Test Accounts DB',
    environment: 'UAT',
    preUpdate: {
      status: 'failed',
      recordsBacked: 0,
      totalRecords: 78500,
      lastBackupTimestamp: null,
    },
    postUpdate: {
      status: 'pending',
      recordsBacked: 0,
      totalRecords: 78500,
      lastBackupTimestamp: null,
    },
    backupAgeHours: 36,
    backupHistory: [
      { timestamp: hoursAgo(36), status: 'failed', errorMessage: 'Authentication credentials expired' },
      { timestamp: hoursAgo(60), status: 'success' },
      { timestamp: hoursAgo(84), status: 'success' },
    ],
  },
  {
    id: '10',
    name: 'Reporting Warehouse',
    environment: 'Production',
    preUpdate: {
      status: 'success',
      recordsBacked: 2340000,
      totalRecords: 2340000,
      lastBackupTimestamp: hoursAgo(3),
    },
    postUpdate: {
      status: 'success',
      recordsBacked: 1800000,
      totalRecords: 2340000,
      lastBackupTimestamp: hoursAgo(2),
    },
    backupAgeHours: 2,
    backupHistory: [
      { timestamp: hoursAgo(2), status: 'success' },
      { timestamp: hoursAgo(3), status: 'success' },
      { timestamp: hoursAgo(27), status: 'success' },
    ],
  },
];

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
