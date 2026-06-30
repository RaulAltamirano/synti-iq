# Synti-IQ Web — PR Review Pipeline

Pre-PR verification pipeline for the Synti-IQ frontend application.

---

## Overview

Before opening a pull request, ensure all quality gates pass. Use the following resources:

| Document | Purpose |
| -------- | ------- |
| [prompts/pre-pr-review.md](prompts/pre-pr-review.md) | Step-by-step checklist and commands |
| [QUALITY_METRICS.md](QUALITY_METRICS.md) | Target metrics and verification pipeline |

---

## Quick Reference

Run the full verification pipeline:

```bash
yarn quality
```

Or run steps individually: `yarn build` → `yarn lint` → `yarn type-check` → `yarn format:check` → `yarn test` → `yarn build-storybook`.
