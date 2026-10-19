import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

export interface NotificationItem {
  id: string;
  type: 'referral';
  title: string;
  message: string;
  time: string;
  read: boolean;
  referrerName?: string;
}

export const useNotificationStore = defineStore('notification', () => {
  const notifications = ref<NotificationItem[]>([]);
  const showNotificationPanel = ref(false);

  const notificationCount = computed(() => notifications.value.filter((n) => !n.read).length);

  const hasNewNotifications = computed(() => notificationCount.value > 0);

  const addReferralNotification = (referrerName: string = 'Someone') => {
    const timeStr = 'Just now';

    notifications.value.unshift({
      id: `referral-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      type: 'referral',
      title: 'New referral!',
      message: `${referrerName} used your referral code to join SyntiIQ.`,
      time: timeStr,
      read: false,
      referrerName,
    });
  };

  const markAsRead = (id: string) => {
    const n = notifications.value.find((x) => x.id === id);
    if (n) n.read = true;
  };

  const markAllAsRead = () => {
    notifications.value.forEach((n) => (n.read = true));
  };

  const toggleNotificationPanel = () => {
    showNotificationPanel.value = !showNotificationPanel.value;
  };

  const closeNotificationPanel = () => {
    showNotificationPanel.value = false;
  };

  return {
    notifications,
    showNotificationPanel,
    notificationCount,
    hasNewNotifications,
    addReferralNotification,
    markAsRead,
    markAllAsRead,
    toggleNotificationPanel,
    closeNotificationPanel,
  };
});
