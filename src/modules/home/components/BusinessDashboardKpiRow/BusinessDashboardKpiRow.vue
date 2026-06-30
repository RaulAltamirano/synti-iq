<script setup lang="ts">
import { BUSINESS_DASHBOARD_KPIS } from '../../constants/business-dashboard.constants';
</script>

<template>
  <section aria-labelledby="kpi-heading" class="mb-8 sm:mb-10">
    <h2 id="kpi-heading" class="sr-only">Key performance indicators</h2>
    <ul class="grid list-none grid-cols-1 gap-3 p-0 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4">
      <li
        v-for="kpi in BUSINESS_DASHBOARD_KPIS"
        :key="kpi.id"
        class="rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-colors duration-200 dark:border-gray-800 dark:bg-gray-900/80"
      >
        <h3 class="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
          {{ kpi.label }}
        </h3>
        <p
          class="mt-2 text-2xl font-semibold tabular-nums text-gray-900 dark:text-gray-100"
          :aria-label="`${kpi.label}: ${kpi.value}`"
        >
          {{ kpi.value }}
        </p>
        <p class="mt-1 text-xs text-gray-600 dark:text-gray-400">
          {{ kpi.caption }}
        </p>
      </li>
    </ul>
  </section>
</template>
