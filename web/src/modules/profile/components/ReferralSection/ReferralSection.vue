<template>
  <ProfileSection
    title="Referral Program"
    subtitle="Invite friends and get benefits"
    :icon="['fas', 'user-plus']"
    icon-color="green"
    :collapsible="true"
    :default-expanded="false"
    @update:expanded="onExpandedChange"
  >
    <div class="space-y-6">
      <!-- Loading state -->
      <ProfileSectionLoadingState
        v-if="isLoadingCode"
        variant="referral"
        label="Loading referral program"
      />

      <!-- Error state -->
      <ProfileLoadErrorBanner v-else-if="error" :message="error" @retry="handleReferralRetry" />

      <template v-else>
        <div v-if="referralStats" class="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div
            v-for="stat in statCards"
            v-show="stat.visible"
            :key="stat.label"
            class="p-4 rounded-lg border text-center"
            :class="[
              isDark ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-gray-50',
              stat.color,
            ]"
          >
            <p class="text-2xl font-bold">{{ stat.value }}</p>
            <p class="text-xs mt-1" :class="isDark ? 'text-gray-400' : 'text-gray-500'">
              {{ stat.label }}
            </p>
          </div>
        </div>

        <!-- Referred by section -->
        <div v-if="referrerInfo" class="space-y-3">
          <h4 class="text-sm font-medium" :class="isDark ? 'text-gray-400' : 'text-gray-600'">
            Referred by
          </h4>
          <div
            class="flex items-center gap-4 p-4 rounded-lg border transition-colors"
            :class="isDark ? 'border-gray-700' : 'border-gray-200'"
          >
            <Avatar
              :name="referrerInfo.fullName"
              :src="referrerInfo.avatarUrl"
              size="lg"
              :status="undefined"
            />
            <div class="flex-1 min-w-0">
              <p class="font-medium truncate" :class="isDark ? 'text-gray-200' : 'text-gray-800'">
                {{ referrerInfo.fullName }}
              </p>
              <p class="text-sm truncate" :class="isDark ? 'text-gray-400' : 'text-gray-500'">
                {{ referrerInfo.email }}
              </p>
            </div>
            <Badge variant="info" size="sm" :icon="['fas', 'calendar']">
              {{ formatReferredDate(referrerInfo.referredAt) }}
            </Badge>
          </div>
        </div>

        <!-- Your referral code section -->
        <div class="space-y-4">
          <h4 class="text-sm font-medium" :class="isDark ? 'text-gray-400' : 'text-gray-600'">
            Your referral code
          </h4>

          <div class="flex flex-col lg:flex-row gap-6">
            <div class="flex-1 space-y-4">
              <div class="flex gap-2">
                <div class="flex-1">
                  <Input
                    :model-value="referralCode"
                    readonly
                    prefix-icon="hashtag"
                    placeholder="Referral code"
                    class="font-mono text-lg"
                  />
                </div>
                <Button
                  :variant="copySuccess ? 'success' : 'outline'"
                  size="md"
                  :icon="copySuccess ? ['fas', 'check'] : ['fas', 'copy']"
                  @click="handleCopyCode"
                >
                  {{ copySuccess ? 'Copied!' : 'Copy' }}
                </Button>
              </div>

              <div class="space-y-2">
                <label
                  class="text-sm font-medium"
                  :class="isDark ? 'text-gray-400' : 'text-gray-600'"
                >
                  Invitation link
                </label>
                <div
                  class="flex items-center gap-2 p-3 rounded-lg border text-sm font-mono break-all"
                  :class="
                    isDark ? 'border-gray-700 text-gray-300' : 'border-gray-200 text-gray-600'
                  "
                >
                  <span class="inline-icon"><FontAwesomeIcon :icon="['fas', 'link']" /></span>
                  <span class="truncate">{{ referralLink }}</span>
                </div>
              </div>

              <div class="flex flex-wrap gap-3">
                <Button variant="primary" :icon="['fas', 'copy']" @click="handleCopyLink">
                  Copy Link
                </Button>

                <Button
                  v-if="canUseWebShare"
                  variant="outline"
                  :icon="['fas', 'share-alt']"
                  :loading="isSharing"
                  @click="handleShare"
                >
                  Share
                </Button>

                <Button variant="ghost" :icon="['fas', 'download']" @click="handleDownloadQR">
                  Download QR
                </Button>

                <Button
                  variant="outline"
                  :icon="['fas', 'bell']"
                  size="sm"
                  class="border-dashed"
                  title="Simulate someone using your referral code (mock)"
                  @click="simulateReferral"
                >
                  Simulate referral
                </Button>
              </div>
            </div>

            <div class="flex flex-col items-center gap-3">
              <div
                class="p-4 rounded-xl shadow-lg bg-white"
                :class="isDark ? 'ring-1 ring-gray-700' : ''"
              >
                <div
                  v-if="isLoadingQR"
                  class="w-[160px] h-[160px] sm:w-[200px] sm:h-[200px] flex items-center justify-center"
                >
                  <Spinner size="lg" />
                </div>
                <div
                  v-else-if="qrCodeSvg"
                  class="qr-container w-[160px] h-[160px] sm:w-[200px] sm:h-[200px]"
                  v-html="qrCodeSvg"
                />
                <div
                  v-else
                  class="w-[160px] h-[160px] sm:w-[200px] sm:h-[200px] flex items-center justify-center bg-gray-100 rounded"
                >
                  <span class="qr-placeholder-icon"
                    ><FontAwesomeIcon :icon="['fas', 'qrcode']"
                  /></span>
                </div>
              </div>
              <p class="text-xs text-center" :class="isDark ? 'text-gray-500' : 'text-gray-400'">
                Scan to register
              </p>
            </div>
          </div>
        </div>

        <!-- Your referrals list -->
        <div v-if="hasReferrals || totalReferralsCount > 0" class="space-y-3">
          <div class="flex items-center justify-between">
            <h4 class="text-sm font-medium" :class="isDark ? 'text-gray-400' : 'text-gray-600'">
              Your referrals
            </h4>
            <Badge variant="success" size="sm">
              {{ totalReferralsCount }} {{ totalReferralsCount === 1 ? 'user' : 'users' }}
            </Badge>
          </div>

          <div class="space-y-2 max-h-[200px] overflow-y-auto scrollbar-thin">
            <div
              v-for="referral in myReferrals"
              :key="referral.userId"
              class="flex items-center gap-3 p-3 rounded-lg border transition-colors"
              :class="
                isDark ? 'border-gray-700 hover:bg-gray-800/50' : 'border-gray-200 hover:bg-gray-50'
              "
            >
              <Avatar :name="getReferralDisplayName(referral)" size="sm" />
              <div class="flex-1 min-w-0">
                <p
                  class="text-sm font-medium truncate"
                  :class="isDark ? 'text-gray-200' : 'text-gray-800'"
                >
                  {{ getReferralDisplayName(referral) }}
                </p>
                <p class="text-xs truncate" :class="isDark ? 'text-gray-500' : 'text-gray-400'">
                  {{ formatReferredDate(referral.registeredAt) }}
                </p>
              </div>
              <Badge :variant="referral.status === 'active' ? 'success' : 'warning'" size="sm">
                {{ referral.status }}
              </Badge>
            </div>
          </div>
          <!-- Mobile: Load more -->
          <div class="sm:hidden">
            <Button
              v-if="hasMoreReferrals"
              variant="ghost"
              size="sm"
              :loading="isLoadingReferrals"
              :icon="['fas', 'chevron-down']"
              class="w-full min-h-[44px]"
              @click="loadMoreReferrals"
            >
              Load more
            </Button>
          </div>
          <!-- Desktop: Pagination -->
          <div v-if="totalReferralsPages > 1" class="hidden sm:block mt-3">
            <Pagination
              :model-value="currentReferralsPage"
              :total-pages="totalReferralsPages"
              :max-pages-to-show="5"
              :on-page-change="goToReferralsPage"
            />
          </div>
        </div>

        <!-- Social media share section -->
        <div class="space-y-3">
          <h4 class="text-sm font-medium" :class="isDark ? 'text-gray-400' : 'text-gray-600'">
            Share on social media
          </h4>
          <div class="flex flex-wrap gap-3">
            <Button
              :icon="['fab', 'whatsapp']"
              class="social-whatsapp"
              @click="openShareUrl('whatsapp')"
            >
              <span class="hidden sm:inline">WhatsApp</span>
            </Button>

            <Button
              :icon="['fab', 'x-twitter']"
              class="social-twitter"
              @click="openShareUrl('twitter')"
            >
              <span class="hidden sm:inline">Twitter</span>
            </Button>

            <Button
              :icon="['fab', 'facebook-f']"
              class="social-facebook"
              @click="openShareUrl('facebook')"
            >
              <span class="hidden sm:inline">Facebook</span>
            </Button>

            <Button variant="secondary" :icon="['fas', 'envelope']" @click="openShareUrl('email')">
              <span class="hidden sm:inline">Email</span>
            </Button>
          </div>
        </div>
      </template>
    </div>
  </ProfileSection>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import {
  Button,
  Input,
  Avatar,
  Badge,
  Spinner,
  Pagination,
  useToast,
} from '../../../ui/components';
import ProfileSection from '../ProfileSection/ProfileSection.vue';
import ProfileSectionLoadingState from '../ProfileSectionLoadingState/ProfileSectionLoadingState.vue';
import ProfileLoadErrorBanner from '../ProfileLoadErrorBanner/ProfileLoadErrorBanner.vue';
import { useReferral } from '../../composables/useReferral';
import { useTheme } from '../../../shared/composables/useTheme';
import { useNotificationStore } from '../../../shared/store/NotificationStore';

