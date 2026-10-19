# Code Review Standards

Standards for pull request review: responsibilities, SLA, and approval criteria. Aligned with DORA Lead Time targets.

**References:** [DEFINITION_OF_DONE.md](../DEFINITION_OF_DONE.md), [docs/prompts/code-review.md](prompts/code-review.md), [PR_REVIEW_PIPELINE.md](PR_REVIEW_PIPELINE.md)

---

## Responsibilities

### Author

- Fill PR template completely (What & Why, Changes Summary, Type, Definition of Done)
- Link issue with `Closes #N`
- Ensure PR title follows Conventional Commits
- Address review feedback promptly
- Run `yarn quality` before opening PR

### Reviewer

- Review within SLA (see below)
- Use the 8-category structure from [code-review.md](prompts/code-review.md)
- Approve only when all criteria pass
- Provide actionable, specific feedback

---

## SLA (DORA Lead Time)

| Metric                  | Target   | Notes                   |
| ----------------------- | -------- | ----------------------- |
| First review response   | &lt; 24h | Business days           |
| Re-review after changes | &lt; 24h | Same reviewer preferred |
| Hotfix review           | &lt; 4h  | Urgent production fixes |

---

## Approval Criteria

All must pass for approval:

| Category                    | Criteria                                                                                          |
| --------------------------- | ------------------------------------------------------------------------------------------------- |
| **Architecture**            | No business logic in controllers; repository layer respected; module structure matches \_template |
| **TypeScript**              | No `any`; explicit return types on services                                                       |
| **DTOs & Validation**       | class-validator on all properties; @IsOptional for optional fields                                |
| **Error Handling**          | Correct HTTP exceptions (404→NotFound, 400→BadRequest, etc.)                                      |
| **Logging & Observability** | NestJS Logger; withSpan for critical ops; no console                                              |
| **Testing**                 | Unit tests for business logic; mocks execute callbacks                                            |
| **API & Documentation**     | ApiDoc on endpoints; Swagger complete                                                             |
| **Conventions**             | kebab-case files; PascalCase classes; absolute imports                                            |

**AI Review:** The pipeline runs an 8-category AI review. Human reviewer must still verify and approve.

---

## References

- [code-review.md](prompts/code-review.md) — AI review categories
- [DEFINITION_OF_DONE.md](../DEFINITION_OF_DONE.md)
- [PR_REVIEW_PIPELINE.md](PR_REVIEW_PIPELINE.md)
