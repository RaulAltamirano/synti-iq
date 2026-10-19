/**
 * Parses issue draft content (YAML frontmatter or inline TITLE/LABELS).
 * @module scripts/lib/issue-parser
 */

const LABEL_ALIASES = { docs: 'documentation' };

/** Maps conventional commit type (from title) to GitHub label. */
const TYPE_TO_LABEL = {
  feat: 'enhancement',
  fix: 'bug',
  docs: 'documentation',
  chore: 'chore',
  refactor: 'refactor',
  test: 'enhancement',
  style: 'chore',
  perf: 'enhancement',
};

/**
 * Parse YAML frontmatter (minimal: title, labels, assignee).
 *
 * @param {string} content - Raw draft content
 * @returns {{ title: string; labels: string[]; assignee: string; body: string } | null}
 */
function parseFrontmatter(content) {
  const trimmed = content.trim();
  if (!trimmed.startsWith('---')) return null;
  const endIdx = trimmed.indexOf('\n---', 3);
  if (endIdx === -1) return null;
  const fm = trimmed.slice(3, endIdx).trim();
  const body = trimmed.slice(endIdx + 4).trim();
  const result = { title: '', labels: [], assignee: '', body };

  for (const line of fm.split('\n')) {
    const colon = line.indexOf(':');
    if (colon === -1) continue;
    const key = line.slice(0, colon).trim().toLowerCase();
    let val = line.slice(colon + 1).trim();
    if (val.startsWith('[') && val.endsWith(']')) {
      val = val
        .slice(1, -1)
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);
    } else if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (key === 'title') result.title = String(val);
    else if (key === 'labels') result.labels = Array.isArray(val) ? val : val ? [val] : [];
    else if (key === 'assignee') result.assignee = String(val).replace(/^@/, '');
  }
  return result.title ? result : null;
}

/**
 * Parse issue content (frontmatter or inline TITLE/LABELS).
 *
 * @param {string} content - Raw draft content
 * @returns {{ title: string; labels: string[]; assignee: string; body: string }}
 */
function parseIssueContent(content) {
  let raw = content.trim();
  raw = raw.replace(/^```[\w]*\n?/, '').replace(/\n?```\s*$/, '');
  const fm = parseFrontmatter(raw);
  if (fm) return fm;

  const lines = raw.split('\n');
  let title = '';
  let labels = [];
  let assignee = '';
  let bodyStart = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.startsWith('TITLE:')) {
      title = line.replace(/^TITLE:\s*/i, '').trim();
    } else if (line.startsWith('LABELS:')) {
      let labelStr = line.replace(/^LABELS:\s*/i, '').trim();
      if (labelStr) {
        if (labelStr.startsWith('[') && labelStr.endsWith(']')) {
          labelStr = labelStr.slice(1, -1).trim();
        }
        labels = labelStr
          .split(/[,\s]+/)
          .map(l => l.trim())
          .filter(Boolean);
      }
    } else if (line.startsWith('ASSIGNEE:')) {
      assignee = line
        .replace(/^ASSIGNEE:\s*/i, '')
        .trim()
        .replace(/^@/, '');
    } else if (line.trim() === '---') {
      bodyStart = i + 1;
      break;
    } else if (title && bodyStart === 0 && line.trim()) {
      bodyStart = i;
      break;
    }
  }

  const body = lines.slice(bodyStart).join('\n').trim();
  return { title, labels, assignee, body };
}

/**
 * Infers label from conventional commit type in title.
 *
 * @param {string} title - Issue title (e.g. "feat(store): add stats")
 * @returns {string|null} Label or null
 */
function inferLabelFromTitle(title) {
  const match = title.match(/^(\w+)(?:\([^)]+\))?:\s*/);
  if (!match) return null;
  const type = match[1].toLowerCase();
  return TYPE_TO_LABEL[type] || null;
}

/**
 * Resolves label alias (e.g. docs -> documentation).
 *
 * @param {string} label - Raw label
 * @returns {string}
 */
function resolveLabel(label) {
  return LABEL_ALIASES[label.toLowerCase()] || label;
}

module.exports = {
  parseFrontmatter,
  parseIssueContent,
  inferLabelFromTitle,
  resolveLabel,
  LABEL_ALIASES,
  TYPE_TO_LABEL,
};
