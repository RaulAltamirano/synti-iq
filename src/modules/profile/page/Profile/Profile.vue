<template>
  <div
    class="min-h-screen transition-colors duration-300 py-8 px-4 text-gray-800 dark:text-gray-100"
  >
    <div class="flex flex-col max-w-4xl w-full mx-auto space-y-8">
      <TitleCard title="Profile" icon="id-card" />

      <div
        v-if="shouldShowBanner"
        v-motion="{
          initial: { opacity: 0, y: -10 },
          enter: { opacity: 1, y: 0, transition: { duration: 0.3 } },
        }"
      >
        <InfoBanner
          variant="warning"
          title="Your subscription is about to expire"
          :description="`Expires in ${daysUntilExpiration} day${daysUntilExpiration !== 1 ? 's' : ''}`"
          action-label="Renew Now"
          :action-handler="navigateToRenewal"
        />
      </div>

      <div
        v-if="!hasActiveSubscription"
        v-motion="{
          initial: { opacity: 0, y: -10 },
          enter: { opacity: 1, y: 0, transition: { duration: 0.3 } },
        }"
      >
        <InfoBanner
          variant="info"
          title="Start your subscription now!"
          description="Access all premium features with our subscription plans"
          action-label="Subscribe Now"
          :action-handler="navigateToNewSubscription"
        />
      </div>

      <div
        v-motion="{
          initial: { opacity: 0, y: 20 },
          enter: { opacity: 1, y: 0, transition: { duration: 0.4 } },
        }"
        class="py-2"
      >
        <ProfileHeroCard
          :user-full-name="userFullName"
          :user-email="userEmail"
          :user-id="userId"
        />
      </div>

      <div
        v-motion="{
          initial: { opacity: 0, y: 20 },
          enter: { opacity: 1, y: 0, transition: { duration: 0.4, delay: 0.1 } },
        }"
      >
        <ProfileSection
          title="Personal Information"
          subtitle="Basic account information"
          :icon="['fas', 'user']"
          icon-color="blue"
          :collapsible="true"
          :default-expanded="false"
        >
          <div class="space-y-2">
            <!-- User ID -->
            <div class="flex items-center gap-3 py-3 border-b border-gray-100 dark:border-gray-700">
              <FontAwesomeIcon
                :icon="['fas', 'fingerprint']"
                class="w-4 h-4 flex-shrink-0 text-gray-500 dark:text-gray-400"
              />
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-gray-600 dark:text-gray-400">User ID</p>
                <p class="text-sm font-mono truncate text-gray-800 dark:text-gray-200">
                  {{ userId || 'Not available' }}
                </p>
              </div>
              <button
                v-if="userId"
                type="button"
                class="flex-shrink-0 p-2 rounded-lg transition-colors duration-200 text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700"
                title="Copy User ID"
                @click="copyUserId"
              >
                <FontAwesomeIcon :icon="['fas', 'copy']" class="w-4 h-4" />
              </button>
            </div>

            <!-- Email -->
            <div class="flex items-center gap-3 py-3 border-b border-gray-100 dark:border-gray-700">
              <FontAwesomeIcon
                :icon="['fas', 'envelope']"
                class="w-4 h-4 flex-shrink-0 text-gray-500 dark:text-gray-400"
              />
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Email</p>
                <p class="text-sm truncate text-gray-800 dark:text-gray-200">
                  {{ userEmail || 'Not available' }}
                </p>
              </div>
            </div>

            <!-- Role -->
            <div class="flex items-center gap-3 py-3">
              <RoleIcon :role="userRole || ''" size="md" class="flex-shrink-0" />
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Role</p>
                <p class="text-sm text-gray-800 dark:text-gray-200">
                  {{ userRole || 'Not available' }}
                </p>
              </div>
            </div>
          </div>
        </ProfileSection>
      </div>

      <div
        v-motion="{
          initial: { opacity: 0, y: 20 },
          enter: { opacity: 1, y: 0, transition: { duration: 0.4, delay: 0.15 } },
        }"
      >
        <SubscriptionSection />
      </div>

      <div
        v-motion="{
          initial: { opacity: 0, y: 20 },
          enter: { opacity: 1, y: 0, transition: { duration: 0.4, delay: 0.2 } },
        }"
      >
        <NotificationPreferences />
      </div>

      <div
        v-motion="{
          initial: { opacity: 0, y: 20 },
          enter: { opacity: 1, y: 0, transition: { duration: 0.4, delay: 0.25 } },
        }"
      >
        <SecuritySection />
      </div>

      <div
        v-if="userRole === 'business_owner'"
        v-motion="{
          initial: { opacity: 0, y: 20 },
          enter: { opacity: 1, y: 0, transition: { duration: 0.4, delay: 0.3 } },
        }"
      >
        <ReferralSection />
      </div>

      <div
        v-motion="{
          initial: { opacity: 0, y: 20 },
          enter: { opacity: 1, y: 0, transition: { duration: 0.4, delay: 0.35 } },
        }"
        class="flex justify-end"
      >
        <Button variant="secondary" size="md" :icon="['fas', 'sign-out-alt']" @click="logOut">
          Log Out
        </Button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useRouter } from 'vue-router';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import TitleCard from '../../../shared/components/TitleCard/TitleCard.vue';
