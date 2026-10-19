<template>
  <ProfileSection
    title="Security"
    subtitle="Account security settings"
    :icon="['fas', 'shield-alt']"
    icon-color="purple"
    :collapsible="true"
    :default-expanded="false"
    collapsible-header-aria-label="Toggle security settings section"
  >
    <div class="space-y-6">
      <!-- Password -->
      <section class="space-y-3" aria-labelledby="security-password-heading">
        <div>
          <h3
            id="security-password-heading"
            class="text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Password
          </h3>
          <p class="text-sm mt-1 text-gray-500 dark:text-gray-400">
            Use a strong, unique password and update it if you suspect unauthorized access.
          </p>
        </div>
        <Button
          variant="warning"
          size="md"
          :full-width="true"
          :icon="['fas', 'key']"
          icon-position="left"
          @click="changePassword"
        >
          Change Password
        </Button>
      </section>

      <div class="border-t border-gray-200 dark:border-gray-700" role="separator" />

      <!-- Two-factor authentication (loads its own skeleton) -->
      <section aria-labelledby="security-2fa-heading">
        <h3 id="security-2fa-heading" class="sr-only">Two-factor authentication</h3>
        <TwoFactorAuth />
      </section>

      <div class="border-t border-gray-200 dark:border-gray-700" role="separator" />

      <!-- Active sessions (loads its own skeleton) -->
      <section aria-labelledby="security-sessions-heading">
        <h3 id="security-sessions-heading" class="sr-only">Active sessions</h3>
        <SessionManager />
      </section>
    </div>
  </ProfileSection>
</template>

<script setup lang="ts">
import ProfileSection from '../ProfileSection/ProfileSection.vue';
import SessionManager from '../SessionManager/SessionManager.vue';
import TwoFactorAuth from '../TwoFactorAuth/TwoFactorAuth.vue';
import { Button, useToast } from '@/modules/ui/components';

const toast = useToast();

const changePassword = () => {
  toast.info('Password change is not available yet. Contact support if you need help.');
};
</script>
