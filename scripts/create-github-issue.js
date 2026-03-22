#!/usr/bin/env node
/**
 * Creates a GitHub issue from AI-generated content.
 *
 * Authentication (in order of precedence):
 * 1. GitHub App: GITHUB_APP_ID/GH_APP_ID, GITHUB_INSTALLATION_ID/GH_INSTALLATION_ID, GITHUB_PRIVATE_KEY/GH_APP_PRIVATE_KEY
 *    (Use GH_* for CI — secret names cannot start with GITHUB_)
 * 2. GH_TOKEN + gh CLI (or gh auth login)
 *
 * Expected formats:
 *
 * 1. YAML frontmatter (recommended):
 *   ---
 *   title: feat(store): add stats endpoint
 *   labels: [enhancement]
 *   assignee: username  (optional)
 *   ---
 *   ## Body (markdown)
 *
 * 2. Inline TITLE/LABELS:
 *   TITLE: feat(store): add stats endpoint
 *   LABELS: enhancement
 *   ASSIGNEE: username  (optional)
 *   ---
 *   ## Body (markdown)
 *
 * Features: auto-label from title, auto-create missing labels, GH_TOKEN, assignee.
 * Full flow: docs/DEVELOPMENT_WORKFLOW.md, docs/prompts/new-issue.md
 *
 * Usage:
 *   node scripts/create-github-issue.js [file.md]
 *   node scripts/create-github-issue.js                    # uses docs/issues/draft.md
 *   cat draft.md | node scripts/create-github-issue.js
 *   GH_TOKEN=ghp_xxx node scripts/create-github-issue.js docs/issues/foo.md
 *   # With GitHub App (bot): GITHUB_* or GH_* (GH_* for CI secrets)
 */

const fs = require('fs');
const path = require('path');
const { execSync, spawnSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');

// Load .env if available (e.g. from @nestjs/config's dotenv or dotenv package)
try {
  const dotenv = require('dotenv');
  dotenv.config({ path: path.join(ROOT, '.env') });
} catch {
  // dotenv not installed — rely on env vars from shell/export
}
const ISSUES_DIR = path.join(ROOT, 'docs', 'issues');
const DEFAULT_FILE = path.join(ISSUES_DIR, 'draft.md');
const TEMPLATE_ISSUES = path.join(ISSUES_DIR, 'draft-template.md');

const LABEL_ALIASES = { docs: 'documentation' };
const LABEL_COLORS = {
  documentation: '0075ca',
  enhancement: 'a2eeef',
  bug: 'd73a4a',
  chore: 'ededed',
  refactor: 'fef2c0',
  test: 'bfdadc',
  'tech-debt': 'fbca04',
};

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

function getStdin() {
  return new Promise(resolve => {
    if (process.stdin.isTTY) {
      resolve(null);
      return;
    }
    let data = '';
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', chunk => {
      data += chunk;
    });
    process.stdin.on('end', () => resolve(data));
  });
}

/** Parse YAML frontmatter (minimal: title, labels, assignee). */
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

/** Infers label from conventional commit type in title. */
function inferLabelFromTitle(title) {
  const match = title.match(/^(\w+)(?:\([^)]+\))?:\s*/);
  if (!match) return null;
  const type = match[1].toLowerCase();
  return TYPE_TO_LABEL[type] || null;
}

