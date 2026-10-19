<script setup lang="ts">
import { computed } from 'vue';
import { usePreferredReducedMotion } from '@vueuse/core';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import TitleCard from '@/modules/shared/components/TitleCard/TitleCard.vue';
import StoreActionsDropdown from '@/modules/store/components/StoreActionsDropdown/StoreActionsDropdown.vue';
import {
  Button,
  Card,
  Input,
  Select,
  Badge,
  Avatar,
  Pagination,
  InfoBanner,
} from '@/modules/ui/components';
import { useStoreDashboard } from '../../composables/useStoreDashboard';

defineOptions({ name: 'StoreDashboard' });

const motionPreference = usePreferredReducedMotion();
const reduceMotion = computed(() => motionPreference.value === 'reduce');

const statsSectionMotion = computed(() => {
  if (reduceMotion.value) {
    return {
      initial: { opacity: 1, y: 0 },
      enter: { opacity: 1, y: 0, transition: { duration: 0 } },
    };
  }
  return {
    initial: { opacity: 0, y: -10 },
    enter: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  };
});

const filtersSectionMotion = computed(() => {
  if (reduceMotion.value) {
    return {
      initial: { opacity: 1, y: 0 },
      enter: { opacity: 1, y: 0, transition: { duration: 0 } },
    };
  }
  return {
    initial: { opacity: 0, y: -10 },
    enter: { opacity: 1, y: 0, transition: { duration: 0.3, delay: 0.05 } },
  };
});

const listSectionMotion = computed(() => {
  if (reduceMotion.value) {
    return {
      initial: { opacity: 1, y: 0 },
      enter: { opacity: 1, y: 0, transition: { duration: 0 } },
    };
  }
  return {
    initial: { opacity: 0, y: 20 },
    enter: { opacity: 1, y: 0, transition: { duration: 0.4, delay: 0.1 } },
  };
});

const {
  stats,
  statsLoading,
  statusOptions,
  filters,
  loading,
  error,
  paginatedStores,
  totalItems,
  currentPage,
  totalPages,
  paginationStart,
  paginationEnd,
  getTypeBadgeVariant,
  formatHours,
  setPage,
  addNewStore,
  viewStoreDetails,
  manageCashiers,
  confirmDelete,
} = useStoreDashboard();
</script>

