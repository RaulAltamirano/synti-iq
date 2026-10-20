import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { ref } from 'vue';
import Textarea from './Textarea.vue';

const meta: Meta<typeof Textarea> = {
  title: 'UI/Textarea',
  component: Textarea,
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
      description: 'Textarea size',
    },
    rows: { control: 'number', description: 'Number of visible rows' },
    disabled: { control: 'boolean', description: 'Disabled state' },
    readonly: { control: 'boolean', description: 'Read-only state' },
    error: { control: 'boolean', description: 'Error state' },
    required: { control: 'boolean', description: 'Required field' },
    fullWidth: { control: 'boolean', description: 'Full width' },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Reusable Textarea component with support for labels, validation and multiple sizes.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Textarea>;

export const Default: Story = {
  args: {
    modelValue: '',
    placeholder: 'Type here...',
    rows: 3,
  },
  render: (args) => ({
    components: { Textarea },
    setup() {
      const value = ref(args.modelValue);
      return { args, value };
    },
    template: '<Textarea v-model="value" v-bind="args" />',
  }),
};

export const WithLabel: Story = {
  args: {
    modelValue: '',
    label: 'Full address',
    placeholder: 'Street, number, neighborhood...',
    rows: 3,
  },
  render: (args) => ({
    components: { Textarea },
    setup() {
      const value = ref(args.modelValue);
      return { args, value };
    },
    template: '<Textarea v-model="value" v-bind="args" />',
  }),
};

export const WithError: Story = {
  args: {
    modelValue: '',
    label: 'Address reference',
    error: true,
    errorMessage: 'This field is required',
    rows: 2,
  },
  render: (args) => ({
    components: { Textarea },
    setup() {
      const value = ref(args.modelValue);
      return { args, value };
    },
    template: '<Textarea v-model="value" v-bind="args" />',
  }),
};
