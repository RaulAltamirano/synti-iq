/**
 * AI Agents — Router + Specialist strategy.
 *
 * Groq (Orchestrator): Summarizations, roast, diff condensation — high throughput, 131K context.
 * Gemini (Specialist): Code quality review — reserved for judgment tasks.
 *
 * See docs/adr/0001-ai-router-specialist-strategy.md
 */

const GROQ_BASE = 'https://api.groq.com/openai/v1';
const GEMINI_BASE = 'https://generativelanguage.googleapis.com/v1beta';

const DEFAULT_GROQ_MODEL = 'llama-3.3-70b-versatile';
const DEFAULT_GEMINI_MODEL = 'gemini-2.5-flash';

/** @typedef {'groq' | 'gemini'} AgentRole */

/**
 * Call Groq (orchestrator). OpenAI-compatible chat completions API.
 * @param {string} prompt
 * @param {{ model?: string; temperature?: number; maxTokens?: number }} [opts]
 * @returns {Promise<string | null>}
 */
async function callGroq(prompt, opts = {}) {
  const key = process.env.GROQ_API_KEY;
  if (!key) return null;

  const model = opts.model || process.env.GROQ_MODEL || DEFAULT_GROQ_MODEL;
  const res = await fetch(`${GROQ_BASE}/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages: [{ role: 'user', content: prompt }],
      temperature: opts.temperature ?? 0.2,
      max_completion_tokens: opts.maxTokens ?? 1024,
    }),
  });

  if (!res.ok) return null;
  const data = await res.json();
  const text = data?.choices?.[0]?.message?.content;
  return text ? String(text).trim() : null;
}

/**
 * Call Gemini (specialist). Used for code quality review.
 * @param {string} prompt
 * @param {{ model?: string; temperature?: number; maxTokens?: number }} [opts]
 * @returns {Promise<string | null>}
 */
async function callGemini(prompt, opts = {}) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return null;

  const model = opts.model || process.env.GEMINI_MODEL || DEFAULT_GEMINI_MODEL;
  const res = await fetch(`${GEMINI_BASE}/models/${model}:generateContent?key=${key}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: opts.temperature ?? 0.3,
        maxOutputTokens: opts.maxTokens ?? 8192,
      },
    }),
  });

  if (!res.ok) return null;
  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  return text ? String(text).trim() : null;
}

/** Token limits per ADR-0001 Token Efficiency Guidelines */
const TOKEN_LIMITS = {
  summarizeIssue: 256,
  summarizeFindings: 512,
  generateRoast: 256,
  condenseDiff: 4096,
  codeReview: 8192,
};

/**
 * Summarize GitHub issue in 3 short lines. Orchestrator task → Groq preferred, fallback Gemini.
 * Uses 5-element prompt: Role, Instructions, Context, Input, Expected Output.
 * @param {string} title
 * @param {string} body
 * @returns {Promise<string | null>}
 */
async function summarizeIssue(title, body) {
  const input = [title, body].filter(Boolean).join('\n\n');
  if (!input.trim()) return null;

  const prompt = `Role: You are a technical task summarizer for a NestJS/TypeScript project.

Instructions: Summarize the GitHub issue in exactly 3 short lines. Be concise. Output only the summary in English, no preamble.

Context: This is a software development task; focus on what needs to be done.

Input:
---
${input}
---

Expected Output: Plain text, 3 lines maximum, no labels or prefixes.`;

  let result = await callGroq(prompt, { maxTokens: TOKEN_LIMITS.summarizeIssue });
  if (!result && process.env.GEMINI_API_KEY) {
    result = await callGemini(prompt, { maxTokens: TOKEN_LIMITS.summarizeIssue });
  }
  return result ? result.split(/\n+/).slice(0, 3).join('\n').slice(0, 900) : null;
}

/**
 * Summarize code review findings in max 6 lines. Orchestrator task → Groq preferred, fallback Gemini.
 * Uses 5-element prompt: Role, Instructions, Context, Input, Expected Output.
 * @param {string} fullFindings
 * @param {number} [maxChars]
 * @returns {Promise<string | null>}
 */
