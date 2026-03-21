# PR Review Pipeline — SonarCloud, AI & Discord

Automated Pull Request review pipeline integrating SonarCloud, Gemini (AI), and Discord notifications.

**Quick reference:** On PR open/update → SonarCloud scan, AI review, Discord notification. On PR close → Discord embed with roast, rating, Sonar stats. Required secrets: `SONAR_TOKEN`, `GEMINI_API_KEY`, `DISCORD_WEBHOOK`.

---

## Flow Summary

| PR Event      | Actions                                                                                             |
| ------------- | --------------------------------------------------------------------------------------------------- |
| `opened`      | SonarCloud, AI review, Discord "New PR" notification                                                |
| `synchronize` | SonarCloud, AI review, Discord "New PR" + **Discord commit update** (thread with commit + comments) |
| `closed`      | Discord notification with status (MERGED/REJECTED), roast, rating, and Sonar metrics                |

**Limitation:** Jobs that use secrets (sonar, ai-review, discord) **do not run** on PRs from forks. They only run when the PR comes from a branch in the same repository.

**CI Quality Gate:** A separate [`.github/workflows/ci.yml`](../.github/workflows/ci.yml) workflow runs on all PRs (main, master, dev) and on push to main/master. It runs `yarn audit`, `yarn lint`, `yarn format:check`, `yarn build`, and `yarn test:cov` in parallel jobs. See **Branch Protection** below for required status checks.

**Sonar job steps:** The `quality-fast` and `quality-build` jobs in `pr-review.yml` run in parallel (audit/lint/format vs build/test:cov). The `sonar` job then runs: SonarCloud scan → **Quality Gate check**. If the Quality Gate fails, the job fails and blocks merge (when required by Branch Protection).

---

## Branch Protection

Configure **Settings > Branches > Branch protection rules** for `main`, `master`, and `dev` to enforce quality gates before merge:

| Setting                                  | Recommendation                                                                                                                                                                                                           |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Require status checks before merging** | Enable. Require both workflows to pass: `CI — Quality Gate` and `PR Review Pipeline`. This ensures `yarn audit`, `yarn lint`, `yarn format:check`, `yarn build`, and `yarn test:cov` pass, plus SonarCloud quality gate. |
| **Require branches to be up to date**    | Optional but recommended — ensures the latest base branch is tested.                                                                                                                                                     |
| **Do not allow bypassing**               | Prevent administrators from bypassing (unless necessary).                                                                                                                                                                |
| **Restrict who can push**                | Block direct push to `main`/`master`; require PRs.                                                                                                                                                                       |
| **Require pull request reviews**         | Require at least 1 approval before merge.                                                                                                                                                                                |

**Required status checks (exact names depend on GitHub UI):**

- `CI — Quality Gate` (workflow) — or its jobs: `quality-fast`, `quality-build`
- `PR Review Pipeline` (workflow) — or its jobs: `quality-fast`, `quality-build`

Without both required, a PR could merge with high-severity vulnerabilities (if only pr-review is required) or without SonarCloud/AI review (if only CI is required).

---

## Required Configuration

### 1. SonarCloud

