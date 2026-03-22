#!/usr/bin/env node
/**
 * PR Review Script — Router + Specialist strategy (see docs/adr/0001-ai-router-specialist-strategy.md).
 * Groq (orchestrator): Condenses large diffs to reduce Gemini token load.
 * Gemini (specialist): Code quality review.
 *
 * Comments: Uses Octokit with GitHub App (GH_APP_ID, GH_INSTALLATION_ID, GH_APP_PRIVATE_KEY) when set;
 * otherwise GITHUB_TOKEN. Bot identity comes from App when configured.
 *
 * Run from project root in GitHub Actions. Requires: GITHUB_REPOSITORY, GITHUB_EVENT_PATH, GEMINI_API_KEY
 * GitHub auth: GITHUB_TOKEN (default) or GH_APP_ID + GH_INSTALLATION_ID + GH_APP_PRIVATE_KEY
 * Optional: GROQ_API_KEY, SONAR_TOKEN, SONAR_PROJECT
 */

const fs = require('fs');
const path = require('path');
const { callGemini, condenseDiff, TOKEN_LIMITS } = require('./lib/ai-agents');
const {
  getAuth,
  listComments,
  deleteComment,
  createComment,
  createReview,
} = require('./lib/github-client');

const MAX_DIFF_LINES = 2500;
const MAX_DIFF_BYTES = 60 * 1024;
const BOT_COMMENT_PREFIX = '🤖 AI Technical Assistant - Review';

