#!/usr/bin/env node
/**
 * Discord Notify Script — Sends PR review summary to Discord webhook as embed card.
 * Run from project root. Env: DISCORD_WEBHOOK, PR_NUMBER, PR_MERGED, PR_URL, PR_AUTHOR,
 *   SONAR_BUGS, SONAR_SECURITY_HOTSPOTS, ROAST_TEXT, ROAST_FALLBACK, RATING
 */

const RATING_LABELS = [
  'Level: Nuclear disaster',
  'Level: Excel spreadsheet',
  'Level: Acceptable',
  'Level: Good',
  'Level: Code god',
];

async function main() {
  const webhook = process.env.DISCORD_WEBHOOK;
  const prNumber = process.env.PR_NUMBER || '?';
  const prMerged = process.env.PR_MERGED === 'true';
  const prUrl = process.env.PR_URL || '';
  const prAuthor = process.env.PR_AUTHOR || 'author';
  const sonarBugs = process.env.SONAR_BUGS || '0';
  const sonarHotspots = process.env.SONAR_SECURITY_HOTSPOTS || '0';
  const sonarVulns = process.env.SONAR_VULNERABILITIES || '0';
  const rawRoast = process.env.ROAST_TEXT || '';
  const fallback = process.env.ROAST_FALLBACK || 'Revisión completada.';
  const generic = 'Revisión completada.';
  const roastText =
    rawRoast && rawRoast.trim() && rawRoast.trim() !== generic
      ? rawRoast.trim()
      : fallback.trim() || generic;
  const rating = Math.min(5, Math.max(1, parseInt(process.env.RATING || '3', 10) || 3));

  if (!webhook || webhook.trim() === '') {
    console.error('Missing DISCORD_WEBHOOK. Check that the secret is set in Settings > Secrets.');
    process.exit(1);
  }

  // Discord field value limit: 1024 chars
  const safeRoast = String(roastText)
    .slice(0, 500)
    .replace(/[\n\r]+/g, ' ');

  const statusText = prMerged ? '🟢 MERGED' : '🔴 REJECTED / CLOSED';
  const color = prMerged ? 3066993 : 15158332; // green : red
  const stars = '⭐'.repeat(rating) + '☆'.repeat(5 - rating);
  const levelLabel = RATING_LABELS[rating - 1] || RATING_LABELS[2];

  const sonarStats = [
    sonarBugs !== '0' && `🔴 ${sonarBugs} Bugs`,
    sonarHotspots !== '0' && `⚠️ ${sonarHotspots} Security Hotspots`,
    sonarVulns !== '0' && `🟠 ${sonarVulns} Vulnerabilities`,
  ]
    .filter(Boolean)
    .join(' | ');

  const embed = {
    title: `🚩 Synti-IQ Review: Pull Request #${prNumber}`,
    description: `**Status:** ${statusText}\n\n> "${safeRoast}"\n— *@${prAuthor}*`,
    color,
    fields: [
      {
        name: 'Rating',
        value: `${stars} (${rating}/5) - ${levelLabel}`,
        inline: true,
      },
      {
        name: 'Sonar Stats',
        value: sonarStats || '✅ Sin hallazgos críticos',
        inline: true,
      },
    ],
    footer: {
      text: 'Repository activity',
    },
    timestamp: new Date().toISOString(),
  };

  const payload = { embeds: [embed] };

  try {
    const res = await fetch(webhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const body = await res.text();
      console.error('Discord webhook failed:', res.status, res.statusText);
      console.error('Response:', body.slice(0, 200));
      process.exit(1);
    }
    console.log('Discord notification sent');
  } catch (err) {
    console.error('Discord webhook error:', err.message || err);
    process.exit(1);
  }
}

main();
