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
  recordsBacked: number;
  totalRecords: number;
  backupHistory: BackupAttempt[];
}

const now = new Date();
const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

function hoursAgo(hours: number): string {
  return new Date(now.getTime() - hours * 60 * 60 * 1000).toISOString();
}

export const mockDatabases: Database[] = [
  {
    id: '1',
    name: 'Core Banking System',
    environment: 'Production',
    lastBackupTimestamp: hoursAgo(2),
    backupAgeHours: 2,
    isBackedUpToday: true,
    recordsBacked: 1250000,
    totalRecords: 1250000,
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
    recordsBacked: 892450,
    totalRecords: 892450,
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
    recordsBacked: 5680000,
    totalRecords: 5680000,
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
    lastBackupTimestamp: hoursAgo(3),
    backupAgeHours: 3,
    isBackedUpToday: true,
    recordsBacked: 345000,
    totalRecords: 345000,
    backupHistory: [
      { timestamp: hoursAgo(3), status: 'success' },
      { timestamp: hoursAgo(27), status: 'success' },
      { timestamp: hoursAgo(51), status: 'success' },
    ],
  },
  {
    id: '5',
    name: 'Core Banking System',
    environment: 'DR',
    lastBackupTimestamp: hoursAgo(6),
    backupAgeHours: 6,
    isBackedUpToday: true,
    recordsBacked: 1250000,
    totalRecords: 1250000,
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
    lastBackupTimestamp: hoursAgo(5),
    backupAgeHours: 5,
    isBackedUpToday: true,
    recordsBacked: 892450,
    totalRecords: 892450,
    backupHistory: [
      { timestamp: hoursAgo(5), status: 'success' },
      { timestamp: hoursAgo(29), status: 'success' },
      { timestamp: hoursAgo(53), status: 'success' },
    ],
  },
  {
    id: '7',
    name: 'Transaction Ledger',
    environment: 'DR',
    lastBackupTimestamp: hoursAgo(8),
    backupAgeHours: 8,
    isBackedUpToday: true,
    recordsBacked: 5680000,
    totalRecords: 5680000,
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
    recordsBacked: 156000,
    totalRecords: 156000,
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
    lastBackupTimestamp: hoursAgo(10),
    backupAgeHours: 10,
    isBackedUpToday: true,
    recordsBacked: 78500,
    totalRecords: 78500,
    backupHistory: [
      { timestamp: hoursAgo(10), status: 'success' },
      { timestamp: hoursAgo(34), status: 'success' },
      { timestamp: hoursAgo(58), status: 'success' },
    ],
  },
  {
    id: '10',
    name: 'Reporting Warehouse',
    environment: 'Production',
    lastBackupTimestamp: hoursAgo(3),
    backupAgeHours: 3,
    isBackedUpToday: true,
    recordsBacked: 2340000,
    totalRecords: 2340000,
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

export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(0) + 'K';
  }
  return num.toString();
}
