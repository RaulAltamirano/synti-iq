#!/usr/bin/env node
/**
 * Notifies Discord when new commits are pushed to a PR branch.
 * Env: DISCORD_WEBHOOK, PR_*, COMMIT_*, COMMENTS_JSON
 * Optional: DISCORD_THREAD_ID (manual or from PR comment when thread-per-PR), GITHUB_TOKEN, GITHUB_REPOSITORY
 * Optional: DISCORD_USE_FORUM (ignored here; thread resolved from PR comment)
 */

const BOT_PREFIX = '🤖';
const { getPrThreadId, savePrThreadId } = require('./lib/discord-pr-thread');
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
  let threadId = (process.env.DISCORD_THREAD_ID || '').trim();

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

  if (!threadId) {
    const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
    const repo = process.env.GITHUB_REPOSITORY || '';
    const prNum = parseInt(prNumber, 10);
    if (token && repo && prNum) {
      const stored = await getPrThreadId(token, repo, prNum);
      if (stored) threadId = stored;
    }
  }

  // Forum channel requires thread_id or thread_name. If no thread yet (race: we run before discord-notify-new-pr), create it.
  if (threadId) {
    await sendEmbed(webhook, embed, { threadId });
  } else {
    const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
    const repo = process.env.GITHUB_REPOSITORY || '';
    const prNum = parseInt(prNumber, 10);
    const threadName = `PR #${prNumber}: ${prTitle}`.slice(0, 100);
    const msg = await sendEmbed(webhook, embed, {
      extraPayload: { thread_name: threadName },
      wait: true,
    });
    const createdId = msg?.channel_id;
    if (createdId && token && repo && prNum) {
      await savePrThreadId(token, repo, prNum, String(createdId), prUrl);
    }
  }
  console.log('Discord commit notification sent');
}

main().catch(err => {
  console.error('Discord webhook error:', err.message || err);
  process.exit(1);
});
