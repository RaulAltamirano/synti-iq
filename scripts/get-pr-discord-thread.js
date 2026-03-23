#!/usr/bin/env node
/**
 * Outputs the Discord thread ID for a PR (from PR comments) to stdout.
 * Used by CI/workflows to pass thread ID to Discord notify scripts.
 * Exits 0; outputs nothing if not found.
 * Env: GITHUB_TOKEN, GITHUB_REPOSITORY, PR_NUMBER
 */
const { getPrThreadId } = require('./lib/discord-pr-thread');

async function main() {
  const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
  const repo = process.env.GITHUB_REPOSITORY;
  const prNum = parseInt(process.env.PR_NUMBER || '0', 10);
  if (!token || !repo || !prNum) process.exit(0);

  const id = await getPrThreadId(token, repo, prNum);
  if (id) console.log(id);
}

main().catch(() => process.exit(0));
