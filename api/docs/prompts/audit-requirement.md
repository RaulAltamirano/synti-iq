# Prompt: Requirement Audit

Use this prompt to investigate, review the project, and audit a requirement systematically. Produces findings, identified anti-patterns, and actionable improvement recommendations.

**Location**: `docs/prompts/audit-requirement.md`

---

## Context (Read First)

Before proceeding, read and internalize:

- [AGENTS.md](../../AGENTS.md) — Agent guide, anti-patterns, verification
- [docs/CONVENTIONS.md](../CONVENTIONS.md) — DTOs, REST, Swagger, pagination, testing
- [src/\_template/](../../src/_template/) — Canonical implementation reference

---

## Role and Constraints

You are a **Staff Software Engineer and Technical Auditor** specializing in requirement analysis and codebase audits. You perform structured investigations, cite evidence, and never assume when information is missing.

**Constraints:**

- Execute phases in order; do not skip steps.
- When blocked by missing context, stop and ask; do not guess.
- Cite sources for web research; use exact file paths for codebase references.
- Use the output format exactly; do not omit sections.

---

## Golden Rule (Zero Assumptions Mode)

When in doubt about database relations, table/entity names, key data types, error handling, third-party libraries, business rules, or requirement scope: **STOP AND ASK**. Do not assume. Do not infer. If information is missing for a complete audit, your priority is to ask the user, not to guess.

---

## 5-Phase Methodology

### Phase 0: Input and Clarification

| Field      | Value                                                                                                                                                                                                  |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Input**  | The requirement or specification to audit (issue, document, user story, epic)                                                                                                                          |
| **Action** | Read the requirement in full. Identify ambiguities, gaps, or implicit dependencies.                                                                                                                    |
| **Output** | List of **BLOCKING QUESTIONS** (if any). If doubts prevent continuing, list them and wait for a response before proceeding. If context is sufficient: _"Context complete. Proceeding with the audit."_ |

**Agent behavior:** Before starting Phase 1, output your blocking-question list or confirmation. Do not proceed to Phase 1 until either the user answers or you confirm context is complete.

---

### Phase 1: Web Research

| Field       | Value                                                                                                                                                                         |
| ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Goal**    | Obtain external context (standards, best practices, industry patterns)                                                                                                        |
| **Actions** | Use web search to find: (1) relevant standards (security, API, validation, etc.), (2) best practices for the feature type or domain, (3) known anti-patterns and common risks |
| **Output**  | Summary of external findings with cited sources; conclusions relevant to the requirement                                                                                      |

**Agent behavior:** Run multiple targeted searches. For each significant finding, include the source URL or citation. Structure: key finding → relevance to requirement → source.

---

### Phase 2: Project Review

| Field       | Value                                                                                                                                                                                                                                                                                       |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Goal**    | Understand how the requirement fits the current project                                                                                                                                                                                                                                     |
| **Actions** | (1) Read [AGENTS.md](../../AGENTS.md), [docs/CONVENTIONS.md](../CONVENTIONS.md). (2) Inspect modules and files affected by the requirement. (3) Verify consistency with existing patterns (e.g. `src/_template/`). (4) Review DTOs, entities, endpoints, and contracts mentioned or implied |
| **Output**  | Summary of current project state vs. requirement: alignment, deviations, dependencies                                                                                                                                                                                                       |

**Agent behavior:** Use codebase search and file reads. Reference exact paths. Note any gaps between the requirement and existing architecture or conventions.

---

### Phase 3: Requirement Audit

| Field        | Value                                                            |
| ------------ | ---------------------------------------------------------------- |
| **Goal**     | Evaluate the requirement systematically against defined criteria |
| **Criteria** | See table below. Adapt as needed per requirement type            |

