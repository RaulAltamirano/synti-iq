# PR Review Pipeline — SonarCloud, AI & Discord

Automated Pull Request review pipeline integrating SonarCloud, Gemini (AI), and Discord notifications.

---

## Flow Summary

| PR Event                 | Actions                                                                              |
| ------------------------ | ------------------------------------------------------------------------------------ |
| `opened` / `synchronize` | SonarCloud analysis, AI review (Gemini), PR comment, Discord "New PR" notification   |
| `closed`                 | Discord notification with status (MERGED/REJECTED), roast, rating, and Sonar metrics |

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

> **Note:** Pipeline variables are documented in [.env.example](../.env.example) (PR Review Pipeline section). They are configured as **Secrets** in GitHub, not in local `.env`.

---

## Pipeline Files

| File                               | Purpose                                                    |
| ---------------------------------- | ---------------------------------------------------------- |
| `.github/workflows/pr-review.yml`  | Main workflow                                              |
| `sonar-project.properties`         | SonarCloud configuration                                   |
| `scripts/pr-review.js`             | Extracts diff, calls Gemini, posts comment on PR           |
| `scripts/discord-notify.js`        | Sends embed to Discord when PR is closed                   |
| `scripts/discord-notify-new-pr.js` | Sends notification to Discord when PR is opened or updated |

---

## GitHub Comment Format

The bot posts a **brief professional comment** (no roast in GitHub at all):

```
🤖 AI Technical Assistant - Review

**Convention Analysis:** [1-2 bullets]

**Security (SonarCloud):** [one line]

**Verdict:** ✅ Approved / ❌ Changes Required. [summary]

**Rating:** X/5
```

---

## Discord Message Format

**On PR open/update:** Simple embed with task description only (title, author, branch, task # and description when branch matches `N-task-name`). No roast.

**On PR close (merge/reject):** Card-style embed with roast:

- **Title:** Synti-IQ Review: Pull Request #N
- **Status:** MERGED (green) / REJECTED (red)
- **IA Roast:** "Review completed." (roast not stored in GitHub; would require separate storage to show custom roast on close)
- **Rating:** Stars (1–5) and level
- **Sonar Stats:** Bugs, Security Hotspots, Vulnerabilities
- **Link:** Link to PR on GitHub

---

## Troubleshooting

| Issue                    | Possible cause                             | Solution                                                                                    |
| ------------------------ | ------------------------------------------ | ------------------------------------------------------------------------------------------- |
| SonarCloud fails         | Invalid token or project does not exist    | Verify `SONAR_TOKEN` and `projectKey` in SonarCloud                                         |
| Gemini does not respond  | Invalid API key or rate limit              | Check `GEMINI_API_KEY`; reduce PR frequency                                                 |
| Gemini 404 NOT_FOUND     | Deprecated or unavailable model            | Script uses `gemini-2.5-flash`. See [models](https://ai.google.dev/gemini-api/docs/models). |
| Discord does not receive | Invalid or revoked webhook                 | Regenerate webhook and update `DISCORD_WEBHOOK`                                             |
| discord-notify exit 1    | Empty webhook (fork PR), invalid URL, 4xx  | Check logs: "Response:" shows Discord error. Fork PRs do not receive secrets.               |
| Diff truncated           | PR too large                               | Script limits to 2000 lines / 50KB; consider smaller PRs                                    |
| Empty roast in Discord   | Bot comment does not match expected format | Ensure prompt in `pr-review.js` requests **IA Roast:** and **Rating:**                      |

---

## References

- [AGENTS.md](../AGENTS.md)
- [docs/prompts/code-review.md](prompts/code-review.md)
- [SonarCloud GitHub Actions](https://docs.sonarsource.com/sonarcloud/advanced-setup/ci-based-analysis/github-actions-for-sonarcloud/)
- [Discord Webhook Embeds](https://discord.com/developers/docs/resources/channel#embed-object)
