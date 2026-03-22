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
    try {
      const { createAppAuth } = require('@octokit/auth-app');
      const { Octokit } = require('octokit');

      const key = String(privateKey).replace(/\\n/g, '\n');
      const auth = createAppAuth({
        appId: Number(appId),
        privateKey: key,
        installationId: Number(installationId),
      });
      const { token } = await auth({ type: 'installation' });
      console.log('PR Review: Using GitHub App for comments and approval');
      return { token, octokit: new Octokit({ auth: token }) };
    } catch (err) {
      console.warn(
        'GitHub App auth failed:',
        err.message,
        '- falling back to GITHUB_TOKEN (comments will show as github-actions)',
      );
    }
  }

  const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
  if (!token) {
    throw new Error(
      'Missing GitHub auth: set GH_APP_ID/GH_INSTALLATION_ID/GH_APP_PRIVATE_KEY or GITHUB_TOKEN',
    );
  }

  const { Octokit } = require('octokit');
  console.log('PR Review: Using GITHUB_TOKEN (comments will show as github-actions[bot])');
  return { token, octokit: new Octokit({ auth: token }) };
}

/** @deprecated Use getAuth() instead */
async function getOctokit() {
  const { octokit } = await getAuth();
  return octokit;
}

/**
 * Get the current authenticated user's login (e.g. "github-actions[bot]" or "my-app[bot]").
 * Returns null when the API is not accessible (e.g. GitHub App installation tokens).
 * @param {Octokit} octokit
 * @returns {Promise<string|null>}
 */
async function getAuthenticatedLogin(octokit) {
  try {
    const { data } = await octokit.rest.users.getAuthenticated();
    return data.login;
  } catch (err) {
    if (err?.status === 403 || err?.response?.data?.message?.includes('integration')) {
      return null;
    }
    throw err;
  }
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
  getAuthenticatedLogin,
  getOctokit,
  listComments,
  deleteComment,
  createComment,
  createReview,
};
