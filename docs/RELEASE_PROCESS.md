# Release Process — SemVer and Changelog

Automated versioning and changelog generation via [release-please](https://github.com/googleapis/release-please).

**Flow:** Merge to main → release-please creates Release PR → Merge Release PR → GitHub Release + `CHANGELOG.md` updated.

**References:** [Conventional Commits](https://www.conventionalcommits.org/), [DEVELOPMENT_WORKFLOW.md](DEVELOPMENT_WORKFLOW.md)

---

## SemVer Mapping

| Commit Type                                 | Version Bump          | Example                             |
| ------------------------------------------- | --------------------- | ----------------------------------- |
| `feat:`                                     | Minor (0.0.x → 0.1.0) | `feat(store): add stats endpoint`   |
| `fix:`                                      | Patch (0.0.1 → 0.0.2) | `fix(auth): resolve token refresh`  |
| `perf:`                                     | Patch                 | `perf(api): optimize query`         |
| `refactor:`                                 | Patch (configurable)  | `refactor(store): simplify service` |
| `BREAKING CHANGE:` or `feat!:`              | Major (0.0.1 → 1.0.0) | `feat!: remove deprecated API`      |
| `chore:`, `docs:`, `test:`, `ci:`, `build:` | —                     | No version bump                     |

---

## Automated Flow

1. **Merge to main** — Commits with `feat`, `fix`, etc. trigger release-please.
2. **Release PR** — release-please creates/updates a PR: `Release vX.Y.Z`.
3. **Merge Release PR** — Creates GitHub Release, updates `package.json` and `CHANGELOG.md`.

**Workflow:** [`.github/workflows/release-please.yml`](../.github/workflows/release-please.yml)

---

## Manual Fallback

If release-please is unavailable, version and changelog manually:

```bash
# Bump version (patch/minor/major)
npm version patch  # or minor, major

# Tag and push
git push origin main --tags
```

Then create a GitHub Release from the tag and update CHANGELOG.md from recent commits.

---

## References

- [release-please](https://github.com/googleapis/release-please)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [DEVELOPMENT_WORKFLOW.md](DEVELOPMENT_WORKFLOW.md)
