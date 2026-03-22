#!/usr/bin/env node
/**
 * Notifies Discord when a new PR is opened or updated.
 * Runs AFTER ai-review (even when it fails). Shows task, links, resumen de hallazgos, rating, Sonar.
 * Uses Router+Specialist: Groq (orchestrator) for summarizations, Gemini fallback. See docs/adr/0001-ai-router-specialist-strategy.md
 * Env: DISCORD_WEBHOOK, PR_*, ISSUE_*, SUMMARY_TEXT, RATING, SONAR_*
 * Optional: GROQ_API_KEY (primary), GEMINI_API_KEY (fallback), WORKFLOW_RUN_URL, PR_BASE_BRANCH
 */

const {
  validateWebhook,
  truncateAtSentence,
  formatRating,
  formatSonarStats,
  buildWorkflowField,
  sendEmbed,
  COLOR_INFO,
  FIELD_VALUE_LIMIT,
} = require('./discord-utils');
const { summarizeIssue, summarizeFindings } = require('./lib/ai-agents');

async function main() {
  const webhook = process.env.DISCORD_WEBHOOK;
  validateWebhook(
    webhook,
    'Missing DISCORD_WEBHOOK. On PRs from forks, secrets are not passed; Discord notifications only work for same-repository PRs.',
  );

  const prNumber = process.env.PR_NUMBER || '?';
  const prTitle = (process.env.PR_TITLE || 'No title').slice(0, 200);
  const prUrl = process.env.PR_URL || '';
  const prAuthor = process.env.PR_AUTHOR || 'author';
  const prAction = process.env.PR_ACTION || 'opened';
  const prBranch = process.env.PR_BRANCH || '';
  const prBaseBranch = process.env.PR_BASE_BRANCH || '';
  const issueNumber = process.env.ISSUE_NUMBER || '';
  const issueTitle = (process.env.ISSUE_TITLE || '').trim();
  const issueBody = (process.env.ISSUE_BODY || '').trim();
  const issueUrl = process.env.ISSUE_URL || '';

  // Skip when no PR context (e.g. workflow_dispatch without PR)
  if (!prUrl && prNumber === '?') {
    console.warn('Skipping: no PR context available');
    process.exit(0);
  }

  const status = prAction === 'synchronize' ? 'PR updated' : 'New PR';
  let description = `**${prTitle}**\n\nBy: @${prAuthor}`;
  if (prBranch) {
    const branchPart = prBaseBranch ? `\`${prBranch}\` → \`${prBaseBranch}\`` : `\`${prBranch}\``;
    description += ` • Branch: ${branchPart}`;
  }

  const fields = [];
  if (issueNumber && (issueTitle || issueBody)) {
    let taskValue = null;
    try {
      taskValue = await summarizeIssue(issueTitle, issueBody);
    } catch (_) {
      /* ignore */
    }
    if (!taskValue) {
      taskValue = [issueTitle.slice(0, 100), issueBody.slice(0, 150)].filter(Boolean).join(' — ');
    }
    fields.push({
      name: `📋 Task #${issueNumber}`,
      value: taskValue,
      inline: false,
    });
  }

  const linkItems = [[prUrl, 'View MR']];
  if (issueUrl && issueNumber) {
    linkItems.push([issueUrl, `View requirement #${issueNumber}`]);
  }
  const links = linkItems
    .filter(([url]) => url)
    .map(([url, label]) => `[${label}](${url})`)
    .join(' • ');

  // Findings summary (max 6 lines, Groq/Gemini when available), Rating, Sonar
  const rawSummary = (process.env.SUMMARY_TEXT || 'No specific findings.').trim();
  let summaryText = rawSummary;
  if (rawSummary && rawSummary !== 'No specific findings.') {
    try {
      const aiSummary = await summarizeFindings(rawSummary, FIELD_VALUE_LIMIT);
      if (aiSummary) {
        summaryText =
          truncateAtSentence(aiSummary, FIELD_VALUE_LIMIT) || aiSummary.slice(0, FIELD_VALUE_LIMIT);
      } else {
        summaryText = truncateAtSentence(rawSummary.replace(/\n{2,}/g, '\n'), FIELD_VALUE_LIMIT);
      }
    } catch (_) {
      summaryText = truncateAtSentence(rawSummary.replace(/\n{2,}/g, '\n'), FIELD_VALUE_LIMIT);
    }
  }
  const rating = Math.min(5, Math.max(1, parseInt(process.env.RATING || '3', 10) || 3));
  const { stars, levelLabel } = formatRating(rating);
  const sonarStats = formatSonarStats(
    process.env.SONAR_BUGS || '0',
    process.env.SONAR_SECURITY_HOTSPOTS || '0',
    process.env.SONAR_VULNERABILITIES || '0',
  );

  fields.push(
    { name: '📋 Findings summary', value: summaryText, inline: false },
    { name: 'Rating', value: `${stars} (${rating}/5) - ${levelLabel}`, inline: true },
    { name: 'Sonar Stats', value: sonarStats, inline: true },
  );

  if (links) {
    fields.push({ name: '🔗 Links', value: links, inline: false });
  }

  const workflowField = buildWorkflowField(process.env.WORKFLOW_RUN_URL);
  if (workflowField) fields.push(workflowField);

  const embed = {
    title: `🚩 Synti-IQ: ${status} #${prNumber}`,
    description,
    color: COLOR_INFO,
    url: prUrl,
    footer: { text: 'Review on GitHub' },
    timestamp: new Date().toISOString(),
    ...(fields.length > 0 && { fields }),
  };

  await sendEmbed(webhook, embed);
  console.log('Discord notification sent');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