const { isDark } = useTheme();
const notificationStore = useNotificationStore();
const toast = useToast();

const {
  referralCode,
  referrerInfo,
  referralLink,
  qrCodeSvg,
  isLoadingQR,
  isLoadingCode,
  copySuccess,
  isSharing,
  canUseWebShare,
  myReferrals,
  referralStats,
  hasReferrals,
  error,
  copyReferralCode,
  copyReferralLink,
  shareViaWebShare,
  openShareUrl,
  downloadQR,
  initializeReferralData,
  formatReferredDate,
  getReferralDisplayName,
  generateQRCode,
  loadMoreReferrals,
  hasMoreReferrals,
  totalReferralsCount,
  totalReferralsPages,
  currentReferralsPage,
  isLoadingReferrals,
  goToReferralsPage,
} = useReferral();

const handleCopyCode = async () => {
  const success = await copyReferralCode();
  if (success) {
    toast.success('Code copied to clipboard');
  }
};

const handleCopyLink = async () => {
  const success = await copyReferralLink();
  if (success) {
    toast.success('Link copied to clipboard');
  }
};

const handleShare = async () => {
  await shareViaWebShare();
};

const handleDownloadQR = async () => {
  await downloadQR();
  toast.success('QR downloaded');
};

const simulateReferral = () => {
  notificationStore.addReferralNotification('Jane Doe');
};

