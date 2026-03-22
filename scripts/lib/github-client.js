/**
 * GitHub client — Uses Octokit with GitHub App (bot) when configured, else GITHUB_TOKEN.
 * For CI: GH_APP_ID, GH_INSTALLATION_ID, GH_APP_PRIVATE_KEY (secrets cannot start with GITHUB_).
 * Fallback: GITHUB_TOKEN (Actions default or manual).
 *
 * @see scripts/create-github-issue.js
 */

/** @typedef {import('octokit').Octokit} Octokit */

/**
 * Returns auth token (for fetch) or Octokit. Prefers GitHub App.
 * @returns {Promise<{ token: string; octokit: Octokit }>}
 */
async function getAuth() {
  const appId = process.env.GH_APP_ID || process.env.GITHUB_APP_ID;
  const installationId = process.env.GH_INSTALLATION_ID || process.env.GITHUB_INSTALLATION_ID;
  const privateKey = process.env.GH_APP_PRIVATE_KEY || process.env.GITHUB_PRIVATE_KEY;

  if (appId && installationId && privateKey) {
    const { createAppAuth } = require('@octokit/auth-app');
    const { Octokit } = require('octokit');

    const key = String(privateKey).replace(/\\n/g, '\n');
    const auth = createAppAuth({
      appId: Number(appId),
      privateKey: key,
      installationId: Number(installationId),
    });
    const { token } = await auth({ type: 'installation' });
    return { token, octokit: new Octokit({ auth: token }) };
  }

  const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
  if (!token) {
    throw new Error(
      'Missing GitHub auth: set GH_APP_ID/GH_INSTALLATION_ID/GH_APP_PRIVATE_KEY or GITHUB_TOKEN',
    );
  }

  const { Octokit } = require('octokit');
  return { token, octokit: new Octokit({ auth: token }) };
}

/** @deprecated Use getAuth() instead */
async function getOctokit() {
  const { octokit } = await getAuth();
  return octokit;
}

/**
 * List issue comments (PR comments).
 * @param {Octokit} octokit
 * @param {{ owner: string; repo: string; issueNumber: number }} params
 */
async function listComments(octokit, { owner, repo, issueNumber }) {
  const { data } = await octokit.rest.issues.listComments({
    owner,
    repo,
    issue_number: issueNumber,
  });
  return data;
}

/**
 * Delete an issue comment.
 * @param {Octokit} octokit
 * @param {{ owner: string; repo: string; commentId: number }} params
 */
async function deleteComment(octokit, { owner, repo, commentId }) {
  await octokit.rest.issues.deleteComment({
    owner,
    repo,
    comment_id: commentId,
  });
}

/**
 * Create an issue comment (PR comment).
 * @param {Octokit} octokit
 * @param {{ owner: string; repo: string; issueNumber: number; body: string }} params
 */
async function createComment(octokit, { owner, repo, issueNumber, body }) {
  const { data } = await octokit.rest.issues.createComment({
    owner,
    repo,
    issue_number: issueNumber,
    body,
  });
  return data;
}

/**
 * Create a pull request review (approve, request changes, or comment).
 * @param {Octokit} octokit
 * @param {{ owner: string; repo: string; pullNumber: number; event: 'APPROVE'|'REQUEST_CHANGES'|'COMMENT'; body?: string }} params
 */
async function createReview(octokit, { owner, repo, pullNumber, event, body }) {
  const { data } = await octokit.rest.pulls.createReview({
    owner,
    repo,
    pull_number: pullNumber,
    event,
    body: body || undefined,
  });
  return data;
}

module.exports = {
  getAuth,
  getOctokit,
  listComments,
  deleteComment,
  createComment,
  createReview,
};
