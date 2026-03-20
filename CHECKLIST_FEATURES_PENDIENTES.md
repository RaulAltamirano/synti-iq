# Checklist de features pendientes - synti-iq-api

**Fecha de análisis:** 18 de marzo de 2025  
**Propósito:** Revisión exhaustiva antes de subir cambios al repositorio remoto.

---

## Resumen ejecutivo

| Categoría                    | Cantidad | Estado                         |
|-----------------------------|----------|--------------------------------|
| Archivos modificados (M)    | 56       | Pendientes de commit          |
| Archivos nuevos (??)       | 22       | Sin trackear                  |
| Archivos eliminados (D)     | 2        | create-store.input, update-store |
| Tests fallando              | 3 suites | Requieren corrección          |
| Placeholders / TODOs        | 2        | Reemplazar antes de prod      |

---

## 1. FEATURES NUEVOS (sin trackear - ??)

### 1.1 Sistema de Referral
- [ ] **Módulo `src/referral/`**
  - `referral.controller.ts` - Endpoints: GET/POST me/code, me/referrer, me/stats, me, validate/:code
  - `referral.service.ts` - Validación de códigos, registro de uso, stats
  - `referral.module.ts`
  - `entities/referral_code.entity.ts` - Tabla `referral_codes`
  - `entities/referral_usage.entity.ts` - Tabla `referral_usage`
  - `dto/referral-validation-response.dto.ts`
  - `utils/generate-referral-code.util.ts`
- [ ] **Postman** - `postman/collections/referral.postman_collection.json`
- [ ] **Integración** - Auth `registerBusiness` acepta `referralCode` opcional y registra uso
- [ ] **Revisar:** Migración de tabla `referral_codes` y `referral_usage` (¿existe en TypeORM sync/migrations?)

### 1.2 Registro de negocio (Register Business)
- [ ] **DTO** `src/auth/dto/register-business.dto.ts` - Campos: email, password, firstName, lastName, businessName, referralCode (opcional)
- [ ] **Endpoint** `POST /auth/register-business` - Crea usuario BUSINESS_OWNER + BusinessProfile
- [ ] **Lógica** - En `auth.service.ts`: crear perfil de negocio, validar código referral, generar código propio

### 1.3 Business Profile
- [ ] **Módulo** `src/business-profile/`
  - `business_profile.module.ts`
  - `entities/business_profile.entity.ts` - Tabla `business_profiles`
  - `dto/create-business-profile.dto.ts`
- [ ] **Relación** - Store ahora tiene `businessProfileId` (obligatorio) y relación ManyToOne con BusinessProfile
- [ ] **Revisar:** Migración de tabla `business_profiles` (TypeORM entities)

### 1.4 Planes de suscripción
- [ ] **Entidad** `src/subscription/entities/subscription-plan.entity.ts` - Tabla `subscription_plans`
- [ ] **DTO** `src/subscription/dto/subscription-plan-response.dto.ts`
- [ ] **Seed** `src/database/seeds/subscription-plans.seed.ts` - Plans: Basic, Professional, Enterprise
- [ ] **Script** `yarn seed:subscription_plans` en package.json
- [ ] **⚠️ Placeholder:** `stripePriceId: 'price_xxx'` y `'price_yyy'` en Basic/Pro - reemplazar por IDs reales de Stripe

### 1.5 Store - extensiones
- [ ] **DTO** `src/store/dto/assign-cashier.dto.ts` - Asignar cajero a tienda
- [ ] **DTO** `src/store/dto/store-schedule-item.dto.ts` - Horarios por día (dayOfWeek, openTime, closeTime)
- [ ] **Endpoint** `POST /store/:id/cashiers` - Asignar cashier
- [ ] **Endpoint** `GET /store/:id/cashiers` - Listar cashiers de tienda
- [ ] **CreateStoreDto** - Soporta `schedules` con validación (UniqueScheduleDays, ScheduleTimesOrder)

### 1.6 Migraciones SQL
- [ ] **`src/database/migrations/user-profiles-unique-profile-type-id.sql`**
  ```sql
  CREATE UNIQUE INDEX IF NOT EXISTS "UQ_user_profiles_profile_type_id" 
      ON user_profiles (profile_type, profile_id) 
      WHERE profile_id IS NOT NULL;
  ```
- [ ] **Verificar:** ¿Existe migración para `subscription_plans`? ¿Y para `business_profiles`? ¿Y para `referral_codes` / `referral_usage`?

### 1.7 Postman modular
- [ ] **Estructura** `postman/` - Colecciones por dominio (auth, referral, stores, etc.)
- [ ] **Script** `yarn postman:build` - Regenera Synti-IQ-API.postman_collection.json
- [ ] **README** `postman/README.md` - Documentación de uso

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

| Suite                               | Error                                                                 |
|-------------------------------------|-----------------------------------------------------------------------|
| `profile-factory.service.spec.ts`   | `mockQueryRunner as QueryRunner` - TypeScript: mock incompleto (QueryRunner tiene 74+ props) |
| `profile-validation.service.spec.ts`| Mismo error: mock QueryRunner incompleto                               |
| `profile-approval.service.spec.ts`  | `BusinessProfileRepository` no está en RootTestModule - falta mock o import |

**Acción:** Añadir mock de `BusinessProfileRepository` en profile-approval.service.spec.ts y corregir casts en profile-factory/profile-validation (usar `as unknown as QueryRunner` o mock más completo).

---

## 4. PLACEHOLDERS / TODOS

| Archivo                               | Línea | Detalle                                           |
|--------------------------------------|-------|---------------------------------------------------|
| `subscription-plans.seed.ts`         | 31, 52| `stripePriceId: 'price_xxx'`, `'price_yyy'`       |

**Acción:** Cuando tengas IDs de Stripe reales, reemplazar. Para desarrollo local puede quedar; para staging/prod usar variables de entorno.

---

## 5. DOCUMENTACIÓN PENDIENTE

- [ ] **README** menciona `docs/STORE_AND_SUBSCRIPTION_PLANS.md` - **El archivo NO existe**
  - Crear doc que explique: creación de stores, límites por plan, max_stores por suscripción

---

## 6. MIGRACIONES / BASE DE DATOS

- [ ] Ejecutar `user-profiles-unique-profile-type-id.sql` si aplica
- [ ] Confirmar que TypeORM sincroniza o que existen migraciones para:
  - `subscription_plans`
  - `business_profiles`
  - `referral_codes`
  - `referral_usage`
- [ ] Ejecutar `yarn seed:subscription_plans` tras crear tablas
- [ ] Verificar que `store` tiene columna `business_profile_id` y FK correcta

---

## 7. COMMITS SUGERIDOS (orden lógico)

1. **chore(db):** Migración user-profiles unique index
2. **feat(subscription):** Subscription plans entity, seed, DTO
3. **feat(business-profile):** BusinessProfile entity, module
4. **feat(referral):** Sistema de referral (códigos, uso, endpoints)
5. **feat(auth):** Register business + integración referral
6. **feat(store):** BusinessProfile en Store, assign cashier, schedules en create
7. **feat(user-profile):** BusinessProfile en profile factory/approval
8. **feat(postman):** Colecciones modulares
9. **fix(tests):** Profile approval, factory, validation specs
10. **docs:** Crear STORE_AND_SUBSCRIPTION_PLANS.md
11. **chore:** Añadir stripe placeholder env (opcional)

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

## 9. DEPENDENCIAS ENTRE FEATURES

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

*Checklist generada automáticamente. Revisar manualmente antes de merge.*
