# Prompt: Fix Quality Issues in a File

Use this prompt to fix all quality issues in a file to align with project standards.

---

## Context (Read First)

Before proceeding, read and internalize:

- [AGENTS.md](../../AGENTS.md) — TypeScript strictness, anti-patterns
- [docs/CONVENTIONS.md](../CONVENTIONS.md) — DTOs, error handling, logging
- [.eslintrc.js](../../.eslintrc.js) — ESLint rules (max-lines, complexity, etc.)
- [src/\_template/](../../src/_template/) — Reference implementation

---

## Task

Fix all quality issues in `<path-to-file>`. Apply the following fixes.

**Placeholder:** Replace `<path-to-file>` with the actual file path (e.g. `src/store/store.service.ts`).

### 1. Remove `any` Types

- Replace with concrete types (interface, type, DTO)
- Use `Record<string, unknown>` for dynamic objects when no concrete type exists
- In .spec.ts: prefer typed mocks; if `any` needed, add `// eslint-disable-next-line @typescript-eslint/no-explicit-any` with brief justification

### 2. Add Return Types

- All public service methods: explicit return type (e.g. `Promise<TemplateItemResponseDto>`)
- Repository methods: return type from TypeORM
- Controllers may infer
- Utilities and helpers: declare return type

### 3. Reduce Complexity

- Cyclomatic complexity ≤ 10 (ESLint `complexity`)
- Extract helper functions for nested conditionals
- Use early returns to flatten logic

### 4. File Length

- Production: max 400 lines (skip blank, skip comments)
- Functions: max 50 lines (production), 80 (spec)
- Split large files into smaller modules if needed

### 5. Error Handling

- 404 → `throw new NotFoundException('Resource not found')`
- 400 → `BadRequestException` for invalid input
- 403 → `ForbiddenException` for permission denied
- 409 → `ConflictException` for duplicates
- Never expose stack traces in responses
- Log errors with `this.logger.error(message, stack, ServiceName.name)`

### 6. Logging

- Replace `console.log`, `console.error`, `console.warn` with NestJS `Logger`
- Use `private readonly logger = new Logger(ServiceName.name)`
- Signature: `this.logger.log(message, ServiceName.name)` or `this.logger.error(message, stack?, ServiceName.name)`

### 7. DTOs

- Add class-validator decorators to every property
- Required: at least one constraint (e.g. @IsString(), @IsUUID())
- Optional: @IsOptional() before other decorators
- Nested: @ValidateNested() + @Type(() => NestedDto)

### 8. Conventions

- File naming: kebab-case
- Class naming: PascalCase
- Imports: absolute `src/` for cross-module

### Verification

After fixes, run:

```bash
yarn build
yarn lint
yarn format:check
```

All must pass with zero errors and zero warnings (where rules are error level).
