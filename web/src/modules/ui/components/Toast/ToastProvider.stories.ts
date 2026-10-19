import type { Meta, StoryObj } from '@storybook/vue3-vite';
import ToastProvider from './ToastProvider.vue';
import { useToast } from '../../composables/useToast';

const meta: Meta<typeof ToastProvider> = {
  title: 'UI/ToastProvider',
  component: ToastProvider,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Wraps the app (or a layout) and renders the singleton `Toast` bound to `useToast()`. ' +
          'Call `useToast()` from any descendant to show messages.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof ToastProvider>;

export const WithSlotAndUseToast: Story = {
  render: () => ({
    components: { ToastProvider },
    setup() {
      const toast = useToast();
      return { toast };
    },
    template: `
      <ToastProvider>
        <div class="min-h-[200px] p-8 flex flex-wrap gap-3 items-start bg-gray-100 dark:bg-gray-900">
          <button
            type="button"
            class="px-4 py-2 rounded-lg bg-primary-600 text-white text-sm font-medium hover:bg-primary-700"
            @click="toast.success('Saved successfully')"
          >
            Success
          </button>
          <button
            type="button"
            class="px-4 py-2 rounded-lg bg-error-600 text-white text-sm font-medium hover:bg-error-700"
            @click="toast.error('Something went wrong')"
          >
            Error
          </button>
          <button
            type="button"
            class="px-4 py-2 rounded-lg bg-warning-600 text-white text-sm font-medium hover:bg-warning-700"
            @click="toast.warning('Please review')"
          >
            Warning
          </button>
          <button
            type="button"
            class="px-4 py-2 rounded-lg bg-info-600 text-white text-sm font-medium hover:bg-info-700"
            @click="toast.info('FYI')"
          >
            Info
          </button>
          <button
            type="button"
            class="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-sm"
            @click="toast.hide()"
          >
            Hide
          </button>
        </div>
      </ToastProvider>
    `,
  }),
};
