# Synti-IQ API — Documentation Index

Central index for project documentation. See [AGENTS.md](../AGENTS.md) for the agent guide.

---

## Conventions

| Document                             | Purpose                                                                        |
| ------------------------------------ | ------------------------------------------------------------------------------ |
| [CONVENTIONS.md](CONVENTIONS.md)     | Technical conventions: DTOs, REST, Swagger, pagination, testing, observability |
| [LOGGING.md](LOGGING.md)             | Logging conventions: NestJS Logger, Pino, levels, error signature              |
| [PLAN_TEMPLATE.md](PLAN_TEMPLATE.md) | Technical plan format for AI agents                                            |

---

## Workflow

| Document                                           | Purpose                                               |
| -------------------------------------------------- | ----------------------------------------------------- |
| [DEVELOPMENT_WORKFLOW.md](DEVELOPMENT_WORKFLOW.md) | Issue → Branch → Implement → Pre-PR → PR → CI → Merge |
| [PR_REVIEW_PIPELINE.md](PR_REVIEW_PIPELINE.md)     | CI, SonarCloud, AI review, Discord notifications      |

---

## Quality

| Document                                       | Purpose                            |
| ---------------------------------------------- | ---------------------------------- |
| [QUALITY_METRICS.md](QUALITY_METRICS.md)       | Coverage thresholds, measurement   |
| [SONAR_QUALITY_GATE.md](SONAR_QUALITY_GATE.md) | SonarQube/SonarCloud configuration |

---

## Prompts

Reusable prompts for AI-assisted workflows.

| Prompt                                                       | Purpose                                 |
| ------------------------------------------------------------ | --------------------------------------- |
| [prompts/new-issue.md](prompts/new-issue.md)                 | Create GitHub issues from requirements  |
| [prompts/new-module.md](prompts/new-module.md)               | Create a new NestJS module from scratch |
| [prompts/pre-pr-review.md](prompts/pre-pr-review.md)         | Pre-PR verification checklist           |
| [prompts/code-review.md](prompts/code-review.md)             | AI code review categories               |
| [prompts/new-adr.md](prompts/new-adr.md)                     | Create Architecture Decision Records    |
| [prompts/write-tests.md](prompts/write-tests.md)             | Test authoring guidance                 |
| [prompts/fix-quality.md](prompts/fix-quality.md)             | Fix quality issues                      |
| [prompts/audit-requirement.md](prompts/audit-requirement.md) | Audit requirements                      |

---

## Architecture Decisions

| Document                             | Purpose                           |
| ------------------------------------ | --------------------------------- |
| [adr/000-index.md](adr/000-index.md) | ADR index and when to create ADRs |

---

## Issues

| Document                                   | Purpose                                              |
| ------------------------------------------ | ---------------------------------------------------- |
| [issues/README.md](issues/README.md)       | Issue drafts, format, commands                       |
| [issues/TEMPLATES.md](issues/TEMPLATES.md) | Issue type templates (TASK, STORY, BUG, EPIC, SPIKE) |

---

## Other

| Document                                                           | Purpose                                |
| ------------------------------------------------------------------ | -------------------------------------- |
| [STORE_AND_SUBSCRIPTION_PLANS.md](STORE_AND_SUBSCRIPTION_PLANS.md) | Subscription limits and store behavior |
| [MAIL_DELIVERABILITY.md](MAIL_DELIVERABILITY.md)                   | Mail configuration and deliverability  |