import ReferralSection from '../../components/ReferralSection/ReferralSection.vue';
import ProfileSection from '../../components/ProfileSection/ProfileSection.vue';
import SubscriptionSection from '../../components/SubscriptionSection/SubscriptionSection.vue';
import NotificationPreferences from '../../components/NotificationPreferences/NotificationPreferences.vue';
import SecuritySection from '../../components/SecuritySection/SecuritySection.vue';
import ProfileHeroCard from '../../components/ProfileHeroCard/ProfileHeroCard.vue';
import { Button, RoleIcon, InfoBanner, useToast } from '../../../ui/components';
import { useProfile } from './Profile';

export default defineComponent({
  name: 'UserProfile',
  components: {
    TitleCard,
    FontAwesomeIcon,
    ReferralSection,
    ProfileSection,
    SubscriptionSection,
    NotificationPreferences,
    SecuritySection,
    ProfileHeroCard,
    Button,
    RoleIcon,
    InfoBanner,
  },
  setup() {
    const router = useRouter();
    const toast = useToast();
    const {
      daysUntilExpiration,
      shouldShowBanner,
      hasActiveSubscription,
      logOut,
      userFullName,
      userEmail,
      userId,
      userRole,
    } = useProfile();

    const navigateToRenewal = () => {
      router.push({ name: 'SubscriptionRenewal' });
    };

    const navigateToNewSubscription = () => {
      router.push({ name: 'SubscriptionNew' });
    };

    const copyUserId = async () => {
      if (!userId.value) return;
      try {
        await navigator.clipboard.writeText(userId.value);
        toast.success('User ID copied to clipboard');
      } catch {
        toast.error('Failed to copy ID');
      }
    };

    return {
      daysUntilExpiration,
      shouldShowBanner,
      hasActiveSubscription,
      navigateToRenewal,
      navigateToNewSubscription,
      logOut,
      userFullName,
      userEmail,
      userId,
      userRole,
      copyUserId,
    };
  },
});
</script>

<style scoped>
.scrollbar-thin {
  scrollbar-width: thin;
}

.scrollbar-thumb-gray-400 {
  scrollbar-color: #a0aec0 #edf2f7;
}

.dark .scrollbar-thumb-gray-400 {
  scrollbar-color: #6b7280 #374151;
}

.scrollbar-thumb-gray-400::-webkit-scrollbar {
  width: 6px;
}

.scrollbar-thumb-gray-400::-webkit-scrollbar-thumb {
  background-color: #a0aec0;
  border-radius: 10px;
}

.dark .scrollbar-thumb-gray-400::-webkit-scrollbar-thumb {
  background-color: #6b7280;
}

.scrollbar-track-gray-200::-webkit-scrollbar-track {
  background-color: #edf2f7;
}

.dark .scrollbar-track-gray-200::-webkit-scrollbar-track {
  background-color: #374151;
}
</style>
