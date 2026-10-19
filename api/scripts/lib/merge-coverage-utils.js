/**
 * Utilities for merging Jest coverage reports (Istanbul format).
 * @module scripts/lib/merge-coverage-utils
 */

const path = require('path');

/**
 * Merges two coverage objects (coverage-final.json format) into one.
 * When both contain the same file path, scripts coverage wins (last wins).
 *
 * @param {Record<string, unknown>} src - Coverage from src/ tests
 * @param {Record<string, unknown>} scripts - Coverage from scripts/ tests
 * @returns {Record<string, unknown>} Merged coverage object
 */
function mergeCoverageObjects(src, scripts) {
  return { ...src, ...scripts };
}

/**
 * Regenerates lcov.info from merged coverage. Returns error message or null on success.
 *
 * @param {Record<string, unknown>} merged - Merged coverage object
 * @param {string} projectRoot - Project root path
 * @returns {string|null} Error message or null if successful
 */
function regenerateLcov(merged, projectRoot) {
  try {
    const libCoverage = require('istanbul-lib-coverage');
    const libReport = require('istanbul-lib-report');
    const reports = require('istanbul-reports');
    const map = libCoverage.createCoverageMap(merged);
    const coverageDir = path.join(projectRoot, 'coverage');
    const context = libReport.createContext({ coverageMap: map, dir: coverageDir });
    reports.create('lcov', { projectRoot }).execute(context);
    return null;
  } catch (e) {
    return e.message;
  }
}

module.exports = { mergeCoverageObjects, regenerateLcov };
