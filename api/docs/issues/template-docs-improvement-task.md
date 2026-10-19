TITLE: [TASK] Align canonical template and docs with conventions
LABELS: documentation, chore

---

<!-- Use English strictly for all content below. See docs/issues/README.md -->

## Overview

Align the canonical module `src/_template/` with project conventions (findById → 404, ParseUUIDPipe, @ApiProperty) and improve documentation (docs/README.md index, CONVENTIONS Template Checklist, AGENTS_UPDATE_RECOMMENDATIONS link fix). Ensures the template remains a reliable reference for new modules.

## Steps

1. Change `findById` to throw `NotFoundException` when resource not found (404) instead of returning `null`
2. Add `ParseUUIDPipe` to `:id` params in template controller
3. Add `@ApiProperty` / `@ApiPropertyOptional` to DTOs (create, response)
4. Update template.service.spec.ts: replace "returns null" with "throws NotFoundException"
5. Create `docs/README.md` as documentation index (Conventions, Workflow, Quality, Prompts, ADRs, Issues)
6. Fix DEFINITION_OF_DONE.md link in AGENTS_UPDATE_RECOMMENDATIONS
7. Add Template Checklist to CONVENTIONS.md (findById 404, ParseUUIDPipe, @ApiProperty)
8. Refactor template.service.spec.ts to satisfy max-lines-per-function (register\*Tests helpers)

## Acceptance criteria

- [ ] `GET /template-items/:id` returns 404 when item not found (not 200 + null)
- [ ] Invalid UUID in `:id` returns 400 (ParseUUIDPipe)
- [ ] DTOs have @ApiProperty for Swagger schema
- [ ] `docs/README.md` exists with categorized index
- [ ] AGENTS_UPDATE_RECOMMENDATIONS block links correctly when pasted into AGENTS.md
- [ ] CONVENTIONS.md includes Template checklist
- [ ] All template tests pass; lint (max-lines-per-function) passes

## Technical context

- **Affected files/modules:** `src/_template/`, `src/docs/template.endpoints.ts`, `docs/`
- **Dependencies:** NestJS, class-validator, @nestjs/swagger
- **Reference plan:** `.cursor/plans/template_and_docs_improvement_6d3d8243.plan.md`

## Out of scope

- Changes to BasePaginationParams or PaginatedResponse
- New modules or migrations
- E2E tests for ParseUUIDPipe

## Resources

- [docs/CONVENTIONS.md](../CONVENTIONS.md)
- [docs/PLAN_TEMPLATE.md](../PLAN_TEMPLATE.md)
- [AGENTS.md](../../AGENTS.md)
