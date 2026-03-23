#!/usr/bin/env node
/**
 * Shared Discord webhook utilities for notification scripts.
 * Exports: truncate, truncateAtSentence, RATING_LABELS, formatRating, formatSonarStats,
 * buildWorkflowField, validateWebhook, sendEmbed.
 */

/** Discord embed limits */
const EMBED_CHAR_LIMIT = 6000;
const FIELD_VALUE_LIMIT = 1024;
const MAX_FIELDS = 25;

/** Embed colors (decimal) */
const COLOR_MERGED = 3066993; // green
const COLOR_REJECTED = 15158332; // red
const COLOR_INFO = 3447003; // blue
const COLOR_GOLD = 15844367; // gold

/** Rating level labels */
const RATING_LABELS = [
  'Level: Nuclear disaster',
  'Level: Excel spreadsheet',
  'Level: Acceptable',
  'Level: Good',
  'Level: Code god',
];

const DEFAULT_TIMEOUT_MS = 15000;
const WEBHOOK_PREFIX = 'https://discord.com/api/webhooks/';

/**
 * Truncates a string to max length, appending "..." if truncated.
 * @param {string} str
 * @param {number} max
 * @returns {string}
 */
function truncate(str, max) {
  const s = str ?? '';
  if (s.length <= max) return s;
  return s.slice(0, max - 3).trim() + '...';
}

/**
 * Truncates text at a sentence boundary when possible.
 * @param {string} text
 * @param {number} maxLen
 * @returns {string}
 */
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

/**
 * Formats rating as stars and level label.
 * @param {number} rating - 1-5
 * @returns {{ stars: string, levelLabel: string }}
 */
function formatRating(rating) {
  const r = Math.min(5, Math.max(1, Number(rating) || 3));
  const stars = '⭐'.repeat(r) + '☆'.repeat(5 - r);
  const levelLabel = RATING_LABELS[r - 1] || RATING_LABELS[2];
  return { stars, levelLabel };
}

/**
 * Formats Sonar stats for embed display.
 * @param {string} bugs
 * @param {string} hotspots
 * @param {string} vulns
 * @param {string} [fallback] - when all are 0
 * @returns {string}
 */
function formatSonarStats(bugs, hotspots, vulns, fallback = '✅ No critical findings') {
  const parts = [];
  if (bugs !== '0') parts.push(`🔴 ${bugs} Bugs`);
  if (hotspots !== '0') parts.push(`⚠️ ${hotspots} Security Hotspots`);
  if (vulns !== '0') parts.push(`🟠 ${vulns} Vulnerabilities`);
  return parts.length ? parts.join(' | ') : fallback;
}

/**
 * Builds a Workflow field for embed.
 * @param {string} url
 * @param {string} [duration] - optional duration (e.g. "3m 42s")
 * @returns {{ name: string, value: string, inline: boolean } | null}
 */
function buildWorkflowField(url, duration) {
  const u = (url || '').trim();
  if (!u) return null;
  const parts = [`[View run](${u})`];
  if (duration && duration.trim()) parts.push(` • ${duration.trim()}`);
  return {
    name: 'Workflow',
    value: parts.join(''),
    inline: false,
  };
}

/**
 * Validates webhook URL format. Exits process with 1 if invalid.
 * @param {string} webhook
 * @param {string} [context] - optional context for error message
 */
function validateWebhook(webhook, context) {
  if (!webhook || webhook.trim() === '') {
    console.error(
      context || 'Missing DISCORD_WEBHOOK. Check that the secret is set in Settings > Secrets.',
    );
    process.exit(1);
  }
  if (!webhook.trim().startsWith(WEBHOOK_PREFIX)) {
    console.error(
      `Invalid DISCORD_WEBHOOK: URL must start with ${WEBHOOK_PREFIX}. Check webhook configuration.`,
    );
    process.exit(1);
  }
}

/**
 * Sanitizes text for Discord embed (escape backticks to avoid breaking code blocks).
 * @param {string} text
 * @returns {string}
 */
function sanitizeForEmbed(text) {
  if (!text || typeof text !== 'string') return '';
  return text.replace(/`/g, "'");
}

/**
 * Sends an embed to a Discord webhook with timeout and optional retry on 429.
 * @param {string} webhookUrl
 * @param {object} embed
 * @param {object} [options]
 * @param {number} [options.timeoutMs]
 * @param {object} [options.extraPayload] - e.g. { thread_name: '...' }
 * @param {string} [options.threadId]
 * @param {boolean} [options.wait] - if true, returns the created Message (channel_id = thread id for forum posts)
 * @returns {Promise<object|void>} - Message object when wait=true; otherwise void
 */
async function sendEmbed(webhookUrl, embed, options = {}) {
  const { timeoutMs = DEFAULT_TIMEOUT_MS, extraPayload = {}, threadId, wait = false } = options;
  let url = webhookUrl;
  const params = [];
  if (threadId) params.push(`thread_id=${threadId}`);
  if (wait) params.push('wait=true');
  if (params.length > 0) {
    const qs = params.join('&');
    url = webhookUrl.includes('?') ? `${webhookUrl}&${qs}` : `${webhookUrl}?${qs}`;
  }
  const payload = { embeds: [embed], ...extraPayload };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    let res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    if (res.status === 429) {
      const retryAfter = res.headers.get('Retry-After');
      const delayMs = retryAfter ? Math.min(parseInt(retryAfter, 10) * 1000, 60000) : 5000;
      await new Promise(r => setTimeout(r, delayMs));
      res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
    }

    clearTimeout(timeoutId);

    if (!res.ok) {
      const body = await res.text();
      console.error('Discord webhook failed:', res.status, res.statusText);
      console.error('Response:', body.slice(0, 500));
      process.exit(1);
    }

    if (wait) {
      return /** @type {{ channel_id?: string }} */ (await res.json());
    }
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      console.error('Discord webhook timeout after', timeoutMs, 'ms');
    } else {
      console.error('Discord webhook error:', err.message || err);
    }
    process.exit(1);
  }
}

module.exports = {
  EMBED_CHAR_LIMIT,
  FIELD_VALUE_LIMIT,
  MAX_FIELDS,
  COLOR_MERGED,
  COLOR_REJECTED,
  COLOR_INFO,
  COLOR_GOLD,
  RATING_LABELS,
  truncate,
  truncateAtSentence,
  formatRating,
  formatSonarStats,
  buildWorkflowField,
  validateWebhook,
  sanitizeForEmbed,
  sendEmbed,
};
