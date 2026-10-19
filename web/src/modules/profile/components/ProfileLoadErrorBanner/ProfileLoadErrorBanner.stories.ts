import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { fn } from 'storybook/test';
import ProfileLoadErrorBanner from './ProfileLoadErrorBanner.vue';

const meta: Meta<typeof ProfileLoadErrorBanner> = {
  title: 'Profile/ProfileLoadErrorBanner',
  component: ProfileLoadErrorBanner,
  tags: ['autodocs'],
  args: {
    onRetry: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof ProfileLoadErrorBanner>;

export const Default: Story = {
  args: {
    message: 'Network error. Check your connection and try again.',
  },
  render: (args) => ({
    components: { ProfileLoadErrorBanner },
    setup() {
      return { args };
    },
    template:
      '<div class="max-w-xl p-4 dark:bg-gray-900"><ProfileLoadErrorBanner v-bind="args" @retry="args.onRetry" /></div>',
  }),
};

export const ApiMessage: Story = {
  args: {
    message: 'You do not have permission to view this resource.',
  },
  render: (args) => ({
    components: { ProfileLoadErrorBanner },
    setup() {
      return { args };
    },
    template:
      '<div class="max-w-xl p-4 dark:bg-gray-900"><ProfileLoadErrorBanner v-bind="args" @retry="args.onRetry" /></div>',
  }),
};
