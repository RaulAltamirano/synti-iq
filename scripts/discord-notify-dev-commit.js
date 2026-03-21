#!/usr/bin/env node
/**
 * Notifies Discord when a commit is pushed directly to the dev branch.
 * Env: DISCORD_WEBHOOK, COMMIT_*, COMMIT_FILES
 * Optional: DISCORD_THREAD_ID, DISCORD_USE_FORUM=true, WORKFLOW_RUN_URL (link to GitHub Actions run)
 * Title/message: max 3 lines (Discord embed standard)
 */

function truncate(str, max) {
  const s = str ?? '';
  if (s.length <= max) return s;
  return s.slice(0, max - 3).trim() + '...';
}

/** Takes full commit message, returns first 3 lines (max ~250 chars for embed safety) */
function commitTitleMax3Lines(msg) {
  if (!msg?.trim()) return 'No message';
  const lines = msg.trim().split(/\r?\n/).slice(0, 3);
  const joined = lines.join('\n');
  return truncate(joined, 250);
}

function main() {
  const webhook = process.env.DISCORD_WEBHOOK;
  const commitSha = (process.env.COMMIT_SHA || '').slice(0, 7);
  const commitMessage = (process.env.COMMIT_MESSAGE || '').trim();
  const commitAuthor = process.env.COMMIT_AUTHOR || 'unknown';
  const commitUrl = process.env.COMMIT_URL || '';
  const commitFiles = (process.env.COMMIT_FILES || '').trim();
  const threadId = (process.env.DISCORD_THREAD_ID || '').trim();

  if (!webhook) {
    console.error('Missing DISCORD_WEBHOOK');
    process.exit(1);
  }

  const titleLines = commitTitleMax3Lines(commitMessage);

  const embed = {
    title: `📌 Commit en \`dev\` — \`${commitSha}\``,
    description: `\`\`\`\n${titleLines}\n\`\`\`\n*by @${commitAuthor}*`,
    color: 3447003, // blue (distinct from PR gold)
    url: commitUrl || undefined,
    fields: [],
    footer: { text: 'Repository activity' },
    timestamp: new Date().toISOString(),
  };

  if (commitFiles && commitFiles.length > 0) {
    const filesDisplay = truncate(commitFiles.replaceAll(',', ', '), 500);
    embed.fields.push({
      name: '📁 Archivos',
      value: `\`${filesDisplay}\``,
      inline: false,
    });
  }

  if (commitUrl) {
    embed.fields.push({
      name: '🔗 Link',
      value: `[Ver commit](${commitUrl})`,
      inline: false,
    });
  }

  const workflowRunUrl = (process.env.WORKFLOW_RUN_URL || '').trim();
  if (workflowRunUrl) {
    embed.fields.push({
      name: 'Workflow',
      value: `[View run](${workflowRunUrl})`,
      inline: false,
    });
  }

  const payload = { embeds: [embed] };

  let url = webhook;
  if (threadId) {
    url = webhook.includes('?')
      ? `${webhook}&thread_id=${threadId}`
      : `${webhook}?thread_id=${threadId}`;
  } else if (process.env.DISCORD_USE_FORUM === 'true') {
    payload.thread_name = `dev: ${titleLines.split('\n')[0]}`.slice(0, 100);
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
      console.log('Discord dev commit notification sent');
    })
    .catch(err => {
      console.error('Discord webhook error:', err.message || err);
      process.exit(1);
    });
}

main();
