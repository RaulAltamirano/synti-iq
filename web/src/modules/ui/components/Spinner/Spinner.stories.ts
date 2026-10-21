import type { Meta, StoryObj } from '@storybook/vue3-vite';
import Spinner from './Spinner.vue';

const meta: Meta<typeof Spinner> = {
  title: 'UI/Spinner',
  component: Spinner,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['spinner', 'dots', 'pulse'],
      description: 'Spinner variant',
    },
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
      description: 'Spinner size',
    },
    color: {
      control: 'select',
      options: ['primary', 'secondary', 'success', 'warning', 'error', 'info'],
      description: 'Spinner color',
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Spinner component for displaying loading states with multiple variants and sizes.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Spinner>;

export const SpinnerVariant: Story = {
  args: {
    variant: 'spinner',
  },
  render: (args) => ({
    components: { Spinner },
    setup() {
      return { args };
    },
    template: '<Spinner v-bind="args" />',
  }),
};

export const DotsVariant: Story = {
  args: {
    variant: 'dots',
  },
  render: (args) => ({
    components: { Spinner },
    setup() {
      return { args };
    },
    template: '<Spinner v-bind="args" />',
  }),
};

export const PulseVariant: Story = {
  args: {
    variant: 'pulse',
  },
  render: (args) => ({
    components: { Spinner },
    setup() {
      return { args };
    },
    template: '<Spinner v-bind="args" />',
  }),
};

export const Sizes: Story = {
  render: () => ({
    components: { Spinner },
    template: `
      <div class="flex items-center gap-8">
        <div class="flex flex-col items-center gap-2">
          <Spinner size="xs" />
          <span class="text-xs">XS</span>
        </div>
        <div class="flex flex-col items-center gap-2">
          <Spinner size="sm" />
          <span class="text-xs">SM</span>
        </div>
        <div class="flex flex-col items-center gap-2">
          <Spinner size="md" />
          <span class="text-xs">MD</span>
        </div>
        <div class="flex flex-col items-center gap-2">
          <Spinner size="lg" />
          <span class="text-xs">LG</span>
        </div>
        <div class="flex flex-col items-center gap-2">
          <Spinner size="xl" />
          <span class="text-xs">XL</span>
        </div>
      </div>
    `,
  }),
};

export const Colors: Story = {
  render: () => ({
    components: { Spinner },
    template: `
      <div class="flex items-center gap-8">
        <div class="flex flex-col items-center gap-2">
          <Spinner color="primary" />
          <span class="text-xs">Primary</span>
        </div>
        <div class="flex flex-col items-center gap-2">
          <Spinner color="success" />
          <span class="text-xs">Success</span>
        </div>
        <div class="flex flex-col items-center gap-2">
          <Spinner color="warning" />
          <span class="text-xs">Warning</span>
        </div>
        <div class="flex flex-col items-center gap-2">
          <Spinner color="error" />
          <span class="text-xs">Error</span>
        </div>
        <div class="flex flex-col items-center gap-2">
          <Spinner color="info" />
          <span class="text-xs">Info</span>
        </div>
      </div>
    `,
  }),
};

export const AllVariants: Story = {
  render: () => ({
    components: { Spinner },
    template: `
      <div class="flex items-center gap-12">
        <div class="flex flex-col items-center gap-2">
          <Spinner variant="spinner" />
          <span class="text-xs">Spinner</span>
        </div>
        <div class="flex flex-col items-center gap-2">
          <Spinner variant="dots" />
          <span class="text-xs">Dots</span>
        </div>
        <div class="flex flex-col items-center gap-2">
          <Spinner variant="pulse" />
          <span class="text-xs">Pulse</span>
        </div>
      </div>
    `,
  }),
};

export const InButton: Story = {
  render: () => ({
    components: { Spinner },
    template: `
      <div class="flex items-center gap-4">
        <button class="px-4 py-2 bg-primary text-white rounded flex items-center gap-2">
          <Spinner size="sm" color="secondary" />
          <span>Loading...</span>
        </button>
        <button class="px-4 py-2 bg-success text-white rounded flex items-center gap-2">
          <Spinner variant="dots" size="sm" color="secondary" />
          <span>Processing</span>
        </button>
      </div>
    `,
  }),
};

export const Centered: Story = {
  render: () => ({
    components: { Spinner },
    template: `
      <div class="flex items-center justify-center h-32 border border-gray-200 dark:border-gray-700 rounded">
        <Spinner size="lg" />
      </div>
    `,
  }),
};
