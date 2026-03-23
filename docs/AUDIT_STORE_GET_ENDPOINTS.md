# Auditoría: GET Store — findAll y findOne

**Objetivo**: Revisar `GET /store` (listar) y `GET /store/:id` (por ID) contra AGENTS.md, CONVENTIONS y prácticas recomendadas.

**Fecha**: 2025-03-23  
**Módulo**: `src/store/`

---

## 1. Resumen ejecutivo

| Aspecto           | Estado | Severidad |
|-------------------|--------|-----------|
| Validación params | ⚠️     | Media     |
| Autorización      | ⚠️     | Media     |
| DTO / Paginación | ⚠️     | Media     |
| Relaciones        | ⚠️     | Media     |
| Observabilidad    | ❌     | Baja      |
| Logging           | ❌     | Baja      |
| Seguridad sortBy  | ⚠️     | Baja      |

---

## 2. Hallazgos por categoría

### 2.1 Validación de parámetros

**Problema**: No se usa `ParseUUIDPipe` en `@Param('id')`.

**Evidencia**:
- `store.controller.ts` líneas 41, 76, 84, 93: `@Param('id') id: string` sin `ParseUUIDPipe`
- CONVENTIONS (docs/CONVENTIONS.md): *"findById — use ParseUUIDPipe for validation for :id params"*
- Referencia: `src/_template/template.controller.ts` usa `@Param('id', ParseUUIDPipe)`

**Impacto**: IDs inválidos devuelven 500 o comportamientos inesperados en lugar de 400 Bad Request.

**Recomendación**: Añadir `ParseUUIDPipe` en `findOne`, `remove`, `assignCashier` y `getCashiers`:

```typescript
@Get(':id')
async findOne(@Param('id', ParseUUIDPipe) id: string, ...) { ... }
```

---

### 2.2 DTO StoreFilterDto — pageSize vs limit

**Problema**: Inconsistencia entre `pageSize` y `limit`.

**Evidencia**:
- `filter-store-dto.ts` (líneas 33–42): redefine `page` y añade `pageSize` con valor por defecto 10
- `BasePaginationParams` define `limit`, no `pageSize`
- `store.service.ts` usa `filters.limit` (línea 84)
- `store.endpoints.ts` documenta `limit` como "Items per page"

**Impacto**: Si el cliente envía `?pageSize=20`, no se usa porque el servicio trabaja con `limit`. La paginación puede ignorar el tamaño deseado por el cliente.

**Recomendación**:

1. Eliminar `page` y `pageSize` redundantes de `StoreFilterDto` y usar `limit` heredado de `BasePaginationParams`; o
2. Si se mantiene `pageSize` por compatibilidad, usar algo como `limit: filters.pageSize ?? filters.limit` en el servicio y documentar bien en Swagger.

---

### 2.3 sortBy sin validación (riesgo)

**Problema**: `StoreFilterDto.sortBy` no está restringido a columnas permitidas.

**Evidencia**:
- `filter-store-dto.ts` línea 31: `sortBy?: string` sin `@IsIn`
- CONVENTIONS: *"Validate sortBy against allowed domain fields with @IsIn([...]) in filter DTOs"*

**Impacto**: `sortBy=malicious_column` o typo puede generar errores SQL o comportamientos raros.

**Recomendación**: Validar contra columnas permitidas:

```typescript
@IsOptional()
@IsIn(['createdAt', 'name', 'isActive', 'dailySalesTarget', 'updatedAt'])
sortBy?: string;
```

---

### 2.4 Autorización incompleta

**Problema**: Lógica de autorización solo contempla `BUSINESS_OWNER`.

**Evidencia** (`store.service.ts`):

**findAll** (líneas 45–52):
- Solo se aplica `businessProfileId` cuando el usuario es `BUSINESS_OWNER`
- Roles como `CASHIER` no tienen filtro y pueden ver todas las tiendas

**findOne** (líneas 135–147):
- Solo se verifica permisos para `BUSINESS_OWNER` (pertenencia al negocio)
- `CASHIER` podría acceder a cualquier store por UUID

**Pregunta de negocio**: ¿Un cajero debe ver solo sus tiendas asignadas o todas las del negocio?

**Recomendación**: Definir reglas por rol (CASHIER, ADMIN, etc.) y aplicarlas en `findAll` y `findOne`. Si CASHIER solo debe ver tiendas asignadas, filtrar por `store.cashiers` donde el cashier pertenezca al usuario.

---

### 2.5 Relaciones — findAll vs findOne

