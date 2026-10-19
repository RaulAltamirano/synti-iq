<script setup lang="ts">
import { TokenAutocomplete } from '@/modules/ui/components';
import type { AutocompleteOption } from '@/modules/ui/components/Autocomplete/Autocomplete';
import { fetchCashierSuggestionsMock } from '@/modules/store/mocks/cashier-search.mock';

const props = withDefaults(
  defineProps<{
    /** IDs de perfiles de cajero ya asignados a la tienda (no se ofrecen en resultados). */
    excludeIds?: string[];
    disabled?: boolean;
    /**
     * Inyectable (p. ej. `searchCashiersByName` desde el API). Por defecto usa datos mock locales.
     */
    fetchSuggestions?: (query: string) => Promise<AutocompleteOption<string>[]>;
  }>(),
  {
    excludeIds: () => [],
    disabled: false,
    fetchSuggestions: undefined,
  }
);

const selectedCashiers = defineModel<AutocompleteOption<string>[]>({ default: () => [] });

async function resolveFetch(query: string): Promise<AutocompleteOption<string>[]> {
  const fetcher = props.fetchSuggestions ?? fetchCashierSuggestionsMock;
  const raw = await fetcher(query);
  const exclude = new Set(props.excludeIds.map(String));
  return raw.filter((o) => !exclude.has(String(o.value)));
}
</script>

<template>
  <div class="flex w-full min-w-0 flex-col gap-1">
    <label
      for="cashier-search"
      class="mb-0 block text-sm font-medium text-gray-700 dark:text-gray-300"
    >
      Buscar cajeros
    </label>
    <!-- Fila del campo + acciones: alineación vertical solo con el token input, no con la ayuda -->
    <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
      <div class="min-w-0 flex-1">
        <TokenAutocomplete
          id="cashier-search"
          v-model="selectedCashiers"
          label=""
          placeholder="Nombre o correo…"
          helper-text=""
          :fetch-suggestions="resolveFetch"
          :disabled="disabled"
          :exclude-ids="excludeIds"
          :prefix-icon="['fas', 'search']"
          :min-chars="2"
          full-width
          name="cashier-search"
        />
      </div>
      <div v-if="$slots.actions" class="flex shrink-0 justify-stretch sm:justify-start">
        <slot name="actions" />
      </div>
    </div>
    <p class="mt-1.5 wrap-break-word text-sm leading-relaxed text-gray-500 dark:text-gray-400">
      Añade uno o más cajeros (estilo etiquetas). Escribe al menos 2 caracteres para buscar por
      nombre, correo, número de caja o sucursal (mismo negocio, aún no asignados a esta tienda).
    </p>
  </div>
</template>
