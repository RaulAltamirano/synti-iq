#!/usr/bin/env node
/**
 * Notifies Discord when new commits are pushed to a PR branch.
 * Env: DISCORD_WEBHOOK, PR_*, COMMIT_*, COMMENTS_JSON
 * Optional: DISCORD_THREAD_ID (post to existing thread), DISCORD_USE_FORUM=true (create forum post per commit)
 */

const BOT_PREFIX = '🤖';

function truncate(str, max) {
  if (!str || str.length <= max) return str || '';
  return str.slice(0, max - 3).trim() + '...';
}

function main() {
  const webhook = process.env.DISCORD_WEBHOOK;
  const prNumber = process.env.PR_NUMBER || '?';
  const prTitle = (process.env.PR_TITLE || 'No title').slice(0, 100);
  const prUrl = process.env.PR_URL || '';
  const prBranch = process.env.PR_BRANCH || '';
  const commitSha = (process.env.COMMIT_SHA || '').slice(0, 7);
  const commitMessage = (process.env.COMMIT_MESSAGE || 'No message').trim();
  const commitAuthor = process.env.COMMIT_AUTHOR || 'unknown';
  const threadId = (process.env.DISCORD_THREAD_ID || '').trim();

  if (!webhook) {
    console.error('Missing DISCORD_WEBHOOK');
    process.exit(1);
  }

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
      const body = truncate(String(c.body).replace(/\n/g, ' '), 150);
      return `**@${author}:** ${body}`;
    });

  const commitTitle = truncate(commitMessage.split('\n')[0], 80);
  const useForum = process.env.DISCORD_USE_FORUM === 'true';

  const embed = {
    title: `📌 New commit on PR #${prNumber}`,
    description: `**${prTitle}**\n\n\`\`\`${commitSha} ${commitTitle}\`\`\`\n*by @${commitAuthor}* on \`${prBranch}\``,
    color: 15844367, // gold
    url: prUrl,
    fields: [],
    footer: { text: 'Repository activity' },
    timestamp: new Date().toISOString(),
  };

  if (humanComments.length > 0) {
    embed.fields.push({
      name: '💬 Recent comments',
      value: humanComments.join('\n').slice(0, 1024),
      inline: false,
    });
  }

  embed.fields.push({
    name: '🔗 Link',
    value: `[View PR #${prNumber}](${prUrl})`,
    inline: false,
  });

  const payload = { embeds: [embed] };

  let url = webhook;
  if (threadId) {
    url = webhook.includes('?')
      ? `${webhook}&thread_id=${threadId}`
      : `${webhook}?thread_id=${threadId}`;
  } else if (useForum) {
    // Forum channel: creates a new thread per commit
    payload.thread_name = `PR #${prNumber}: ${commitTitle}`.slice(0, 100);
  }

  fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
    .then(res => {
      if (!res.ok) {
        console.error('Discord webhook failed:', res.status, res.statusText);
        process.exit(1);
      }
      console.log('Discord commit notification sent');
    })
    .catch(err => {
      console.error('Discord webhook error:', err.message || err);
      process.exit(1);
    });
}

main();
