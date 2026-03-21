# Checklist de features pendientes - synti-iq-api

**Fecha de análisis:** 19 de marzo de 2025  
**Propósito:** Revisión exhaustiva antes de subir cambios al repositorio remoto.

---

## Resumen ejecutivo

| Categoría                | Cantidad | Estado                                             |
| ------------------------ | -------- | -------------------------------------------------- |
| Archivos modificados (M) | 56       | Pendientes de commit                               |
| Archivos nuevos (??)     | 22       | Sin trackear                                       |
| Archivos eliminados (D)  | 2        | create-store.input, update-store                   |
| Tests fallando           | 0        | Corregidos (profile-approval, factory, validation) |
| Placeholders / TODOs     | 0        | Stripe: env vars STRIPE_PRICE_BASIC/PRO            |

---

## 1. FEATURES NUEVOS (sin trackear - ??)

### 1.1 Sistema de Referral

- [x] **Módulo `src/referral/`** (implementado)
  - `referral.controller.ts` - Endpoints: GET/POST me/code, me/referrer, me/stats, me, validate/:code
  - `referral.service.ts` - Validación de códigos, registro de uso, stats
  - `referral.module.ts`
  - `entities/referral_code.entity.ts` - Tabla `referral_codes`
  - `entities/referral_usage.entity.ts` - Tabla `referral_usage`
  - `dto/referral-validation-response.dto.ts`
  - `utils/generate-referral-code.util.ts`
- [x] **Postman** - `postman/collections/referral.postman_collection.json`
- [x] **Integración** - Auth `registerBusiness` acepta `referralCode` opcional y registra uso
- [ ] **Revisar:** Migración de tabla `referral_codes` y `referral_usage` (¿existe en TypeORM sync/migrations?)

### 1.2 Registro de negocio (Register Business)

- [x] **DTO** `src/auth/dto/register-business.dto.ts` - Campos: email, password, firstName, lastName, businessName, referralCode (opcional)
- [x] **Endpoint** `POST /auth/register-business` - Crea usuario BUSINESS_OWNER + BusinessProfile
- [x] **Lógica** - En `auth.service.ts`: crear perfil de negocio, validar código referral, generar código propio

### 1.3 Business Profile

- [x] **Módulo** `src/business-profile/` (implementado)
  - `business_profile.module.ts`
  - `entities/business_profile.entity.ts` - Tabla `business_profiles`
  - `dto/create-business-profile.dto.ts`
- [x] **Relación** - Store ahora tiene `businessProfileId` (obligatorio) y relación ManyToOne con BusinessProfile
- [ ] **Revisar:** Migración de tabla `business_profiles` (TypeORM entities)

### 1.4 Planes de suscripción

- [x] **Entidad** `src/subscription/entities/subscription-plan.entity.ts` - Tabla `subscription_plans`
- [x] **DTO** `src/subscription/dto/subscription-plan-response.dto.ts`
- [x] **Seed** `src/database/seeds/subscription-plans.seed.ts` - Plans: Basic, Professional, Enterprise
- [x] **Script** `yarn seed:subscription_plans` en package.json
- [x] **Stripe:** Usa `STRIPE_PRICE_BASIC` y `STRIPE_PRICE_PRO` (env); fallback `price_xxx`/`price_yyy` en dev

### 1.5 Store - extensiones

- [x] **DTO** `src/store/dto/assign-cashier.dto.ts` - Asignar cajero a tienda
- [x] **DTO** `src/store/dto/store-schedule-item.dto.ts` - Horarios por día (dayOfWeek, openTime, closeTime)
- [x] **Endpoint** `POST /store/:id/cashiers` - Asignar cashier
- [x] **Endpoint** `GET /store/:id/cashiers` - Listar cashiers de tienda
- [x] **CreateStoreDto** - Soporta `schedules` con validación (UniqueScheduleDays, ScheduleTimesOrder)

### 1.6 Migraciones SQL

- [ ] **No aplica** — Migración user-profiles unique index eliminada (no necesaria). TypeORM sincroniza schema desde entidades.
- [ ] **Verificar:** ¿Existe migración para `subscription_plans`? ¿Y para `business_profiles`? ¿Y para `referral_codes` / `referral_usage`?

