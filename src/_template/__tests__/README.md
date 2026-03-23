# Template Module Tests

This README implements the patterns from [docs/CONVENTIONS.md](../../../docs/CONVENTIONS.md) — Testing. See `docs/CONVENTIONS.md` for the full specification.

---

Support structure for scalable and maintainable tests.

## Structure

```
src/_template/
├── __tests__/
│   ├── dto/                # DTO validation specs (plainToInstance + validate)
│   │   ├── create-template-item.dto.spec.ts
│   │   └── filter-template-item.dto.spec.ts
│   ├── fixtures/           # Reusable test data
│   │   ├── template-item.fixture.ts
│   │   └── index.ts
│   ├── mocks/               # Shared mocks (ObservabilityService, TemplateMetricsService)
│   │   ├── observability.mock.ts
│   │   ├── template-metrics.mock.ts
│   │   └── index.ts
│   ├── services/           # Specs mirroring src/services/
│   │   └── template-metrics.service.spec.ts
│   ├── template.service.spec.ts
│   └── README.md
├── template.service.ts
├── services/
│   └── template-metrics.service.ts
└── ...
```

## Conventions

- **Centralized specs in `__tests__/`**: All tests live in their own folder, mirroring the source structure (`services/`, `dto/`). Facilitates scaling and keeping tests separate from production code.
- **Fixtures**: Use `create*Fixture(overrides)` for consistent test data. Avoids duplicating mock objects.
- **Mocks**: Import from `__tests__/mocks` for ObservabilityService and TemplateMetricsService.
- **describe/it**: `describe('Class')` > `describe('method')` > `it('expected behavior')`.
- **Arrange-Act-Assert**: Keep tests readable in three clear blocks.
- **One concept per test**: Prefer one main `expect` per `it`; group related assertions when it makes sense.
- **DTO specs**: Use `plainToInstance` + `validate` from class-transformer/class-validator for Create and Filter DTOs with custom validators or transform logic.

## Example usage

```ts
// From template.service.spec.ts (in __tests__/)
import { createMockObservabilityService, createMockTemplateMetricsService } from './mocks';
import { createTemplateItemFixture } from './fixtures';

const mockObservability = createMockObservabilityService();
const mockMetrics = createMockTemplateMetricsService();

// In the test:
templateItemRepository.findOne.mockResolvedValue(createTemplateItemFixture({ name: 'Test Item' }));
```
