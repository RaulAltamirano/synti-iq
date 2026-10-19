<script setup lang="ts">
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { RouterLink } from 'vue-router';
import Section from '@/modules/ui/components/Section/Section.vue';
import { useTheme } from '@/modules/shared/composables/useTheme';
import { BUSINESS_DASHBOARD_MODULE_GROUPS } from '../../constants/business-dashboard.constants';

const { isDark } = useTheme();
</script>

<template>
  <div class="flex flex-col gap-8 sm:gap-10">
    <Section
      v-for="group in BUSINESS_DASHBOARD_MODULE_GROUPS"
      :key="group.id"
      :title="group.sectionTitle"
      :subtitle="group.sectionSubtitle"
      :icon="group.sectionIcon"
      :icon-color="group.sectionIconColor"
      :collapsible="false"
    >
      <ul
        class="grid list-none grid-cols-1 gap-3 p-0 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3"
        :aria-label="group.sectionTitle"
      >
        <li v-for="card in group.cards" :key="card.id">
          <RouterLink
            :to="{ name: card.routeName }"
            :aria-label="`Go to ${card.title}`"
            :class="[
              'group relative flex min-h-[120px] cursor-pointer flex-col rounded-xl border p-4 shadow-sm transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 sm:p-5',
              isDark
                ? 'border-gray-800 bg-gray-900/80 focus-visible:ring-offset-gray-900'
                : 'border-gray-200 bg-white focus-visible:ring-offset-white',
            ]"
          >
            <div
              class="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary-100 text-primary-600 dark:bg-primary-900/50 dark:text-primary-400"
              aria-hidden="true"
            >
              <FontAwesomeIcon :icon="card.icon" class="h-5 w-5" />
            </div>
            <h3
              class="text-base font-semibold leading-tight text-gray-900 transition-colors duration-150 dark:text-gray-100"
            >
              {{ card.title }}
            </h3>
            <p class="mt-1 grow text-sm leading-relaxed text-gray-600 dark:text-gray-400">
              {{ card.description }}
            </p>
            <div
              class="mt-3 inline-flex items-center text-sm font-medium text-primary-600 dark:text-primary-400"
            >
              <span>Open</span>
              <svg
                class="ml-1 h-4 w-4 transform transition-transform duration-150 group-hover:translate-x-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          </RouterLink>
        </li>
      </ul>
    </Section>
  </div>
</template>
