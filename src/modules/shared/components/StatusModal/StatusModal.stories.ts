import type { Meta, StoryObj } from '@storybook/vue3';
import { ref } from 'vue';
import StatusModal from './StatusModal.vue';

const meta: Meta<typeof StatusModal> = {
  title: 'Shared/StatusModal',
  component: StatusModal,
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: 'select',
      options: ['success', 'error', 'warning', 'info'],
      description: 'Modal type that determines visual style and animations',
    },
    title: {
      control: 'text',
      description: 'Modal main title',
    },
    message: {
      control: 'text',
      description: 'Modal descriptive message',
    },
    actionText: {
      control: 'text',
      description: 'Action button text',
    },
    actionAriaLabel: {
      control: 'text',
      description: 'Aria label for button accessibility',
    },
    showEffects: {
      control: 'boolean',
      description: 'Enable/disable visual effects and animations',
    },
    isVisible: {
      control: 'boolean',
      description: 'Controls modal visibility',
    },
    details: {
      control: 'object',
      description: 'Object with additional details to display',
    },
    additionalInfo: {
      control: 'text',
      description: 'Highlighted additional information',
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Versatile status modal for displaying success, error, warning and info messages with professional animations and dark mode support.',
      },
    },
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof StatusModal>;

const createModalStory = (defaultArgs: Record<string, unknown>) => ({
  render: (args: Record<string, unknown>) => ({
    components: { StatusModal },
    setup() {
      const isOpen = ref(true);
      const handleAction = () => {
        isOpen.value = false;
        setTimeout(() => {
          isOpen.value = true;
        }, 500);
      };
      const handleClose = () => {
        isOpen.value = false;
        setTimeout(() => {
          isOpen.value = true;
        }, 500);
      };
      return { args, isOpen, handleAction, handleClose };
    },
    template: `
      <div class="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center p-8">
        <button 
          @click="isOpen = true" 
          class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Show Modal
        </button>
        <StatusModal 
          v-bind="args" 
          :is-visible="isOpen"
          @action="handleAction"
          @close="handleClose"
        />
      </div>
    `,
  }),
  args: defaultArgs,
});

export const Success: Story = createModalStory({
  type: 'success',
  title: 'Operation Successful',
  message: 'The transaction has been processed successfully.',
  actionText: 'Continue',
  showEffects: true,
});

export const Error: Story = createModalStory({
  type: 'error',
  title: 'Operation Error',
  message: 'The request could not be completed. Please try again.',
  actionText: 'Retry',
  showEffects: true,
});

export const Warning: Story = createModalStory({
  type: 'warning',
  title: 'Attention Required',
  message: 'This action could have significant consequences.',
  actionText: 'Understood',
  showEffects: true,
});

export const Info: Story = createModalStory({
  type: 'info',
  title: 'Information',
  message: 'This is an informational notification for the user.',
  actionText: 'Accept',
  showEffects: true,
});

export const WithDetails: Story = createModalStory({
  type: 'success',
  title: 'Payment Completed',
  message: 'Your transaction has been processed successfully.',
  actionText: 'View Receipt',
  showEffects: true,
  details: {
    amount: '$1,250.00',
    reference: 'TXN-2024-001234',
    date: '26/01/2026 14:30',
    method: 'Credit Card',
  },
});

export const WithAdditionalInfo: Story = createModalStory({
  type: 'warning',
  title: 'Session Expiring',
  message: 'Your session will expire in 5 minutes due to inactivity.',
  actionText: 'Extend Session',
  showEffects: true,
  additionalInfo: 'Save your work before the session expires automatically.',
});

export const WithoutEffects: Story = createModalStory({
  type: 'success',
  title: 'Accessible Modal',
  message: 'This modal respects the reduced motion preference.',
  actionText: 'Accept',
  showEffects: false,
});

export const AllTypes: Story = {
  render: () => ({
    components: { StatusModal },
    setup() {
      const modals = ref({
        success: false,
        error: false,
        warning: false,
        info: false,
      });
      const openModal = (type: 'success' | 'error' | 'warning' | 'info') => {
        modals.value[type] = true;
      };
      const closeModal = (type: 'success' | 'error' | 'warning' | 'info') => {
        modals.value[type] = false;
      };
      return { modals, openModal, closeModal };
    },
    template: `
      <div class="min-h-screen bg-gray-100 dark:bg-gray-900 p-8">
        <div class="max-w-2xl mx-auto">
          <h2 class="text-2xl font-bold text-gray-800 dark:text-white mb-6">Modal Types</h2>
          <div class="grid grid-cols-2 gap-4">
            <button 
              @click="openModal('success')" 
              class="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg font-semibold hover:shadow-lg transition-shadow"
            >
              Success Modal
            </button>
            <button 
              @click="openModal('error')" 
              class="px-6 py-3 bg-gradient-to-r from-red-500 to-rose-500 text-white rounded-lg font-semibold hover:shadow-lg transition-shadow"
            >
              Error Modal
            </button>
            <button 
              @click="openModal('warning')" 
              class="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg font-semibold hover:shadow-lg transition-shadow"
            >
              Warning Modal
            </button>
            <button 
              @click="openModal('info')" 
              class="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg font-semibold hover:shadow-lg transition-shadow"
            >
              Info Modal
            </button>
          </div>
        </div>
        
        <StatusModal 
          :is-visible="modals.success"
          type="success"
          title="Operation Successful"
          message="Everything went perfectly."
          action-text="Continue"
          @action="closeModal('success')"
          @close="closeModal('success')"
        />
        
        <StatusModal 
          :is-visible="modals.error"
          type="error"
          title="Error Detected"
          message="Something went wrong. Please try again."
          action-text="Retry"
          @action="closeModal('error')"
          @close="closeModal('error')"
        />
        
        <StatusModal 
          :is-visible="modals.warning"
          type="warning"
          title="Warning"
          message="Proceed with caution."
          action-text="Understood"
          @action="closeModal('warning')"
          @close="closeModal('warning')"
        />
        
        <StatusModal 
          :is-visible="modals.info"
          type="info"
          title="Information"
          message="This is an informational notification."
          action-text="Accept"
          @action="closeModal('info')"
          @close="closeModal('info')"
        />
      </div>
    `,
  }),
};
