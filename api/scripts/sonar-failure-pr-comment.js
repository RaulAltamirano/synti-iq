#!/usr/bin/env node
/**
 * When SonarCloud Quality Gate fails: fetches issues from SonarCloud API,
 * posts a summary as PR comment, and notifies the Discord thread.
 *
 * Env (required): GITHUB_TOKEN (or GH_TOKEN), GITHUB_REPOSITORY, PR_NUMBER,
 *   SONAR_PROJECT_KEY
 * Env (optional): SONAR_TOKEN (needed to fetch issues), DISCORD_WEBHOOK,
 *   DISCORD_THREAD_ID (or resolved via get-pr-discord-thread),
 *   PR_TITLE, PR_AUTHOR, PR_BRANCH, WORKFLOW_RUN_URL
 */

const {
  validateWebhook,
  truncate,
  buildWorkflowField,
  sendEmbed,
  COLOR_REJECTED,
  FIELD_VALUE_LIMIT,
} = require('./discord-utils');
const { getPrThreadId } = require('./lib/discord-pr-thread');

const SONAR_BASE = 'https://sonarcloud.io';

/**
 * Fetch issues from SonarCloud API for the given project and PR.
 * @param {string} token
 * @param {string} projectKey
 * @param {string} pullRequestKey - PR number as string
 * @returns {Promise<{ total: number; issues: Array<{ type: string; severity: string; message: string; component: string; line?: number }> }>}
 */
async function fetchSonarIssues(token, projectKey, pullRequestKey) {
  if (!token || !projectKey || !pullRequestKey) {
    return { total: 0, issues: [] };
  }
  const url = new URL(`${SONAR_BASE}/api/issues/search`);
  url.searchParams.set('projectKeys', projectKey);
  url.searchParams.set('pullRequest', pullRequestKey);
  url.searchParams.set('resolved', 'false');
  url.searchParams.set('ps', '100');

  const res = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
  });
  if (!res.ok) return { total: 0, issues: [] };

  const data = await res.json();
  const total = data.total ?? 0;
  const rawIssues = data.issues ?? [];

  const issues = rawIssues.map(i => ({
    type: i.type || 'unknown',
    severity: i.severity || 'unknown',
    message: (i.message || '').trim(),
    component: (i.component || '').split(':').pop() || '',
    line: i.line,
  }));

  return { total, issues };
}

/**
 * Fetch quality gate status for project/PR.
 * @param {string} token
 * @param {string} projectKey
 * @param {string} pullRequestKey
 * @returns {Promise<{ status: string; conditions: Array<{ metricKey: string; status: string }> } | null>}
 */
async function fetchQualityGateStatus(token, projectKey, pullRequestKey) {
  if (!token || !projectKey || !pullRequestKey) return null;
  const url = new URL(`${SONAR_BASE}/api/qualitygates/project_status`);
  url.searchParams.set('projectKey', projectKey);
  url.searchParams.set('pullRequest', pullRequestKey);

  const res = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
  });
  if (!res.ok) return null;
  return res.json();
}

/**
 * Build SonarCloud dashboard URL for the PR.
 * @param {string} projectKey
 * @param {string} pullRequestKey
 * @returns {string}
 */
function buildSonarDashboardUrl(projectKey, pullRequestKey) {
  const encoded = encodeURIComponent(projectKey);
  return `${SONAR_BASE}/project/issues?id=${encoded}&pullRequest=${pullRequestKey}`;
}

/**
 * Group issues by type and severity, build markdown table.
 * @param {Array<{ type: string; severity: string; message: string; component: string; line?: number }>} issues
 * @param {number} maxIssues - max rows to show
 * @returns {string}
 */
function formatIssuesMarkdown(issues, maxIssues = 30) {
  if (!issues.length) return '_No issues fetched._';

  const byType = {
    BUG: '🐛 Bug',
    VULNERABILITY: '🔒 Vulnerability',
    CODE_SMELL: '📋 Code Smell',
    SECURITY_HOTSPOT: '🔥 Security Hotspot',
  };
  const bySev = { BLOCKER: '🔴', CRITICAL: '🟠', MAJOR: '🟡', MINOR: '🟢', INFO: '⚪' };

  const rows = issues.slice(0, maxIssues).map(i => {
    const loc = i.line != null ? `:${i.line}` : '';
    const comp = (i.component || 'unknown') + loc;
    const typeLabel = byType[i.type] || i.type;
    const sevLabel = bySev[i.severity] || i.severity;
    const msg = (i.message || '').slice(0, 80).replace(/\|/g, '\\|');
    return `| ${sevLabel} | ${typeLabel} | \`${comp}\` | ${msg} |`;
  });

  const header =
    '| Severity | Type | Location | Message |\n|----------|------|----------|--------|';
  let out = header + '\n' + rows.join('\n');
  if (issues.length > maxIssues) {
    out += `\n\n_… and ${issues.length - maxIssues} more. See SonarCloud for full list._`;
  }
  return out;
}

/**
 * Post comment to PR (update existing bot comment if found).
 * @param {string} token
 * @param {string} repo
 * @param {number} prNumber
 * @param {string} body
 * @returns {Promise<boolean>}
 */
