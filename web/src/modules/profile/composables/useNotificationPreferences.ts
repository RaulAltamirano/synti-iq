import { ref } from 'vue';
import type { NotificationSetting } from '../interfaces/notification.types';
import { DEFAULT_NOTIFICATION_SETTINGS } from '../interfaces/notification.types';

const STORAGE_KEY = 'syntiiq_notification_settings';

export function useNotificationPreferences() {
  const settings = ref<NotificationSetting[]>([]);
  const isLoading = ref(false);
  const isSaving = ref(false);
  const saveSuccess = ref(false);

  const loadSettings = () => {
    isLoading.value = true;

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        settings.value = JSON.parse(stored);
      } else {
        settings.value = DEFAULT_NOTIFICATION_SETTINGS.map((s) => ({ ...s }));
      }
    } catch {
      settings.value = DEFAULT_NOTIFICATION_SETTINGS.map((s) => ({ ...s }));
    } finally {
      isLoading.value = false;
    }
  };

  const toggleSetting = (id: string) => {
    const setting = settings.value.find((s) => s.id === id);
    if (setting) {
      setting.enabled = !setting.enabled;
      saveSettings();
    }
  };

  const saveSettings = async () => {
    isSaving.value = true;
    saveSuccess.value = false;

    try {
      await new Promise((resolve) => setTimeout(resolve, 300));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings.value));
      saveSuccess.value = true;

      setTimeout(() => {
        saveSuccess.value = false;
      }, 2000);
    } catch {
      /* localStorage unavailable */
    } finally {
      isSaving.value = false;
    }
  };

  return {
    settings,
    isLoading,
    isSaving,
    saveSuccess,
    toggleSetting,
    loadSettings,
  };
}
