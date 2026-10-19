<script setup lang="ts">
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { RouterLink } from 'vue-router';
import { BUSINESS_DASHBOARD_QUICK_ACTIONS } from '../../constants/business-dashboard.constants';

const linkClass =
  'inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-primary bg-transparent px-4 py-2 text-sm font-medium text-primary transition-all duration-200 hover:bg-primary hover:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:border-primary-400 dark:text-primary-400 dark:hover:bg-primary-800 dark:focus:ring-offset-gray-900 sm:text-base';
</script>

<template>
  <section aria-labelledby="quick-actions-heading" class="mb-10 sm:mb-12">
    <h2
      id="quick-actions-heading"
      class="mb-3 text-lg font-semibold text-gray-900 dark:text-gray-100"
    >
      Quick actions
    </h2>
    <div class="flex flex-wrap gap-3">
      <RouterLink
        v-for="action in BUSINESS_DASHBOARD_QUICK_ACTIONS"
        :key="action.id"
        :to="{ name: action.routeName }"
        :class="linkClass"
      >
        <FontAwesomeIcon :icon="action.icon" class="h-4 w-4 shrink-0" aria-hidden="true" />
        {{ action.label }}
      </RouterLink>
    </div>
  </section>
</template>