function checkGhInstalled() {
  try {
    execSync('gh --version', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

/** Returns [owner, repo] from GITHUB_REPOSITORY or git remote. */
function getOwnerRepo() {
  const repoEnv = process.env.GITHUB_REPOSITORY;
  if (repoEnv) {
    const parts = repoEnv.split('/');
    if (parts.length >= 2) return [parts[0], parts[1].replace(/\.git$/, '')];
  }
  try {
    const url = execSync('git config --get remote.origin.url', { encoding: 'utf8' }).trim();
    const match = url.match(/(?:git@github\.com:|https?:\/\/[^/]+\/)([^/]+)\/([^/.]+)(?:\.git)?$/);
    if (match) return [match[1], match[2]];
  } catch {
    // ignore
  }
  return null;
}

/** Resolve App credentials. Uses GH_APP_* for CI (secret names cannot start with GITHUB_). */
function getAppCredentials() {
  const appId = process.env.GH_APP_ID || process.env.GITHUB_APP_ID;
  const installationId = process.env.GH_INSTALLATION_ID || process.env.GITHUB_INSTALLATION_ID;
  const privateKey = process.env.GH_APP_PRIVATE_KEY || process.env.GITHUB_PRIVATE_KEY;
  return appId && installationId && privateKey ? { appId, installationId, privateKey } : null;
}

/** Check if GitHub App credentials are configured. */
function hasAppCredentials() {
  return !!getAppCredentials();
}

/** Create issue via GitHub REST API using App installation token. */
async function createIssueViaApi(title, body, labels, assignee, owner, repo) {
  const { createAppAuth } = require('@octokit/auth-app');
  const { Octokit } = require('octokit');

  const creds = getAppCredentials();
  const privateKey = (creds.privateKey || '').replace(/\\n/g, '\n');
  const auth = createAppAuth({
    appId: creds.appId,
    privateKey,
    installationId: creds.installationId,
  });
  const installationAuth = await auth({ type: 'installation' });
  const octokit = new Octokit({ auth: installationAuth.token });

  const resolvedLabels = labels.map(l => LABEL_ALIASES[l.toLowerCase()] || l);

  // Ensure labels exist
  if (resolvedLabels.length > 0) {
    const { data: existingLabels } = await octokit.rest.issues.listLabelsForRepo({
      owner,
      repo,
    });
    const existing = new Set(existingLabels.map(l => l.name.toLowerCase()));
    for (const name of resolvedLabels) {
      const key = name.toLowerCase();
      if (!existing.has(key)) {
        const color = LABEL_COLORS[key] || 'ededed';
        try {
          await octokit.rest.issues.createLabel({
            owner,
            repo,
            name,
            color,
          });
          existing.add(key);
        } catch {
          // ignore — create issue without this label
        }
      }
    }
  }

  const issueParams = {
    owner,
    repo,
    title,
    body: body || undefined,
    labels: resolvedLabels.length > 0 ? resolvedLabels : undefined,
  };
  if (assignee) {
    issueParams.assignees = [assignee];
  }

  const { data } = await octokit.rest.issues.create(issueParams);
  console.log(`Issue created: ${data.html_url}`);
  return true;
}

function getExistingLabels() {
  try {
    const out = execSync('gh label list --json name', { encoding: 'utf8' });
    const arr = JSON.parse(out || '[]');
    return new Set(arr.map(o => o.name.toLowerCase()));
  } catch {
    return new Set();
  }
}

function ensureLabels(labels) {
  if (labels.length === 0) return;
  const existing = getExistingLabels();
  const resolved = labels.map(l => LABEL_ALIASES[l.toLowerCase()] || l);
  for (const name of resolved) {
    const key = name.toLowerCase();
    if (existing.has(key)) continue;
    const color = LABEL_COLORS[key] || 'ededed';
    try {
      spawnSync('gh', ['label', 'create', name, '--color', color, '--force'], {
        stdio: 'pipe',
        encoding: 'utf8',
      });
      existing.add(key);
    } catch {
      // ignore — will retry without labels in createIssue
    }
  }
}

function createIssue(title, body, labels, assignee) {
  const baseArgs = ['issue', 'create', '--title', title];
  if (body) {
    baseArgs.push('--body', body);
  }
  if (assignee) {
    baseArgs.push('--assignee', assignee);
  }

  const withLabels = [...baseArgs];
  const resolvedLabels = labels.map(l => LABEL_ALIASES[l.toLowerCase()] || l);
  for (const label of resolvedLabels) {
    withLabels.push('--label', label);
  }

  let result = spawnSync('gh', withLabels, {
    stdio: 'inherit',
    encoding: 'utf8',
  });

  if (result.status !== 0 && resolvedLabels.length > 0) {
    console.warn('');
    console.warn('Note: Some labels may not exist in the repo. Retrying without labels...');
    result = spawnSync('gh', baseArgs, {
      stdio: 'inherit',
      encoding: 'utf8',
    });
  }

  return result.status === 0;
}

function ensureIssuesDir() {
  if (!fs.existsSync(ISSUES_DIR)) {
    fs.mkdirSync(ISSUES_DIR, { recursive: true });
    console.log(`Created ${path.relative(ROOT, ISSUES_DIR)}/`);
  }
}

function getTemplatePath(requestedPath) {
  if (!requestedPath) return null;
  const absPath = path.isAbsolute(requestedPath) ? requestedPath : path.join(ROOT, requestedPath);
  const baseName = path.basename(absPath);
  const isDraft =
    /^draft/i.test(baseName) || absPath.startsWith(ISSUES_DIR) || baseName === 'issue-draft.md';
  return isDraft && fs.existsSync(TEMPLATE_ISSUES) ? TEMPLATE_ISSUES : null;
}

async function main() {
  let content = '';
  let filePath = process.argv[2];

  if (filePath) {
    const absPath = path.isAbsolute(filePath) ? filePath : path.join(ROOT, filePath);
    if (!fs.existsSync(absPath)) {
      const template = getTemplatePath(absPath);
      const baseName = path.basename(absPath);
      const isDraft = /^draft/i.test(baseName) || absPath.startsWith(ISSUES_DIR);
      if (template && (isDraft || baseName === 'issue-draft.md')) {
        ensureIssuesDir();
        fs.copyFileSync(template, absPath);
        console.log(`Created ${path.relative(ROOT, absPath)} from template.`);
        console.log('Edit the file with your content (or AI output) and run again.');
        process.exit(0);
      }
      console.error(`Error: File not found: ${filePath}`);
      console.error('');
      console.error('Flow: 1) Use the prompt in docs/prompts/new-issue.md with AI');
      console.error('      2) Save the output to docs/issues/<name>.md');
      console.error('      3) Run: yarn issue:create docs/issues/<name>.md');
      process.exit(1);
    }
    content = fs.readFileSync(absPath, 'utf8');
  } else {
    content = await getStdin();
    if (!content) {
      filePath = DEFAULT_FILE;
      if (!fs.existsSync(filePath)) {
        ensureIssuesDir();
        const template = fs.existsSync(TEMPLATE_ISSUES) ? TEMPLATE_ISSUES : null;
        if (template) {
          fs.copyFileSync(template, filePath);
          console.log(`Created ${path.relative(ROOT, filePath)} from template.`);
          console.log(
            'Edit the file with your content (or AI output) and run: yarn issue:create docs/issues/draft.md',
          );
          process.exit(0);
        }
      } else {
        content = fs.readFileSync(filePath, 'utf8');
      }
    }
    if (!content) {
      console.error(`Usage:
  node scripts/create-github-issue.js [file.md]
  node scripts/create-github-issue.js                    # uses docs/issues/draft.md
  cat draft.md | node scripts/create-github-issue.js

Generate content with the prompt in docs/prompts/new-issue.md`);
      process.exit(1);
    }
  }

  const { title, labels, assignee, body } = parseIssueContent(content);

  if (!title) {
    console.error(
      'Error: No TITLE found in content. Check the format in docs/prompts/new-issue.md',
    );
    process.exit(1);
  }

  const placeholderPattern = /^\[.*(replace|reemplaza|título|title|descriptivo|description).*\]$/i;
  if (placeholderPattern.test(title)) {
    console.error(
      'Error: The title appears to be a placeholder. Use a real title: [TYPE] prefix (e.g. [TASK], [STORY]) or type(scope): imperative description',
    );
    process.exit(1);
  }

  let resolvedLabels = [...labels];
  if (resolvedLabels.length === 0) {
    const inferred = inferLabelFromTitle(title);
    if (inferred) {
      resolvedLabels.push(inferred);
      console.log(`  Inferred label from title: ${inferred}`);
    }
  }

  const useApp = hasAppCredentials();

  if (useApp) {
    const ownerRepo = getOwnerRepo();
    if (!ownerRepo) {
      console.error(
        'Error: Cannot determine owner/repo. Set GITHUB_REPOSITORY (e.g. owner/repo) or run from a git repo with remote.origin.',
      );
      process.exit(1);
    }
    const [owner, repo] = ownerRepo;
    console.log('Using GitHub App — issues will be created as the app.');
    console.log(`  Repo: ${owner}/${repo}`);
    console.log(`  Title: ${title}`);
    if (resolvedLabels.length) console.log(`  Labels: ${resolvedLabels.join(', ')}`);
    if (assignee) console.log(`  Assignee: @${assignee}`);
    try {
      const ok = await createIssueViaApi(title, body, resolvedLabels, assignee, owner, repo);
      process.exit(ok ? 0 : 1);
    } catch (err) {
      console.error('Error creating issue via GitHub App:', err.message);
      process.exit(1);
    }
  }

  if (!checkGhInstalled()) {
    console.error('Error: GitHub CLI (gh) is not installed. Install from: https://cli.github.com/');
    console.error(
      'Alternatively, configure GitHub App: GITHUB_APP_ID/GH_APP_ID, GITHUB_INSTALLATION_ID/GH_INSTALLATION_ID, GITHUB_PRIVATE_KEY/GH_APP_PRIVATE_KEY',
    );
    process.exit(1);
  }

  if (process.env.GH_TOKEN) {
    console.log('Using GH_TOKEN — issues will be created as the token owner (bot/other account).');
  }
  console.log('Creating issue on GitHub...');
  console.log(`  Title: ${title}`);
  if (resolvedLabels.length) console.log(`  Labels: ${resolvedLabels.join(', ')}`);
  if (assignee) console.log(`  Assignee: @${assignee}`);

  ensureLabels(resolvedLabels);
  const ok = createIssue(title, body, resolvedLabels, assignee);
  process.exit(ok ? 0 : 1);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