async function main() {
  const repo = process.env.GITHUB_REPOSITORY;
  const geminiKey = process.env.GEMINI_API_KEY;
  const eventPath = process.env.GITHUB_EVENT_PATH;

  const missing = [];
  if (!repo) missing.push('GITHUB_REPOSITORY');
  if (!geminiKey) missing.push('GEMINI_API_KEY');
  if (!eventPath) missing.push('GITHUB_EVENT_PATH');

  const hasToken = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
  const hasApp =
    (process.env.GH_APP_ID || process.env.GITHUB_APP_ID) &&
    (process.env.GH_INSTALLATION_ID || process.env.GITHUB_INSTALLATION_ID) &&
    (process.env.GH_APP_PRIVATE_KEY || process.env.GITHUB_PRIVATE_KEY);
  if (!hasToken && !hasApp) missing.push('GITHUB_TOKEN or GH_APP_*');

  if (missing.length > 0) {
    console.error('Missing required env:', missing.join(', '));
    if (missing.includes('GEMINI_API_KEY')) {
      console.error(
        'Tip: GEMINI_API_KEY is a secret. PRs from forks do not receive secrets. Ensure the PR is from a branch in the same repo.',
      );
    }
    process.exit(1);
  }

  const { token, octokit } = await getAuth();

  const event = JSON.parse(fs.readFileSync(eventPath, 'utf8'));
  const pr = event.pull_request;
  if (!pr) {
    console.error('No pull_request in event');
    process.exit(1);
  }

  const prNumber = pr.number;
  const prAuthor = pr.user?.login || 'author';
  const [owner, repoName] = repo.split('/');
  const apiBase = 'https://api.github.com';

  // 0. Fetch SonarCloud metrics (optional)
  let sonarStats = '';
  const sonarToken = process.env.SONAR_TOKEN;
  const sonarProject = process.env.SONAR_PROJECT || 'RaulAltamirano_synti-iq';
  if (sonarToken) {
    try {
      const sonarRes = await fetch(
        `https://sonarcloud.io/api/measures/component?component=${sonarProject}&metricKeys=bugs,security_hotspots,vulnerabilities`,
        { headers: { Authorization: `Bearer ${sonarToken}` } },
      );
      if (sonarRes.ok) {
        const data = await sonarRes.json();
        const getVal = m => data?.component?.measures?.find(x => x.metric === m)?.value ?? '0';
        const bugs = getVal('bugs');
        const hotspots = getVal('security_hotspots');
        const vulns = getVal('vulnerabilities');
        const parts = [];
        if (bugs !== '0') parts.push(`🔴 ${bugs} Bugs`);
        if (hotspots !== '0') parts.push(`⚠️ ${hotspots} Hotspots`);
        if (vulns !== '0') parts.push(`🟠 ${vulns} Vulns`);
        sonarStats = parts.length ? parts.join(' | ') : '✅ No critical findings';
      }
    } catch (_) {
      /* ignore */
    }
  }

  // 1. Get PR diff
  const diffRes = await fetch(`${apiBase}/repos/${owner}/${repoName}/pulls/${prNumber}`, {
    headers: {
      Accept: 'application/vnd.github.diff',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!diffRes.ok) {
    console.error('Failed to fetch diff:', diffRes.status, await diffRes.text());
    process.exit(1);
  }

  let diff = await diffRes.text();
  const originalLength = diff.length;
  const lines = diff.split('\n');

  if (lines.length > MAX_DIFF_LINES || diff.length > MAX_DIFF_BYTES) {
    diff = lines.slice(0, MAX_DIFF_LINES).join('\n');
    diff += `\n\n... [Diff truncated: original ${lines.length} lines, ${originalLength} bytes]`;
  }

  if (!diff.trim()) {
    diff = '(No code changes in diff)';
  }

  // 1b. Condense large diff with Groq (orchestrator) to reduce Gemini token load
  const DIFF_CONDENSE_THRESHOLD = 1200;
  if (lines.length >= DIFF_CONDENSE_THRESHOLD && process.env.GROQ_API_KEY) {
    const condensed = await condenseDiff(diff, 800);
    if (condensed) {
      diff = condensed + `\n\n... [Diff condensed by Groq: original ${lines.length} lines]`;
    }
  }

  // 2. Load context files with smart truncation
  const root = path.resolve(__dirname, '..');
  const CONTEXT_LIMITS = {
    'AGENTS.md': 5000,
    'docs/CONVENTIONS.md': 5000,
    'DEFINITION_OF_DONE.md': 2500,
    'docs/prompts/code-review.md': Infinity,
    'docs/QUALITY_METRICS.md': 1500,
    'docs/prompts/fix-quality.md': 2000,
    'docs/prompts/pre-pr-review.md': 1500,
  };

  const codeReviewPrompt = readFile(root, 'docs/prompts/code-review.md');
  const agentsMd = readFile(root, 'AGENTS.md');
  const conventionsMd = readFile(root, 'docs/CONVENTIONS.md');
  const definitionOfDone = readFile(root, 'DEFINITION_OF_DONE.md');
  const qualityMetrics = readFile(root, 'docs/QUALITY_METRICS.md');
  const fixQuality = readFile(root, 'docs/prompts/fix-quality.md');
  const prePrReview = readFile(root, 'docs/prompts/pre-pr-review.md');

  const truncate = (text, limit) =>
    typeof limit === 'number' && limit < Infinity ? text.slice(0, limit) : text;

  const context = `
## Project Context (internalize before reviewing)

### Code Review Prompt
${codeReviewPrompt}

### AGENTS.md (excerpt)
${truncate(agentsMd, CONTEXT_LIMITS['AGENTS.md'])}

### CONVENTIONS.md (excerpt)
${truncate(conventionsMd, CONTEXT_LIMITS['docs/CONVENTIONS.md'])}

### Definition of Done
${truncate(definitionOfDone, CONTEXT_LIMITS['DEFINITION_OF_DONE.md'])}

### Quality Metrics
${truncate(qualityMetrics, CONTEXT_LIMITS['docs/QUALITY_METRICS.md'])}

### Fix Quality (reference)
${truncate(fixQuality, CONTEXT_LIMITS['docs/prompts/fix-quality.md'])}

### Pre-PR Verification (reference)
${truncate(prePrReview, CONTEXT_LIMITS['docs/prompts/pre-pr-review.md'])}
`;

  const userPrompt = `
## Task

Review this PR diff against project standards. Output professional feedback: clear, actionable, constructive. Target <2500 chars. Tone: helpful peer review.

**IA Roast:** "[One light sarcastic one-liner. Mention @${prAuthor}. Max 80 chars.]"

**Convention Analysis:**
Format each finding as:
- \`✓ Category\` — brief note when PASS (what was done well)
- \`✗ Category\` — file:line — what to fix, reference (AGENTS.md/CONVENTIONS.md)
- Omit N/A categories. One line per category that applies. Be specific for FAILs; concise for PASSes.

**Security (SonarCloud):** One line. If issues: what to address. If none: "No issues in diff."

**Verdict:** Start with ✅ Approved or ❌ Changes Required. Follow with one sentence: summary of strengths or key action items.

**Rating:** [1-5]/5

IMPORTANT: Professional tone. Acknowledge good work on PASS. For FAIL, be specific and cite docs. English only.

---

## PR Diff

\`\`\`diff
${diff}
\`\`\`
`;

  // 3. Call Gemini (specialist) for code quality review
  const fullPrompt = context + '\n\n' + userPrompt;
  const textPart = await callGemini(fullPrompt, {
    temperature: 0.3,
    maxTokens: TOKEN_LIMITS.codeReview,
  });

  if (!textPart) {
    console.error('Gemini API error: no response. Check GEMINI_API_KEY and rate limits.');
    process.exit(1);
  }

  let parsed = parseGeminiResponse(textPart);

  // GitHub: professional review format. Verdict first, then findings. Hidden blocks for Discord.
  const sections = [
    ['Verdict', parsed.verdict],
    ['Findings', parsed.conventionAnalysis],
    ['Security', parsed.security],
  ];
  if (sonarStats) {
    sections.push(['SonarCloud', sonarStats]);
  }
  sections.push(['Rating', parsed.rating + '/5']);
  const githubComment = [
    BOT_COMMENT_PREFIX,
    '',
    ...sections.flatMap(([title, body]) => [`**${title}**`, body, '']),
    `<!-- DISCORD_ROAST:${String(parsed.roast).replace(/-->/g, '')} -->`,
    `<!-- DISCORD_RATING:${parsed.rating} -->`,
    `<!-- DISCORD_VERDICT:${String(parsed.verdict).replace(/-->/g, '')} -->`,
    `<!-- DISCORD_SUMMARY:${[parsed.conventionAnalysis, parsed.security, parsed.verdict].join('\n---\n').replace(/-->/g, '')} -->`,
  ].join('\n');

  // 4. Delete previous bot comments (Octokit)
  const comments = await listComments(octokit, {
    owner,
    repo: repoName,
    issueNumber: prNumber,
  });
  for (const c of comments) {
    if (c.body && c.body.startsWith(BOT_COMMENT_PREFIX)) {
      await deleteComment(octokit, { owner, repo: repoName, commentId: c.id });
    }
  }

  // 5. Post new comment (Octokit — bot identity when GH_APP_* set)
  await createComment(octokit, {
    owner,
    repo: repoName,
    issueNumber: prNumber,
    body: githubComment,
  });

  // 6. Approve PR when verdict passes (Octokit can approve; branch protection may still require manual merge)
  const isApproved = /✅\s*Approved|Approved\s*[.—]|^Approved\b/i.test(parsed.verdict);
  if (isApproved) {
    try {
      await createReview(octokit, {
        owner,
        repo: repoName,
        pullNumber: prNumber,
        event: 'APPROVE',
        body: '🤖 AI Technical Assistant — Review passed. See comment above for details.',
      });
      console.log('PR approved by bot');
    } catch (err) {
      console.warn(
        'Could not approve PR (check token permissions: pull_requests write):',
        err.message,
      );
    }
  }

  console.log('PR review comment posted successfully');
}

/**
 * Parses Gemini response into structured review output.
 * @param {string} text - Raw Gemini response text
 * @returns {{ roast: string, conventionAnalysis: string, security: string, verdict: string, rating: string }}
 */
function parseGeminiResponse(text) {
  const normalize = s => (s || '').trim().replace(/\n{2,}/g, '\n');
  const isEmpty = s => !s || /^n\/?a\s*$/i.test(String(s).trim());

  const roastMatch = text.match(/\*\*IA Roast:\*\*\s*"([^"]*)"/);
  const conventionMatch =
    text.match(
      /\*\*Convention Analysis:\*\*\s*([\s\S]*?)(?=\*\*Security\s*\(SonarCloud\)|\*\*Security:\*\*|\*\*Verdict|\*\*Rating|$)/,
    ) ||
    (text.includes('Convention') || /PASS|FAIL/.test(text)
      ? text.match(
          /\*\*Convention[\s\S]*?:\*\*\s*([\s\S]*?)(?=\*\*Security|\*\*Verdict|\*\*Rating|$)/,
        )
      : null);
  const securityMatch =
    text.match(/\*\*Security\s*\(SonarCloud\):\*\*\s*([\s\S]*?)(?=\*\*Verdict|\*\*Rating|$)/) ||
    text.match(/\*\*Security:\*\*\s*([\s\S]*?)(?=\*\*Verdict|\*\*Rating|$)/);
  const verdictMatch = text.match(/\*\*Verdict:\*\*\s*([\s\S]*?)(?=\*\*Rating|$)/);
  const ratingMatch = text.match(/\*\*Rating:\*\*\s*(\d)/);

  const convention = normalize(conventionMatch?.[1] || '');
  const securityRaw = normalize(securityMatch?.[1] || '');
  const verdictRaw = normalize(verdictMatch?.[1] || '');

  return {
    roast: (roastMatch?.[1] || 'Review completed.').trim(),
    conventionAnalysis: isEmpty(convention)
      ? 'No specific findings. Consider running yarn quality locally.'
      : convention,
    security: isEmpty(securityRaw) ? 'No obvious security issues detected in diff.' : securityRaw,
    verdict: isEmpty(verdictRaw)
      ? 'Review incomplete. Please address any convention or security findings above.'
      : verdictRaw,
    rating: ratingMatch?.[1] || '3',
  };
}

function readFile(root, relPath) {
  const fullPath = path.join(root, relPath);
  try {
    return fs.readFileSync(fullPath, 'utf8');
  } catch (e) {
    return `[Could not read ${relPath}]`;
  }
}

if (require.main === module) {
  main().catch(err => {
    console.error(err);
    process.exit(1);
  });
} else {
  module.exports = { parseGeminiResponse, readFile };
}
