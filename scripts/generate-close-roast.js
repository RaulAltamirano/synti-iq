#!/usr/bin/env node
/**
 * Generates a roast (burla) about why the PR was closed/merged.
 * Uses roast-prompt.config.js for easy customization.
 * Env: GEMINI_API_KEY, PR_AUTHOR, PR_MERGED, SONAR_BUGS, SONAR_SECURITY_HOTSPOTS, RATING, VERDICT
 * Optional: GEMINI_MODEL (default: gemini-2.5-flash)
 */

const config = require('./roast-prompt.config.js');

async function main() {
  const key = process.env.GEMINI_API_KEY;
  const author = process.env.PR_AUTHOR || 'author';
  const merged = process.env.PR_MERGED === 'true';
  const bugs = process.env.SONAR_BUGS || '0';
  const hotspots = process.env.SONAR_SECURITY_HOTSPOTS || '0';
  const rating = process.env.RATING || '3';
  const verdict = process.env.VERDICT || '';

  if (!key) {
    console.log(config.fallback);
    return;
  }

  const action = merged ? 'mergeado' : 'cerrado/rechazado';
  const context = merged
    ? `PR fue MERGEADO. Rating ${rating}/5. Sonar: ${bugs} bugs, ${hotspots} hotspots.`
    : `PR fue CERRADO/RECHAZADO. Rating ${rating}/5. Sonar: ${bugs} bugs, ${hotspots} hotspots. Veredicto: ${verdict}`;

  const style = config.styles[Math.floor(Math.random() * config.styles.length)];

  const prompt = config.promptTemplate
    .replace(/\{\{action\}\}/g, action)
    .replace(/\{\{context\}\}/g, context)
    .replace(/\{\{style\}\}/g, style)
    .replace(/\{\{author\}\}/g, author)
    .replace(/\{\{maxChars\}\}/g, String(config.maxChars));

  const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 256 },
        }),
      },
    );
    if (!res.ok) {
      console.log(config.fallback);
      return;
    }
    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    const roast =
      text
        ?.trim()
        .slice(0, config.maxChars)
        .replace(/^["']|["']$/g, '') || config.fallback;
    console.log(roast);
  } catch (_) {
    console.log(config.fallback);
  }
}

main();
