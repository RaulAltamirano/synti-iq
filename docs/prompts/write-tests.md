# Prompt: Write Comprehensive Tests for a Service

Use this prompt to generate unit tests for an existing NestJS service.

---

## Context (Read First)

Before proceeding, read and internalize:

- [AGENTS.md](../../AGENTS.md) — Quality gates, verification
- [docs/CONVENTIONS.md](../CONVENTIONS.md) — Testing section, **tests** structure
- [src/\_template/**tests**/](../../src/_template/__tests__/) — Canonical test structure
- [src/\_template/**tests**/template.service.spec.ts](../../src/_template/__tests__/template.service.spec.ts) — Example spec

---

## Task

Generate comprehensive unit tests for the service at `<path-to-service>`.

**Placeholder:** Replace `<path-to-service>` with the actual path (e.g. `src/store/store.service.ts`).

### Structure

- If module has 3+ specs or shared fixtures: use `__tests__/` folder
- Colocated `*.spec.ts` next to source for single spec
- Mirror path: `__tests__/services/foo.service.spec.ts` for `services/foo.service.ts`

### Required Elements

1. **Fixtures** — `create*Fixture(overrides?: Partial<Entity>)`
   - Export from `fixtures/index.ts`
   - Use spread for overrides

2. **Mocks**
   - `createMockObservabilityService()` — `withSpan` must execute the callback: `jest.fn((_name, fn) => fn(span))`
   - `createMock*MetricsService()` — mock recordCreate, recordList, etc.
   - Export from `mocks/index.ts`

3. **Test Cases**

   **Happy path:**
   - Returns expected structure (paginated: items, total, page, totalPages, limit)
   - Persists correctly (create, update)
   - Calls repository with correct arguments

   **Edge cases:**
   - Empty result (empty array, total 0)
   - Null/undefined handling
   - Default values (page=1, limit=10, sortOrder=DESC)

   **Error paths:**
   - NotFoundException when resource not found (update, delete, findById if applicable)
   - Correct exception message

   **Observability:**
   - withSpan called with correct span name constant
   - Metrics service methods called when applicable

### Conventions

- `describe('ServiceName')` → `describe('methodName')` → `it('expected behavior')`
- Arrange-Act-Assert
- Mock Logger: `jest.spyOn(Logger.prototype, 'log').mockImplementation()`
- Clear mocks in beforeEach: `jest.clearAllMocks()`
- Restore in afterEach: `jest.restoreAllMocks()`

### Example Pattern

```typescript
it('throws NotFoundException when item not found', async () => {
  templateItemRepository.findOne.mockResolvedValue(null);

  await expect(service.update('non-existent', { name: 'Updated' })).rejects.toThrow(
    NotFoundException,
  );
  await expect(service.update('non-existent', { name: 'Updated' })).rejects.toThrow(
    'Template item not found',
  );
});
```

### Verification

Run `yarn test` — all tests must pass.
