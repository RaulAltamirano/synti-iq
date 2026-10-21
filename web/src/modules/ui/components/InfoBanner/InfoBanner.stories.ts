import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { fn } from 'storybook/test';
import InfoBanner from './InfoBanner.vue';

const meta: Meta<typeof InfoBanner> = {
  title: 'UI/InfoBanner',
  component: InfoBanner,
  tags: ['autodocs'],
  args: {
    onRemove: fn(),
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['success', 'info', 'warning', 'error'],
      description: 'Banner variant (success, info, warning, error)',
    },
    title: {
      control: 'text',
      description: 'Banner title',
    },
    description: {
      control: 'text',
      description: 'Optional description',
    },
    dismissable: {
      control: 'boolean',
      description: 'Show dismiss button',
    },
    actionLabel: {
      control: 'text',
      description: 'Label for action button',
    },
    onRemove: {
      action: 'remove',
      description: 'Emitted when dismiss is clicked',
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Generic info banner with variant styling, optional action button, and dismiss. Use for referrals, subscription alerts, and other contextual messages.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof InfoBanner>;

export const Default: Story = {
  args: {
    variant: 'success',
    title: 'Referred by System Business Owner',
    description: '',
    dismissable: false,
  },
  render: (args) => ({
    components: { InfoBanner },
    setup() {
      return { args };
    },
    template: '<InfoBanner v-bind="args" @remove="args.onRemove" />',
  }),
};

export const WithDescription: Story = {
  args: {
    variant: 'success',
    title: 'Referred by System Business Owner',
    description: '60 extra days of trial',
    dismissable: false,
  },
  render: (args) => ({
    components: { InfoBanner },
    setup() {
      return { args };
    },
    template: '<InfoBanner v-bind="args" @remove="args.onRemove" />',
  }),
};

export const Dismissable: Story = {
  args: {
    variant: 'success',
    title: 'Referred by System Business Owner',
    description: '60 extra days of trial',
    dismissable: true,
  },
  render: (args) => ({
    components: { InfoBanner },
    setup() {
      return { args };
    },
    template: '<InfoBanner v-bind="args" @remove="args.onRemove" />',
  }),
};

export const WithAction: Story = {
  args: {
    variant: 'warning',
    title: 'Your subscription is about to expire',
    description: 'Expires in 7 days',
    actionLabel: 'Renew Now',
    actionHandler: fn(),
  },
  render: (args) => ({
    components: { InfoBanner },
    setup() {
      return { args };
    },
    template: '<InfoBanner v-bind="args" @remove="args.onRemove" />',
  }),
};

export const Variants: Story = {
  render: () => ({
    components: { InfoBanner },
    template: `
      <div class="space-y-4">
        <InfoBanner
          variant="success"
          title="Success"
          description="Operation completed successfully."
        />
        <InfoBanner
          variant="info"
          title="Information"
          description="Here is some helpful information."
        />
        <InfoBanner
          variant="warning"
          title="Warning"
          description="Please review before continuing."
        />
        <InfoBanner
          variant="error"
          title="Error"
          description="Something went wrong."
        />
      </div>
    `,
  }),
};
