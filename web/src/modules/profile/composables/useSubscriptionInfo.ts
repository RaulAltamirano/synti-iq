import { ref, computed } from 'vue';
import type {
  SubscriptionInfo,
  SubscriptionStatus,
  SubscriptionStatusConfig,
} from '../interfaces/subscription.types';
import { SUBSCRIPTION_STATUS_CONFIG } from '../interfaces/subscription.types';

const MOCK_SUBSCRIPTION: SubscriptionInfo = {
  id: 'sub_001',
  planName: 'Professional Plan',
  status: 'active',
  price: 299,
  currency: 'MXN',
  period: 'monthly',
  startDate: new Date('2024-01-15'),
  expirationDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  features: [
    { id: 'f1', name: 'Access to all features', included: true },
    { id: 'f2', name: 'Priority support', included: true },
    { id: 'f3', name: 'Advanced reports', included: true },
    { id: 'f4', name: 'Premium integrations', included: true },
    { id: 'f5', name: 'API access', included: false },
  ],
  autoRenew: true,
};

export function useSubscriptionInfo() {
  const subscriptionInfo = ref<SubscriptionInfo | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  const statusConfig = computed<SubscriptionStatusConfig | null>(() => {
    if (!subscriptionInfo.value) return null;
    return SUBSCRIPTION_STATUS_CONFIG[subscriptionInfo.value.status];
  });

  const statusLabel = computed(() => {
    return statusConfig.value?.label || 'Unknown';
  });

  const statusBadgeClasses = computed(() => {
    if (!statusConfig.value) return '';
    return `${statusConfig.value.bgClass} ${statusConfig.value.textClass}`;
  });

  const formattedExpirationDate = computed(() => {
    if (!subscriptionInfo.value?.expirationDate) return '';
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(new Date(subscriptionInfo.value.expirationDate));
  });

  const formattedStartDate = computed(() => {
    if (!subscriptionInfo.value?.startDate) return '';
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(new Date(subscriptionInfo.value.startDate));
  });

  const formattedPrice = computed(() => {
    if (!subscriptionInfo.value) return '';
    const { price, currency, period } = subscriptionInfo.value;
    const periodLabel = period === 'monthly' ? '/month' : '/year';
    return (
      new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
      }).format(price) + periodLabel
    );
  });

  const daysUntilExpiration = computed(() => {
    if (!subscriptionInfo.value?.expirationDate) return -1;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expiration = new Date(subscriptionInfo.value.expirationDate);
    expiration.setHours(0, 0, 0, 0);
    const diffTime = expiration.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  });

  const isExpiringSoon = computed(() => {
    return daysUntilExpiration.value >= 0 && daysUntilExpiration.value <= 7;
  });

  const fetchSubscriptionInfo = async () => {
    isLoading.value = true;
    error.value = null;

    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      subscriptionInfo.value = { ...MOCK_SUBSCRIPTION };
    } catch {
      error.value = 'Error loading subscription information';
    } finally {
      isLoading.value = false;
    }
  };

  const hasActiveSubscription = computed(() => {
    return (
      subscriptionInfo.value?.status === 'active' || subscriptionInfo.value?.status === 'trial'
    );
  });

  return {
    subscriptionInfo,
    isLoading,
    error,

    statusConfig,
    statusLabel,
    statusBadgeClasses,
    formattedExpirationDate,
    formattedStartDate,
    formattedPrice,
    daysUntilExpiration,
    isExpiringSoon,
    hasActiveSubscription,

    fetchSubscriptionInfo,
  };
}
