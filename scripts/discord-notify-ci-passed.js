#!/usr/bin/env node
/**
 * Notifies Discord when CI quality gate passes.
 * Env: DISCORD_WEBHOOK
 * Optional: WORKFLOW_RUN_URL, WORKFLOW_DURATION, PR_NUMBER, PR_TITLE, PR_URL,
 *   PR_AUTHOR, PR_BRANCH, BRANCH, COMMIT_SHA, COMMIT_MSG, EVENT_NAME
 */

const {
  validateWebhook,
  truncate,
  buildWorkflowField,
  sendEmbed,
  COLOR_MERGED,
} = require('./discord-utils');

async function main() {
  const webhook = process.env.DISCORD_WEBHOOK?.trim();
  if (!webhook) {
    console.log('DISCORD_WEBHOOK not set — skipping CI passed notification');
    return;
  }
  validateWebhook(
    webhook,
    'Invalid DISCORD_WEBHOOK. CI passed notifications require the secret in Settings > Secrets.',
  );

  const eventName = process.env.EVENT_NAME || 'unknown';
  const prNumber = process.env.PR_NUMBER || '';
  const prTitle = (process.env.PR_TITLE || '').slice(0, 150);
  const prUrl = process.env.PR_URL || '';
  const prAuthor = process.env.PR_AUTHOR || '';
  const prBranch = process.env.PR_BRANCH || '';
  const branch = process.env.BRANCH || process.env.GITHUB_REF_NAME || '';
  const commitSha = (process.env.COMMIT_SHA || process.env.GITHUB_SHA || '').slice(0, 7);
  const commitMsg = (process.env.COMMIT_MSG || '').trim().split('\n')[0].slice(0, 80);

  let title;
  let description;
  let url = prUrl;

  if (eventName === 'pull_request' && prNumber) {
    title = `✅ CI passed — PR #${prNumber}`;
    description = `**${prTitle || 'No title'}**\n\nBy: @${prAuthor}\nBranch: \`${prBranch || branch}\``;
  } else {
    title = `✅ CI passed — \`${branch}\``;
    description = `Commit \`${commitSha}\`${commitMsg ? ` — ${truncate(commitMsg, 60)}` : ''}`;
  }

  const embed = {
    title,
    description,
    color: COLOR_MERGED,
    url: url || undefined,
    fields: [],
    footer: { text: 'Quality gate' },
    timestamp: new Date().toISOString(),
  };

  const workflowField = buildWorkflowField(
    process.env.WORKFLOW_RUN_URL,
    process.env.WORKFLOW_DURATION,
  );
  if (workflowField) embed.fields.push(workflowField);

  await sendEmbed(webhook, embed);
  console.log('Discord CI passed notification sent');
}

main().catch(err => {
  console.error('Discord webhook error:', err.message || err);
  process.exit(1);
});
