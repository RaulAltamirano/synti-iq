const { mergeCoverageObjects, regenerateLcov } = require('../lib/merge-coverage-utils');

describe('mergeCoverageObjects', () => {
  it('merges two empty objects', () => {
    expect(mergeCoverageObjects({}, {})).toEqual({});
  });

  it('merges src and scripts coverage', () => {
    const src = { '/abs/path/foo.ts': { s: {}, f: {}, b: {} } };
    const scripts = { '/abs/path/scripts/bar.js': { s: {}, f: {}, b: {} } };
    const merged = mergeCoverageObjects(src, scripts);
    expect(Object.keys(merged)).toHaveLength(2);
    expect(merged['/abs/path/foo.ts']).toBeDefined();
    expect(merged['/abs/path/scripts/bar.js']).toBeDefined();
  });

  it('scripts overwrites when same path exists in both', () => {
    const src = { '/path/file.js': { s: { 0: 1 }, path: 'src' } };
    const scripts = { '/path/file.js': { s: { 0: 2 }, path: 'scripts' } };
    const merged = mergeCoverageObjects(src, scripts);
    expect(merged['/path/file.js'].path).toBe('scripts');
  });
});

describe('regenerateLcov', () => {
  it('returns null for valid merged coverage', () => {
    const merged = {
      '/tmp/foo.js': {
        path: '/tmp/foo.js',
        statementMap: {},
        fnMap: {},
        branchMap: {},
        s: {},
        f: {},
        b: {},
      },
    };
    const err = regenerateLcov(merged, process.cwd());
    expect(err).toBeNull();
  });

  it('handles empty coverage without throwing', () => {
    const err = regenerateLcov({}, process.cwd());
    expect(err === null || typeof err === 'string').toBe(true);
  });
});