const hasLoadedOnce = ref(false);

const onExpandedChange = (expanded: boolean) => {
  if (expanded && !hasLoadedOnce.value) {
    hasLoadedOnce.value = true;
    initializeReferralData();
  }
};

const handleReferralRetry = async () => {
  try {
    await initializeReferralData();
  } catch {
    void 0;
  }
};

const statCards = computed(() => {
  const s = referralStats.value;
  if (!s) return [];
  const color = (light: string, dark: string) => (isDark.value ? dark : light);
  return [
    {
      label: 'Total Referrals',
      value: s.totalReferrals,
      visible: true,
      color: color('text-green-600', 'text-green-400'),
    },
    {
      label: 'Active',
      value: s.successfulReferrals,
      visible: true,
      color: color('text-blue-600', 'text-blue-400'),
    },
    {
      label: 'Pending',
      value: s.pendingReferrals,
      visible: true,
      color: color('text-amber-600', 'text-amber-400'),
    },
    {
      label: 'Days Earned',
      value: s.totalBenefitsEarned ? `+${s.totalBenefitsEarned.trialDays || 0}` : 0,
      visible: !!s.totalBenefitsEarned,
      color: color('text-purple-600', 'text-purple-400'),
    },
  ];
});

watch(referralLink, (newLink) => {
  if (newLink) {
    generateQRCode(newLink);
  }
});
</script>

<style scoped>
.qr-container :deep(svg) {
  width: 100%;
  height: 100%;
}

.inline-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1rem;
  height: 1rem;
  flex-shrink: 0;
}

.inline-icon :deep(svg) {
  width: 100%;
  height: 100%;
}

.qr-placeholder-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 3rem;
  height: 3rem;
  color: #9ca3af;
}

.qr-placeholder-icon :deep(svg) {
  width: 100%;
  height: 100%;
}

.scrollbar-thin {
  scrollbar-width: thin;
}

.scrollbar-thin::-webkit-scrollbar {
  width: 6px;
}

.scrollbar-thin::-webkit-scrollbar-thumb {
  background-color: #9ca3af;
  border-radius: 3px;
}

.scrollbar-thin::-webkit-scrollbar-track {
  background-color: transparent;
}

/* Social media brand colors */
.social-whatsapp {
  background-color: #25d366 !important;
  border-color: #25d366 !important;
  color: white !important;
}

.social-whatsapp:hover {
  background-color: #20bd5a !important;
  border-color: #20bd5a !important;
}

.social-twitter {
  background-color: #000000 !important;
  border-color: #000000 !important;
  color: white !important;
}

.social-twitter:hover {
  background-color: #1a1a1a !important;
  border-color: #1a1a1a !important;
}

.social-facebook {
  background-color: #1877f2 !important;
  border-color: #1877f2 !important;
  color: white !important;
}

.social-facebook:hover {
  background-color: #166fe5 !important;
  border-color: #166fe5 !important;
}
</style>
