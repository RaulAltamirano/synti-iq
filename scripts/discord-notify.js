#!/usr/bin/env node
/**
 * Discord Notify Script — Sends PR review summary to Discord webhook as embed card.
 * Run from project root. Env: DISCORD_WEBHOOK, PR_NUMBER, PR_MERGED, PR_URL, PR_AUTHOR,
 *   SONAR_BUGS, SONAR_SECURITY_HOTSPOTS, ROAST_TEXT, ROAST_FALLBACK, RATING
 * Optional: WORKFLOW_RUN_URL (link to GitHub Actions run)
 */

const {
  validateWebhook,
  formatRating,
  formatSonarStats,
  buildWorkflowField,
  sendEmbed,
  COLOR_MERGED,
  COLOR_REJECTED,
} = require('./discord-utils');

async function main() {
  const webhook = process.env.DISCORD_WEBHOOK;
  validateWebhook(webhook);

  const prNumber = process.env.PR_NUMBER || '?';
  const prMerged = process.env.PR_MERGED === 'true';
  const prUrl = process.env.PR_URL || '';
  const prAuthor = process.env.PR_AUTHOR || 'author';
  const sonarBugs = process.env.SONAR_BUGS || '0';
  const sonarHotspots = process.env.SONAR_SECURITY_HOTSPOTS || '0';
  const sonarVulns = process.env.SONAR_VULNERABILITIES || '0';
  const rawRoast = process.env.ROAST_TEXT || '';
  const fallback = process.env.ROAST_FALLBACK || 'Revisión completada.';
  const generic = 'Revisión completada.';
  const roastText =
    rawRoast && rawRoast.trim() && rawRoast.trim() !== generic
      ? rawRoast.trim()
      : fallback.trim() || generic;
  const rating = Math.min(5, Math.max(1, parseInt(process.env.RATING || '3', 10) || 3));

  const safeRoast = String(roastText)
    .slice(0, 500)
    .replace(/[\n\r]+/g, ' ');

  const statusText = prMerged ? '🟢 MERGED' : '🔴 REJECTED / CLOSED';
  const color = prMerged ? COLOR_MERGED : COLOR_REJECTED;
  const { stars, levelLabel } = formatRating(rating);
  const sonarStats = formatSonarStats(
    sonarBugs,
    sonarHotspots,
    sonarVulns,
    '✅ Sin hallazgos críticos',
  );

  const fields = [
    {
      name: 'Rating',
      value: `${stars} (${rating}/5) - ${levelLabel}`,
      inline: true,
    },
    {
      name: 'Sonar Stats',
      value: sonarStats,
      inline: true,
    },
  ];
  const workflowField = buildWorkflowField(process.env.WORKFLOW_RUN_URL);
  if (workflowField) fields.push(workflowField);

  const embed = {
    title: `🚩 Synti-IQ Review: Pull Request #${prNumber}`,
    description: `**Status:** ${statusText}\n\n> "${safeRoast}"\n— *@${prAuthor}*`,
    color,
    url: prUrl || undefined,
    fields,
    footer: {
      text: 'Repository activity',
    },
    timestamp: new Date().toISOString(),
  };

  await sendEmbed(webhook, embed);
  console.log('Discord notification sent');
}

main().catch(err => {
  console.error('Discord webhook error:', err.message || err);
  process.exit(1);
});
