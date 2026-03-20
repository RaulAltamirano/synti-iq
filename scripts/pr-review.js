#!/usr/bin/env node
/**
 * PR Review Script — Extracts PR diff, sends to Gemini for code review, posts comment on GitHub.
 * Run from project root in GitHub Actions. Requires: GITHUB_REPOSITORY, GITHUB_EVENT_PATH, GITHUB_TOKEN, GEMINI_API_KEY
 * Optional: SONAR_TOKEN — fetches SonarCloud metrics for the comment
 */

const fs = require('fs');
const path = require('path');

const MAX_DIFF_LINES = 2000;
const MAX_DIFF_BYTES = 50 * 1024;
const BOT_COMMENT_PREFIX = '🤖 AI Technical Assistant - Review';

async function main() {
  const repo = process.env.GITHUB_REPOSITORY;
  const token = process.env.GITHUB_TOKEN;
  const geminiKey = process.env.GEMINI_API_KEY;
  const eventPath = process.env.GITHUB_EVENT_PATH;

  const missing = [];
  if (!repo) missing.push('GITHUB_REPOSITORY');
  if (!token) missing.push('GITHUB_TOKEN');
  if (!geminiKey) missing.push('GEMINI_API_KEY');
  if (!eventPath) missing.push('GITHUB_EVENT_PATH');
  if (missing.length > 0) {
    console.error('Missing required env:', missing.join(', '));
    if (missing.includes('GEMINI_API_KEY')) {
      console.error(
        'Tip: GEMINI_API_KEY is a secret. PRs from forks do not receive secrets. Ensure the PR is from a branch in the same repo.',
      );
    }
    process.exit(1);
  }

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
  const sonarProject = 'RaulAltamirano_synti-iq';
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
        sonarStats = parts.length ? parts.join(' | ') : '✅ Sin hallazgos críticos';
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

  // 2. Load context files
  const root = path.resolve(__dirname, '..');
  const codeReviewPrompt = readFile(root, 'docs/prompts/code-review.md');
  const agentsMd = readFile(root, 'AGENTS.md');
  const conventionsMd = readFile(root, 'docs/CONVENTIONS.md');
  const definitionOfDone = readFile(root, 'DEFINITION_OF_DONE.md');

  const context = `
## Project Context (internalize before reviewing)

### Code Review Prompt
${codeReviewPrompt}

### AGENTS.md (excerpt)
${agentsMd.slice(0, 4000)}

### CONVENTIONS.md (excerpt)
${conventionsMd.slice(0, 4000)}

### Definition of Done
${definitionOfDone.slice(0, 2000)}
`;

  const userPrompt = `
## Task

Review the following PR diff against project standards (AGENTS.md, CONVENTIONS.md, code-review prompt). Provide actionable feedback. Use this exact format:

**IA Roast:** "[One funny sarcastic one-liner in Spanish. Mention @${prAuthor}. Max 150 chars. Use phrases or style from: The Simpsons, Futurama, Lupita (Mexican humor), TikTok trends, or Oprankedy. Vary the style each time.]"

**Convention Analysis:**
- [PASS/FAIL/N/A] - Location: [file or section] - Detail: [what is wrong or correct] - Reference: [AGENTS.md/CONVENTIONS.md/DEFINITION_OF_DONE]
- [Add 1-3 bullets. Each must have Location and Detail. Be specific.]

**Security (SonarCloud):**
- [Specific concerns if any, or "No obvious security issues detected in diff."]

**Verdict:** [✅ Approved / ❌ Changes Required]. [One sentence: what to fix or confirmation that it looks good.]

**Rating:** [1-5]/5

IMPORTANT: Verdict and Convention Analysis must never be empty or N/A. Always provide actionable feedback.

---

## PR Diff

\`\`\`diff
${diff}
\`\`\`
`;

  // 3. Call Gemini (gemini-2.5-flash: stable, good price-performance; fallback: gemini-2.0-flash)
  const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`;
  const geminiRes = await fetch(geminiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [
        {
          role: 'user',
          parts: [{ text: context + '\n\n' + userPrompt }],
        },
      ],
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 4096,
      },
    }),
  });

  if (!geminiRes.ok) {
    console.error('Gemini API error:', geminiRes.status, await geminiRes.text());
    process.exit(1);
  }

  const geminiData = await geminiRes.json();
  const textPart = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!textPart) {
    console.error('No text in Gemini response:', JSON.stringify(geminiData, null, 2));
    process.exit(1);
  }

  const parsed = parseGeminiResponse(textPart);

  // GitHub: brief professional review with emojis. Hidden blocks for Discord extraction on PR close.
  const sections = [
    ['📋 Convention Analysis', parsed.conventionAnalysis],
    ['🔒 Security', parsed.security],
    ['📌 Verdict', parsed.verdict],
    ['⭐ Rating', parsed.rating + '/5'],
  ];
  if (sonarStats) {
    sections.splice(2, 0, ['📊 SonarCloud', sonarStats]); // after Security, before Verdict
  }
  const githubComment = [
    BOT_COMMENT_PREFIX,
    '',
    ...sections.flatMap(([title, body]) => [`**${title}:**`, body, '']),
    `<!-- DISCORD_ROAST:${String(parsed.roast).replace(/-->/g, '')} -->`,
    `<!-- DISCORD_RATING:${parsed.rating} -->`,
    `<!-- DISCORD_VERDICT:${String(parsed.verdict).replace(/-->/g, '')} -->`,
    `<!-- DISCORD_SUMMARY:${[parsed.conventionAnalysis, parsed.security, parsed.verdict].join('\n---\n').replace(/-->/g, '')} -->`,
  ].join('\n');

  // 4. Delete previous bot comments (optional, for cleaner PRs)
  const commentsRes = await fetch(
    `${apiBase}/repos/${owner}/${repoName}/issues/${prNumber}/comments`,
    {
      headers: {
        Accept: 'application/vnd.github+json',
        Authorization: `Bearer ${token}`,
        'X-GitHub-Api-Version': '2022-11-28',
      },
    },
  );

  if (commentsRes.ok) {
    const comments = await commentsRes.json();
    for (const c of comments) {
      if (c.body && c.body.startsWith(BOT_COMMENT_PREFIX)) {
        await fetch(`${apiBase}/repos/${owner}/${repoName}/issues/comments/${c.id}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
            'X-GitHub-Api-Version': '2022-11-28',
          },
        });
      }
    }
  }

  // 5. Post new comment (professional only)
  const postRes = await fetch(`${apiBase}/repos/${owner}/${repoName}/issues/${prNumber}/comments`, {
    method: 'POST',
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${token}`,
      'X-GitHub-Api-Version': '2022-11-28',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ body: githubComment }),
  });

  if (!postRes.ok) {
    console.error('Failed to post comment:', postRes.status, await postRes.text());
    process.exit(1);
  }

  console.log('PR review comment posted successfully');
}

function parseGeminiResponse(text) {
  const roastMatch = text.match(/\*\*IA Roast:\*\*\s*"([^"]*)"/);
  const conventionMatch = text.match(
    /\*\*Convention Analysis:\*\*\s*([\s\S]*?)(?=\*\*Security\s*\(SonarCloud\)|\*\*Verdict|\*\*Rating|$)/,
  );
  const securityMatch = text.match(
    /\*\*Security\s*\(SonarCloud\):\*\*\s*([\s\S]*?)(?=\*\*Verdict|\*\*Rating|$)/,
  );
  const verdictMatch = text.match(/\*\*Verdict:\*\*\s*([\s\S]*?)(?=\*\*Rating|$)/);
  const ratingMatch = text.match(/\*\*Rating:\*\*\s*(\d)/);

  const isEmpty = s => !s || /^n\/?a\s*$/i.test(s.trim());

  const convention = (conventionMatch?.[1] || '').trim();
  const securityRaw = (securityMatch?.[1] || '').trim();
  const verdictRaw = (verdictMatch?.[1] || '').trim();

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

main().catch(err => {
  console.error(err);
  process.exit(1);
});
