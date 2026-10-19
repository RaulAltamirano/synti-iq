# ADR-0001: AI Router + Specialist Strategy (Groq + Gemini)

---

## Status

Active

## Context

The PR review pipeline uses the Gemini API for code review, summaries (issues, findings), and roast generation. Gemini frequently hits rate limits or token quotas, causing failed reviews and incomplete Discord notifications.

**Problems:**

- Single provider (Gemini) for all AI tasks
- Token-heavy flows (large diffs, context files) exhaust quota
- Summarization tasks don't require the same depth as code quality judgment

## Decision

Adopt a **Router + Specialist** architecture:

1. **Groq (Orchestrator/Router):** Handles token-heavy, high-volume tasks with better rate limits (250K TPM, 1K RPM) and 131K context:
   - Summarize GitHub issues (3 lines)
   - Summarize code review findings (6 lines)
   - Generate roast on PR close
   - Condense large diffs when needed (transform 2500+ lines into structured highlights for the specialist)

2. **Gemini (Specialist):** Reserved for the core quality judgment task:
   - Exhaustive code review (Convention Analysis, Security, Verdict, Rating)
   - Receives pre-processed input from Groq when diff is large
   - Smaller, focused prompts → fewer tokens → fewer rate limit hits

**Data flow:**

```
PR diff (large) → Groq: condense to key changes → Gemini: quality review
PR diff (small) → Gemini: direct review
Issue/Findings/Roast → Groq: summarization
```

## Communication Contract

What Groq MUST produce for downstream consumers (Gemini or Discord):

| Task             | Output Format                                                     | Constraints                 |
| ---------------- | ----------------------------------------------------------------- | --------------------------- |
| Condensed diff   | Preserve `+++`, `---`, `@@` diff format; optional metadata header | Max ~800 lines; no preamble |
| Issue summary    | Plain text, max 3 lines                                           | No preamble; English        |
| Findings summary | Plain text, max 6 lines                                           | No preamble; English        |
| Roast            | Single line, Spanish                                              | Max 200 chars; no quotes    |

Future: Groq may output JSON `{ condensedDiff: string, files: string[] }` for condenseDiff when structured output is adopted.

## Prompt Structure (Groq 5-Element Pattern)

All Groq prompts SHALL include:

1. **Role** — e.g. "You are a code diff summarizer"
2. **Instructions** — Exact actions and output format
3. **Context** — Project type (NestJS, TypeScript)
4. **Input** — The data to process
5. **Expected Output** — Schema or example; "Output ONLY X, no preamble"

Reference: [Groq Prompt Engineering Patterns](https://console.groq.com/docs/prompting/patterns)

## Token Efficiency Guidelines

| Task              | Agent       | maxTokens | Rationale                   |
| ----------------- | ----------- | --------- | --------------------------- |
| summarizeIssue    | Groq/Gemini | 256       | 3 lines; fallback uses same |
| summarizeFindings | Groq/Gemini | 512       | Max 6 lines                 |
| generateRoast     | Groq/Gemini | 256       | Max 200 chars               |
| condenseDiff      | Groq        | 4096      | ~800 lines diff             |
| code review       | Gemini      | 8192      | Full analysis + sections    |

- **Threshold:** Condense when diff >= 1200 lines (balance: Groq rate limits vs Gemini context).
- **Caching:** Future: use Gemini prompt caching for static project context when supported.

## Handoff Failure Handling

| Failure                      | Fallback                                       |
| ---------------------------- | ---------------------------------------------- |
| Groq fails (summarize/roast) | Gemini if `GEMINI_API_KEY` set                 |
| condenseDiff fails           | Use truncated diff (no condensation)           |
| Both fail                    | Truncation for diff; config fallback for roast |

## Structured Output Roadmap

- **Gemini:** `response_mime_type: application/json` + `response_json_schema` for review output (`roast`, `conventionAnalysis`, `security`, `verdict`, `rating`). Replaces regex `parseGeminiResponse`.
- **Groq:** `response_format: { type: "json_schema", ... }` for condenseDiff → `{ condensedDiff: string, files: string[] }`.

## Operational Runbook

**Diagnose Groq vs Gemini failures:**

- No PR comment + `Gemini API error` in logs → Gemini (key, quota, or rate limit).
- Discord missing task summary → Groq summarization failed; check `GROQ_API_KEY`.
- Condensed diff not used despite large PR → Groq condenseDiff returned null; diff sent raw/truncated.

**Log patterns (when added):** `callGroq` / `callGemini` return `null` on `!res.ok`; consider logging status + brief error for debugging.

## Alternatives Considered

- **Groq only:** Llama 3.3 70B is capable but Gemini has stronger convention-following for structured output. Code review quality matters.
- **Gemini only with larger quotas:** User reported quota issues; not under our control.
- **OpenAI/Anthropic:** Adds cost and another vendor; Groq is free-tier friendly and fast.

## Consequences

### Positive

- Reduces Gemini token usage; quota lasts longer
- Groq handles summarizations and roast with higher throughput
- Clear separation of concerns: transform (Groq) vs judge (Gemini)
- Fallback: if Groq fails, scripts can fall back to Gemini for summaries/roast when configured
- Easy to swap specialist (e.g. Claude for code review) without touching orchestrator

### Negative

- Two API keys required (`GROQ_API_KEY`, `GEMINI_API_KEY`)
- Slightly more complex pipeline logic

### Neutral

- `GEMINI_API_KEY` remains required for the core review; optional for roast/summaries if Groq is primary

## References

**Project:**

- [PR Review Pipeline](../PR_REVIEW_PIPELINE.md)
- Scripts: `pr-review.js`, `discord-notify-new-pr.js`, `generate-close-roast.js`
- Shared module: `scripts/lib/ai-agents.js`

**APIs:**

- [Groq Models](https://console.groq.com/docs/models)
- [Groq Structured Outputs](https://console.groq.com/docs/structured-outputs)
- [Groq Prompting Patterns](https://console.groq.com/docs/prompting/patterns)
- [Gemini API](https://ai.google.dev/gemini-api/docs)
- [Gemini Structured Output](https://ai.google.dev/gemini-api/docs/structured-output)
- [Gemini Prompt Design](https://ai.google.dev/gemini-api/docs/prompting-strategies)

**Research:**

- [Structured Agent Handoffs vs Prompt Chains](https://www.voxyz.space/insights/structured-agent-handoffs-vs-prompts)
- [AI Agent Context Handoff (Context Dump Fallacy)](https://xtrace.ai/blog/ai-agent-context-handoff)
