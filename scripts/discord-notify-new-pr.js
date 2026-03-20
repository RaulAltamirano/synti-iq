#!/usr/bin/env node
/**
 * Notifies Discord when a new PR is opened or updated.
 * Env: DISCORD_WEBHOOK, PR_NUMBER, PR_TITLE, PR_URL, PR_AUTHOR, PR_ACTION
 */

async function main() {
  const webhook = process.env.DISCORD_WEBHOOK;
  const prNumber = process.env.PR_NUMBER || '?';
  const prTitle = (process.env.PR_TITLE || 'Sin título').slice(0, 200);
  const prUrl = process.env.PR_URL || '';
  const prAuthor = process.env.PR_AUTHOR || 'author';
  const prAction = process.env.PR_ACTION || 'opened';

  if (!webhook) {
    console.error('Missing DISCORD_WEBHOOK');
    process.exit(1);
  }

  const status = prAction === 'synchronize' ? 'PR actualizado' : 'Nuevo PR';
  const embed = {
    title: `🚩 Synti-IQ: ${status} #${prNumber}`,
    description: `**${prTitle}**\n\nPor: @${prAuthor}`,
    color: 3447003,
    url: prUrl,
    footer: { text: 'Revisar en GitHub' },
    timestamp: new Date().toISOString(),
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
