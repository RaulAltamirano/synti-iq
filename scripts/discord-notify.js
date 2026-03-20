#!/usr/bin/env node
/**
 * Discord Notify Script — Sends PR review summary to Discord webhook as embed card.
 * Run from project root. Env: DISCORD_WEBHOOK, PR_NUMBER, PR_MERGED, PR_URL, PR_AUTHOR,
 *   SONAR_BUGS, SONAR_SECURITY_HOTSPOTS, ROAST_TEXT, RATING
 */

const RATING_LABELS = [
  'Nivel: Desastre nuclear',
  'Nivel: Tabla de Excel',
  'Nivel: Aceptable',
  'Nivel: Bueno',
  'Nivel: Dios del código',
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
  const roastText = process.env.ROAST_TEXT || 'No roast disponible.';
  const rating = Math.min(5, Math.max(1, parseInt(process.env.RATING || '3', 10) || 3));

  if (!webhook) {
    console.error('Missing DISCORD_WEBHOOK');
    process.exit(1);
  }

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
    description: `**Status:** ${statusText}`,
    color,
    fields: [
      {
        name: 'IA Roast',
        value: `> "${roastText}"\n— *@${prAuthor}*`,
        inline: false,
      },
      {
        name: 'Calificación',
        value: `${stars} (${rating}/5) - ${levelLabel}`,
        inline: true,
      },
      {
        name: 'Sonar Stats',
        value: sonarStats || '✅ Sin hallazgos críticos',
        inline: true,
      },
    ],
    url: prUrl,
    footer: {
      text: 'Revisar MR en GitHub',
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
      console.error('Discord webhook failed:', res.status, res.statusText);
      process.exit(1);
    }
    console.log('Discord notification sent');
  } catch (err) {
    console.error('Discord webhook error:', err);
    process.exit(1);
  }
}

main();
