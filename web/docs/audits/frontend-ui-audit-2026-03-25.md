# Auditoría frontend — `src/modules/ui/`

**Fecha:** 2026-03-25  
**Alcance:** Módulo UI canónico (`src/modules/ui/`), según plan de auditoría (código, a11y, UI/UX, convenciones).

---

## 1. Contexto y alcance

- **Objetivo:** Evaluar alineación con [AGENTS.md](../../AGENTS.md) y [FRONTEND_CONVENTIONS.md](../FRONTEND_CONVENTIONS.md), con rúbrica Claridad / Completitud / Consistencia / Estándares (a11y + UX).
- **Incluido:** Componentes del barrel [`src/modules/ui/components/index.ts`](../../src/modules/ui/components/index.ts), composable `useToast`, tokens y estilos (`tokens/`, `styles/`).
- **Excluido:** Módulos feature (auth, checkout, profile, etc.).

**Método:** inventario vs barrel; búsqueda estática (`text-[`, `any`, `defineComponent`); revisión de plantillas y ARIA; `yarn build-storybook` (éxito). El panel **@storybook/addon-a11y** debe usarse en Storybook interactivo por historia (no automatizado en este informe).

---

## 2. Resumen ejecutivo

El módulo UI está **bien estructurado**: barrel coherente con carpetas, **sin `any`** en código de producción del módulo, **sin `text-[13px]`** u otros tamaños prohibidos explícitos en `ui/`, y **patrones ARIA sólidos** en Autocomplete, TokenAutocomplete, Select, Input, Textarea, Toggle, Pagination, Toast e InfoBanner. **Storybook compila** correctamente.

Principales áreas de seguimiento: **deuda de estilo** (mayoría de componentes en Options API + `.ts` frente a `<script setup>` para código nuevo), **valores arbitrarios de Tailwind** (44px, 280px, etc.) que conviene tokenizar o documentar como excepciones a11y, y **historia dedicada opcional** para `ToastProvider` (integración con `useToast`).

---

## 3. Hallazgos