async function summarizeFindings(fullFindings, maxChars = 1024) {
  if (!fullFindings?.trim()) return null;

  const prompt = `Role: You are a code review summarizer for technical teams.

Instructions: Summarize the findings in a maximum of 6 short lines. Keep it simple. Output only the summary in English, no preamble.

Context: These are code quality findings from an automated review (NestJS/TypeScript).

Input:
---
${fullFindings}
---

Expected Output: Plain text, 6 lines maximum, no labels or prefixes.`;

  let result = await callGroq(prompt, { maxTokens: TOKEN_LIMITS.summarizeFindings });
  if (!result && process.env.GEMINI_API_KEY) {
    result = await callGemini(prompt, { maxTokens: TOKEN_LIMITS.summarizeFindings });
  }
  if (!result) return null;

  const lines = result.split(/\n+/).slice(0, 6);
  const joined = lines.join('\n');
  return joined.slice(0, maxChars);
}

/**
 * Generate roast (burla) on PR close. Orchestrator task → Groq preferred, fallback Gemini.
 * @param {object} params
 * @param {string} params.prompt - Full prompt (built from roast-prompt.config.js template)
 * @param {number} params.maxChars
 * @param {string} params.fallback - Fallback when API fails
 * @returns {Promise<string>}
 */
async function generateRoast({ prompt, maxChars, fallback }) {
  if (!prompt?.trim()) return fallback;

  let result = await callGroq(prompt, { temperature: 0.7, maxTokens: TOKEN_LIMITS.generateRoast });
  if (!result && process.env.GEMINI_API_KEY) {
    result = await callGemini(prompt, { temperature: 0.7, maxTokens: TOKEN_LIMITS.generateRoast });
  }

  const roast = result
    ?.trim()
    .slice(0, maxChars)
    .replace(/^["']|["']$/g, '');
  return roast || fallback;
}

/**
 * Condense a large diff into structured highlights for the specialist.
 * Reduces token load on Gemini when diff exceeds threshold.
 * Prepends handoff metadata for Gemini to interpret the input.
 * @param {string} diff - Full or truncated diff
 * @param {number} [targetLines] - Approximate target lines for output
 * @returns {Promise<string | null>} Condensed diff with handoff header, or null (use original)
 */
async function condenseDiff(diff, targetLines = 800) {
  const key = process.env.GROQ_API_KEY;
  if (!key || !diff?.trim()) return null;

  const originalLines = diff.split('\n').length;

  const prompt = `Role: You are a code diff summarizer for NestJS/TypeScript projects.

Instructions: Output a condensed diff that preserves file paths and key changes. Use the same diff format (+++, ---, @@). Output ONLY the condensed diff, no preamble or markdown fences.

Context: NestJS backend with DTOs, services, controllers, validation, error handling. Preserve critical logic; remove boilerplate, imports-only changes, and repetitive blocks.

Input (PR diff):
---
\`\`\`diff
${diff}
\`\`\`
---

Expected Output: Raw diff under ~${targetLines} lines. Start with +++ line, no \`\`\` wrapper.`;

  const result = await callGroq(prompt, {
    maxTokens: TOKEN_LIMITS.condenseDiff,
    temperature: 0.1,
  });
  if (!result) return null;

  // Strip markdown code fences if present
  const stripped = result.replace(/^```(?:diff)?\s*\n?/, '').replace(/\n?```\s*$/, '');
  const condensed = stripped.trim();
  if (!condensed) return null;

  const filesCount = (condensed.match(/^\+\+\+ /gm) || []).length;

  const handoffHeader = `<!-- HANDOFF: condensed=true, originalLines=${originalLines}, files=${filesCount} -->\n\n`;
  return handoffHeader + condensed;
}

module.exports = {
  callGroq,
  callGemini,
  summarizeIssue,
  summarizeFindings,
  generateRoast,
  condenseDiff,
  TOKEN_LIMITS,
  DEFAULT_GROQ_MODEL,
  DEFAULT_GEMINI_MODEL,
};
