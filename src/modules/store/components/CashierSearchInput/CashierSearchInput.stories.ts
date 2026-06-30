import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { ref } from 'vue';
import CashierSearchInput from './CashierSearchInput.vue';
import { searchCashiersByName } from '@/modules/store/services/userSearchApi';
import type { AutocompleteOption } from '@/modules/ui/components';

const meta: Meta<typeof CashierSearchInput> = {
  title: 'Store/CashierSearchInput',
  component: CashierSearchInput,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Búsqueda multi-cajero con chips y avatar. Por defecto datos mock (`fetchCashierSuggestionsMock`). Para API: `:fetch-suggestions="searchCashiersByName"`.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof CashierSearchInput>;

export const Default: Story = {
  render: () => ({
    components: { CashierSearchInput },
    setup() {
      const model = ref<AutocompleteOption<string>[]>([]);
      return { model };
    },
    template:
      '<div class="max-w-md p-4"><CashierSearchInput v-model="model" /><p class="mt-4 text-xs opacity-70">Seleccionados: {{ model.length }} — ids: {{ model.map(m => m.value).join(\', \') || "—" }}</p></div>',
  }),
};

export const WithExcludedIds: Story = {
  render: () => ({
    components: { CashierSearchInput },
    setup() {
      const model = ref<AutocompleteOption<string>[]>([]);
      return { model };
    },
    template:
      '<div class="max-w-md p-4"><CashierSearchInput v-model="model" :exclude-ids="[\'a1b2c3d4-e5f6-7890-abcd-ef1234567890\']" /><p class="mt-4 text-xs opacity-70">Ana López excluida (simula ya asignada).</p></div>',
  }),
};

export const WithApiFetch: Story = {
  render: () => ({
    components: { CashierSearchInput },
    setup() {
      const model = ref<AutocompleteOption<string>[]>([]);
      return { model, searchCashiersByName };
    },
    template:
      '<div class="max-w-md p-4"><CashierSearchInput v-model="model" :fetch-suggestions="searchCashiersByName" /><p class="mt-4 text-xs opacity-70">Requiere backend y sesión.</p></div>',
  }),
};