| Componente / área                               | Criterio         | Severidad | Evidencia                                                                                                                                                                                      |
| ----------------------------------------------- | ---------------- | --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Pagination.vue`                                | Consistencia     | Bajo      | Múltiples `min-h-[44px] min-w-[44px]` — acorde a objetivo táctil; documentar en tokens o comentario de excepción ([FRONTEND_CONVENTIONS](../FRONTEND_CONVENTIONS.md) ya menciona este patrón). |
| `Toast.vue` / `Toast.ts`                        | Consistencia     | Bajo      | `min-w-[280px] max-w-[90vw]` — valores fuera de escala; considerar variables CSS o tokens.                                                                                                     |
| `TokenAutocomplete.vue`                         | Consistencia     | Bajo      | `min-w-[7rem]`, `min-h-[2.75rem]`, `max-w-[12rem]` — alinear con escala o tokens.                                                                                                              |
| `Stepper.vue`                                   | Industria (a11y) | Bajo      | `role="progressbar"` + `aria-valuenow` — válido; algunos equipos prefieren navegación por pasos (`aria-current` en lista); revisar si auditoría WCAG estricta lo exige.                        |
| `Toast.vue`                                     | Industria (a11y) | Bajo      | `role="alert"` con `aria-live="polite"` — combinación aceptable para toasts no bloqueantes; revisar si mensajes críticos deben ser `assertive`.                                                |
| `ToastProvider.vue`                             | Completitud      | Bajo      | Exportado en barrel; **no** hay `.stories.ts` propio — las historias de `Toast.vue` montan el componente aislado; valor añadido: historia “Provider + slot” para documentar integración.       |
| 14× `defineComponent` en `.ts` / `RoleIcon.vue` | Consistencia     | Medio     | Legado documentado; **no** incumple AGENTS para componentes nuevos si los nuevos usan `<script setup>`. Migración gradual.                                                                     |
| `Select` trigger (`button`)                     | Industria (a11y) | Bajo      | Patrón listbox con `aria-haspopup`, `aria-expanded`, teclado en `Select.ts` — alineado con patrón personalizado; verificar en addon-a11y por historia.                                         |
| `useToast`                                      | Completitud      | —         | Cubierto por [`tests/ui/composables/useToast.spec.ts`](../../tests/ui/composables/useToast.spec.ts).                                                                                           |
| Storybook build                                 | Completitud      | —         | `yarn build-storybook` finalizó con éxito (2026-03-25).                                                                                                                                        |

**Inventario barrel:** Las 20 exportaciones por defecto en `index.ts` corresponden a carpetas bajo `components/`. Historias meta: `Introduction.stories.ts`, `Tokens.stories.ts` (no son componentes de producto).

**Patrones positivos (muestra):**

- [`base.css`](../../src/modules/ui/styles/base.css): `.sr-only`, `.focus-visible:focus-visible` con token de color primario.
- Combobox/listbox: Autocomplete, TokenAutocomplete con `aria-activedescendant`, `role="option"`, estados de carga/anuncios.
- `Pagination`: `role="navigation"`, `aria-label`, `aria-current="page"`.
- `Toggle`: `role="switch"`, `aria-checked`.
- `Card`: teclado en `clickable` / cabecera colapsable (`Enter` / `Space`).
- `InfoBanner`: `role` dinámico `alert` vs `status` según variante.

---

## 4. Riesgos y deuda

1. **Bifurcación Options API / script setup:** Mantenimiento y onboarding más costosos; los componentes canónicos nuevos deben seguir InfoBanner/Section ([AGENTS.md](../../AGENTS.md)).
2. **Magic numbers / arbitrarios:** Riesgo de deriva visual si no se centralizan excepciones (a11y táctil, anchos de toast).
3. **Stepper semántico:** Si se exige alineación estricta con un patrón “stepped navigation” WAI, puede hacer falta iteración de roles/estructura DOM.

---

## 5. Recomendaciones priorizadas

| Prioridad | Acción                                                                                                                                                                                     |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| P1        | Documentar en código o en convenciones las excepciones de tamaño (44px táctil, toast mínimo) como **excepciones a11y** enlazadas a tokens cuando existan equivalentes.                     |
| P2        | Añadir historia **ToastProvider** (layout + slot + toast global) para documentar el flujo real de la app.                                                                                  |
| P3        | Plan de migración **opcional** de componentes de mayor uso a `<script setup>` (sin big-bang).                                                                                              |
| P4        | Pasada manual con **addon-a11y** en Storybook por cada historia UI y toolbar de viewport (mobile/tablet/desktop) ya configurado en [`.storybook/preview.ts`](../../.storybook/preview.ts). |

---

## 6. Actualización sugerida (Audit Summary)

- Conteos de taxonomía: **sin cambio** (11 foundation, 9 pattern, 1 composable, tokens/estilos como antes).
- **Patrón actual:** confirmado mix Options API + script setup; arbitrarios localizados principalmente en Pagination, Toast, TokenAutocomplete, Stepper, RoleIcon.
- Enlace **Latest audit:** este documento.

**Seguimiento (post-auditoría):** Pagination/Toast/TokenAutocomplete alineados con escala Tailwind y tokens (`min-h-11`, `min-w-toast`, etc.); historia `ToastProvider`; checklist a11y manual y migración legado documentados en [FRONTEND_CONVENTIONS.md](../FRONTEND_CONVENTIONS.md).

---

## 7. Verificación post-corrección

Tras implementar cambios de código:

`yarn build` → `yarn lint` → `yarn type-check` → `yarn format:check` → `yarn test` → `yarn build-storybook` (o `yarn quality` / `yarn pre-pr` si aplica).

---

## Referencias

- [AGENTS.md](../../AGENTS.md)
- [FRONTEND_CONVENTIONS.md](../FRONTEND_CONVENTIONS.md)
- [PLAN_TEMPLATE.md](../PLAN_TEMPLATE.md)
