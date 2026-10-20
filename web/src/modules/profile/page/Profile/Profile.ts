import { ref, computed } from 'vue';
import { useAuthStore } from '../../../auth/stores/authStore';
import { useAuth } from '../../../auth/composables/useAuth';
import { useConfirmModal } from '../../../shared/composables/useConfirmModal';

export function useProfile() {
  const authStore = useAuthStore();
  const { logout } = useAuth();
  const { confirmDanger, setLoading } = useConfirmModal();

  const subscriptionExpirationDate = ref<Date | null>(new Date());

  const daysUntilExpiration = computed(() => {
    if (!subscriptionExpirationDate.value) return -1;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expiration = new Date(subscriptionExpirationDate.value);
    expiration.setHours(0, 0, 0, 0);
    const diffTime = expiration.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  });

  const shouldShowBanner = computed(() => {
    return daysUntilExpiration.value <= 7 && daysUntilExpiration.value >= 0;
  });

  const hasActiveSubscription = computed(() => {
    return subscriptionExpirationDate.value !== null && daysUntilExpiration.value > 0;
  });

  const initializeMockExpiration = () => {
    const expiration = new Date();
    expiration.setDate(expiration.getDate() + 7);
    subscriptionExpirationDate.value = expiration;
  };

  initializeMockExpiration();

  const currentUser = computed(() => authStore.currentUser);

  const userFullName = computed(() => {
    const user = currentUser.value;
    if (!user) return null;
    const userData = (user as unknown)?.user || user;
    return userData?.fullName || null;
  });

  const userEmail = computed(() => {
    const user = currentUser.value;
    if (!user) return null;
    const userData = (user as unknown)?.user || user;
    return userData?.email || null;
  });

  const userId = computed(() => {
    const user = currentUser.value;
    if (!user) return null;
    const userData = (user as unknown)?.user || user;
    return userData?.id || userData?.userId || null;
  });

  const userRole = computed(() => {
    const user = currentUser.value;
    if (!user) return null;
    const userData = (user as unknown)?.user || user;
    return userData?.role || userData?.roleName || null;
  });

  const logOut = async () => {
    const confirmed = await confirmDanger({
      title: 'Sign Out',
      message:
        'Your current session will be closed and you will need to sign in again to continue.',
      confirmText: 'Sign Out',
      cancelText: 'Cancel',
      loadingText: 'Signing out...',
      icon: ['fas', 'sign-out-alt'],
    });

    if (!confirmed) return;

    try {
      setLoading(true);
      await logout();
    } catch {
      // Error silenced
    } finally {
      setLoading(false);
    }
  };

  return {
    daysUntilExpiration,
    shouldShowBanner,
    hasActiveSubscription,
    logOut,
    currentUser,
    userFullName,
    userEmail,
    userId,
    userRole,
  };
}
