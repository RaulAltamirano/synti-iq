import type { Meta, StoryObj } from '@storybook/vue3';
import { ref } from 'vue';
import Autocomplete from './Autocomplete.vue';
import type { AutocompleteOption } from './Autocomplete.vue';

const MOCK_OPTIONS: AutocompleteOption[] = [
  { label: 'Av. Reforma 222, Juárez', value: 'place-1', description: 'Ciudad de México, CDMX' },
  { label: 'Av. Reforma 123, Cuauhtémoc', value: 'place-2', description: 'CDMX' },
  { label: 'Reforma 222 - Colonia Juárez', value: 'place-3', description: 'Ciudad de México' },
  { label: 'Calle Madero 1, Centro Histórico', value: 'place-4', description: 'CDMX' },
  { label: 'Insurgentes Sur 1234', value: 'place-5', description: 'Ciudad de México' },
];

function mockFetchSuggestions(query: string): Promise<AutocompleteOption[]> {
  const q = query.toLowerCase().trim();
  if (q.length < 2) return Promise.resolve([]);
  const filtered = MOCK_OPTIONS.filter((opt) => opt.label.toLowerCase().includes(q));
  return Promise.resolve(filtered);
}

function mockFetchWithDelay(ms: number) {
  return (query: string): Promise<AutocompleteOption[]> => {
    return new Promise((resolve) => {
      setTimeout(() => resolve(mockFetchSuggestions(query)), ms);
    });
  };
}

const MOCK_PEOPLE: AutocompleteOption[] = [
  {
    label: 'María García',
    value: 'user-1',
    description: 'maria@example.com',
    avatarName: 'María García',
  },
  {
    label: 'Luis Pérez',
    value: 'user-2',
    description: 'luis@example.com',
    avatarName: 'Luis Pérez',
  },
];

function mockFetchWithAvatars(query: string): Promise<AutocompleteOption[]> {
  const q = query.toLowerCase().trim();
  if (q.length < 2) return Promise.resolve([]);
  const filtered = MOCK_PEOPLE.filter(
    (opt) =>
      opt.label.toLowerCase().includes(q) || (opt.description ?? '').toLowerCase().includes(q)
  );
  return Promise.resolve(filtered);
}

const meta: Meta<typeof Autocomplete> = {
  title: 'UI/Autocomplete',
  component: Autocomplete,
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
      description: 'Input size',
    },
    disabled: {
      control: 'boolean',
      description: 'Disabled state',
    },
    error: {
      control: 'boolean',
      description: 'Error state',
    },
    minChars: {
      control: 'number',
      description: 'Minimum characters before fetching',
    },
    fullWidth: {
      control: 'boolean',
      description: 'Full width',
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Generic autocomplete with async suggestions. Use fetchSuggestions to provide options; emits select with { label, value }.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Autocomplete>;

export const Default: Story = {
  args: {
    modelValue: '',
    label: 'Search address',
    placeholder: 'Type to search (e.g. Reforma)...',
    helperText: 'Start typing to see suggestions.',
    prefixIcon: ['fas', 'search'],
    fetchSuggestions: mockFetchSuggestions,
    minChars: 2,
    fullWidth: true,
  },
  render: (args) => ({
    components: { Autocomplete },
    setup() {
      const value = ref(args.modelValue as string);
      const selected = ref<AutocompleteOption | null>(null);
      const onSelect = (option: AutocompleteOption) => {
        selected.value = option;
      };
      return { args, value, selected, onSelect };
    },
    template: `
      <div class="w-full max-w-md space-y-2">
        <Autocomplete
          v-model="value"
          v-bind="args"
          @select="onSelect"
        />
        <p v-if="selected" class="text-sm text-gray-500">
          Selected: {{ selected.label }} (value: {{ selected.value }})
        </p>
      </div>
    `,
  }),
};

export const AsyncWithDelay: Story = {
  args: {
    modelValue: '',
    label: 'Search (300ms delay)',
    placeholder: 'Type at least 2 characters...',
    fetchSuggestions: mockFetchWithDelay(300),
    minChars: 2,
    fullWidth: true,
  },
  render: (args) => ({
    components: { Autocomplete },
    setup() {
      const value = ref(args.modelValue as string);
      const selected = ref<AutocompleteOption | null>(null);
      return { args, value, selected };
    },
    template: `
      <div class="w-full max-w-md space-y-2">
        <Autocomplete
          v-model="value"
          v-bind="args"
          @select="(opt) => (selected = opt)"
        />
        <p v-if="selected" class="text-sm text-gray-500">
          Selected: {{ selected.label }}
        </p>
      </div>
    `,
  }),
};

export const WithError: Story = {
  args: {
    modelValue: '',
    label: 'Address',
    placeholder: 'Search address...',
    fetchSuggestions: mockFetchSuggestions,
    error: true,
    errorMessage: 'Please select a valid address',
    minChars: 2,
  },
  render: (args) => ({
    components: { Autocomplete },
    setup() {
      const value = ref(args.modelValue as string);
      return { args, value };
    },
    template: '<Autocomplete v-model="value" v-bind="args" />',
  }),
};

export const Disabled: Story = {
  args: {
    modelValue: 'Pre-filled',
    label: 'Address',
    placeholder: 'Search...',
    fetchSuggestions: mockFetchSuggestions,
    disabled: true,
  },
  render: (args) => ({
    components: { Autocomplete },
    setup() {
      const value = ref(args.modelValue as string);
      return { args, value };
    },
    template: '<Autocomplete v-model="value" v-bind="args" />',
  }),
};

export const WithAvatarOptions: Story = {
  args: {
    modelValue: '',
    label: 'Buscar persona',
    placeholder: 'Escribe al menos 2 caracteres…',
    helperText: 'Opciones con avatar (prop `avatarName` en cada opción).',
    prefixIcon: ['fas', 'user'],
    fetchSuggestions: mockFetchWithAvatars,
    minChars: 2,
    fullWidth: true,
  },
  render: (args) => ({
    components: { Autocomplete },
    setup() {
      const value = ref(args.modelValue as string);
      return { args, value };
    },
    template: '<div class="w-full max-w-md"><Autocomplete v-model="value" v-bind="args" /></div>',
  }),
};

export const NoResults: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Empty state when the query has no matches. Verify the icon + message render correctly.',
      },
    },
  },
  render: () => ({
    components: { Autocomplete },
    setup() {
      const value = ref('xqzwmfp');
      return { value };
    },
    template: `
      <div class="w-full max-w-md">
        <Autocomplete
          v-model="value"
          label="Search"
          placeholder="Type to search..."
          :fetch-suggestions="() => Promise.resolve([])"
          :min-chars="1"
          full-width
        />
      </div>
    `,
  }),
};

