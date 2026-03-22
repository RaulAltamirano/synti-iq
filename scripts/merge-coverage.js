#!/usr/bin/env node
/**
 * Merges coverage-final.json from coverage/ (src) and coverage-scripts/ (scripts)
 * into a single coverage/coverage-final.json for SonarCloud and jest-coverage-report.
 *
 * Run after: jest --coverage (src) && jest --config scripts/jest.config.js --coverage (scripts)
 */
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const covSrc = path.join(root, 'coverage', 'coverage-final.json');
const covScripts = path.join(root, 'coverage-scripts', 'coverage-final.json');
const outPath = path.join(root, 'coverage', 'coverage-final.json');

const src = fs.existsSync(covSrc) ? JSON.parse(fs.readFileSync(covSrc, 'utf8')) : {};
const scripts = fs.existsSync(covScripts) ? JSON.parse(fs.readFileSync(covScripts, 'utf8')) : {};
const merged = { ...src, ...scripts };

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, JSON.stringify(merged, null, 0), 'utf8');

try {
  const libCoverage = require('istanbul-lib-coverage');
  const libReport = require('istanbul-lib-report');
  const reports = require('istanbul-reports');
  const map = libCoverage.createCoverageMap(merged);
  const coverageDir = path.join(root, 'coverage');
  const context = libReport.createContext({ coverageMap: map, dir: coverageDir });
  reports.create('lcov', { projectRoot: root }).execute(context);
} catch (e) {
  console.warn('Could not regenerate lcov.info:', e.message);
}
