<script setup lang="ts">
import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useAuthStore } from '@/modules/auth/stores/authStore';
import { useGreeting } from '../../composables/useGreeting';

const authStore = useAuthStore();
const { currentUser } = storeToRefs(authStore);
const firstName = computed(() => currentUser.value?.firstName ?? null);
const { greetingPrefix, displayName } = useGreeting(firstName);

const todayLabel = computed(() =>
  new Intl.DateTimeFormat(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  }).format(new Date())
);
</script>

<template>
  <header class="mb-6 sm:mb-8">
    <p
      class="text-sm font-medium text-primary-600 dark:text-primary-400"
      data-testid="dashboard-date"
    >
      {{ todayLabel }}
    </p>
    <h1
      id="dashboard-page-title"
      class="mt-1 text-2xl font-semibold tracking-tight text-gray-900 dark:text-gray-100 sm:text-3xl"
    >
      <template v-if="displayName">
        {{ greetingPrefix }},
        <span class="text-primary-600 dark:text-primary-400">{{ displayName }}</span>
      </template>
      <template v-else> {{ greetingPrefix }}. </template>
    </h1>
    <p class="mt-2 max-w-2xl text-sm leading-relaxed text-gray-600 dark:text-gray-400 sm:text-base">
      Operational overview: jump into POS, stores, and team tools from here.
    </p>
  </header>
</template>
