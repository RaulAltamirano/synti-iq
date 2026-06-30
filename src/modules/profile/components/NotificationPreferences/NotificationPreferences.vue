<template>
  <ProfileSection
    title="Notifications"
    subtitle="Configure your preferences"
    :icon="['fas', 'bell']"
    icon-color="green"
    :collapsible="true"
    :default-expanded="false"
    @update:expanded="onExpandedChange"
  >
    <ProfileSectionLoadingState
      v-if="isLoading"
      variant="notifications"
      label="Loading notification preferences"
    />

    <div v-else class="space-y-2">
      <div
        v-for="setting in settings"
        :key="setting.id"
        class="flex items-center justify-between py-3 border-b last:border-b-0"
        :class="isDark ? 'border-gray-700' : 'border-gray-100'"
      >
        <div class="flex items-center gap-3 flex-1 min-w-0">
          <FontAwesomeIcon
            :icon="setting.icon"
            class="w-4 h-4 flex-shrink-0"
            :class="isDark ? 'text-gray-400' : 'text-gray-500'"
          />
          <div class="flex-1 min-w-0">
            <p class="font-medium text-sm" :class="isDark ? 'text-gray-200' : 'text-gray-800'">
              {{ setting.label }}
            </p>
            <p class="text-xs truncate" :class="isDark ? 'text-gray-400' : 'text-gray-500'">
              {{ setting.description }}
            </p>
          </div>
        </div>
        <Toggle
          :model-value="setting.enabled"
          size="sm"
          @update:model-value="handleToggleSetting(setting.id)"
        />
      </div>
    </div>
  </ProfileSection>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import ProfileSection from '../ProfileSection/ProfileSection.vue';
import { Toggle, useToast } from '../../../ui/components';
import ProfileSectionLoadingState from '../ProfileSectionLoadingState/ProfileSectionLoadingState.vue';
import { useNotificationPreferences } from '../../composables/useNotificationPreferences';
import { useTheme } from '../../../shared/composables/useTheme';

const { isDark } = useTheme();
const toast = useToast();

const { settings, isLoading, saveSuccess, toggleSetting, loadSettings } =
  useNotificationPreferences();

const hasLoadedOnce = ref(false);

const onExpandedChange = (expanded: boolean) => {
  if (expanded && !hasLoadedOnce.value) {
    hasLoadedOnce.value = true;
    loadSettings();
  }
};

const handleToggleSetting = (id: string) => {
  toggleSetting(id);
};

// Watch saveSuccess to show toast
watch(saveSuccess, (newValue) => {
  if (newValue) {
    toast.success('Changes saved');
  }
});
</script>