### 1.7 Postman modular

- [x] **Estructura** `postman/` - Colecciones por dominio (auth, referral, stores, etc.)
- [x] **Script** `yarn postman:build` - Regenera Synti-IQ-API.postman_collection.json
- [x] **README** `postman/README.md` - Documentación de uso

### 1.8 Tests unitarios nuevos

- [ ] **`src/store/dto/create-store.dto.spec.ts`** - Pasa ✓
- [ ] **`src/shared/utils/date-utils.spec.ts`** - Revisar cobertura

---

## 2. FEATURES MODIFICADOS (M - staged)

### 2.1 Auth

- [ ] `auth.controller.ts` - Nuevo endpoint `register-business`
- [ ] `auth.service.ts` - `registerBusiness()`, integración con ReferralService, creación BusinessProfile
- [ ] `auth.module.ts` - Import ReferralModule
- [ ] `auth-response.dto.ts` - Cambios en estructura
- [ ] `filter-user.dto.ts` - Campo `isPendingApproval`
- [ ] `sign-up.dto.ts` - Ajustes
- [ ] `guards/user-role.guard.ts` - Ajustes
- [ ] `docs/auth.endpoints.ts` - Documentación register-business

### 2.2 Store

- [ ] `store.entity.ts` - `businessProfileId` + relación BusinessProfile, eliminado campo anterior si existía
- [ ] `store.service.ts` - Filtro por businessProfileId para BUSINESS_OWNER, `assignCashierToStore`, `getCashiersFromStore`, create con schedules
- [ ] `store.controller.ts` - Endpoints asignar/listar cashiers
- [ ] `store.module.ts` - Posibles dependencias nuevas
- [ ] `create-store.dto.ts` - Soporte schedules, validadores
- [ ] `filter-store-dto.ts` - `businessProfileId`
- [ ] **Eliminados:** `create-store.input.ts.ts`, `update-store.input.ts`

### 2.3 User Profile

- [ ] `user_profile.entity.ts` - Cambios
- [ ] `profile-factory.service.ts` - Creación BusinessProfile
- [ ] `profile-approval.service.ts` - Soporte BusinessProfileRepository
- [ ] `profile-validation.service.ts` - Validación BusinessProfile
- [ ] `profile-activity.service.ts` - Cambios
- [ ] `profile-repository.helper.ts` - BusinessProfileRepository
- [ ] `profile-creation.strategy.ts` - Estrategia para BusinessProfile
- [ ] `user_profile.service.ts` - Cambios
- [ ] `user_profile.module.ts` - BusinessProfileModule

### 2.4 Location

- [ ] `create-address.dto.ts` - Campos nuevos (31 líneas añadidas)
- [ ] `create-location.dto.ts` - Ajustes
- [ ] `location.entity.ts` - Cambios (24 líneas)
- [ ] `location.service.ts` - Lógica actualizada (114 líneas)

### 2.5 User & User Session

- [ ] `user.service.ts` - Filtro `isPendingApproval`
- [ ] `user.entity.ts` - Cambios
- [ ] `CreateUserDto.ts`, `UpdateUserDto.ts`, `UserProfileResponseDto.ts`
- [ ] `filter-user-params.ts`
- [ ] `user-session.service.ts`
- [ ] `user-session-paginated-response.dto.ts`
- [ ] `docs/user-session.endpoints.ts`

### 2.6 Store Schedule

- [ ] `store-schedule.entity.ts` - Cambios
- [ ] `store-schedule.controller.ts` - Ajustes (32 líneas)
- [ ] `store-schedule.controller.spec.ts` - Actualizar mocks

### 2.7 Otros

- [ ] `pagination/PaginatedResponse.ts`, `PaginationCacheUtil.ts`
- [ ] `product/product.service.ts`
- [ ] `shared/enums/roles.enum.ts` - Rol BUSINESS_OWNER
- [ ] `shared/utils/date-utils.ts` - Utilidades
- [ ] `cashier-schedule-assignment.service.ts`
- [ ] `database/scripts/seed-runner.ts` - Nuevo caso subscription_plans
- [ ] `database/seeds/roles.seed.ts` - Rol business_owner
- [ ] `database/seeds/seeds-standalone.module.ts` - SubscriptionPlansSeed
- [ ] `database/seeds/users.seed.ts` - Creación referral codes para business
- [ ] `subscription/subscription.module.ts` - SubscriptionPlan entity
- [ ] `core/app.module.ts` - BusinessProfileModule, ReferralModule

