import { ref, type Ref } from 'vue';
import type { ToastVariant } from '../components/Toast/Toast.vue';
import { DEFAULT_DURATION } from '../components/Toast/Toast.vue';

export interface ToastOptions {
  message: string;
  variant?: ToastVariant;
  duration?: number;
  icon?: string | string[];
}

export interface ToastState extends ToastOptions {
  visible: boolean;
}

export interface UseToastReturn {
  show: (options: ToastOptions) => void;
  success: (message: string, duration?: number) => void;
  error: (message: string, duration?: number) => void;
  warning: (message: string, duration?: number) => void;
  info: (message: string, duration?: number) => void;
  hide: () => void;
  state: Ref<ToastState>;
}

// Global state for singleton toast
const toastState = ref<ToastState>({
  message: '',
  variant: 'default',
  duration: DEFAULT_DURATION,
  icon: undefined,
  visible: false,
});

let hideTimeout: ReturnType<typeof setTimeout> | null = null;

export function useToast(): UseToastReturn {
  const clearHideTimeout = () => {
    if (hideTimeout) {
      clearTimeout(hideTimeout);
      hideTimeout = null;
    }
  };

  const hide = () => {
    clearHideTimeout();
    toastState.value.visible = false;
  };

  const show = (options: ToastOptions) => {
    clearHideTimeout();

    const duration = options.duration ?? DEFAULT_DURATION;
    toastState.value = {
      message: options.message,
      variant: options.variant || 'default',
      duration,
      icon: options.icon,
      visible: true,
    };
    if (duration > 0) {
      hideTimeout = setTimeout(() => {
        hide();
      }, duration);
    }
  };

  const success = (message: string, duration?: number) => {
    show({ message, variant: 'success', duration });
  };

  const error = (message: string, duration?: number) => {
    show({ message, variant: 'error', duration });
  };

  const warning = (message: string, duration?: number) => {
    show({ message, variant: 'warning', duration });
  };

  const info = (message: string, duration?: number) => {
    show({ message, variant: 'info', duration });
  };

  return {
    show,
    success,
    error,
    warning,
    info,
    hide,
    state: toastState,
  };
}