**Problema**: Diferencia de relaciones cargadas y posible pérdida de `location` en el listado.

**Evidencia**:
- **findAll** (líneas 64–68): `leftJoinAndSelect` para `schedules`, `cashiers`, `paymentMethods`. No incluye `location`.
- **findOne** (líneas 127–129): `relations: ['schedules', 'cashiers', 'paymentMethods']`. `Store.location` tiene `eager: true`, así que se carga.
- TypeORM: con `createQueryBuilder` las relaciones `eager` no se cargan automáticamente. Solo se cargan con `find()`/`findOne()`.

**Impacto**: En `findAll`, cada `Store` puede tener `location` sin cargar o inconsistente, frente a `findOne` que sí la trae.

**Recomendación**: Añadir `location` en el listado para consistencia:

```typescript
.leftJoinAndSelect('store.location', 'location')
```

---

### 2.6 Observabilidad (OpenTelemetry)

**Problema**: No se usan spans para los GET de store.

**Evidencia**:
- `store.service.ts`: sin `withSpan`
- `_template/template.service.ts`: usa `observabilityService.withSpan` en `findAll` y `findById`
- CONVENTIONS: *"Wrap critical operations with observabilityService.withSpan"*

**Recomendación**: Añadir spans en `findAll` y `findOne` siguiendo el patrón de `_template` y definiendo constantes de span en `store-span.constants.ts`.

---

### 2.7 Logging (NestJS Logger)

**Problema**: El servicio store no usa Logger.

**Evidencia**:
- AGENTS.md: *"Use NestJS Logger; never console.log, console.error, or console.warn"*
- `store.service.ts`: no hay `private readonly logger = new Logger(StoreService.name)`
- `_template/template.service.ts`: sí usa Logger

**Recomendación**: Inyectar Logger y usarlo para errores y eventos relevantes (p. ej. cache miss, acceso denegado).

---

### 2.8 Otros hallazgos menores

| Hallazgo                    | Ubicación        | Detalle                                                                 |
|----------------------------|------------------|-------------------------------------------------------------------------|
| `remove()` error handling  | store.service:243| `throw new BadRequestException('...', error)` puede filtrar stack trace |
| Respuesta entidad cruda    | findAll / findOne| Devuelve `Store` completo; considerar DTO de respuesta para controlar exposición |
| Cache TTL fijo             | findAll:86       | TTL 300 segundos hardcodeado; podría parametrizarse                     |

---

## 3. Relaciones del entity Store (referencia)

```
Store
├── location (OneToOne, eager)      — ⚠️ NO cargado en findAll con QueryBuilder
├── businessProfile (ManyToOne)
├── schedules (OneToMany)
├── cashiers (OneToMany → CashierProfile)
├── paymentMethods (ManyToMany)
├── inventoryItems (OneToMany)
├── sales (OneToMany)
└── recurringTemplates (OneToMany)
```

**findAll** carga: `schedules`, `cashiers`, `paymentMethods`.  
**findOne** carga: `schedules`, `cashiers`, `paymentMethods`; `location` vía eager.

---

## 4. Plan de corrección sugerido

| Prioridad | Acción                                                    | Esfuerzo |
|-----------|-----------------------------------------------------------|----------|
| P0        | Añadir `ParseUUIDPipe` en todos los `@Param('id')`       | Bajo     |
| P0        | Corregir StoreFilterDto (pageSize/limit) y documentación | Bajo     |
| P1        | Añadir `@IsIn` a `sortBy` en StoreFilterDto              | Bajo     |
| P1        | Definir y aplicar reglas de autorización para CASHIER   | Medio    |
| P1        | Incluir `location` en `findAll` (leftJoinAndSelect)       | Bajo     |
| P2        | Añadir ObservabilityService.withSpan                     | Medio    |
| P2        | Añadir NestJS Logger                                     | Bajo     |
| P2        | Revisar `remove()` para no exponer stack traces         | Bajo     |

---

## 5. Referencias

- [AGENTS.md](../AGENTS.md) — Golden Rule, Anti-Patterns, Canonical Contracts
- [docs/CONVENTIONS.md](CONVENTIONS.md) — Pagination, Observability, DTO validation
- [src/_template/](../src/_template/) — Patrón de referencia
- [src/store/store.service.ts](../src/store/store.service.ts)
- [src/store/store.controller.ts](../src/store/store.controller.ts)
- [src/store/dto/filter-store-dto.ts](../src/store/dto/filter-store-dto.ts)
