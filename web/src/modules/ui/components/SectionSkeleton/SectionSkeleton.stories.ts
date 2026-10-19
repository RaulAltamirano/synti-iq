import type { Meta, StoryObj } from '@storybook/vue3';
import SectionSkeleton from './SectionSkeleton.vue';

const meta: Meta<typeof SectionSkeleton> = {
  title: 'UI/SectionSkeleton',
  component: SectionSkeleton,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['referral', 'subscription', 'notifications', 'security', 'sessions', 'default'],
      description: 'Layout variant (shorthand for block visibility)',
    },
    showStats: {
      control: 'boolean',
      description: 'Show stats grid placeholder',
    },
    showContentBlocks: {
      control: 'boolean',
      description: 'Show content blocks placeholder',
    },
    showInputArea: {
      control: 'boolean',
      description: 'Show input area placeholder',
    },
    showListRows: {
      control: 'boolean',
      description: 'Show list rows placeholder',
    },
    listRowsCount: {
      control: 'number',
      description: 'Number of list rows when showListRows is true',
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Skeleton placeholder for section loading states. Use variant for presets or individual props for custom layouts.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof SectionSkeleton>;

export const Default: Story = {
  args: {
    variant: 'default',
  },
  render: (args) => ({
    components: { SectionSkeleton },
    setup() {
      return { args };
    },
    template: '<SectionSkeleton v-bind="args" />',
  }),
};

export const AllBlocks: Story = {
  args: {
    showStats: true,
    showContentBlocks: true,
    showInputArea: true,
    showListRows: true,
    listRowsCount: 4,
  },
  render: (args) => ({
    components: { SectionSkeleton },
    setup() {
      return { args };
    },
    template: '<SectionSkeleton v-bind="args" />',
  }),
};

export const Referral: Story = {
  args: {
    variant: 'referral',
  },
  render: (args) => ({
    components: { SectionSkeleton },
    setup() {
      return { args };
    },
    template: '<SectionSkeleton v-bind="args" />',
  }),
};

export const Subscription: Story = {
  args: {
    variant: 'subscription',
  },
  render: (args) => ({
    components: { SectionSkeleton },
    setup() {
      return { args };
    },
    template: '<SectionSkeleton v-bind="args" />',
  }),
};

export const Notifications: Story = {
  args: {
    variant: 'notifications',
  },
  render: (args) => ({
    components: { SectionSkeleton },
    setup() {
      return { args };
    },
    template: '<SectionSkeleton v-bind="args" />',
  }),
};

export const Security: Story = {
  args: {
    variant: 'security',
  },
  render: (args) => ({
    components: { SectionSkeleton },
    setup() {
      return { args };
    },
    template: '<SectionSkeleton v-bind="args" />',
  }),
};

export const Sessions: Story = {
  args: {
    variant: 'sessions',
    listRowsCount: 3,
  },
  render: (args) => ({
    components: { SectionSkeleton },
    setup() {
      return { args };
    },
    template: '<SectionSkeleton v-bind="args" />',
  }),
};
