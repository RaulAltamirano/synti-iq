<template>
  <ProfileSection
    title="Subscription and Billing"
    subtitle="Manage your plan and payments"
    :icon="['fas', 'credit-card']"
    icon-color="yellow"
    :collapsible="true"
    :default-expanded="false"
    @update:expanded="onExpandedChange"
  >
    <ProfileSectionLoadingState
      v-if="isLoading"
      variant="subscription"
      label="Loading subscription information"
    />

    <ProfileLoadErrorBanner v-else-if="error" :message="error" @retry="handleSubscriptionRetry" />

    <div v-else-if="subscriptionInfo" class="space-y-6">
      <div
        class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 rounded-lg border min-w-0"
        :class="isDark ? 'border-gray-700' : 'border-gray-200'"
      >
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-3 mb-2 flex-wrap">
            <h4 class="text-xl font-bold" :class="isDark ? 'text-gray-100' : 'text-gray-900'">
              {{ subscriptionInfo.planName }}
            </h4>
            <Badge :variant="statusBadgeVariant" size="sm">
              {{ statusLabel }}
            </Badge>
          </div>
          <p class="text-2xl font-bold" :class="isDark ? 'text-yellow-400' : 'text-yellow-600'">
            {{ formattedPrice }}
          </p>
        </div>

        <div
          v-if="subscriptionInfo.autoRenew"
          class="flex items-center gap-2 text-sm"
          :class="isDark ? 'text-gray-400' : 'text-gray-600'"
        >
          <FontAwesomeIcon :icon="['fas', 'sync-alt']" class="w-4 h-4" />
          <span>Auto-renewal</span>
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div
          class="p-4 rounded-lg border min-w-0"
          :class="isDark ? 'border-gray-700' : 'border-gray-200'"
        >
          <p class="text-sm font-medium mb-1" :class="isDark ? 'text-gray-400' : 'text-gray-600'">
            Start date
          </p>
          <p
            class="text-base font-semibold truncate"
            :class="isDark ? 'text-gray-200' : 'text-gray-800'"
          >
            {{ formattedStartDate }}
          </p>
        </div>

        <div
          class="p-4 rounded-lg border min-w-0"
          :class="[
            isDark ? 'border-gray-700' : 'border-gray-200',
            isExpiringSoon ? (isDark ? 'border-yellow-500/50' : 'border-yellow-400') : '',
          ]"
        >
          <p class="text-sm font-medium mb-1" :class="isDark ? 'text-gray-400' : 'text-gray-600'">
            Expiration date
          </p>
          <p
            class="text-base font-semibold truncate"
            :class="
              isExpiringSoon
                ? isDark
                  ? 'text-yellow-400'
                  : 'text-yellow-600'
                : isDark
                  ? 'text-gray-200'
                  : 'text-gray-800'
            "
          >
            {{ formattedExpirationDate }}
          </p>
          <p
            v-if="isExpiringSoon && daysUntilExpiration >= 0"
            class="text-xs mt-1"
            :class="isDark ? 'text-yellow-400' : 'text-yellow-600'"
          >
            Expires in {{ daysUntilExpiration }} day{{ daysUntilExpiration !== 1 ? 's' : '' }}
          </p>
        </div>
      </div>

      <div>
        <h5 class="text-sm font-medium mb-3" :class="isDark ? 'text-gray-400' : 'text-gray-600'">
          Plan features
        </h5>
        <ul class="space-y-2">
          <li
            v-for="feature in subscriptionInfo.features"
            :key="feature.id"
            class="flex items-center gap-2 text-sm"
            :class="isDark ? 'text-gray-300' : 'text-gray-700'"
          >
            <FontAwesomeIcon
              :icon="feature.included ? ['fas', 'check-circle'] : ['fas', 'times-circle']"
              class="w-4 h-4 flex-shrink-0"
              :class="
                feature.included
                  ? isDark
                    ? 'text-green-400'
                    : 'text-green-500'
                  : isDark
                    ? 'text-gray-500'
                    : 'text-gray-400'
              "
            />
            <span :class="{ 'line-through opacity-50': !feature.included }">
              {{ feature.name }}
            </span>
          </li>
        </ul>
      </div>

      <div
        class="flex flex-wrap gap-3 pt-4 border-t"
        :class="isDark ? 'border-gray-700' : 'border-gray-200'"
      >
        <Button variant="primary" :icon="['fas', 'sync-alt']" @click="navigateToRenewal">
          Renew Subscription
        </Button>
        <Button variant="outline" :icon="['fas', 'exchange-alt']" @click="navigateToChangePlan">
          Change Plan
        </Button>
      </div>
    </div>

    <div v-else class="text-center py-8">
      <FontAwesomeIcon
        :icon="['fas', 'credit-card']"
        class="w-12 h-12 mb-4"
        :class="isDark ? 'text-gray-600' : 'text-gray-400'"
      />
      <p class="text-lg font-medium mb-2" :class="isDark ? 'text-gray-300' : 'text-gray-700'">
        You don't have an active subscription
      </p>
      <p class="text-sm mb-4" :class="isDark ? 'text-gray-500' : 'text-gray-500'">
        Subscribe to a plan to access all features
      </p>
      <Button variant="primary" :icon="['fas', 'shopping-cart']" @click="navigateToNewSubscription">
        Subscribe Now
      </Button>
    </div>
  </ProfileSection>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { useRouter } from 'vue-router';
import ProfileSection from '../ProfileSection/ProfileSection.vue';
import { Button, Badge } from '../../../ui/components';
import ProfileSectionLoadingState from '../ProfileSectionLoadingState/ProfileSectionLoadingState.vue';
import ProfileLoadErrorBanner from '../ProfileLoadErrorBanner/ProfileLoadErrorBanner.vue';
import type { BadgeVariant } from '../../../ui/components';
import { useSubscriptionInfo } from '../../composables/useSubscriptionInfo';
import { useTheme } from '../../../shared/composables/useTheme';

const router = useRouter();
const { isDark } = useTheme();

const {
  subscriptionInfo,
  isLoading,
  error,
  statusLabel,
  formattedExpirationDate,
  formattedStartDate,
  formattedPrice,
  daysUntilExpiration,
  isExpiringSoon,
  fetchSubscriptionInfo,
} = useSubscriptionInfo();

const hasLoadedOnce = ref(false);

const onExpandedChange = (expanded: boolean) => {
  if (expanded && !hasLoadedOnce.value) {
    hasLoadedOnce.value = true;
    fetchSubscriptionInfo();
  }
};

const handleSubscriptionRetry = () => {
  fetchSubscriptionInfo();
};

const statusBadgeVariant = computed<BadgeVariant>(() => {
  if (!subscriptionInfo.value) return 'default';
  const statusMap: Record<string, BadgeVariant> = {
    active: 'success',
    expired: 'error',
    cancelled: 'default',
    trial: 'info',
  };
  return statusMap[subscriptionInfo.value.status] || 'default';
});

const navigateToRenewal = () => {
  router.push({ name: 'SubscriptionRenewal' });
};

const navigateToChangePlan = () => {
  router.push({ name: 'SubscriptionRenewal' });
};

const navigateToNewSubscription = () => {
  router.push({ name: 'SubscriptionNew' });
};
</script>
