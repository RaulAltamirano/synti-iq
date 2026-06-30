# SyntiIQ UI Component System

Sistema de componentes UI primitivos reutilizables construidos con Vue 3, TypeScript y Tailwind CSS.

## Instalación

Los componentes ya están incluidos en el proyecto. No se requiere instalación adicional.

## Uso

### Importar componentes

```typescript
import {
  Button,
  Input,
  Card,
  Badge,
  Select,
  Avatar,
  Spinner,
  Autocomplete,
  TokenAutocomplete,
  Stepper,
  InfoBanner,
} from '@/modules/ui';
```

### Ejemplo básico

```vue
<template>
  <div>
    <Button variant="primary" size="md" @click="handleClick"> Click me </Button>

    <Input
      v-model="email"
      type="email"
      label="Email"
      placeholder="email@example.com"
      :error="hasError"
      error-message="Please enter a valid email"
    />

    <Card variant="elevated" padding="lg">
      <template #header>
        <h3>Card Title</h3>
      </template>
      <p>Card content</p>
      <template #footer>
        <Button>Action</Button>
      </template>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Button, Input, Card } from '@/modules/ui';

const email = ref('');
const hasError = ref(false);
</script>
```

## Componentes exportados (`components/index.ts`)

| Tier        | Componentes                                                                                                  |
| ----------- | ------------------------------------------------------------------------------------------------------------ |
| Foundation  | Button, Input, Textarea, Badge, Avatar, Spinner, Skeleton, Toggle, RoleIcon, Autocomplete, TokenAutocomplete |
| Pattern     | Card, Select, Toast, ToastProvider, Pagination, Section, SectionSkeleton, InfoBanner, Stepper                |
| Composables | `useToast`                                                                                                   |

Los **design tokens** están en `tokens/` (`colors`, `spacing`, `typography`, `shadows`) y en `styles/tokens.css`.

## Modales de confirmación y estado (Storybook)

Los componentes **ConfirmModal** y **StatusModal** viven en `src/modules/shared/components/` (no en este barrel). Sus historias de Storybook están colocalizadas allí (`Shared/ConfirmModal`, `Shared/StatusModal`) para evitar carpetas “solo stories” bajo `ui/components/`.

## Design Tokens

```typescript
import { colors, spacing, typography, shadows } from '@/modules/ui/tokens';
```

### CSS Variables

Los tokens también están disponibles como CSS variables (ver `styles/tokens.css`).

## Dark Mode

Añade la clase `dark` al elemento raíz:

```javascript
document.documentElement.classList.add('dark');
```

## Storybook

```bash
yarn storybook
```

Abre `http://localhost:6006` para variantes, props y documentación autogenerada.

## Estructura de archivos

```
src/modules/ui/
├── components/          # Componentes por carpeta (ComponentName.vue, *.ts, *.stories.ts)
├── composables/         # useToast, etc.
├── tokens/              # Design tokens TypeScript
├── styles/              # base.css, tokens.css
└── types/               # Tipos compartidos
```

## Convenciones

- Cada componente UI: carpeta con `ComponentName.vue`, lógica opcional en `ComponentName.ts`, y `ComponentName.stories.ts`.
- Los componentes nuevos deben preferir `<script setup lang="ts">` (referencia: `InfoBanner`, `Section`).
- Props tipados; sin `any` en superficie pública.
- Patrones accesibles por defecto (etiquetas, ARIA en combobox/listbox, foco).

## Checklist antes de cambiar `ui/`

Usar como guía rápida (la norma detallada sigue en la documentación del repo):

1. Leer [AGENTS.md](../../AGENTS.md) (referencias canónicas, verificación).
2. Leer [docs/FRONTEND_CONVENTIONS.md](../../docs/FRONTEND_CONVENTIONS.md) (taxonomía Foundation/Pattern, tokens, Storybook, estado).
3. Componentes nuevos: plantilla [InfoBanner](components/InfoBanner/) o [Section](components/Section/) (`<script setup>`, props/emits tipados).
4. Añadir o actualizar `ComponentName.stories.ts` (CSF3: Default, Variants; States si aplica).
5. Exportar en [components/index.ts](components/index.ts) si el componente forma parte del barrel público.
6. Cerrar con `yarn build`, `yarn lint`, `yarn type-check`, `yarn format:check`, `yarn test`, `yarn build-storybook` (véase AGENTS).

## Contribuir

1. Crear carpeta en `src/modules/ui/components/`.
2. Seguir la estructura de InfoBanner o Section (`script setup` + stories CSF3).
3. Exportar en `src/modules/ui/components/index.ts`.
4. Documentar props en Storybook (`autodocs`).
