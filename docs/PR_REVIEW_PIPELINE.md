# PR Review Pipeline — SonarCloud, AI & Discord

Automated Pull Request review pipeline integrating SonarCloud, Gemini (AI), and Discord notifications.

---

## Flow Summary

| PR Event      | Actions                                                                                             |
| ------------- | --------------------------------------------------------------------------------------------------- |
| `opened`      | SonarCloud, AI review, Discord "New PR" notification                                                |
| `synchronize` | SonarCloud, AI review, Discord "New PR" + **Discord commit update** (thread with commit + comments) |
| `closed`      | Discord notification with status (MERGED/REJECTED), roast, rating, and Sonar metrics                |

**Limitation:** Jobs that use secrets (sonar, ai-review, discord) **do not run** on PRs from forks. They only run when the PR comes from a branch in the same repository.

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

> **Note:** Pipeline variables are documented in [.env.example](../.env.example) (PR Review Pipeline section). They are configured as **Secrets** in GitHub, not in local `.env`.

---

## Pipeline Files

| File                               | Purpose                                                         |
| ---------------------------------- | --------------------------------------------------------------- |
| `.github/workflows/pr-review.yml`  | Main workflow                                                   |
| `sonar-project.properties`         | SonarCloud configuration                                        |
| `scripts/pr-review.js`             | Extracts diff, calls Gemini, posts comment on PR                |
| `scripts/discord-notify.js`        | Sends embed to Discord when PR is closed                        |
| `scripts/discord-notify-new-pr.js` | Sends notification to Discord when PR is opened or updated      |
| `scripts/discord-notify-commit.js` | Sends commit + comments to Discord on each push (synchronize)   |
| `scripts/roast-prompt.config.js`   | Config del roast (idioma, estilos, prompt) — fácil de modificar |

---

## Roast (al cerrar PR)

El roast se genera en **español** y se configura en `scripts/roast-prompt.config.js`:

- **language**: `'es'` | `'en'`
- **styles**: referencias de humor (Los Simpson, Lupita, etc.) — añade las que quieras
- **promptTemplate**: plantilla con `{{action}}`, `{{context}}`, `{{style}}`, `{{author}}`, `{{maxChars}}`
- **fallback**: mensaje cuando Gemini falla

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

**On PR open/update:** Brief embed with PR title, author, branch, task summary (3-line Gemini summary when `GEMINI_API_KEY` is set), and links (View MR, View requirement).

**Data source:** When branch matches `N-task-name`, fetches issue #N from GitHub API. Gemini summarizes the issue in 3 lines for readability. Fallback: truncated title + body.

**On PR close (merge/reject):** Card-style embed with roast:

- **Title:** Synti-IQ Review: Pull Request #N
- **Status:** MERGED (green) / REJECTED (red)
- **IA Roast:** Extracted from the AI review comment (hidden block `<!-- DISCORD_ROAST:... -->`)
- **Rating:** Stars (1–5) and level
- **Sonar Stats:** Bugs, Security Hotspots, Vulnerabilities
- **Link:** Link to PR on GitHub

**On each new commit (synchronize):** Separate notification with:

- Commit hash, message, author, branch
- Recent human comments on the PR (excludes bot comments)
- Link to PR

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

- [AGENTS.md](../AGENTS.md)
- [docs/prompts/code-review.md](prompts/code-review.md)
- [SonarCloud GitHub Actions](https://docs.sonarsource.com/sonarcloud/advanced-setup/ci-based-analysis/github-actions-for-sonarcloud/)
- [Discord Webhook Embeds](https://discord.com/developers/docs/resources/channel#embed-object)
