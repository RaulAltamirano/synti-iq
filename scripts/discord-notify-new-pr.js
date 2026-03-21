#!/usr/bin/env node
/**
 * Notifies Discord when a new PR is opened or updated.
 * Runs AFTER ai-review (even when it fails). Shows task, links, resumen de hallazgos, rating, Sonar.
 * Env: DISCORD_WEBHOOK, PR_*, ISSUE_*, GEMINI_API_KEY (optional),
 *   SUMMARY_TEXT, RATING, SONAR_BUGS, SONAR_SECURITY_HOTSPOTS, SONAR_VULNERABILITIES
 * Optional: WORKFLOW_RUN_URL (link to GitHub Actions run)
 */

const RATING_LABELS = [
  'Level: Nuclear disaster',
  'Level: Excel spreadsheet',
  'Level: Acceptable',
  'Level: Good',
  'Level: Code god',
];

async function summarizeWithGemini(title, body) {
  const key = process.env.GEMINI_API_KEY;
  if (!key || (!title && !body)) return null;

  const input = [title, body].filter(Boolean).join('\n\n');
  const prompt = `Summarize this GitHub issue/task in exactly 3 short lines. Be concise. Output only the summary, no preamble.\n\n---\n\n${input}`;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 256,
      },
    }),
  });

  if (!res.ok) return null;
  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) return null;

  const summary = text.trim().split(/\n+/).slice(0, 3).join('\n').slice(0, 900);
  return summary || null;
}

async function summarizeFindingsWithGemini(fullFindings) {
  const key = process.env.GEMINI_API_KEY;
  if (!key || !fullFindings?.trim()) return null;

  const prompt = `Summarize these code review findings in a maximum of 6 short lines. Keep it simple. Output only the summary in English, no preamble.\n\n---\n\n${fullFindings}`;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 512,
      },
    }),
  });

  if (!res.ok) return null;
  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) return null;

  const lines = text.trim().split(/\n+/).slice(0, 6);
  const joined = lines.join('\n');
  return truncateAtSentence(joined, 1024) || joined.slice(0, 1024);
}

function truncateAtSentence(text, maxLen) {
  if (!text || text.length <= maxLen) return text;
  const cut = text.slice(0, maxLen + 1);
  const lastPeriod = cut.lastIndexOf('.');
  const lastNewline = cut.lastIndexOf('\n');
  const lastBreak = Math.max(lastPeriod, lastNewline);
  if (lastBreak > maxLen * 0.5) return text.slice(0, lastBreak + 1).trim();
  const lastSpace = cut.lastIndexOf(' ');
  if (lastSpace > maxLen * 0.5) return text.slice(0, lastSpace).trim();
  return text.slice(0, maxLen).trim();
}

async function main() {
  const webhook = process.env.DISCORD_WEBHOOK;
  const prNumber = process.env.PR_NUMBER || '?';
  const prTitle = (process.env.PR_TITLE || 'No title').slice(0, 200);
  const prUrl = process.env.PR_URL || '';
  const prAuthor = process.env.PR_AUTHOR || 'author';
  const prAction = process.env.PR_ACTION || 'opened';
  const prBranch = process.env.PR_BRANCH || '';
  const issueNumber = process.env.ISSUE_NUMBER || '';
  const issueTitle = (process.env.ISSUE_TITLE || '').trim();
  const issueBody = (process.env.ISSUE_BODY || '').trim();
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
    let taskValue = null;
    try {
      taskValue = await summarizeWithGemini(issueTitle, issueBody);
    } catch (_) {
      /* ignore */
    }
    if (!taskValue) {
      taskValue = [issueTitle.slice(0, 100), issueBody.slice(0, 150)].filter(Boolean).join(' — ');
    }
    fields.push({
      name: `📋 Task #${issueNumber}`,
      value: taskValue,
      inline: false,
    });
  }

  const linkItems = [[prUrl, 'View MR']];
  if (issueUrl && issueNumber) {
    linkItems.push([issueUrl, `View requirement #${issueNumber}`]);
  }
  const links = linkItems
    .filter(([url]) => url)
    .map(([url, label]) => `[${label}](${url})`)
    .join(' • ');

  // Findings summary (max 6 lines, Gemini-generated when available), Rating, Sonar
  const rawSummary = (process.env.SUMMARY_TEXT || 'No specific findings.').trim();
  let summaryText = rawSummary;
  if (rawSummary && rawSummary !== 'No specific findings.') {
    try {
      const geminiSummary = await summarizeFindingsWithGemini(rawSummary);
      if (geminiSummary) {
        summaryText = geminiSummary;
      } else {
        summaryText = truncateAtSentence(rawSummary.replace(/\n{2,}/g, '\n'), 1024);
      }
    } catch (_) {
      summaryText = truncateAtSentence(rawSummary.replace(/\n{2,}/g, '\n'), 1024);
    }
  }
  const rating = Math.min(5, Math.max(1, parseInt(process.env.RATING || '3', 10) || 3));
  const stars = '⭐'.repeat(rating) + '☆'.repeat(5 - rating);
  const levelLabel = RATING_LABELS[rating - 1] || RATING_LABELS[2];
  const sonarBugs = process.env.SONAR_BUGS || '0';
  const sonarHotspots = process.env.SONAR_SECURITY_HOTSPOTS || '0';
  const sonarVulns = process.env.SONAR_VULNERABILITIES || '0';
  const sonarParts = [];
  if (sonarBugs !== '0') sonarParts.push(`🔴 ${sonarBugs} Bugs`);
  if (sonarHotspots !== '0') sonarParts.push(`⚠️ ${sonarHotspots} Hotspots`);
  if (sonarVulns !== '0') sonarParts.push(`🟠 ${sonarVulns} Vulns`);
  const sonarStats = sonarParts.length ? sonarParts.join(' | ') : '✅ No critical findings';

  fields.push(
    { name: '📋 Findings summary', value: summaryText, inline: false },
    { name: 'Rating', value: `${stars} (${rating}/5) - ${levelLabel}`, inline: true },
    { name: 'Sonar Stats', value: sonarStats, inline: true },
  );

  if (links) {
    fields.push({ name: '🔗 Links', value: links, inline: false });
  }

  const workflowRunUrl = (process.env.WORKFLOW_RUN_URL || '').trim();
  if (workflowRunUrl) {
    fields.push({
      name: 'Workflow',
      value: `[View run](${workflowRunUrl})`,
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