async function postPrComment(token, repo, prNumber, body) {
  const [owner, repoNamespace] = repo.split('/');
  if (!owner || !repoNamespace) return false;

  const BOT_MARKER = '<!-- SONAR_QUALITY_GATE_FAILURE -->';

  const listUrl = `https://api.github.com/repos/${owner}/${repoNamespace}/issues/${prNumber}/comments`;
  const listRes = await fetch(listUrl, {
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${token}`,
      'X-GitHub-Api-Version': '2022-11-28',
    },
  });
  if (!listRes.ok) return false;

  const comments = await listRes.json();
  const existing = Array.isArray(comments)
    ? comments.find(c => (c.body || '').includes(BOT_MARKER))
    : null;

  const fullBody = body + '\n\n' + BOT_MARKER;

  if (existing?.id) {
    const updateUrl = `https://api.github.com/repos/${owner}/${repoNamespace}/issues/comments/${existing.id}`;
    const updateRes = await fetch(updateUrl, {
      method: 'PATCH',
      headers: {
        Accept: 'application/vnd.github+json',
        Authorization: `Bearer ${token}`,
        'X-GitHub-Api-Version': '2022-11-28',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ body: fullBody }),
    });
    return updateRes.ok;
  }

  const createRes = await fetch(listUrl, {
    method: 'POST',
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${token}`,
      'X-GitHub-Api-Version': '2022-11-28',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ body: fullBody }),
  });
  return createRes.ok;
}

async function main() {
  const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
  const repo = (process.env.GITHUB_REPOSITORY || '').trim();
  const prNumber = parseInt(process.env.PR_NUMBER || '0', 10);
  const projectKey = (process.env.SONAR_PROJECT_KEY || '').trim();
  const sonarToken = (process.env.SONAR_TOKEN || '').trim();

  if (!token || !repo || !prNumber || !projectKey) {
    console.error(
      'Missing required env: GITHUB_TOKEN, GITHUB_REPOSITORY, PR_NUMBER, SONAR_PROJECT_KEY',
    );
    process.exit(1);
  }

  const pullRequestKey = String(prNumber);
  const dashboardUrl = buildSonarDashboardUrl(projectKey, pullRequestKey);

  let issuesData = { total: 0, issues: [] };
  let qgStatus = null;

  if (sonarToken) {
    try {
      issuesData = await fetchSonarIssues(sonarToken, projectKey, pullRequestKey);
      qgStatus = await fetchQualityGateStatus(sonarToken, projectKey, pullRequestKey);
    } catch (err) {
      console.warn('SonarCloud API error:', err.message);
    }
  }

  // ---- PR Comment ----
  const prTitle = (process.env.PR_TITLE || '').slice(0, 100);
  const prAuthor = process.env.PR_AUTHOR || '';
  const prBranch = process.env.PR_BRANCH || '';
  const prUrl = process.env.PR_URL || '';
  const workflowUrl = process.env.WORKFLOW_RUN_URL || '';

  const mdParts = [
    '## ❌ SonarCloud Quality Gate — Failed',
    '',
    prTitle ? `**PR:** ${prTitle} | By: @${prAuthor} | Branch: \`${prBranch}\`` : '',
    '',
    `### Summary`,
    `- **Total issues (unresolved):** ${issuesData.total}`,
    qgStatus?.projectStatus?.status
      ? `- **Quality Gate:** \`${qgStatus.projectStatus.status}\``
      : '',
    '',
    '### Issues',
    '',
    formatIssuesMarkdown(issuesData.issues),
    '',
    '### Links',
    `- [View full analysis in SonarCloud](${dashboardUrl})`,
    workflowUrl ? `- [Workflow run](${workflowUrl})` : '',
  ].filter(Boolean);

  const prBody = mdParts.join('\n');
  const prOk = await postPrComment(token, repo, prNumber, prBody);
  console.log(prOk ? 'PR comment posted' : 'PR comment failed');

  // ---- Discord ----
  const webhook = process.env.DISCORD_WEBHOOK?.trim();
  let threadId = (process.env.DISCORD_THREAD_ID || '').trim();

  if (!threadId && token && repo && prNumber) {
    try {
      threadId = (await getPrThreadId(token, repo, prNumber)) || '';
    } catch {
      // ignore
    }
  }

  if (webhook) {
    try {
      validateWebhook(
        webhook,
        'Invalid DISCORD_WEBHOOK. Sonar failure notifications require the secret.',
      );

      const shortSummary = issuesData.issues.length
        ? `${issuesData.total} issue(s): ${issuesData.issues
            .slice(0, 5)
            .map(i => i.message?.slice(0, 40) || i.type)
            .join('; ')}`
        : 'Quality Gate failed. See SonarCloud for details.';

      const embed = {
        title: `❌ SonarCloud Quality Gate — PR #${prNumber}`,
        description: [
          prTitle ? `**${truncate(prTitle, 100)}**` : '',
          `By: @${prAuthor}`,
          `Branch: \`${prBranch}\``,
          '',
          truncate(shortSummary, 400),
        ]
          .filter(Boolean)
          .join('\n'),
        color: COLOR_REJECTED,
        url: dashboardUrl,
        fields: [],
        footer: { text: `Total issues: ${issuesData.total}` },
        timestamp: new Date().toISOString(),
      };

      const workflowField = buildWorkflowField(workflowUrl, process.env.WORKFLOW_DURATION);
      if (workflowField) embed.fields.push(workflowField);

      embed.fields.push({
        name: 'SonarCloud',
        value: `[View analysis](${dashboardUrl})`,
        inline: false,
      });

      const descLen = JSON.stringify(embed.description).length;
      if (descLen > FIELD_VALUE_LIMIT) {
        embed.description = truncate(embed.description, FIELD_VALUE_LIMIT - 50);
      }

      await sendEmbed(webhook, embed, threadId ? { threadId } : {});
      console.log('Discord notification sent');
    } catch (err) {
      console.error('Discord notification error:', err.message);
      // do not exit 1 — PR comment is the main deliverable
    }
  } else {
    console.log('DISCORD_WEBHOOK not set — skipping Discord notification');
  }
}

main().catch(err => {
  console.error(err.message || err);
  process.exit(1);
});