---

## 3. TESTS FALLANDO (corregir antes de push)

**Estado:** Corregidos (19 mar 2025)

| Suite                                | Solución aplicada                                                      |
| ------------------------------------ | ---------------------------------------------------------------------- |
| `profile-factory.service.spec.ts`    | `as unknown as QueryRunner`; añadido `BusinessProfileStrategy` mock    |
| `profile-validation.service.spec.ts` | `as unknown as QueryRunner`; añadido `BusinessProfile` repository mock |
| `profile-approval.service.spec.ts`   | Añadido `getRepositoryToken(BusinessProfile)` con mock `findOne`       |

---

## 4. PLACEHOLDERS / TODOS

**Estado:** Resuelto (19 mar 2025)

| Archivo                      | Solución                                                                                                                                                                    |
| ---------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `subscription-plans.seed.ts` | Usa `process.env.STRIPE_PRICE_BASIC` y `STRIPE_PRICE_PRO`; fallback `price_xxx`/`price_yyy` en dev. Documentado en `.env.example` y `docs/STORE_AND_SUBSCRIPTION_PLANS.md`. |

---

## 5. DOCUMENTACIÓN PENDIENTE

- [x] **`docs/STORE_AND_SUBSCRIPTION_PLANS.md`** — Existe y actualizado
  - Creación de stores, límites por plan, max_stores (planificado), Stripe env vars
  - Plan–BusinessProfile y enforcement de max_stores documentados como trabajo futuro

---

## 6. MIGRACIONES / BASE DE DATOS

- [ ] Confirmar que TypeORM sincroniza o que existen migraciones para:
  - `subscription_plans`
  - `business_profiles`
  - `referral_codes`
  - `referral_usage`
- [ ] Ejecutar `yarn seed:subscription_plans` tras crear tablas
- [ ] Verificar que `store` tiene columna `business_profile_id` y FK correcta

---

## 7. COMMITS SUGERIDOS (orden lógico)

1. **feat(subscription):** Subscription plans entity, seed, DTO
2. **feat(business-profile):** BusinessProfile entity, module
3. **feat(referral):** Sistema de referral (códigos, uso, endpoints)
4. **feat(auth):** Register business + integración referral
5. **feat(store):** BusinessProfile en Store, assign cashier, schedules en create
6. **feat(user-profile):** BusinessProfile en profile factory/approval
7. **feat(postman):** Colecciones modulares
8. **fix(tests):** Profile approval, factory, validation specs
9. **docs:** Crear STORE_AND_SUBSCRIPTION_PLANS.md
10. **chore:** Añadir stripe placeholder env (opcional)

---

## 8. COMANDOS DE VERIFICACIÓN

```bash
# Tests
yarn test

# Lint
yarn lint:check

# Build
yarn build

# Seeds (requiere DB)
yarn seed:subscription_plans

# Postman
yarn postman:build
```

---

## 9. CONVENCIONES (docs/CONVENTIONS.md)

- **Entity file naming:** `referral_code.entity.ts`, `referral_usage.entity.ts`, `business_profile.entity.ts` usan snake_case. CONVENTIONS indica kebab-case para módulos nuevos (`referral-code.entity.ts`). Refactor opcional; ver Plan 4 en `.cursor/plans/`.
- **Verificación:** `yarn build`, `yarn lint`, `yarn test`, `yarn format:check` antes de commit.

---

## 10. DEPENDENCIAS ENTRE FEATURES

```
BusinessProfile  ──► Store (businessProfileId)
                 ──► UserProfile (profile_type=business_owner)
                 ──► ReferralCode

Auth.registerBusiness ──► BusinessProfile + ReferralService
Store.create      ──► BusinessProfile (inferido del usuario)
Referral          ──► BusinessProfile (owner del código)
SubscriptionPlan  ──► (futuro) límites por plan
```

---

_Checklist actualizada 19 mar 2025. Revisar manualmente antes de merge._
