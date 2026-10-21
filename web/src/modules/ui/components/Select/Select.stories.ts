import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { ref } from 'vue';
import Select from './Select.vue';

const meta: Meta<typeof Select> = {
  title: 'UI/Select',
  component: Select,
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
      description: 'Select size',
    },
    disabled: {
      control: 'boolean',
      description: 'Disabled state',
    },
    error: {
      control: 'boolean',
      description: 'Error state',
    },
    multiple: {
      control: 'boolean',
      description: 'Multiple selection',
    },
    searchable: {
      control: 'boolean',
      description: 'Search enabled',
    },
    required: {
      control: 'boolean',
      description: 'Required field',
    },
  },
  parameters: {
    docs: {
      description: {
        component: 'Select component with support for single, multiple selection and search.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Select>;

const options = [
  { label: 'Option 1', value: '1' },
  { label: 'Option 2', value: '2' },
  { label: 'Option 3', value: '3' },
  { label: 'Option 4', value: '4' },
  { label: 'Option 5', value: '5' },
];

export const Default: Story = {
  args: {
    options,
    placeholder: 'Select an option...',
  },
  render: (args) => ({
    components: { Select },
    setup() {
      const value = ref(null);
      return { args, value };
    },
    template: '<Select v-model="value" v-bind="args" />',
  }),
};

export const WithLabel: Story = {
  args: {
    options,
    label: 'Choose an option',
    placeholder: 'Select...',
  },
  render: (args) => ({
    components: { Select },
    setup() {
      const value = ref(null);
      return { args, value };
    },
    template: '<Select v-model="value" v-bind="args" />',
  }),
};

export const WithHelperText: Story = {
  args: {
    options,
    label: 'Country',
    helperText: 'Please select your country',
    placeholder: 'Select country...',
  },
  render: (args) => ({
    components: { Select },
    setup() {
      const value = ref(null);
      return { args, value };
    },
    template: '<Select v-model="value" v-bind="args" />',
  }),
};

export const WithError: Story = {
  args: {
    options,
    label: 'Required Field',
    error: true,
    errorMessage: 'Please select an option',
    required: true,
  },
  render: (args) => ({
    components: { Select },
    setup() {
      const value = ref(null);
      return { args, value };
    },
    template: '<Select v-model="value" v-bind="args" />',
  }),
};

export const Multiple: Story = {
  args: {
    options,
    multiple: true,
    label: 'Select multiple options',
    placeholder: 'Choose options...',
  },
  render: (args) => ({
    components: { Select },
    setup() {
      const value = ref([]);
      return { args, value };
    },
    template: '<Select v-model="value" v-bind="args" />',
  }),
};

export const Searchable: Story = {
  args: {
    options: [
      { label: 'Apple', value: 'apple' },
      { label: 'Banana', value: 'banana' },
      { label: 'Cherry', value: 'cherry' },
      { label: 'Date', value: 'date' },
      { label: 'Elderberry', value: 'elderberry' },
      { label: 'Fig', value: 'fig' },
      { label: 'Grape', value: 'grape' },
    ],
    searchable: true,
    label: 'Search fruits',
    placeholder: 'Search and select...',
  },
  render: (args) => ({
    components: { Select },
    setup() {
      const value = ref(null);
      return { args, value };
    },
    template: '<Select v-model="value" v-bind="args" />',
  }),
};

export const Sizes: Story = {
  args: {
    options,
  },
  render: (args) => ({
    components: { Select },
    setup() {
      const values = {
        xs: ref(null),
        sm: ref(null),
        md: ref(null),
        lg: ref(null),
        xl: ref(null),
      };
      return { args, values };
    },
    template: `
      <div class="space-y-4 w-64">
        <Select v-model="values.xs" v-bind="args" size="xs" placeholder="Extra Small" />
        <Select v-model="values.sm" v-bind="args" size="sm" placeholder="Small" />
        <Select v-model="values.md" v-bind="args" size="md" placeholder="Medium" />
        <Select v-model="values.lg" v-bind="args" size="lg" placeholder="Large" />
        <Select v-model="values.xl" v-bind="args" size="xl" placeholder="Extra Large" />
      </div>
    `,
  }),
};

export const Disabled: Story = {
  args: {
    options,
    disabled: true,
    modelValue: '1',
  },
  render: (args) => ({
    components: { Select },
    setup() {
      const value = ref(args.modelValue);
      return { args, value };
    },
    template: '<Select v-model="value" v-bind="args" />',
  }),
};

export const WithDisabledOptions: Story = {
  args: {
    options: [
      { label: 'Option 1', value: '1' },
      { label: 'Option 2', value: '2', disabled: true },
      { label: 'Option 3', value: '3' },
      { label: 'Option 4', value: '4', disabled: true },
      { label: 'Option 5', value: '5' },
    ],
    label: 'Select (some disabled)',
  },
  render: (args) => ({
    components: { Select },
    setup() {
      const value = ref(null);
      return { args, value };
    },
    template: '<Select v-model="value" v-bind="args" />',
  }),
};

export const Required: Story = {
  args: {
    options,
    label: 'Required Field',
    required: true,
    placeholder: 'Please select...',
  },
  render: (args) => ({
    components: { Select },
    setup() {
      const value = ref(null);
      return { args, value };
    },
    template: '<Select v-model="value" v-bind="args" />',
  }),
};
