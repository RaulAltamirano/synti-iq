export type SubscriptionStatus = 'active' | 'expired' | 'cancelled' | 'trial';

export type SubscriptionPeriod = 'monthly' | 'yearly';

export interface SubscriptionFeature {
  id: string;
  name: string;
  included: boolean;
}

export interface SubscriptionInfo {
  id: string;
  planName: string;
  status: SubscriptionStatus;
  price: number;
  currency: string;
  period: SubscriptionPeriod;
  startDate: Date;
  expirationDate: Date;
  features: SubscriptionFeature[];
  autoRenew: boolean;
}

export interface SubscriptionStatusConfig {
  label: string;
  color: 'green' | 'yellow' | 'red' | 'blue' | 'gray';
  bgClass: string;
  textClass: string;
}

export const SUBSCRIPTION_STATUS_CONFIG: Record<SubscriptionStatus, SubscriptionStatusConfig> = {
  active: {
    label: 'Active',
    color: 'green',
    bgClass: 'bg-green-100 dark:bg-green-900/30',
    textClass: 'text-green-700 dark:text-green-400',
  },
  expired: {
    label: 'Expired',
    color: 'red',
    bgClass: 'bg-red-100 dark:bg-red-900/30',
    textClass: 'text-red-700 dark:text-red-400',
  },
  cancelled: {
    label: 'Cancelled',
    color: 'gray',
    bgClass: 'bg-gray-100 dark:bg-gray-700/30',
    textClass: 'text-gray-700 dark:text-gray-400',
  },
  trial: {
    label: 'Trial',
    color: 'blue',
    bgClass: 'bg-blue-100 dark:bg-blue-900/30',
    textClass: 'text-blue-700 dark:text-blue-400',
  },
};
