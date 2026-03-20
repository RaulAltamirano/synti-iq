# Prompt: Create a New NestJS Module

Use this prompt when creating a complete NestJS module from scratch.

---

## Context (Read First)

Before proceeding, read and internalize:

- [AGENTS.md](../../AGENTS.md) — Agent guide, canonical contracts, verification checklist
- [docs/CONVENTIONS.md](../CONVENTIONS.md) — DTOs, REST, Swagger, pagination, observability, testing
- [src/_template/](../../src/_template/) — Canonical module reference (every file)

---

## Task

Create a complete NestJS module for `<ENTITY>` with the following structure.

### Required Files

1. **Module** — `src/<module-name>/<module-name>.module.ts`
   - Register TypeOrmModule.forFeature, controllers, providers
   - Export the main service if consumed by other modules

2. **Controller** — `src/<module-name>/<module-name>.controller.ts`
   - Thin; delegate all logic to service
   - Use `@ApiTags()`, `@ApiDoc(docs, endpointId)` on each endpoint
   - Routes: GET (list, findById), POST (create), PATCH (update), DELETE

3. **Service** — `src/<module-name>/<module-name>.service.ts`
   - Business logic, Logger, ObservabilityService
   - Use `withSpan` for critical operations
   - Explicit return types on all public methods
   - Error handling: NotFoundException for 404

4. **Entity** — `src/<module-name>/entities/<entity>.entity.ts`
   - `@Entity('snake_case_table')`
   - kebab-case filename

5. **DTOs** — in `src/<module-name>/dto/`
   - `create-<entity>.dto.ts` — class-validator on all properties
   - `update-<entity>.dto.ts` — `PartialType(CreateXDto)` from @nestjs/swagger
   - `filter-<entity>.dto.ts` — extends BasePaginationParams, filter fields with @IsOptional()
   - `*-response.dto.ts` — response shape
   - `*-paginated.dto.ts` — `PaginatedResponse<ResponseDto>`

6. **Constants** — `src/<module-name>/constants/<module>-span.constants.ts`
   - SPAN_* for span names, ATTR_* for attributes (see [template-span.constants.ts](../../src/_template/constants/template-span.constants.ts))
   - `<MODULE>_SPAN_NAMES`, `<MODULE>_SPAN_ATTRIBUTES` objects
   - Barrel: `constants/index.ts`

7. **Metrics Service** (if domain metrics needed) — `src/<module-name>/services/<module>-metrics.service.ts`
   - Implements OnModuleInit, registers counters/histograms

8. **Endpoint Docs** — `src/docs/<module>.endpoints.ts`
   - Record<string, EndpointDocSpec> for each endpoint

9. **Tests** — `src/<module-name>/__tests__/`
   - `fixtures/` — create*Fixture(overrides?)
   - `mocks/` — createMockObservabilityService(), createMock*MetricsService()
   - `<module-name>.service.spec.ts` — happy path, edge cases, error paths
   - `services/<module>-metrics.service.spec.ts` if metrics service exists

### Conventions

- File naming: kebab-case (e.g. `create-store.dto.ts`)
- Class naming: PascalCase (e.g. `CreateStoreDto`)
- Absolute imports: `import { X } from 'src/module/...'`
- No `any` in production code
- NestJS Logger; never console.log

### Creation Order

1. Interfaces / types
2. DTOs (with class-validator)
3. Entities
4. Services
5. Controllers
6. Module registration
7. Endpoint docs
8. Tests

### Verification

After creation, run: `yarn build`, `yarn lint`, `yarn test`, `yarn format:check`
