#!/usr/bin/env node
/**
 * Notifies Discord when new commits are pushed to a PR branch.
 * Env: DISCORD_WEBHOOK, PR_*, COMMIT_*, COMMENTS_JSON
 * Optional: DISCORD_THREAD_ID (post to existing thread), DISCORD_USE_FORUM=true (create forum post per commit),
 *   WORKFLOW_RUN_URL (link to GitHub Actions run), COMMIT_URL (link to commit - makes hash clickable)
 */

const BOT_PREFIX = '🤖';
const {
  validateWebhook,
  truncate,
  buildWorkflowField,
  sendEmbed,
  sanitizeForEmbed,
  COLOR_GOLD,
  FIELD_VALUE_LIMIT,
} = require('./discord-utils');

async function main() {
  const webhook = process.env.DISCORD_WEBHOOK;
  validateWebhook(webhook);

  const prNumber = process.env.PR_NUMBER || '?';
  const prTitle = (process.env.PR_TITLE || 'No title').slice(0, 100);
  const prUrl = process.env.PR_URL || '';
  const prBranch = process.env.PR_BRANCH || '';
  const commitSha = (process.env.COMMIT_SHA || '').slice(0, 7);
  const commitUrl = (process.env.COMMIT_URL || '').trim();
  const commitMessage = (process.env.COMMIT_MESSAGE || 'No message').trim();
  const commitAuthor = process.env.COMMIT_AUTHOR || 'unknown';
  const threadId = (process.env.DISCORD_THREAD_ID || '').trim();
  const useForum = process.env.DISCORD_USE_FORUM === 'true';

  let comments = [];
  try {
    const raw = process.env.COMMENTS_JSON || '[]';
    comments = JSON.parse(raw);
  } catch (_) {
    /* ignore */
  }

  // Filter out bot comments, take last 5, format
  const humanComments = comments
    .filter(c => c?.body && !String(c.body).startsWith(BOT_PREFIX))
    .slice(-5)
    .map(c => {
      const author = c.user?.login || 'unknown';
      const body = truncate(sanitizeForEmbed(String(c.body).replace(/\n/g, ' ')), 150);
      return `**@${author}:** ${body}`;
    });

  const commitTitle = truncate(sanitizeForEmbed(commitMessage.split('\n')[0]), 80);
  const commitDisplay = commitUrl
    ? `[${commitSha}](${commitUrl}) ${commitTitle}`
    : `\`${commitSha}\` ${commitTitle}`;

  const embed = {
    title: `📌 New commit on PR #${prNumber}`,
    description: `**${sanitizeForEmbed(prTitle)}**\n\n${commitDisplay}\n*by @${commitAuthor}* on \`${prBranch}\``,
    color: COLOR_GOLD,
    url: prUrl,
    fields: [],
    footer: { text: 'Repository activity' },
    timestamp: new Date().toISOString(),
  };

  if (humanComments.length > 0) {
    embed.fields.push({
      name: '💬 Recent comments',
      value: humanComments.join('\n').slice(0, FIELD_VALUE_LIMIT),
      inline: false,
    });
  }

  embed.fields.push({
    name: '🔗 Link',
    value: `[View PR #${prNumber}](${prUrl})`,
    inline: false,
  });

  const workflowField = buildWorkflowField(process.env.WORKFLOW_RUN_URL);
  if (workflowField) embed.fields.push(workflowField);

  const extraPayload =
    useForum && !threadId ? { thread_name: `PR #${prNumber}: ${commitTitle}`.slice(0, 100) } : {};
  await sendEmbed(webhook, embed, {
    threadId: threadId || undefined,
    extraPayload,
  });
  console.log('Discord commit notification sent');
}

main().catch(err => {
  console.error('Discord webhook error:', err.message || err);
  process.exit(1);
});
