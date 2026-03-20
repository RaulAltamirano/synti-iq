#!/usr/bin/env node
/**
 * PR Review Script — Extracts PR diff, sends to Gemini for code review, posts comment on GitHub.
 * Run from project root in GitHub Actions. Requires: GITHUB_REPOSITORY, GITHUB_EVENT_PATH, GITHUB_TOKEN, GEMINI_API_KEY
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

Review the following PR diff against the project standards above. Provide your analysis in this exact format:

**IA Roast:** "[One funny, sarcastic one-liner in Spanish roasting the code quality. Mention @${prAuthor} in the roast. Keep it under 150 chars.]"

**Análisis de Convenciones:**
- [List specific findings: PASS/FAIL/N/A, Location, Detail, Reference]
- [One bullet per finding]

**Seguridad (SonarCloud):**
- [Note any obvious security concerns from the diff; if none, say "No obvious issues detected in diff"]

**Veredicto:** [✅ Aprobado / ❌ Cambios Requeridos]. [One sentence summary. If changes required, mention what to fix.]

**Calificación:** [1-5]/5 (single number, e.g. "3/5")

---

## PR Diff

\`\`\`diff
${diff}
\`\`\`
`;

  // 3. Call Gemini
  const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`;
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
        maxOutputTokens: 2048,
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

  const commentBody = `${BOT_COMMENT_PREFIX}\n\n${textPart}`;

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

  // 5. Post new comment
  const postRes = await fetch(`${apiBase}/repos/${owner}/${repoName}/issues/${prNumber}/comments`, {
    method: 'POST',
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${token}`,
      'X-GitHub-Api-Version': '2022-11-28',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ body: commentBody }),
  });

  if (!postRes.ok) {
    console.error('Failed to post comment:', postRes.status, await postRes.text());
    process.exit(1);
  }

  console.log('PR review comment posted successfully');
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