export const LongDescriptions: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Options with long description strings — verifies text truncation and layout stability.',
      },
    },
  },
  render: () => ({
    components: { Autocomplete },
    setup() {
      const value = ref('a');
      const longOptions: AutocompleteOption[] = [
        {
          label: 'Calle muy larga con nombre extendido núm. 1234',
          value: 'long-1',
          description:
            'Esta es una descripción muy larga que debería truncarse con ellipsis en pantallas pequeñas sin romper el layout del dropdown',
        },
        {
          label: 'Otra opción con descripción extensa',
          value: 'long-2',
          description:
            'Col. San Rafael, Delegación Cuauhtémoc, Ciudad de México, CDMX 06470, México',
        },
      ];
      return { value, longOptions };
    },
    template: `
      <div class="w-72">
        <Autocomplete
          v-model="value"
          label="Address"
          placeholder="Type 'a'..."
          :fetch-suggestions="() => Promise.resolve(longOptions)"
          :min-chars="1"
          full-width
        />
      </div>
    `,
  }),
};

export const ManyOptions: Story = {
  parameters: {
    docs: {
      description: {
        story: '20+ options in the dropdown — verifies scroll behavior within the max-h-64 panel.',
      },
    },
  },
  render: () => ({
    components: { Autocomplete },
    setup() {
      const value = ref('item');
      const manyOptions: AutocompleteOption[] = Array.from({ length: 25 }, (_, i) => ({
        label: `Item ${i + 1}`,
        value: `item-${i + 1}`,
        description: `Description for item ${i + 1}`,
      }));
      return { value, manyOptions };
    },
    template: `
      <div class="w-full max-w-md">
        <Autocomplete
          v-model="value"
          label="Select item"
          placeholder="Type 'item'..."
          :fetch-suggestions="() => Promise.resolve(manyOptions)"
          :min-chars="1"
          full-width
        />
      </div>
    `,
  }),
};

export const FullFeatured: Story = {
  args: {
    modelValue: '',
    label: 'Dirección',
    placeholder: 'Buscar por calle, ciudad o código postal…',
    helperText: 'Selecciona una sugerencia para rellenar el formulario.',
    prefixIcon: ['fas', 'search'],
    fetchSuggestions: mockFetchWithDelay(200),
    minChars: 2,
    fullWidth: true,
    loadingText: 'Buscando…',
    noResultsText: 'No se encontraron resultados',
    clearable: true,
    required: true,
  },
  render: (args) => ({
    components: { Autocomplete },
    setup() {
      const value = ref(args.modelValue as string);
      const selected = ref<AutocompleteOption | null>(null);
      return { args, value, selected };
    },
    template: `
      <div class="w-full max-w-md space-y-2">
        <Autocomplete
          v-model="value"
          v-bind="args"
          @select="(opt) => (selected = opt)"
        />
        <p v-if="selected" class="text-sm text-gray-500">
          Seleccionado: {{ selected.label }} ({{ selected.value }})
        </p>
      </div>
    `,
  }),
};
