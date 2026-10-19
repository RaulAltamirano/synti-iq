'use strict';

const { existsSync } = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const instrumentationPath = path.join(__dirname, '..', 'dist', 'instrumentation.js');

if (existsSync(instrumentationPath)) {
  process.exit(0);
}

console.log('dist/instrumentation.js missing — running nest build...');

const result = spawnSync('yarn', ['build'], {
  cwd: path.join(__dirname, '..'),
  stdio: 'inherit',
  shell: process.platform === 'win32',
});

process.exit(result.status ?? 1);
