#!/usr/bin/env node
/**
 * Notifies Discord when a commit is pushed directly to the dev branch.
 * Env: DISCORD_WEBHOOK, COMMIT_*, COMMIT_FILES
 * Optional: DISCORD_THREAD_ID, DISCORD_USE_FORUM=true, WORKFLOW_RUN_URL (link to GitHub Actions run)
 * Title/message: max 3 lines (Discord embed standard)
 */

const {
  validateWebhook,
  truncate,
  buildWorkflowField,
  sendEmbed,
  sanitizeForEmbed,
  COLOR_INFO,
} = require('./discord-utils');

/** Takes full commit message, returns first 3 lines (max ~250 chars for embed safety) */
function commitTitleMax3Lines(msg) {
  if (!msg?.trim()) return 'No message';
  const lines = msg.trim().split(/\r?\n/).slice(0, 3);
  const joined = lines.join('\n');
  return truncate(joined, 250);
}

async function main() {
  const webhook = process.env.DISCORD_WEBHOOK;
  validateWebhook(webhook);

  const commitSha = (process.env.COMMIT_SHA || '').slice(0, 7);
  const commitMessage = (process.env.COMMIT_MESSAGE || '').trim();
  const commitAuthor = process.env.COMMIT_AUTHOR || 'unknown';
  const commitUrl = process.env.COMMIT_URL || '';
  const commitFiles = (process.env.COMMIT_FILES || '').trim();
  const threadId = (process.env.DISCORD_THREAD_ID || '').trim();
  const useForum = process.env.DISCORD_USE_FORUM === 'true';

  const titleLines = commitTitleMax3Lines(commitMessage);

  const embed = {
    title: `📌 Commit in \`dev\` — \`${commitSha}\``,
    description: `\`\`\`\n${sanitizeForEmbed(titleLines)}\n\`\`\`\n*by @${commitAuthor}*`,
    color: COLOR_INFO,
    url: commitUrl || undefined,
    fields: [],
    footer: { text: 'Repository activity' },
    timestamp: new Date().toISOString(),
  };

  if (commitFiles && commitFiles.length > 0) {
    const filesDisplay = truncate(commitFiles.replaceAll(',', ', '), 500);
    embed.fields.push({
      name: '📁 Files',
      value: `\`${sanitizeForEmbed(filesDisplay)}\``,
      inline: false,
    });
  }

  if (commitUrl) {
    embed.fields.push({
      name: '🔗 Link',
      value: `[View commit](${commitUrl})`,
      inline: false,
    });
  }

  const workflowField = buildWorkflowField(process.env.WORKFLOW_RUN_URL);
  if (workflowField) embed.fields.push(workflowField);

  const extraPayload =
    useForum && !threadId ? { thread_name: `dev: ${titleLines.split('\n')[0]}`.slice(0, 100) } : {};
  await sendEmbed(webhook, embed, {
    threadId: threadId || undefined,
    extraPayload,
  });
  console.log('Discord dev commit notification sent');
}

main().catch(err => {
  console.error('Discord webhook error:', err.message || err);
  process.exit(1);
});
