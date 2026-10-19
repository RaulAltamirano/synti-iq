'use strict';

const { spawnSync } = require('node:child_process');

const result = spawnSync('yarn', ['audit', '--json'], {
  encoding: 'utf8',
  maxBuffer: 64 * 1024 * 1024,
});

if (result.error) {
  console.error(result.error);
  process.exit(1);
}

const lines = (result.stdout || '')
  .trim()
  .split('\n')
  .filter(line => line.length > 0);

let vulnerabilities = null;
for (const line of lines) {
  let row;
  try {
    row = JSON.parse(line);
  } catch {
    continue;
  }
  if (row.type === 'auditSummary' && row.data?.vulnerabilities) {
    vulnerabilities = row.data.vulnerabilities;
    break;
  }
}

if (!vulnerabilities) {
  console.error('audit-high-gate: missing auditSummary in yarn audit --json output');
  if (result.stderr) {
    process.stderr.write(result.stderr);
  }
  process.exit(result.status !== null && result.status !== 0 ? result.status : 1);
}

const high = vulnerabilities.high || 0;
const critical = vulnerabilities.critical || 0;

if (high > 0 || critical > 0) {
  console.error(
    'audit-high-gate: high or critical vulnerabilities reported:',
    JSON.stringify(vulnerabilities, null, 2),
  );
  spawnSync('yarn', ['audit', '--level', 'high'], { stdio: 'inherit' });
  process.exit(1);
}

console.log('audit-high-gate: ok (no high/critical). Counts:', JSON.stringify(vulnerabilities));
process.exit(0);
