import { reactive } from 'vue';
import type { ConfirmModalVariant } from '../components/ConfirmModal/ConfirmModal.vue';

interface ConfirmModalState {
  isVisible: boolean;
  variant: ConfirmModalVariant;
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  loadingText: string;
  loading: boolean;
  icon?: string[];
}

interface ConfirmOptions {
  title: string;
  message: string;
  variant?: ConfirmModalVariant;
  confirmText?: string;
  cancelText?: string;
  loadingText?: string;
  icon?: string[];
}

type ConfirmResolver = (value: boolean) => void;

const state = reactive<ConfirmModalState>({
  isVisible: false,
  variant: 'danger',
  title: '',
  message: '',
  confirmText: 'Confirm',
  cancelText: 'Cancel',
  loadingText: 'Processing...',
  loading: false,
  icon: undefined,
});

let currentResolver: ConfirmResolver | null = null;

export function useConfirmModal() {
  const confirm = (options: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      currentResolver = resolve;

      state.title = options.title;
      state.message = options.message;
      state.variant = options.variant || 'danger';
      state.confirmText = options.confirmText || 'Confirm';
      state.cancelText = options.cancelText || 'Cancel';
      state.loadingText = options.loadingText || 'Processing...';
      state.icon = options.icon;
      state.loading = false;
      state.isVisible = true;
    });
  };

  const confirmDanger = (options: Omit<ConfirmOptions, 'variant'>) => {
    return confirm({ ...options, variant: 'danger' });
  };

  const confirmWarning = (options: Omit<ConfirmOptions, 'variant'>) => {
    return confirm({ ...options, variant: 'warning' });
  };

  const confirmInfo = (options: Omit<ConfirmOptions, 'variant'>) => {
    return confirm({ ...options, variant: 'info' });
  };

  const handleConfirm = () => {
    if (currentResolver) {
      currentResolver(true);
      currentResolver = null;
    }
    state.isVisible = false;
  };

  const handleCancel = () => {
    if (currentResolver) {
      currentResolver(false);
      currentResolver = null;
    }
    state.isVisible = false;
  };

  const setLoading = (loading: boolean) => {
    state.loading = loading;
  };

  const close = () => {
    handleCancel();
  };

  return {
    state,
    confirm,
    confirmDanger,
    confirmWarning,
    confirmInfo,
    handleConfirm,
    handleCancel,
    setLoading,
    close,
  };
}
