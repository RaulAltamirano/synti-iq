# SonarCloud Quality Gate — How to View and Fix Issues

This guide explains how to view SonarCloud analysis results and fix Quality Gate failures.

---

## 1. View Issues on SonarCloud Web

### Direct URL

Open your project on SonarCloud:

```
https://sonarcloud.io/project/overview?id=RaulAltamirano_synti-iq
```

### Where to Find Each Issue Type

| Issue Type            | Location in SonarCloud                                                       |
| --------------------- | ---------------------------------------------------------------------------- |
| **Security Hotspots** | Project → **Security** tab → **Security Hotspots** (filter by "On New Code") |
| **Duplication**       | Project → **Code** tab → **Duplication** (set "Scope: New Code")             |
| **Security Rating**   | Project → **Security** tab → **Security Rating** widget (New Code section)   |
| **All Issues**        | Project → **Issues** tab → Filter by "Status: Open", "Scope: New Code"       |

### Filters to Use

- **Scope: New Code** — Only issues introduced in the current PR/branch
- **Type: Security Hotspot** — To focus on the 8 hotspots
- **Status: Open** — Exclude resolved/safe hotspots

---

## 2. SonarLint for IDE (Recommended)

Install the **SonarLint** or **SonarQube for IDE** extension to see issues directly in your editor **before** pushing.

### Setup (VS Code / Cursor)

1. Install **SonarLint** from the Extensions panel
2. Enable **Connected Mode** (links to SonarCloud)
3. Add SonarCloud connection:
   - **SonarLint** → **Connect to SonarCloud/SonarQube**
   - Use your SonarCloud token and organization
   - Select project `RaulAltamirano_synti-iq`

You will then see:

- Security hotspots and issues inline in the editor
- A **SECURITY HOTSPOTS** view in the sidebar
- Quick fixes and "Why is this an issue?" explanations

---

## 3. Run SonarScanner Locally (Optional)

To run the same analysis locally before opening a PR:

```bash
# Prerequisites: yarn test:cov must pass (generates coverage/lcov.info)

# Install SonarScanner (if not installed)
# npm install -g sonarqube-scanner
# or: https://docs.sonarsource.com/sonarqube/latest/analyzing-source-code/scanners/sonarscanner/

# Run scan (requires SONAR_TOKEN in env)
export SONAR_TOKEN=your_sonarcloud_token
sonar-scanner
```

Or add a script to `package.json`:

```json
"sonar": "sonar-scanner"
```

Then: `yarn test:cov && yarn sonar`

---

## 4. Understanding Your Current Failures

| Condition                      | Current | Required | What to Do                                                                                            |
| ------------------------------ | ------- | -------- | ----------------------------------------------------------------------------------------------------- |
| **Security Hotspots**          | 8       | 0        | Review each hotspot in SonarCloud → Security tab. Mark as "Safe" if intentional, or fix the code.     |
| **Duplication on New Code**    | 3.2%    | ≤ 3%     | Extract duplicated logic into shared functions/utils. Refactor similar blocks.                        |
| **Security Rating (New Code)** | C       | ≥ A      | Fix security issues in new code. Common causes: hardcoded secrets, unsafe regex, user input handling. |

### Security Hotspots — Typical Fixes

- **Hardcoded secrets/passwords** → Move to env vars, use `process.env`
- **SQL injection risk** → Use parameterized queries (TypeORM does this; verify usage)
- **ReDoS (regex)** → Simplify regex, avoid nested quantifiers
- **User input in eval/exec** → Never use `eval`; validate/sanitize inputs
- **Insecure deserialization** → Use safe serialization (e.g. JSON.parse with validation)

### Duplication — Quick Wins

- Extract repeated error messages into constants
- Extract repeated query-building logic into helpers
- Use shared DTOs or base classes where appropriate

### Security Rating C → A

- Fix all **Vulnerabilities** (red) in new code
- Review and fix or mark **Security Hotspots** (yellow) as Safe
- Avoid new `any` types, unvalidated inputs, and risky patterns

---

## 5. Marking Hotspots as Safe (When Appropriate)

If a hotspot is a **false positive** or **intentional**:

1. Open the hotspot in SonarCloud
2. Click **Review**
3. Choose:
   - **Safe** — No fix needed (e.g. dev-only code, already mitigated)
   - **Fixed** — You applied a code change
   - Add a comment explaining the decision (recommended for audits)

---

## 6. References

- [SonarCloud Dashboard](https://sonarcloud.io)
- [Security Hotspots — SonarCloud Docs](https://docs.sonarsource.com/sonarqube-cloud/digging-deeper/security-hotspots)
- [SonarLint for VS Code](https://marketplace.visualstudio.com/items?itemName=SonarSource.sonarlint-vscode)
- [PR Review Pipeline](PR_REVIEW_PIPELINE.md) — How SonarCloud runs in CI

---

## 7. Quality Gate Blocks Merge in CI

The PR Review Pipeline uses `sonarsource/sonarqube-quality-gate-action` after the SonarCloud scan. If the Quality Gate fails:

- The `sonar` job fails in GitHub Actions
- When **Branch Protection** is configured to require the `sonar` (or `quality`) job, the PR cannot be merged until the Quality Gate passes

Configure Branch Protection in **Settings → Branches → Branch protection rules** for `main` and `master` to require:

1. **CI — Quality Gate** workflow: `quality` job
2. **PR Review Pipeline** workflow: `sonar` job (optional, for SonarCloud enforcement)