<template>
  <div class="min-h-screen px-4 py-8 text-gray-800 transition-colors duration-300 dark:text-white">
    <div class="mx-auto flex w-full max-w-4xl flex-col space-y-8">
      <TitleCard title="Stores" icon="store" :actions="[{ icon: 'add', click: addNewStore }]" />

      <!-- Stats Bar -->
      <div v-motion="statsSectionMotion" class="grid grid-cols-2 gap-3 sm:gap-4">
        <Card
          v-for="stat in stats"
          :key="stat.label"
          variant="default"
          padding="sm"
          class="transition-shadow duration-200 hover:shadow-md dark:hover:border-gray-600"
        >
          <div class="flex items-center gap-3">
            <FontAwesomeIcon
              :icon="['fas', stat.icon]"
              class="flex-shrink-0 text-xl"
              :class="stat.color"
            />
            <div class="min-w-0 flex-1">
              <p class="truncate text-sm opacity-70">{{ stat.label }}</p>
              <p v-if="statsLoading" class="truncate text-xl font-bold opacity-50 sm:text-2xl">…</p>
              <p v-else class="truncate text-xl font-bold sm:text-2xl">{{ stat.value }}</p>
            </div>
          </div>
        </Card>
      </div>

      <!-- Filters -->
      <div v-motion="filtersSectionMotion">
        <Card variant="default" padding="md">
          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div class="sm:col-span-1">
              <Input
                v-model="filters.search"
                type="search"
                :prefix-icon="['fas', 'search']"
                placeholder="Search stores..."
                full-width
              />
            </div>
            <Select
              v-model="filters.status"
              :options="statusOptions"
              placeholder="All Status"
              full-width
            />
          </div>
        </Card>
      </div>

      <!-- Error -->
      <InfoBanner
        v-if="error"
        variant="error"
        title="Error"
        :description="error"
        :icon="['fas', 'exclamation-circle']"
      />

      <!-- Store List -->
      <div v-motion="listSectionMotion">
        <!-- Loading -->
        <div v-if="loading" class="space-y-4">
          <Card v-for="i in 3" :key="i" variant="default" padding="md">
            <div class="flex gap-4 animate-pulse">
              <div class="h-14 w-14 rounded-full bg-gray-200/50 dark:bg-gray-700/50" />
              <div class="flex-1 space-y-2">
                <div class="h-4 w-1/3 rounded bg-gray-200/50 dark:bg-gray-700/50" />
                <div class="h-3 w-2/3 rounded bg-gray-200/40 dark:bg-gray-700/40" />
              </div>
            </div>
          </Card>
        </div>

        <!-- Empty state: primary card + hint card (minimal layout) -->
        <div v-else-if="!totalItems" class="space-y-4">
          <Card variant="outlined" padding="xl" class="border-dashed!">
            <div class="mx-auto flex max-w-md flex-col items-center text-center">
              <div
                class="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gray-50 ring-1 ring-black/6 text-gray-400 dark:bg-white/4 dark:ring-white/10"
              >
                <FontAwesomeIcon :icon="['fas', 'store']" class="text-3xl opacity-80" />
              </div>
              <h3 class="text-lg font-medium tracking-tight text-gray-900 dark:text-gray-100">
                No stores yet
              </h3>
              <p class="mt-2 max-w-sm text-sm leading-relaxed text-gray-500">
                Create your first location to manage inventory, staff, and sales from one place.
              </p>
              <Button
                variant="outline"
                size="md"
                class="mt-8 min-h-11 touch-manipulation rounded-full px-8 font-medium"
                :icon="['fas', 'plus']"
                @click="addNewStore"
              >
                Add store
              </Button>
            </div>
          </Card>

          <Card variant="default" padding="md" class="shadow-none!">
            <div class="flex items-start gap-3 text-left sm:gap-4">
              <div
                class="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100 dark:bg-white/6"
              >
                <FontAwesomeIcon
                  :icon="['fas', 'wand-magic-sparkles']"
                  class="text-sm text-gray-600 opacity-70 dark:text-gray-300"
                />
              </div>
              <div class="min-w-0 space-y-1">
                <p class="text-xs font-medium uppercase tracking-wide text-gray-500">Quick tip</p>
                <p class="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                  After adding a store, you can open its details to set hours, address, and invite
                  cashiers.
                </p>
              </div>
            </div>
          </Card>
        </div>

        <!-- Store cards -->
        <TransitionGroup v-else name="list" tag="div" class="space-y-4">
          <Card
            v-for="store in paginatedStores"
            :key="store.id"
            variant="default"
            padding="md"
            hover
            clickable
            class="transition-all duration-300"
            :aria-label="`Open details for ${store.name}`"
            @click="viewStoreDetails(store)"
          >
            <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
              <!-- Store info -->
              <div class="flex min-w-0 flex-1 items-start gap-4">
                <div class="relative flex-shrink-0">
                  <Avatar
                    :name="store.name"
                    :color-seed="String(store.id)"
                    size="lg"
                    class="font-bold"
                  />
                  <span
                    :class="[
                      'absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full border-2 border-white dark:border-gray-800',
                      store.isActive ? 'bg-success-500' : 'bg-gray-400',
                    ]"
                  />
                </div>
                <div class="min-w-0 flex-1">
                  <h3 class="truncate text-lg font-semibold text-gray-800 dark:text-gray-100">
                    {{ store.name }}
                  </h3>
                  <p class="mt-0.5 truncate text-sm text-gray-600 dark:text-gray-400">
                    {{ store.address }}
                  </p>
                  <div class="mt-2 flex flex-wrap gap-2">
                    <Badge :variant="getTypeBadgeVariant(store.storeType)" size="sm">
                      {{ store.storeType }}
                    </Badge>
                    <Badge :variant="store.isActive ? 'success' : 'default'" size="sm">
                      {{ store.isActive ? 'Active' : 'Inactive' }}
                    </Badge>
                  </div>
                  <div class="mt-2 flex flex-wrap gap-3 text-xs text-gray-500">
                    <span class="flex items-center gap-1">
                      <FontAwesomeIcon :icon="['fas', 'clock']" />
                      {{ formatHours(store.openingHours) }}
                    </span>
                    <span class="flex items-center gap-1">
                      <FontAwesomeIcon :icon="['fas', 'users']" />
                      {{ store.cashiersCount }} cashiers
                    </span>
                  </div>
                </div>
              </div>

              <!-- Actions (clicks do not open store detail) -->
              <div class="flex justify-end sm:flex-shrink-0" @click.stop>
                <StoreActionsDropdown
                  :store="store"
                  :on-manage-cashiers="manageCashiers"
                  :on-delete="confirmDelete"
                />
              </div>
            </div>
          </Card>
        </TransitionGroup>

        <!-- Pagination -->
        <div
          v-if="!loading && totalItems > 0"
          class="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <p class="order-2 text-sm text-gray-600 sm:order-1 dark:text-gray-400">
            Showing {{ paginationStart + 1 }} to {{ paginationEnd }} of {{ totalItems }} stores
          </p>
          <div
            class="order-1 flex max-w-full flex-wrap justify-center gap-2 overflow-x-auto sm:order-2"
          >
            <Pagination
              :model-value="currentPage"
              :total-pages="totalPages"
              :max-pages-to-show="5"
              :show-compact-on-mobile="true"
              :on-page-change="setPage"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@reference "../../../../assets/tailwind.css";

.list-move,
.list-enter-active,
.list-leave-active {
  transition: all 0.5s ease;
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}

@media (prefers-reduced-motion: reduce) {
  .list-move,
  .list-enter-active,
  .list-leave-active {
    transition: none;
  }

  .list-enter-from,
  .list-leave-to {
    transform: none;
    opacity: 0;
  }
}
</style>
