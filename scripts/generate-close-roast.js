#!/usr/bin/env node
/**
 * Generates a roast (burla) about why the PR was closed/merged.
 * Uses Router+Specialist: Groq (orchestrator) primary, Gemini fallback. See docs/adr/0001-ai-router-specialist-strategy.md
 * Uses roast-prompt.config.js for easy customization.
 * Env: PR_AUTHOR, PR_MERGED, SONAR_BUGS, SONAR_SECURITY_HOTSPOTS, RATING, VERDICT
 * Optional: GROQ_API_KEY (primary), GEMINI_API_KEY (fallback), GEMINI_MODEL, GROQ_MODEL
 */

const { randomInt } = require('node:crypto');
const config = require('./roast-prompt.config.js');
const { generateRoast } = require('./lib/ai-agents');

async function main() {
  const author = process.env.PR_AUTHOR || 'author';
  const merged = process.env.PR_MERGED === 'true';
  const bugs = process.env.SONAR_BUGS || '0';
  const hotspots = process.env.SONAR_SECURITY_HOTSPOTS || '0';
  const rating = process.env.RATING || '3';
  const verdict = process.env.VERDICT || '';

  const action = merged ? 'mergeado' : 'cerrado/rechazado';
  const context = merged
    ? `PR fue MERGEADO. Rating ${rating}/5. Sonar: ${bugs} bugs, ${hotspots} hotspots.`
    : `PR fue CERRADO/RECHAZADO. Rating ${rating}/5. Sonar: ${bugs} bugs, ${hotspots} hotspots. Veredicto: ${verdict}`;

  const style = config.styles[randomInt(config.styles.length)];
  const prompt = config.promptTemplate
    .replace(/\{\{action\}\}/g, action)
    .replace(/\{\{context\}\}/g, context)
    .replace(/\{\{style\}\}/g, style)
    .replace(/\{\{author\}\}/g, author)
    .replace(/\{\{maxChars\}\}/g, String(config.maxChars));

  const roast = await generateRoast({
    prompt,
    maxChars: config.maxChars,
    fallback: config.fallback,
  });
  console.log(roast);
}

main();
