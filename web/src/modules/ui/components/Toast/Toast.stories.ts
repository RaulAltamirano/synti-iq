import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { ref } from 'vue';
import Toast from './Toast.vue';

const meta: Meta<typeof Toast> = {
  title: 'UI/Toast',
  component: Toast,
  tags: ['autodocs'],
  argTypes: {
    message: {
      control: 'text',
      description: 'Message to display in the toast',
    },
    variant: {
      control: 'select',
      options: ['default', 'success', 'error', 'warning', 'info'],
      description: 'Visual variant of the toast',
    },
    visible: {
      control: 'boolean',
      description: 'Controls toast visibility',
    },
  },
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Toast notification component for displaying temporary messages with multiple variants.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Toast>;

export const Default: Story = {
  render: (args) => ({
    components: { Toast },
    setup() {
      const isVisible = ref(true);
      return { args, isVisible };
    },
    template: `
      <div class="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center p-8">
        <button 
          @click="isVisible = true" 
          class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Show Toast
        </button>
        <Toast 
          v-bind="args" 
          :visible="isVisible"
          @close="isVisible = false"
        />
      </div>
    `,
  }),
  args: {
    message: 'This is a notification message',
    variant: 'default',
  },
};

export const Success: Story = {
  ...Default,
  args: {
    message: 'Operation completed successfully',
    variant: 'success',
  },
};

export const Error: Story = {
  ...Default,
  args: {
    message: 'An error has occurred',
    variant: 'error',
  },
};

export const Warning: Story = {
  ...Default,
  args: {
    message: 'Attention: please verify the information',
    variant: 'warning',
  },
};

export const Info: Story = {
  ...Default,
  args: {
    message: 'Important information',
    variant: 'info',
  },
};
