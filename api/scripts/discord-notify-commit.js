#!/usr/bin/env node
/**
 * Notifies Discord when new commits are pushed to a PR branch.
 * Env: DISCORD_WEBHOOK, PR_*, COMMIT_*
 * Optional: DISCORD_THREAD_ID (manual or from PR comment when thread-per-PR), GITHUB_TOKEN, GITHUB_REPOSITORY
 */

const { getPrThreadId, savePrThreadId } = require('./lib/discord-pr-thread');
const {
  validateWebhook,
  truncate,
  buildWorkflowField,
  sendEmbed,
  sanitizeForEmbed,
  COLOR_GOLD,
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

  const commitTitle = truncate(sanitizeForEmbed(commitMessage.split('\n')[0]), 80);
  const commitDisplay = commitUrl
    ? `[${commitSha}](${commitUrl}) ${commitTitle}`
    : `\`${commitSha}\` ${commitTitle}`;

  const embed = {
    title: `📌 New commit on PR #${prNumber}`,
    description: `**${sanitizeForEmbed(prTitle)}**\n\n${commitDisplay}\n*by @${commitAuthor}* on \`${prBranch}\``,
    color: COLOR_GOLD,
    url: prUrl,
    fields: [
      {
        name: '🔗 Link',
        value: `[View PR #${prNumber}](${prUrl})`,
        inline: false,
      },
    ],
    footer: { text: 'Repository activity' },
    timestamp: new Date().toISOString(),
  };

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
