# Prompt: Pre-PR Review Checklist

Use this prompt before opening a pull request to verify all quality gates pass.

---

## Instructions

Run the full verification pipeline and confirm readiness for PR.

### Checklist (from [AGENTS.md](../../AGENTS.md))

Execute in order and ensure all pass:

| Step | Command | Purpose |
|------|---------|---------|
| 1 | `yarn build` | Verify compilation (no TypeScript errors) |
| 2 | `yarn lint` | No ESLint errors |
| 3 | `yarn type-check` | Type-check without emit |
| 4 | `yarn format:check` | Prettier formatting |
| 5 | `yarn test` | Unit tests pass |
| 6 | `yarn build-storybook` | Storybook builds for UI components |

**Shortcut:** `yarn quality` or `yarn pre-pr` runs all steps.

### Additional checks

- [ ] New composables/stores have `.spec.ts` files
- [ ] New UI components have `.stories.ts` files (CSF3 format)
- [ ] Commit messages follow conventional commits (feat:, fix:, docs:, etc.) if commit-msg hook is enabled
- [ ] No `any` in new or modified code
- [ ] Imports use `@/` alias

### If something fails

1. Run `yarn lint:fix` for auto-fixable lint issues
2. Run `yarn format` to fix formatting
3. Fix remaining errors manually
4. Re-run `yarn quality` until all pass

### References

- [AGENTS.md](../../AGENTS.md) — Verification checklist
- [docs/FRONTEND_CONVENTIONS.md](../FRONTEND_CONVENTIONS.md) — Conventions
