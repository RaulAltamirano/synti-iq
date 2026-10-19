const {
  parseFrontmatter,
  parseIssueContent,
  inferLabelFromTitle,
  resolveLabel,
} = require('../lib/issue-parser');

describe('parseFrontmatter', () => {
  it('returns null when content does not start with ---', () => {
    expect(parseFrontmatter('title: foo\n---\nbody')).toBeNull();
    expect(parseFrontmatter('no frontmatter')).toBeNull();
  });

  it('returns null when no closing ---', () => {
    expect(parseFrontmatter('---\ntitle: foo\nbody')).toBeNull();
  });

  it('parses title and body', () => {
    const result = parseFrontmatter('---\ntitle: feat(store): add stats\n---\n## Body here');
    expect(result).not.toBeNull();
    expect(result.title).toBe('feat(store): add stats');
    expect(result.body).toBe('## Body here');
    expect(result.labels).toEqual([]);
    expect(result.assignee).toBe('');
  });

  it('parses labels as array', () => {
    const result = parseFrontmatter('---\ntitle: x\nlabels: [enhancement, docs]\n---\nbody');
    expect(result.labels).toEqual(['enhancement', 'docs']);
  });

  it('parses assignee and strips @', () => {
    const result = parseFrontmatter('---\ntitle: x\nassignee: "@user"\n---\nbody');
    expect(result.assignee).toBe('user');
  });

  it('returns null when title is empty', () => {
    const result = parseFrontmatter('---\nlabels: [x]\n---\nbody');
    expect(result).toBeNull();
  });
});

describe('parseIssueContent', () => {
  it('uses frontmatter when present', () => {
    const content = '---\ntitle: my title\n---\nbody';
    const result = parseIssueContent(content);
    expect(result.title).toBe('my title');
    expect(result.body).toBe('body');
  });

  it('parses inline TITLE:', () => {
    const content = 'TITLE: [TASK] Audit auth\n---\nBody text';
    const result = parseIssueContent(content);
    expect(result.title).toBe('[TASK] Audit auth');
    expect(result.body).toBe('Body text');
  });

  it('parses inline LABELS:', () => {
    const content = 'TITLE: x\nLABELS: enhancement, docs\n---\nbody';
    const result = parseIssueContent(content);
    expect(result.labels).toEqual(['enhancement', 'docs']);
  });

  it('parses ASSIGNEE with @', () => {
    const content = 'TITLE: x\nASSIGNEE: @alice\n---\nbody';
    const result = parseIssueContent(content);
    expect(result.assignee).toBe('alice');
  });

  it('strips code fences', () => {
    const content = '```\n---\ntitle: inside\n---\nbody\n```';
    const result = parseIssueContent(content);
    expect(result.title).toBe('inside');
  });
});

describe('inferLabelFromTitle', () => {
  it('returns enhancement for feat:', () => {
    expect(inferLabelFromTitle('feat(store): add stats')).toBe('enhancement');
  });

  it('returns bug for fix:', () => {
    expect(inferLabelFromTitle('fix: crash on null')).toBe('bug');
  });

  it('returns documentation for docs:', () => {
    expect(inferLabelFromTitle('docs: update README')).toBe('documentation');
  });

  it('returns null for non-conventional title', () => {
    expect(inferLabelFromTitle('Just a plain title')).toBeNull();
  });
});

describe('resolveLabel', () => {
  it('maps docs to documentation', () => {
    expect(resolveLabel('docs')).toBe('documentation');
  });

  it('returns unchanged for unknown label', () => {
    expect(resolveLabel('enhancement')).toBe('enhancement');
  });
});
