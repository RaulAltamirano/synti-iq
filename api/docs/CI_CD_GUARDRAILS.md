# CI/CD Guardrails

Security and quality gates in the CI/CD pipeline. Aligned with [OWASP Top 10 CI/CD Security Risks](https://owasp.org/www-project-top-10-ci-cd-security-risks/).

**References:** [.github/workflows/ci.yml](../.github/workflows/ci.yml), [PR_REVIEW_PIPELINE.md](PR_REVIEW_PIPELINE.md)

---

## Gates Overview

| Gate                    | Tool / Step             | When                | Failure behavior                             |
| ----------------------- | ----------------------- | ------------------- | -------------------------------------------- |
| **Secrets scan**        | gitleaks                | PR, push            | Job fails; merge blocked                     |
| **Commit validation**   | commitlint              | PR only             | Job fails; merge blocked                     |
| **PR title validation** | commitlint              | PR only             | Job fails; merge blocked                     |
| **Dependency audit**    | yarn audit --level high | PR, push            | Job fails; merge blocked                     |
| **Lint**                | ESLint                  | PR, push            | Job fails; merge blocked                     |
| **Format**              | Prettier                | PR, push            | Job fails; merge blocked                     |
| **Build**               | nest build              | PR, push            | Job fails; merge blocked                     |
| **Tests**               | Jest                    | PR, push            | Job fails; merge blocked                     |
| **Quality Gate**        | SonarCloud              | PR only (pr-review) | Job fails when required by Branch Protection |

---

## Execution Order

1. **quality-fast** (parallel): secrets scan → validate commits → validate PR title → audit → lint → format
2. **quality-build** (parallel): build → test:cov
3. **sonar** (pr-review): SonarCloud scan → Quality Gate check
4. **ai-review** (pr-review): AI code review

---

## Guardrail Details

### Secrets Scan (gitleaks)

- Detects hardcoded API keys, passwords, tokens
- Runs on full git history (fetch-depth: 0)
- Fails pipeline if secrets detected
- **Note:** For GitHub organizations, `GITLEAKS_LICENSE` may be required

### Dependency Audit

- `yarn audit --level high` — blocks high/critical vulnerabilities
- Runs in both ci.yml and pr-review.yml
- Fix before merge or add override with justification

### SonarCloud Quality Gate

- Configure as required status check in Branch Protection
- Blocks merge when Quality Gate fails
- See [PR_REVIEW_PIPELINE.md](PR_REVIEW_PIPELINE.md)

---

## Optional: SBOM (Software Bill of Materials)

For supply chain auditing, consider adding:

```bash
npm sbom
# or
npx @cyclonedx/cyclonedx-npm --output-file sbom.json
```

Run on release or as a separate job. Not yet implemented.

---

## References

- [OWASP Top 10 CI/CD Security Risks](https://owasp.org/www-project-top-10-ci-cd-security-risks/)
- [gitleaks](https://github.com/gitleaks/gitleaks)
- [CI_CD_AUDIT_BEFORE_AFTER.md](CI_CD_AUDIT_BEFORE_AFTER.md)
