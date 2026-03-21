#!/usr/bin/env node
/**
 * Notifies Discord when a new GitHub issue is opened.
 * Runs on issues.opened. Reads event from GITHUB_EVENT_PATH.
 * Env: DISCORD_WEBHOOK, GITHUB_EVENT_PATH (auto-set by Actions)
 * Optional: DISCORD_THREAD_ID, WORKFLOW_RUN_URL
 */

const fs = require('fs');

const {
  validateWebhook,
  truncate,
  truncateAtSentence,
  buildWorkflowField,
  sendEmbed,
  sanitizeForEmbed,
  COLOR_INFO,
  FIELD_VALUE_LIMIT,
} = require('./discord-utils');

function loadIssueFromEvent() {
  const eventPath = process.env.GITHUB_EVENT_PATH;
  if (!eventPath || !fs.existsSync(eventPath)) {
    console.error(
      'GITHUB_EVENT_PATH not set or file missing. This script must run in a GitHub Actions workflow triggered by issues.opened.',
    );
    process.exit(1);
  }
  const event = JSON.parse(fs.readFileSync(eventPath, 'utf8'));
  if (!event.issue) {
    console.error('No issue in event payload. Event action:', event.action);
    process.exit(1);
  }
  return event.issue;
}

async function main() {
  const webhook = process.env.DISCORD_WEBHOOK;
  validateWebhook(
    webhook,
    'Missing DISCORD_WEBHOOK. Discord notifications for new issues require this secret.',
  );

  const issue = loadIssueFromEvent();
  const title = (issue.title || '').trim();
  const body = (issue.body || '').trim();
  const htmlUrl = issue.html_url || '';
  const number = issue.number;
  const author = issue.user?.login || issue.user?.name || 'unknown';
  const labels = (issue.labels || []).map(l => l.name).filter(Boolean);
  const threadId = (process.env.DISCORD_THREAD_ID || '').trim();

  const summary = truncateAtSentence(body, 400) || '_No description_';

  const embed = {
    title: `📋 New issue #${number} — ${sanitizeForEmbed(truncate(title, 220))}`,
    description: `\`\`\`\n${sanitizeForEmbed(summary)}\n\`\`\`\n*by @${author}*`,
    color: COLOR_INFO,
    url: htmlUrl || undefined,
    fields: [],
    footer: { text: 'synti-iq-api' },
    timestamp: new Date().toISOString(),
  };

  if (labels.length > 0) {
    const labelStr = labels.join(', ');
    embed.fields.push({
      name: 'Labels',
      value: sanitizeForEmbed(truncate(labelStr, FIELD_VALUE_LIMIT)),
      inline: true,
    });
  }

  if (htmlUrl) {
    embed.fields.push({
      name: 'Link',
      value: `[Open issue #${number}](${htmlUrl})`,
      inline: false,
    });
  }

  const workflowField = buildWorkflowField(process.env.WORKFLOW_RUN_URL);
  if (workflowField) embed.fields.push(workflowField);

  await sendEmbed(webhook, embed, { threadId: threadId || undefined });
  console.log('Discord new-issue notification sent');
}

main().catch(err => {
  console.error('Discord webhook error:', err.message || err);
  process.exit(1);
});
