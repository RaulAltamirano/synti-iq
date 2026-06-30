import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { ref } from 'vue';
import TokenAutocomplete from './TokenAutocomplete.vue';
import type { AutocompleteOption } from '../Autocomplete/Autocomplete.vue';

const PEOPLE: AutocompleteOption<string>[] = [
  {
    label: 'María García',
    value: 'u1',
    description: 'maria@example.com',
    avatarName: 'María García',
  },
  {
    label: 'Luis Pérez',
    value: 'u2',
    description: 'luis@example.com',
    avatarName: 'Luis Pérez',
  },
  {
    label: 'Ana Martínez',
    value: 'u3',
    description: 'ana@example.com',
    avatarName: 'Ana Martínez',
  },
  {
    label: 'Pedro Soto',
    value: 'u4',
    description: 'pedro@example.com',
    avatarName: 'Pedro Soto',
  },
  {
    label: 'Elena Rivas',
    value: 'u5',
    description: 'elena@example.com',
    avatarName: 'Elena Rivas',
  },
];

async function mockFetch(q: string): Promise<AutocompleteOption<string>[]> {
  const query = q.trim().toLowerCase();
  if (query.length < 2) return [];
  return PEOPLE.filter(
    (p) =>
      p.label.toLowerCase().includes(query) || (p.description ?? '').toLowerCase().includes(query)
  );
}

const meta: Meta<typeof TokenAutocomplete> = {
  title: 'UI/TokenAutocomplete',
  component: TokenAutocomplete,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Campo tipo etiquetas (GitLab reviewers): varias opciones con avatar, búsqueda y exclusión de ya elegidos.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof TokenAutocomplete>;

export const Default: Story = {
  render: () => ({
    components: { TokenAutocomplete },
    setup() {
      const model = ref<AutocompleteOption<string>[]>([]);
      return { model, mockFetch };
    },
    template:
      '<div class="max-w-lg p-4"><TokenAutocomplete v-model="model" label="Revisores" placeholder="Buscar por nombre…" helper-text="Escribe al menos 2 caracteres." :fetch-suggestions="mockFetch" :prefix-icon="[\'fas\', \'search\']" name="token-demo" /><p class="mt-4 text-xs opacity-70">Seleccionados: {{ model.length }}</p></div>',
  }),
};

export const WithExcludedIds: Story = {
  render: () => ({
    components: { TokenAutocomplete },
    setup() {
      const model = ref<AutocompleteOption<string>[]>([]);
      return { model, mockFetch };
    },
    template:
      '<div class="max-w-lg p-4"><TokenAutocomplete v-model="model" label="Revisores" placeholder="Buscar…" :fetch-suggestions="mockFetch" :exclude-ids="[\'u2\']" helper-text="Luis Pérez excluido por id." :prefix-icon="[\'fas\', \'search\']" /><p class="mt-4 text-xs opacity-70">u2 no aparece en sugerencias.</p></div>',
  }),
};
