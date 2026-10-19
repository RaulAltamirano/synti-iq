<template>
  <div class="w-full">
    <div class="flex items-center justify-between mb-3">
      <div class="flex items-center gap-2">
        <h3 class="text-sm font-medium" :class="isDark ? 'text-gray-300' : 'text-gray-600'">
          Active Sessions
        </h3>
        <Badge variant="default" size="sm">
          {{ sessions.length }}
        </Badge>
      </div>
      <Button
        v-if="sessions.length > 1"
        variant="danger"
        size="xs"
        :disabled="loading"
        @click="handleDeleteOtherSessions"
      >
        Close Other Sessions
      </Button>
    </div>

    <ProfileSectionSkeleton
      v-if="loading && sessions.length === 0"
      variant="sessions"
      :list-rows-count="3"
    />

    <ProfileLoadErrorBanner
      v-else-if="error && sessions.length === 0"
      :message="error"
      @retry="handleRetry"
    />

    <div v-else class="space-y-2">
      <div
        v-for="session in sessions"
        :key="session.id"
        class="flex items-center justify-between p-3 rounded-lg transition-colors"
        :class="isDark ? 'hover:bg-gray-700/30' : 'hover:bg-gray-50'"
      >
        <div class="flex items-center gap-3 flex-1 min-w-0">
          <div
            class="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
            :class="
              isCurrentSession(session.sessionId)
                ? isDark
                  ? 'bg-green-900/50'
                  : 'bg-green-100'
                : isDark
                  ? 'bg-gray-700/50'
                  : 'bg-gray-100'
            "
          >
            <FontAwesomeIcon
              :icon="getDeviceIcon(session.deviceInfo?.deviceType)"
              class="w-4 h-4"
              :class="
                isCurrentSession(session.sessionId)
                  ? isDark
                    ? 'text-green-400'
                    : 'text-green-600'
                  : isDark
                    ? 'text-gray-400'
                    : 'text-gray-500'
              "
            />
          </div>

          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2">
              <p
                class="font-medium text-sm truncate"
                :class="isDark ? 'text-gray-200' : 'text-gray-800'"
              >
                {{ session.deviceInfo?.browser || 'Browser' }}
                <span :class="isDark ? 'text-gray-500' : 'text-gray-400'">·</span>
                {{ session.deviceInfo?.os || 'System' }}
              </p>
              <Badge v-if="isCurrentSession(session.sessionId)" variant="success" size="xs">
                Current
              </Badge>
            </div>
            <p class="text-xs truncate" :class="isDark ? 'text-gray-400' : 'text-gray-500'">
              {{ session.deviceInfo?.location || 'Unknown location' }} ·
              {{ formatDate(session.lastUsed) }}
            </p>
          </div>
        </div>

        <Button
          v-if="!isCurrentSession(session.sessionId)"
          variant="ghost"
          size="sm"
          :icon="['fas', 'times']"
          :disabled="loading"
          class="ml-2 flex-shrink-0"
          @click="handleDeleteSession(session.sessionId)"
        />
      </div>

      <div v-if="sessions.length === 0 && !loading" class="text-center py-6">
        <p class="text-sm" :class="isDark ? 'text-gray-500' : 'text-gray-400'">
          No active sessions
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { Badge, Button } from '../../../ui/components';
import ProfileSectionSkeleton from '../ProfileSectionSkeleton/ProfileSectionSkeleton.vue';
import ProfileLoadErrorBanner from '../ProfileLoadErrorBanner/ProfileLoadErrorBanner.vue';
import { useSessionManager } from '../../composables/useSessionManager';
import { useTheme } from '../../../shared/composables/useTheme';
import { useConfirmModal } from '../../../shared/composables/useConfirmModal';

const emit = defineEmits<{
  ready: [];
}>();

const { isDark } = useTheme();
const { confirmDanger, confirmWarning, setLoading } = useConfirmModal();

const {
  sessions,
  loading,
  error,
  fetchSessions,
  deleteSession,
  deleteOtherSessions,
  getCurrentSessionId,
  isCurrentSession,
} = useSessionManager();

onMounted(async () => {
  try {
    await fetchSessions();
  } catch {
    // Error is handled by the composable
  } finally {
    emit('ready');
  }
});

const handleRetry = async () => {
  try {
    await fetchSessions();
  } catch {
    // Error is handled by the composable
  }
};

const formatDate = (date: Date): string => {
  const now = new Date();
  const diff = now.getTime() - new Date(date).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return 'Now';
};

const getDeviceIcon = (deviceType?: string): string[] => {
  switch (deviceType?.toLowerCase()) {
    case 'mobile':
      return ['fas', 'mobile-alt'];
    case 'tablet':
      return ['fas', 'tablet-alt'];
    case 'desktop':
      return ['fas', 'desktop'];
    default:
      return ['fas', 'laptop'];
  }
};

const handleDeleteSession = async (sessionId: string) => {
  const confirmed = await confirmDanger({
    title: 'Close Session',
    message: 'The device will need to sign in again to access.',
    confirmText: 'Close',
    cancelText: 'Cancel',
    loadingText: 'Closing...',
  });

  if (!confirmed) return;

  try {
    setLoading(true);
    await deleteSession(sessionId);
  } catch {
    void 0;
  } finally {
    setLoading(false);
  }
};

const handleDeleteOtherSessions = async () => {
  const currentSessionId = getCurrentSessionId();
  if (!currentSessionId) return;

  const confirmed = await confirmWarning({
    title: 'Close Other Sessions',
    message:
      'All sessions on other devices will be closed. Only your current session will remain active.',
    confirmText: 'Continue',
    cancelText: 'Cancel',
    loadingText: 'Closing...',
  });

  if (!confirmed) return;

  try {
    setLoading(true);
    await deleteOtherSessions(currentSessionId);
  } catch {
    void 0;
  } finally {
    setLoading(false);
  }
};
</script>
