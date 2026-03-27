import { Database } from '@/data/apiTypes';
import { getServerOverallStatus } from '@/data/apiService';
import { format } from 'date-fns';

function formatTimestamp(ts: string | null): string {
  if (!ts) return 'N/A';
  try { return format(new Date(ts), 'dd MMM yyyy HH:mm'); } catch { return ts; }
}

function statusLabel(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// ─── CSV Export ────────────────────────────────────────────────────────────────

export function exportComplianceCSV(databases: Database[]): void {
  const headers = [
    'Server',
    'Database',
    'Environment',
    'UI Status',
    'Overall Status',
    'Pre-Backup Status',
    'Pre-Backup Size (MB)',
    'Pre-Backup Dump Exists',
    'Post-Backup Status',
    'Post-Backup Size (MB)',
    'Post-Backup Dump Exists',
    'Last Activity',
    'Backup Age (hrs)',
    'Pre Errors',
    'Post Errors',
  ];

  const rows = databases.map(db => {
    const overall = getServerOverallStatus(db);
    const preErrors = (db.preUpdate?.errors ?? []).join(' | ');
    const postErrors = (db.postUpdate?.errors ?? []).join(' | ');
    return [
      db.host,
      db.name,
      db.environment,
      db.uiStatus,
      statusLabel(overall),
      db.preUpdate ? statusLabel(db.preUpdate.status) : 'N/A',
      db.preUpdate?.dumpSizeKb?.toString() ?? 'N/A',
      db.preUpdate ? (db.preUpdate.dumpExists ? 'Yes' : 'No') : 'N/A',
      db.postUpdate ? statusLabel(db.postUpdate.status) : 'N/A',
      db.postUpdate?.dumpSizeKb?.toString() ?? 'N/A',
      db.postUpdate ? (db.postUpdate.dumpExists ? 'Yes' : 'No') : 'N/A',
      db.preUpdate?.lastBackupTimestamp ? formatTimestamp(db.preUpdate.lastBackupTimestamp) : 'N/A',
      db.backupAgeHours !== null ? db.backupAgeHours.toFixed(1) : 'N/A',
      preErrors || 'None',
      postErrors || 'None',
    ].map(v => `"${String(v).replace(/"/g, '""')}"`);
  });

  const csv = [headers.map(h => `"${h}"`).join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `backup-compliance-report-${format(new Date(), 'yyyy-MM-dd')}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── HTML / Print Export ───────────────────────────────────────────────────────

export function exportCompliancePrint(databases: Database[]): void {
  const reportDate = format(new Date(), 'dd MMMM yyyy HH:mm');

  const rowsHtml = databases.map(db => {
    const overall = getServerOverallStatus(db);
    const overallColor = overall === 'success' ? '#16a34a' : overall === 'failed' ? '#dc2626' : overall === 'warning' ? '#d97706' : '#64748b';
    const postErrors = [...new Set(db.postUpdate?.errors ?? [])];
    const preErrors = [...new Set(db.preUpdate?.errors ?? [])];
    const errorHtml = [...preErrors.map(e => `<span style="color:#d97706">⚠ [PRE] ${e}</span>`), ...postErrors.map(e => `<span style="color:#d97706">⚠ [POST] ${e}</span>`)].join('<br/>');
    return `
      <tr>
        <td>${db.host}</td>
        <td><strong>${db.name}</strong></td>
        <td>${db.environment}</td>
        <td><strong style="color:${overallColor}">${db.uiStatus}</strong></td>
        <td>${db.preUpdate ? statusLabel(db.preUpdate.status) : '—'}</td>
        <td>${db.postUpdate ? statusLabel(db.postUpdate.status) : '—'}</td>
        <td>${formatTimestamp(db.preUpdate?.lastBackupTimestamp ?? null)}</td>
        <td style="font-size:11px;color:#555">${errorHtml || '—'}</td>
      </tr>`;
  }).join('');

  const success = databases.filter(d => getServerOverallStatus(d) === 'success').length;
  const failed = databases.filter(d => getServerOverallStatus(d) === 'failed').length;
  const warning = databases.filter(d => getServerOverallStatus(d) === 'warning').length;

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <title>Backup Compliance Report – ${reportDate}</title>
  <style>
    body { font-family: 'Segoe UI', Arial, sans-serif; font-size: 13px; color:#1e293b; margin:32px; }
    h1 { font-size:22px; margin-bottom:4px; color:#0f172a; }
    .meta { color:#64748b; margin-bottom:24px; font-size:12px; }
    .summary { display:flex; gap:16px; margin-bottom:24px; }
    .card { border-radius:8px; padding:12px 20px; font-size:14px; font-weight:600; }
    .c-total { background:#f1f5f9; color:#0f172a; }
    .c-ok { background:#dcfce7; color:#16a34a; }
    .c-fail { background:#fee2e2; color:#dc2626; }
    .c-warn { background:#fef3c7; color:#d97706; }
    table { width:100%; border-collapse:collapse; }
    th { background:#0f172a; color:#fff; padding:8px 12px; text-align:left; font-size:12px; }
    td { padding:8px 12px; border-bottom:1px solid #e2e8f0; vertical-align:top; font-size:12px; }
    tr:nth-child(even) td { background:#f8fafc; }
    @media print { body { margin:16px; } }
  </style>
</head>
<body>
  <h1>Backup Compliance Report</h1>
  <p class="meta">Generated: ${reportDate} &nbsp;|&nbsp; Total Servers: ${databases.length}</p>
  <div class="summary">
    <div class="card c-total">Total: ${databases.length}</div>
    <div class="card c-ok">✔ Successful: ${success}</div>
    <div class="card c-fail">✖ Failed: ${failed}</div>
    <div class="card c-warn">⚠ Warning: ${warning}</div>
  </div>
  <table>
    <thead><tr>
      <th>Host</th><th>Database</th><th>Environment</th><th>Status</th>
      <th>Pre-Backup</th><th>Post-Backup</th><th>Last Activity</th><th>Errors / Warnings</th>
    </tr></thead>
    <tbody>${rowsHtml}</tbody>
  </table>
</body>
</html>`;

  const win = window.open('', '_blank');
  if (win) {
    win.document.write(html);
    win.document.close();
    win.focus();
    setTimeout(() => win.print(), 400);
  }
}