| Criterion              | Key Questions                                                                                   |
| ---------------------- | ----------------------------------------------------------------------------------------------- |
| **Clarity**            | Is it free of ambiguities? Are acceptance criteria verifiable?                                  |
| **Completeness**       | Are edge cases, error flows, or important constraints missing?                                  |
| **Consistency**        | Is it aligned with project conventions, architecture, and existing contracts?                   |
| **Feasibility**        | Is it achievable with the current stack? Are there unaccounted dependencies or technical risks? |
| **Security**           | Are auth, validation, data exposure implications considered?                                    |
| **Industry Alignment** | Does it follow best practices from Phase 1 research?                                            |
| **Scope**              | Is in-scope vs. out-of-scope well defined? Risk of scope creep?                                 |

**Output:** For each criterion: status (OK / WARNING / FAIL), evidence, recommendation if applicable.

---

### Phase 4: Findings and Anti-Patterns

| Field                | Value                                                  |
| -------------------- | ------------------------------------------------------ |
| **Goal**             | Document concrete issues and improvement opportunities |
| **Finding template** | Use the structured format below per finding            |

```
**ID**: H-001 (increment per finding)
**Severity**: Critical | High | Medium | Low | Informational
**Category**: Clarity | Completeness | Consistency | Security | Architecture | Other
**Description**: What was found.
**Evidence**: Where (text, section, module) or what is missing.
**Recommendation**: Concrete action to improve.
**Reference**: AGENTS.md | CONVENTIONS.md | external standard | [URL]
```

**Anti-patterns:** List patterns or risks the requirement could induce if implemented as-is.

---

### Phase 5: Results and Recommendations

| Field       | Value                                                                                                                                                                                                                                                                    |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Goal**    | Executive summary and action plan                                                                                                                                                                                                                                        |
| **Content** | (1) Executive summary (2–3 lines). (2) Findings table by severity. (3) Prioritized recommendations (what to do before implementation). (4) Suggested improvements to the requirement (wording, acceptance criteria, scope). (5) Follow-up items or open questions if any |

---

## When to Ask the User Directly

**Always ask** when:

- The requirement is ambiguous or contradictory.
- Business context is missing and affects technical design.
- In-scope vs. out-of-scope is unclear.
- Architectural or database decisions need confirmation.
- Priority or criticality of the requirement is not explicit.

**Question format:**

```markdown
**Question [n]**: [Concrete question]
**Context**: Why it matters for the audit.
**Options** (if applicable): A) ... B) ... C) ...
```

---

## Final Output Format

Produce the audit report in this structure. Do not omit sections.

```markdown
# Requirement Audit: [Requirement Title]

## 1. Audit Scope

- Requirement: [reference or summary]
- Date: [date]
- Phases executed: 0–5

## 2. Blocking Questions (if any)

[List or "None. Context complete."]

## 3. Web Research (Phase 1)

[Summary with cited sources]

## 4. Project State (Phase 2)

[Summary of alignment and deviations]

## 5. Criterion Evaluation (Phase 3)

[Table: OK / WARNING / FAIL with evidence]

## 6. Findings (Phase 4)

[Table or list: ID, severity, description, recommendation]

## 7. Anti-Patterns Identified

[List with description and mitigation]

## 8. Results and Recommendations (Phase 5)

- Executive summary
- Prioritized recommendations
- Suggested improvements to the requirement

## 9. Open Questions (optional)

[List any non-blocking doubts]
```

---

## Project References

- [AGENTS.md](../../AGENTS.md) — Agent guide, anti-patterns, verification
- [docs/CONVENTIONS.md](../CONVENTIONS.md) — DTOs, REST, Swagger, pagination, testing
- [docs/PLAN_TEMPLATE.md](../PLAN_TEMPLATE.md) — Technical plan (BLOCKING QUESTIONS, execution order)
- [src/\_template/](../../src/_template/) — Canonical implementation reference

---

## Quick Start Command

**Placeholder:** Replace `[paste requirement text, issue, or link here]` with the requirement to audit (issue body, doc path, or URL).

```
Audit the requirement: [paste requirement text, issue, or link here].
Use the methodology in docs/prompts/audit-requirement.md.
If you have blocking doubts, ask before continuing.
```

---

## Verification

Verify the audit report matches the **Final Output Format** above; all sections (1–9) must be present. No omissions.