1. Create an account at [SonarCloud](https://sonarcloud.io).
2. Import the repository and configure the project with ID `RaulAltamirano_synti-iq`.
3. Generate a token: **My Account > Security > Generate Token**.
4. Add to GitHub: **Settings > Secrets and variables > Actions** → `SONAR_TOKEN`.

The `sonar-project.properties` file in the project root defines:

- `sonar.organization=RaulAltamirano`
- `sonar.projectKey=RaulAltamirano_synti-iq`
- Source, test, and coverage paths.

### 2. Gemini (Google AI)

1. Get an API key from [Google AI Studio](https://aistudio.google.com/apikey).
2. Add to GitHub Secrets: `GEMINI_API_KEY`.
3. Model used: `gemini-2.5-flash` (stable, good performance/cost).

### 3. Discord

1. In the developer channel: **Channel settings > Integrations > Webhooks > New webhook**.
2. Copy the webhook URL.
3. Add to GitHub Secrets: `DISCORD_WEBHOOK`.

---

## Required Secrets

| Secret            | Description                |
| ----------------- | -------------------------- |
| `SONAR_TOKEN`     | SonarCloud token           |
| `GEMINI_API_KEY`  | Google AI (Gemini) API key |
| `DISCORD_WEBHOOK` | Discord webhook URL        |

`GITHUB_TOKEN` is automatically injected by GitHub Actions.

**Optional:** `SONAR_PROJECT` — SonarCloud project key (default: `RaulAltamirano_synti-iq`). Set in workflow env if using a different project.

**Optional secrets/variables:** `DISCORD_THREAD_ID`, `DISCORD_USE_FORUM`, `GEMINI_MODEL` — documented in [.env.example](../.env.example) (PR Review Pipeline section).

> **Note:** Pipeline variables are documented in [.env.example](../.env.example) (PR Review Pipeline section). They are configured as **Secrets** or **Variables** in GitHub Actions, not in local `.env`.

---

## Pipeline Files

| File                                      | Purpose                                                                                                   |
| ----------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `.github/workflows/ci.yml`                | Quality gate: audit, lint, format (quality-fast) + build, test:cov (quality-build) in parallel on PR/push |
| `.github/workflows/pr-review.yml`         | Main workflow: SonarCloud, AI review, Discord                                                             |
| `sonar-project.properties`                | SonarCloud configuration                                                                                  |
| `scripts/pr-review.js`                    | Extracts diff, calls Gemini, posts comment on PR                                                          |
| `scripts/discord-notify.js`               | Sends embed to Discord when PR is closed                                                                  |
| `scripts/discord-notify-new-pr.js`        | Sends notification to Discord when PR is opened or updated                                                |
| `scripts/discord-notify-commit.js`        | Sends commit + comments to Discord on each push (synchronize)                                             |
| `scripts/discord-notify-dev-commit.js`    | Sends notification when commit is pushed directly to `dev`                                                |
| `.github/workflows/dev-commit-notify.yml` | Discord notification on push to dev branch                                                                |
| `scripts/roast-prompt.config.js`          | Roast config (language, styles, prompt) — easy to customize                                               |

---

## Roast (on PR Close)

The roast is generated when the PR is closed via `scripts/generate-close-roast.js`, which calls Gemini with the PR context (rating, Sonar, merge/reject). Configuration is in `scripts/roast-prompt.config.js`:

- **language**: `'es'` | `'en'`
- **styles**: humor references (e.g. TV shows) — add your own
- **promptTemplate**: template with `{{action}}`, `{{context}}`, `{{style}}`, `{{author}}`, `{{maxChars}}`
- **fallback**: message when Gemini fails or no API key is configured

**Fallback:** If Gemini fails or `GEMINI_API_KEY` is not set, the roast is extracted from the bot comment on the PR (hidden block `<!-- DISCORD_ROAST:... -->`), or the default message from `roast-prompt.config.js`.

---

## Review Scope

The AI review follows the 8-category structure from [docs/prompts/code-review.md](prompts/code-review.md):

1. **Architecture** — No business logic in controllers, repository layer, module structure
2. **TypeScript Quality** — No `any`, explicit return types, strict typing
3. **DTOs & Validation** — class-validator, `@IsOptional`, nested validation
4. **Error Handling** — NotFoundException, BadRequestException, etc.
5. **Logging & Observability** — NestJS Logger, withSpan, no console
6. **Testing** — Unit tests, fixtures, mocks, edge cases
7. **API & Documentation** — ApiDoc, Swagger, endpoint specs
8. **Conventions** — kebab-case files, PascalCase classes, absolute imports

Context loaded: AGENTS.md, CONVENTIONS.md, DEFINITION_OF_DONE.md, QUALITY_METRICS.md, fix-quality.md, pre-pr-review.md.

---

## GitHub Comment Format

The bot posts a **brief professional comment** with emojis for readability (no roast in GitHub):

```
🤖 AI Technical Assistant - Review

**📋 Convention Analysis:** [8-category bullets: Architecture, TypeScript, DTOs, Error Handling, Logging, Testing, API, Conventions — each with PASS/FAIL/N/A, Location, Detail]
**🔒 Security:** [AI assessment]
**📊 SonarCloud:** [🔴 Bugs | ⚠️ Hotspots | 🟠 Vulns — from SonarCloud API]
**📌 Verdict:** [✅ Approved / ❌ Changes Required]
**⭐ Rating:** [1-5]/5
```

---

## Discord Message Format

All Discord embeds include a **Workflow** field with a link to the GitHub Actions run that sent the notification (`[View run](url)`). This allows quick navigation from Discord to the workflow logs.

**On PR open/update:** Brief embed with PR title, author, branch (source → target when available), task summary (3-line Gemini summary when `GEMINI_API_KEY` is set), and links (View MR, View requirement).

**Data source:** When branch matches `N-task-name`, fetches issue #N from GitHub API. Gemini summarizes the issue in 3 lines for readability. Fallback: truncated title + body.

**On PR close (merge/reject):** Card-style embed with roast:

- **Title:** Synti-IQ Review: Pull Request #N (clickable, links to PR)
- **Status:** MERGED (green) / REJECTED (red)
- **IA Roast:** Generated by `generate-close-roast.js` via Gemini when PR closes. Fallback: extracted from AI review comment (hidden block `<!-- DISCORD_ROAST:... -->`) if Gemini fails.
- **Rating:** Stars (1–5) and level
- **Sonar Stats:** Bugs, Security Hotspots, Vulnerabilities
- **Link:** Link to PR on GitHub
- **Workflow:** Link to the GitHub Actions run

**On each new commit (synchronize):** Separate notification with:

- Commit hash (clickable when `COMMIT_URL` is set), message, author, branch
- Recent human comments on the PR (excludes bot comments)
- Link to PR
- **Workflow:** Link to the GitHub Actions run

**Discord job behavior:** Discord jobs use `continue-on-error: true` so that a webhook failure (invalid URL, rate limit, etc.) does not block PR merge. Failed notifications are visible in the workflow logs; check the Actions run if Discord does not receive a message.

**Thread options (optional):**

- `DISCORD_THREAD_ID` (secret): Post all commit updates to this thread. Create a thread in Discord, enable Developer Mode, right-click the thread → Copy Thread ID.
- `DISCORD_USE_FORUM` (variable, `true`): If the webhook is in a **forum channel**, each commit creates a new forum post (thread). Set in **Settings > Variables**.

---

## Troubleshooting

| Issue                       | Possible cause                             | Solution                                                                                    |
| --------------------------- | ------------------------------------------ | ------------------------------------------------------------------------------------------- |
| SonarCloud fails            | Invalid token or project does not exist    | Verify `SONAR_TOKEN` and `projectKey` in SonarCloud                                         |
| Gemini does not respond     | Invalid API key or rate limit              | Check `GEMINI_API_KEY`; reduce PR frequency                                                 |
| Gemini 404 NOT_FOUND        | Deprecated or unavailable model            | Script uses `gemini-2.5-flash`. See [models](https://ai.google.dev/gemini-api/docs/models). |
| Discord does not receive    | Invalid or revoked webhook                 | Regenerate webhook and update `DISCORD_WEBHOOK`                                             |
| discord-notify exit 1       | Empty webhook (fork PR), invalid URL, 4xx  | Check logs: "Response:" shows Discord error. Fork PRs do not receive secrets.               |
| Diff truncated              | PR too large                               | Script limits to 2000 lines / 50KB; consider smaller PRs                                    |
| Incomplete/truncated review | Gemini hit MAX_TOKENS or SAFETY            | Check `finishReason` in workflow logs; consider splitting the PR or reducing diff size      |
| Empty roast in Discord      | Bot comment does not match expected format | Ensure prompt in `pr-review.js` requests **IA Roast:** and **Rating:**                      |

---

## References

- [DEVELOPMENT_WORKFLOW.md](DEVELOPMENT_WORKFLOW.md) — Full flow from issue creation to merge
- [AGENTS.md](../AGENTS.md)
- [docs/prompts/code-review.md](prompts/code-review.md)
- [SonarCloud GitHub Actions](https://docs.sonarsource.com/sonarcloud/advanced-setup/ci-based-analysis/github-actions-for-sonarcloud/)
- [Discord Webhook Embeds](https://discord.com/developers/docs/resources/channel#embed-object)
