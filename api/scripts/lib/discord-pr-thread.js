#!/usr/bin/env node
/**
 * Resolve or persist Discord thread ID per PR.
 * Uses PR comments to store <!-- DISCORD_THREAD_ID:123 --> so all notifications
 * (CI, AI review, commits, closed) go to the same thread.
 *
 * Requires: DISCORD_USE_FORUM=true (forum channel) to create threads via webhook.
 * Env: GITHUB_TOKEN (or GH_TOKEN), GITHUB_REPOSITORY, PR_NUMBER
 */

const THREAD_ID_RE = /<!--\s*DISCORD_THREAD_ID:(\d+)\s*-->/;

/**
 * Fetches PR comments and extracts the stored Discord thread ID.
 * @param {string} token - GitHub token
 * @param {string} repo - "owner/repo"
 * @param {number} prNumber - PR number
 * @returns {Promise<string|null>}
 */
async function getPrThreadId(token, repo, prNumber) {
  if (!token || !repo || !prNumber) return null;
  const [owner, repoNamespace] = repo.split('/');
  if (!owner || !repoNamespace) return null;

  const url = `https://api.github.com/repos/${owner}/${repoNamespace}/issues/${prNumber}/comments`;
  const res = await fetch(url, {
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${token}`,
      'X-GitHub-Api-Version': '2022-11-28',
    },
  });
  if (!res.ok) return null;

  const comments = await res.json();
  if (!Array.isArray(comments)) return null;

  for (let i = comments.length - 1; i >= 0; i--) {
    const body = comments[i]?.body;
    if (typeof body !== 'string') continue;
    const m = body.match(THREAD_ID_RE);
    if (m) return m[1];
  }
  return null;
}

/**
 * Posts a PR comment storing the Discord thread ID.
 * @param {string} token
 * @param {string} repo - "owner/repo"
 * @param {number} prNumber
 * @param {string} threadId
 * @param {string} [prUrl] - optional, for link in comment
 * @returns {Promise<boolean>}
 */
async function savePrThreadId(token, repo, prNumber, threadId, prUrl) {
  if (!token || !repo || !prNumber || !threadId) return false;
  const [owner, repoNamespace] = repo.split('/');
  if (!owner || !repoNamespace) return false;

  const body = prUrl
    ? `🔗 [Discord thread for PR #${prNumber}](${prUrl}) <!-- DISCORD_THREAD_ID:${threadId} -->`
    : `<!-- DISCORD_THREAD_ID:${threadId} -->`;

  const url = `https://api.github.com/repos/${owner}/${repoNamespace}/issues/${prNumber}/comments`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${token}`,
      'X-GitHub-Api-Version': '2022-11-28',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ body }),
  });
  return res.ok;
}

module.exports = {
  getPrThreadId,
  savePrThreadId,
  THREAD_ID_RE,
};
