#!/usr/bin/env node
/**
 * Notifies Discord when a new PR is opened or updated.
 * Shows brief task description from linked issue (branch like 20-task-name).
 * Env: DISCORD_WEBHOOK, PR_*, ISSUE_*
 */

async function main() {
  const webhook = process.env.DISCORD_WEBHOOK;
  const prNumber = process.env.PR_NUMBER || '?';
  const prTitle = (process.env.PR_TITLE || 'No title').slice(0, 200);
  const prUrl = process.env.PR_URL || '';
  const prAuthor = process.env.PR_AUTHOR || 'author';
  const prAction = process.env.PR_ACTION || 'opened';
  const prBranch = process.env.PR_BRANCH || '';
  const issueNumber = process.env.ISSUE_NUMBER || '';
  const issueTitle = (process.env.ISSUE_TITLE || '').slice(0, 100);
  const issueBody = (process.env.ISSUE_BODY || '').slice(0, 80);
  const issueUrl = process.env.ISSUE_URL || '';

  if (!webhook) {
    console.error('Missing DISCORD_WEBHOOK');
    process.exit(1);
  }

  const status = prAction === 'synchronize' ? 'PR updated' : 'New PR';
  let description = `**${prTitle}**\n\nBy: @${prAuthor}`;
  if (prBranch) {
    description += ` • Branch: \`${prBranch}\``;
  }

  const fields = [];
  if (issueNumber && (issueTitle || issueBody)) {
    const taskValue = [issueTitle, issueBody].filter(Boolean).join(' — ');
    fields.push({
      name: `📋 Task #${issueNumber}`,
      value: taskValue + (issueUrl ? `\n\n[View in GitHub](${issueUrl})` : ''),
      inline: false,
    });
  }

  const embed = {
    title: `🚩 Synti-IQ: ${status} #${prNumber}`,
    description,
    color: 3447003,
    url: prUrl,
    footer: { text: 'Review on GitHub' },
    timestamp: new Date().toISOString(),
    ...(fields.length > 0 && { fields }),
  };

  const res = await fetch(webhook, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ embeds: [embed] }),
  });

  if (!res.ok) {
    console.error('Discord webhook failed:', res.status);
    process.exit(1);
  }
  console.log('Discord notification sent');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
