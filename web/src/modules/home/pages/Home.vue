<script setup lang="ts">
import InfoBanner from '@/modules/ui/components/InfoBanner/InfoBanner.vue';
import BusinessDashboardHeader from '../components/BusinessDashboardHeader/BusinessDashboardHeader.vue';
import BusinessDashboardKpiRow from '../components/BusinessDashboardKpiRow/BusinessDashboardKpiRow.vue';
import BusinessDashboardQuickActions from '../components/BusinessDashboardQuickActions/BusinessDashboardQuickActions.vue';
import BusinessDashboardModules from '../components/BusinessDashboardModules/BusinessDashboardModules.vue';
</script>

<template>
  <div class="min-h-dvh w-full overflow-x-hidden">
    <main
      class="container mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8"
      aria-labelledby="dashboard-page-title"
    >
      <BusinessDashboardHeader />
      <InfoBanner
        class="mb-6 sm:mb-8"
        variant="info"
        title="Sample metrics"
        description="KPIs in the row below are placeholders until live analytics are connected to the API."
      />
      <BusinessDashboardKpiRow />
      <BusinessDashboardQuickActions />
      <BusinessDashboardModules />
    </main>
  </div>
</template>
