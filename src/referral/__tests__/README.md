# Tests del módulo Referral

This README implements the patterns from [docs/CONVENTIONS.md](../../../docs/CONVENTIONS.md) — Testing. See `docs/CONVENTIONS.md` for the full specification.

---

Estructura de soporte para tests escalable y mantenible.

## Estructura

```
src/referral/
├── __tests__/
│   ├── fixtures/           # Datos de prueba reutilizables
│   │   ├── referral-code.fixture.ts
│   │   ├── user.fixture.ts
│   │   ├── usage.fixture.ts
│   │   └── index.ts
│   ├── mocks/               # Mocks compartidos (ObservabilityService, ReferralMetricsService)
│   │   ├── observability.mock.ts
│   │   ├── referral-metrics.mock.ts
│   │   └── index.ts
│   ├── services/           # Specs de servicios (refleja src/services/)
│   │   └── referral-metrics.service.spec.ts
│   ├── utils/              # Specs de utils (refleja src/utils/)
│   │   ├── format-user-name.util.spec.ts
│   │   ├── generate-referral-code.util.spec.ts
│   │   ├── referral-benefits.util.spec.ts
│   │   └── referral-dto.util.spec.ts
│   ├── referral.service.spec.ts
│   └── README.md
├── referral.service.ts
├── services/
│   └── referral-metrics.service.ts
└── utils/
    ├── format-user-name.util.ts
    ├── generate-referral-code.util.ts
    ├── referral-benefits.util.ts
    └── referral-dto.util.ts
```

## Convenciones

- **Specs centralizados en `__tests__/`**: Todos los tests viven en su propia carpeta, reflejando la estructura del código fuente (`utils/`, `services/`). Facilita escalar y mantener tests separados del código productivo.
- **Fixtures**: Usar `create*Fixture(overrides)` para datos de prueba consistentes. Evita duplicar objetos mock.
- **Mocks**: Importar desde `__tests__/mocks` para ObservabilityService y ReferralMetricsService.
- **describe/it**: `describe('Clase')` > `describe('metodo')` > `it('comportamiento esperado')`.
- **Arrange-Act-Assert**: Mantener tests legibles en tres bloques claros.
- **Un concepto por test**: Preferir un `expect` principal por `it`; agrupar aserciones relacionadas si tiene sentido.

## Ejemplo de uso

```ts
// Desde referral.service.spec.ts (en __tests__/)
import {
  createMockObservabilityService,
  createMockReferralMetricsService,
} from './mocks';
import {
  createReferralCodeFixture,
  createUserFixture,
  createUserProfileFixture,
} from './fixtures';

const mockObservability = createMockObservabilityService();
const mockMetrics = createMockReferralMetricsService();

// En el test:
referralCodeRepository.findOne.mockResolvedValue(
  createReferralCodeFixture({ code: 'VALID12' }),
);
userProfileRepository.findOne.mockResolvedValue(
  createUserProfileFixture(),
);
userRepository.findOne.mockResolvedValue(createUserFixture());
```
