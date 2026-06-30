import type { Meta, StoryObj } from '@storybook/vue3';
import Skeleton from './Skeleton.vue';

const meta: Meta<typeof Skeleton> = {
  title: 'UI/Skeleton',
  component: Skeleton,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['text', 'circular', 'rectangular'],
      description: 'Shape variant of the skeleton',
    },
    width: {
      control: 'text',
      description: 'Width (CSS value or number for px)',
    },
    height: {
      control: 'text',
      description: 'Height (CSS value or number for px)',
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Skeleton placeholder for loading states. Uses animate-pulse for shimmer effect.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Skeleton>;

export const Default: Story = {
  args: {
    variant: 'rectangular',
    width: '200px',
    height: '20px',
  },
  render: (args) => ({
    components: { Skeleton },
    setup() {
      return { args };
    },
    template: '<Skeleton v-bind="args" />',
  }),
};

export const Text: Story = {
  args: {
    variant: 'text',
    height: '16px',
    class: 'w-48',
  },
  render: (args) => ({
    components: { Skeleton },
    setup() {
      return { args };
    },
    template: '<Skeleton v-bind="args" />',
  }),
};

export const Circular: Story = {
  args: {
    variant: 'circular',
    width: 48,
    height: 48,
  },
  render: (args) => ({
    components: { Skeleton },
    setup() {
      return { args };
    },
    template: '<Skeleton v-bind="args" />',
  }),
};

export const Rectangular: Story = {
  args: {
    variant: 'rectangular',
    width: '100%',
    height: '120px',
    class: 'rounded-lg',
  },
  render: (args) => ({
    components: { Skeleton },
    setup() {
      return { args };
    },
    template: '<Skeleton v-bind="args" />',
  }),
};

export const MultipleLines: Story = {
  render: () => ({
    components: { Skeleton },
    template: `
      <div class="space-y-3 w-64">
        <Skeleton variant="text" height="16" class="w-full" />
        <Skeleton variant="text" height="16" class="w-3/4" />
        <Skeleton variant="text" height="16" class="w-1/2" />
      </div>
    `,
  }),
};
