import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { ref } from 'vue';
import ConfirmModal from './ConfirmModal.vue';

const meta: Meta<typeof ConfirmModal> = {
  title: 'Shared/ConfirmModal',
  component: ConfirmModal,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['danger', 'warning', 'info'],
      description: 'Visual variant of the modal',
    },
    title: {
      control: 'text',
      description: 'Modal title',
    },
    message: {
      control: 'text',
      description: 'Confirmation message',
    },
    confirmText: {
      control: 'text',
      description: 'Confirm button text',
    },
    cancelText: {
      control: 'text',
      description: 'Cancel button text',
    },
    loading: {
      control: 'boolean',
      description: 'Loading state',
    },
  },
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Minimalist confirmation modal with three variants: danger, warning and info.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof ConfirmModal>;

const createStory = (args: Record<string, unknown>) => ({
  render: (storyArgs: Record<string, unknown>) => ({
    components: { ConfirmModal },
    setup() {
      const isOpen = ref(true);
      const handleConfirm = () => {
        isOpen.value = false;
        setTimeout(() => {
          isOpen.value = true;
        }, 400);
      };
      const handleCancel = () => {
        isOpen.value = false;
        setTimeout(() => {
          isOpen.value = true;
        }, 400);
      };
      return { storyArgs, isOpen, handleConfirm, handleCancel };
    },
    template: `
      <div class="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <button 
          @click="isOpen = true" 
          class="px-5 py-2.5 bg-gray-800 dark:bg-white text-white dark:text-gray-900 text-sm font-medium rounded-lg hover:opacity-90 transition-opacity"
        >
          Open Modal
        </button>
        <ConfirmModal 
          v-bind="storyArgs" 
          :is-visible="isOpen"
          @confirm="handleConfirm"
          @cancel="handleCancel"
        />
      </div>
    `,
  }),
  args,
});

export const Danger: Story = createStory({
  variant: 'danger',
  title: 'Sign Out',
  message: 'Your current session will be closed and you will need to sign in again to continue.',
  confirmText: 'Sign Out',
  cancelText: 'Cancel',
});

export const Warning: Story = createStory({
  variant: 'warning',
  title: 'Close Other Sessions',
  message:
    'All sessions on other devices will be closed. Only your current session will remain active.',
  confirmText: 'Continue',
  cancelText: 'Cancel',
});

export const Info: Story = createStory({
  variant: 'info',
  title: 'Save Changes',
  message: 'You have unsaved changes. Do you want to save them before leaving?',
  confirmText: 'Save',
  cancelText: 'Discard',
});

export const Loading: Story = createStory({
  variant: 'danger',
  title: 'Deleting Data',
  message: 'This action will permanently delete all selected data.',
  confirmText: 'Delete',
  cancelText: 'Cancel',
  loading: true,
  loadingText: 'Deleting...',
});

export const DeleteAccount: Story = createStory({
  variant: 'danger',
  title: 'Delete Account',
  message: 'This action is permanent and cannot be undone. All your data will be deleted.',
  confirmText: 'Delete Account',
  cancelText: 'Keep Account',
  icon: ['fas', 'user-slash'],
});

export const AllVariants: Story = {
  render: () => ({
    components: { ConfirmModal },
    setup() {
      const activeModal = ref<string | null>(null);
      const open = (variant: string) => {
        activeModal.value = variant;
      };
      const close = () => {
        activeModal.value = null;
      };
      return { activeModal, open, close };
    },
    template: `
      <div class="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <div class="flex gap-3">
          <button 
            @click="open('danger')" 
            class="px-5 py-2.5 bg-red-500 text-white text-sm font-medium rounded-lg hover:bg-red-600 transition-colors"
          >
            Danger
          </button>
          <button 
            @click="open('warning')" 
            class="px-5 py-2.5 bg-amber-500 text-white text-sm font-medium rounded-lg hover:bg-amber-600 transition-colors"
          >
            Warning
          </button>
          <button 
            @click="open('info')" 
            class="px-5 py-2.5 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-colors"
          >
            Info
          </button>
        </div>
        
        <ConfirmModal 
          :is-visible="activeModal === 'danger'"
          variant="danger"
          title="Delete Item"
          message="This item will be permanently deleted."
          confirm-text="Delete"
          @confirm="close"
          @cancel="close"
        />
        
        <ConfirmModal 
          :is-visible="activeModal === 'warning'"
          variant="warning"
          title="Pending Changes"
          message="You have unsaved changes that will be lost."
          confirm-text="Continue"
          @confirm="close"
          @cancel="close"
        />
        
        <ConfirmModal 
          :is-visible="activeModal === 'info'"
          variant="info"
          title="Update Available"
          message="A new version is available."
          confirm-text="Update"
          @confirm="close"
          @cancel="close"
        />
      </div>
    `,
  }),
};
