export interface BackupAttempt {
  timestamp: string;
  status: 'success' | 'failed';
  errorMessage?: string;
}

export interface Database {
  id: string;
  name: string;
  environment: 'Production' | 'DR' | 'UAT';
  lastBackupTimestamp: string | null;
  backupAgeHours: number | null;
  isBackedUpToday: boolean;
  backupHistory: BackupAttempt[];
}

const now = new Date();
const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

function hoursAgo(hours: number): string {
  return new Date(now.getTime() - hours * 60 * 60 * 1000).toISOString();
}

function daysAgo(days: number): string {
  return new Date(now.getTime() - days * 24 * 60 * 60 * 1000).toISOString();
}

export const mockDatabases: Database[] = [
  {
    id: '1',
    name: 'Core Banking System',
    environment: 'Production',
    lastBackupTimestamp: hoursAgo(2),
    backupAgeHours: 2,
    isBackedUpToday: true,
    backupHistory: [
      { timestamp: hoursAgo(2), status: 'success' },
      { timestamp: hoursAgo(26), status: 'success' },
      { timestamp: hoursAgo(50), status: 'success' },
    ],
  },
  {
    id: '2',
    name: 'Customer Accounts DB',
    environment: 'Production',
    lastBackupTimestamp: hoursAgo(4),
    backupAgeHours: 4,
    isBackedUpToday: true,
    backupHistory: [
      { timestamp: hoursAgo(4), status: 'success' },
      { timestamp: hoursAgo(28), status: 'success' },
      { timestamp: hoursAgo(52), status: 'success' },
    ],
  },
  {
    id: '3',
    name: 'Transaction Ledger',
    environment: 'Production',
    lastBackupTimestamp: hoursAgo(1),
    backupAgeHours: 1,
    isBackedUpToday: true,
    backupHistory: [
      { timestamp: hoursAgo(1), status: 'success' },
      { timestamp: hoursAgo(25), status: 'success' },
      { timestamp: hoursAgo(49), status: 'success' },
    ],
  },
  {
    id: '4',
    name: 'Loan Management System',
    environment: 'Production',
    lastBackupTimestamp: daysAgo(2),
    backupAgeHours: 48,
    isBackedUpToday: false,
    backupHistory: [
      { timestamp: hoursAgo(3), status: 'failed', errorMessage: 'Connection timeout to backup server' },
      { timestamp: daysAgo(2), status: 'success' },
      { timestamp: daysAgo(3), status: 'success' },
    ],
  },
  {
    id: '5',
    name: 'Core Banking System',
    environment: 'DR',
    lastBackupTimestamp: hoursAgo(6),
    backupAgeHours: 6,
    isBackedUpToday: true,
    backupHistory: [
      { timestamp: hoursAgo(6), status: 'success' },
      { timestamp: hoursAgo(30), status: 'success' },
      { timestamp: hoursAgo(54), status: 'success' },
    ],
  },
  {
    id: '6',
    name: 'Customer Accounts DB',
    environment: 'DR',
    lastBackupTimestamp: daysAgo(1),
    backupAgeHours: 28,
    isBackedUpToday: false,
    backupHistory: [
      { timestamp: hoursAgo(5), status: 'failed', errorMessage: 'Disk space insufficient on backup target' },
      { timestamp: daysAgo(1), status: 'success' },
      { timestamp: daysAgo(2), status: 'success' },
    ],
  },
  {
    id: '7',
    name: 'Transaction Ledger',
    environment: 'DR',
    lastBackupTimestamp: hoursAgo(8),
    backupAgeHours: 8,
    isBackedUpToday: true,
    backupHistory: [
      { timestamp: hoursAgo(8), status: 'success' },
      { timestamp: hoursAgo(32), status: 'success' },
      { timestamp: hoursAgo(56), status: 'success' },
    ],
  },
  {
    id: '8',
    name: 'Core Banking System',
    environment: 'UAT',
    lastBackupTimestamp: hoursAgo(12),
    backupAgeHours: 12,
    isBackedUpToday: true,
    backupHistory: [
      { timestamp: hoursAgo(12), status: 'success' },
      { timestamp: hoursAgo(36), status: 'success' },
      { timestamp: hoursAgo(60), status: 'success' },
    ],
  },
  {
    id: '9',
    name: 'Test Accounts DB',
    environment: 'UAT',
    lastBackupTimestamp: daysAgo(3),
    backupAgeHours: 72,
    isBackedUpToday: false,
    backupHistory: [
      { timestamp: hoursAgo(2), status: 'failed', errorMessage: 'Database locked by another process' },
      { timestamp: hoursAgo(26), status: 'failed', errorMessage: 'Network unreachable' },
      { timestamp: daysAgo(3), status: 'success' },
    ],
  },
  {
    id: '10',
    name: 'Reporting Warehouse',
    environment: 'Production',
    lastBackupTimestamp: hoursAgo(3),
    backupAgeHours: 3,
    isBackedUpToday: true,
    backupHistory: [
      { timestamp: hoursAgo(3), status: 'success' },
      { timestamp: hoursAgo(27), status: 'success' },
      { timestamp: hoursAgo(51), status: 'success' },
    ],
  },
];

export function getBackupStats(databases: Database[]) {
  const total = databases.length;
  const backedUp = databases.filter(db => db.isBackedUpToday).length;
  const notBackedUp = total - backedUp;
  
  return { total, backedUp, notBackedUp };
}
