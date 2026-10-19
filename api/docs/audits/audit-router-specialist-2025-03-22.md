# Requirement Audit: AI Router + Specialist Strategy Implementation

---

## 1. Audit Scope

- **Requirement:** Implementation of Router + Specialist AI architecture (Groq orchestrator, Gemini specialist) to reduce Gemini quota exhaustion in the PR review pipeline.
- **Date:** 2025-03-22
- **Phases executed:** 0–5
- **Artifacts audited:** ADR-0001, scripts/lib/ai-agents.js, scripts/pr-review.js, scripts/discord-notify-new-pr.js, scripts/generate-close-roast.js, .github/workflows/pr-review.yml, docs/PR_REVIEW_PIPELINE.md, .env.example

## 2. Blocking Questions (if any)

None. Context complete.

## 3. Web Research (Phase 1)

### Groq API

- **Rate limits:** Groq measures RPM, RPD, TPM, TPD. Limits are per organization. Developer plan: llama-3.3-70b-versatile ~30 RPM, 12K TPM, 100K TPD (varies). Higher limits (250K TPM, 1K RPM) available on paid plans.
- **Best practice:** Implement exponential backoff for 429 errors; use `x-ratelimit-remaining-*` and `retry-after` headers.
- **Source:** [Groq Rate Limits](https://console.groq.com/docs/rate-limits)

### Router-Specialist Pattern

- **Pattern:** Router classifies tasks and directs to specialized agents. Reduces memory bloat, context pollution, cost explosion vs single-agent.
- **Implementation:** Stateless routing (each request independent). Groq for transform/summarize; Gemini for quality judgment aligns with capability matching.
- **Source:** [Router-Based Agents (Towards AI)](https://pub.towardsai.net/router-based-agents-the-architecture-pattern-that-makes-ai-systems-scale-a9cbe3148482)

## 4. Project State (Phase 2)

| Aspect         | Alignment | Deviation                                                               |
| -------------- | --------- | ----------------------------------------------------------------------- |
| AGENTS.md      | OK        | New scripts not in canonical paths; scripts/ is existing pattern for CI |
| CONVENTIONS.md | OK        | Scripts use Node.js (not Nest/TS); acceptable for CI tooling            |
| \_template     | N/A       | Scripts are standalone, no Nest module structure                        |
| DTOs/Entities  | N/A       | No DTOs in scripts; env vars validated at runtime                       |
| Logging        | WARNING   | No NestJS Logger; uses console.error (acceptable for scripts)           |
| Error handling | OK        | process.exit(1) on critical failures; fallbacks for optional flows      |

## 5. Criterion Evaluation (Phase 3)

| Criterion              | Status  | Evidence                                                                        | Recommendation                                             |
| ---------------------- | ------- | ------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| **Clarity**            | OK      | ADR documents decision; scripts have header comments                            | Add inline JSDoc for exported functions                    |
| **Completeness**       | WARNING | No retry/backoff for Groq 429                                                   | Add retry with exponential backoff for callGroq/callGemini |
| **Consistency**        | OK      | Matches create-github-issue.js (Octokit) pattern for GitHub API                 | Use Octokit for PR comments when App credentials present   |
| **Feasibility**        | OK      | Groq, Gemini APIs verified; no new runtime deps                                 | Monitor Groq rate limits in production                     |
| **Security**           | OK      | API keys via env; no hardcoding                                                 | Ensure .env.example excludes real keys                     |
| **Industry Alignment** | OK      | Router-Specialist pattern documented; Groq best practices followed              | Add rate-limit headers logging in dev                      |
| **Scope**              | OK      | In-scope: PR review, Discord summaries, roast. Out-of-scope: other AI use cases | —                                                          |

## 6. Findings (Phase 4)

| ID    | Severity      | Category     | Description                        | Evidence                                                 | Recommendation                                                                   | Reference              |
| ----- | ------------- | ------------ | ---------------------------------- | -------------------------------------------------------- | -------------------------------------------------------------------------------- | ---------------------- |
| H-001 | Medium        | Completeness | No retry logic for Groq/Gemini 429 | ai-agents.js: callGroq/callGemini return null on !res.ok | Add exponential backoff (1 retry) for 429                                        | Groq docs              |
| H-002 | Low           | Consistency  | PR comments use fetch+GITHUB_TOKEN | pr-review.js lines 236–278                               | Prefer Octokit (GitHub App) when GH*APP*\* set for bot identity                  | create-github-issue.js |
| H-003 | Informational | Completeness | Condensed diff may alter semantics | condenseDiff prompt asks to remove boilerplate           | Document that condensation is lossy; reviewer may miss minor issues              | ADR-0001               |
| H-004 | Low           | Architecture | ai-agents has no unit tests        | scripts/lib/ has no .spec                                | Add basic unit tests for parseGeminiResponse; mock fetch for callGroq/callGemini | DEFINITION_OF_DONE     |

## 7. Anti-Patterns Identified

1. **Single-point failure:** If both Groq and Gemini fail for summarizations, scripts fall back to truncation. Acceptable but could add logging for observability.
2. **Silent API failures:** callGroq/callGemini return null without logging. Debugging production issues will be harder.
3. **Hardcoded project key:** `RaulAltamirano_synti-iq` in pr-review.js. Documented in env.example but not overridable in all scripts.

## 8. Results and Recommendations (Phase 5)

### Executive Summary

The Router + Specialist implementation meets the stated goal of reducing Gemini token usage. It aligns with project conventions and industry patterns. Address retry logic (H-001) and Octokit integration (H-002) before production hardening.

### Prioritized Recommendations

1. **Before merge:** Add Octokit (GitHub App) support for PR comments when `GH_APP_ID`, `GH_INSTALLATION_ID`, `GH_APP_PRIVATE_KEY` are set; fallback to `GITHUB_TOKEN`.
2. **Before production:** Add retry with exponential backoff for 429 in ai-agents.js.
3. **Post-merge:** Add optional logging (env DEBUG=1) for API failures; consider unit tests for ai-agents.

### Suggested Improvements

- ADR: Add "Operational Runbook" section (how to diagnose Groq vs Gemini failures).
- .env.example: Clarify that GH*APP*\* enables bot identity for PR comments.

## 9. Open Questions (optional)

- Should condenseDiff run only when diff > 1500 lines (closer to 2500 truncation)?
- Is llama-3.3-70b-versatile the right default for all orchestrator tasks, or should roast use a lighter model (e.g. llama-3.1-8b-instant)?

---

## Appendix: Addressed Findings

| ID    | Status    | Action                                                                                                                          |
| ----- | --------- | ------------------------------------------------------------------------------------------------------------------------------- |
| H-002 | Addressed | pr-review.js now uses Octokit (`scripts/lib/github-client.js`) with GitHub App when `GH_APP_*` set; fallback to `GITHUB_TOKEN`. |
