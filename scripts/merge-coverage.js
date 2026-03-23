#!/usr/bin/env node
/**
 * Merges coverage-final.json from coverage/ (src) and coverage-scripts/ (scripts)
 * into a single coverage/coverage-final.json for SonarCloud and jest-coverage-report.
 *
 * Run after: jest --coverage (src) && jest --config scripts/jest.config.js --coverage (scripts)
 */
const fs = require('fs');
const path = require('path');
const { mergeCoverageObjects, regenerateLcov } = require('./lib/merge-coverage-utils');

const root = path.resolve(__dirname, '..');
const covSrc = path.join(root, 'coverage', 'coverage-final.json');
const covScripts = path.join(root, 'coverage-scripts', 'coverage-final.json');
const outPath = path.join(root, 'coverage', 'coverage-final.json');

function run() {
  const src = fs.existsSync(covSrc) ? JSON.parse(fs.readFileSync(covSrc, 'utf8')) : {};
  const scripts = fs.existsSync(covScripts) ? JSON.parse(fs.readFileSync(covScripts, 'utf8')) : {};
  const merged = mergeCoverageObjects(src, scripts);

  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(merged, null, 0), 'utf8');

  const lcovError = regenerateLcov(merged, root);
  if (lcovError) console.warn('Could not regenerate lcov.info:', lcovError);
}

if (require.main === module) {
  run();
} else {
  module.exports = { run };
}
