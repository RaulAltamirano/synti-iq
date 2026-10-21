<script setup lang="ts">
import { computed } from 'vue';
import Skeleton from '../Skeleton/Skeleton.vue';

const props = withDefaults(defineProps<SectionSkeletonProps>(), {
  variant: 'default',
  listRowsCount: 4,
});
const borderClasses = 'border-gray-200 dark:border-gray-700';
const borderBClasses = 'border-gray-200 dark:border-gray-700';

export type SectionSkeletonVariant =
  'referral' | 'subscription' | 'notifications' | 'security' | 'sessions' | 'default';

export interface SectionSkeletonProps {
  variant?: SectionSkeletonVariant;
  showStats?: boolean;
  showContentBlocks?: boolean;
  showInputArea?: boolean;
  showListRows?: boolean;
  listRowsCount?: number;
}

const resolvedVariant = computed(() => props.variant ?? 'default');

const showStats = computed(() => {
  if (props.showStats !== undefined) return props.showStats;
  return resolvedVariant.value === 'default';
});

const showContentBlocks = computed(() => {
  if (props.showContentBlocks !== undefined) return props.showContentBlocks;
  return resolvedVariant.value === 'default';
});

const showInputArea = computed(() => {
  if (props.showInputArea !== undefined) return props.showInputArea;
  return resolvedVariant.value === 'default';
});

const showListRows = computed(() => {
  if (props.showListRows !== undefined) return props.showListRows;
  return false;
});

const listRowsCount = computed(() => props.listRowsCount);
</script>

<template>
  <div class="w-full min-w-0" aria-hidden="true">
    <!-- Subscription: mirrors plan card, date grid, features, actions -->
    <div v-if="resolvedVariant === 'subscription'" class="space-y-6">
      <div class="p-4 rounded-lg border space-y-4" :class="borderClasses">
        <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div class="flex-1 space-y-3 min-w-0">
            <div class="flex items-center gap-3 flex-wrap">
              <Skeleton variant="text" :height="24" class="w-40" />
              <Skeleton variant="rectangular" :height="22" class="w-16 rounded-full" />
            </div>
            <Skeleton variant="text" :height="28" class="w-32" />
          </div>
          <Skeleton variant="text" :height="14" class="w-28" />
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div v-for="i in 2" :key="i" class="p-4 rounded-lg border space-y-2" :class="borderClasses">
          <Skeleton variant="text" :height="14" class="w-24" />
          <Skeleton variant="text" :height="18" class="w-36" />
        </div>
      </div>

      <div class="space-y-3">
        <Skeleton variant="text" :height="14" class="w-28" />
        <ul class="space-y-2">
          <li v-for="i in 5" :key="i" class="flex items-center gap-2">
            <Skeleton variant="circular" :width="16" :height="16" />
            <Skeleton variant="text" :height="14" class="w-48" />
          </li>
        </ul>
      </div>

      <div class="flex flex-wrap gap-3 pt-4 border-t" :class="borderClasses">
        <Skeleton variant="rectangular" :height="40" class="w-40 rounded-lg" />
        <Skeleton variant="rectangular" :height="40" class="w-32 rounded-lg" />
      </div>
    </div>

    <!-- Notifications: toggle rows -->
    <div v-else-if="resolvedVariant === 'notifications'" class="space-y-0">
      <div
        v-for="i in listRowsCount"
        :key="i"
        class="flex items-center justify-between gap-4 py-3 border-b last:border-b-0"
        :class="borderBClasses"
      >
        <div class="flex items-center gap-3 flex-1 min-w-0">
          <Skeleton variant="rectangular" :width="16" :height="16" class="rounded shrink-0" />
          <div class="space-y-1.5 flex-1 min-w-0">
            <Skeleton variant="text" :height="14" class="w-32 max-w-full" />
            <Skeleton variant="text" :height="12" class="w-48 max-w-full" />
          </div>
        </div>
        <Skeleton variant="rectangular" :width="44" :height="24" class="rounded-full shrink-0" />
      </div>
    </div>

    <!-- Security: password action, 2FA card, sessions list -->
    <div v-else-if="resolvedVariant === 'security'" class="space-y-4">
      <Skeleton variant="rectangular" :height="44" class="w-full rounded-lg" />

      <div class="p-4 rounded-xl border space-y-4" :class="borderClasses">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div class="flex items-start gap-4 flex-1 min-w-0">
            <Skeleton variant="rectangular" :width="48" :height="48" class="rounded-xl shrink-0" />
            <div class="space-y-2 flex-1 min-w-0">
              <div class="flex items-center gap-2 flex-wrap">
                <Skeleton variant="text" :height="16" class="w-44" />
                <Skeleton variant="rectangular" :height="22" class="w-24 rounded-full" />
              </div>
              <Skeleton variant="text" :height="14" class="w-full max-w-sm" />
              <Skeleton variant="text" :height="14" class="w-3/4 max-w-xs" />
            </div>
          </div>
          <Skeleton variant="rectangular" :width="44" :height="44" class="rounded-xl shrink-0" />
        </div>
      </div>

      <div class="space-y-3">
        <div class="flex items-center justify-between">
          <Skeleton variant="text" :height="14" class="w-32" />
          <Skeleton variant="rectangular" :height="22" class="w-8 rounded-full" />
        </div>
        <div v-for="i in 3" :key="i" class="flex items-center justify-between gap-3 p-3 rounded-lg">
          <div class="flex items-center gap-3 flex-1 min-w-0">
            <Skeleton variant="circular" :width="36" :height="36" />
            <div class="space-y-1.5 flex-1 min-w-0">
              <Skeleton variant="text" :height="14" class="w-40 max-w-full" />
              <Skeleton variant="text" :height="12" class="w-28 max-w-full" />
            </div>
          </div>
          <Skeleton variant="rectangular" :width="32" :height="32" class="rounded-lg shrink-0" />
        </div>
      </div>
    </div>

    <!-- Sessions: list rows only (SessionManager inline loading) -->
    <div v-else-if="resolvedVariant === 'sessions'" class="space-y-3">
      <div class="flex items-center justify-between">
        <Skeleton variant="text" :height="14" class="w-32" />
        <Skeleton variant="rectangular" :height="22" class="w-8 rounded-full" />
      </div>
      <div
        v-for="i in listRowsCount"
        :key="i"
        class="flex items-center justify-between gap-3 p-3 rounded-lg"
      >
        <div class="flex items-center gap-3 flex-1 min-w-0">
          <Skeleton variant="circular" :width="36" :height="36" />
          <div class="space-y-1.5 flex-1 min-w-0">
            <Skeleton variant="text" :height="14" class="w-40 max-w-full" />
            <Skeleton variant="text" :height="12" class="w-28 max-w-full" />
          </div>
        </div>
        <Skeleton variant="rectangular" :width="32" :height="32" class="rounded-lg shrink-0" />
      </div>
    </div>

    <!-- Referral: stats + content + input -->
    <div v-else-if="resolvedVariant === 'referral'" class="space-y-6">
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div
          v-for="i in 4"
          :key="i"
          class="p-4 rounded-lg border flex flex-col items-center justify-center gap-2"
          :class="borderClasses"
        >
          <Skeleton variant="rectangular" :height="28" class="w-12" />
          <Skeleton variant="text" :height="12" class="w-20" />
        </div>
      </div>

      <div class="space-y-4">
        <Skeleton variant="text" :height="14" class="w-24" />
        <div class="p-4 rounded-lg border space-y-3" :class="borderClasses">
          <div class="flex items-center gap-4">
            <Skeleton variant="circular" :width="48" :height="48" />
            <div class="flex-1 space-y-2">
              <Skeleton variant="text" :height="16" class="w-3/4" />
              <Skeleton variant="text" :height="12" class="w-1/2" />
            </div>
          </div>
        </div>
      </div>

      <div class="space-y-4">
        <Skeleton variant="text" :height="14" class="w-32" />
        <Skeleton variant="rectangular" :height="44" class="w-full rounded-lg" />
        <div class="flex gap-3">
          <Skeleton variant="rectangular" :height="40" class="w-28 rounded-lg" />
          <Skeleton variant="rectangular" :height="40" class="w-24 rounded-lg" />
        </div>
      </div>
    </div>

    <!-- Default: configurable blocks -->
    <div v-else class="space-y-6 py-2">
      <div v-if="showStats" class="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div
          v-for="i in 4"
          :key="i"
          class="p-4 rounded-lg border flex flex-col items-center justify-center gap-2"
          :class="borderClasses"
        >
          <Skeleton variant="rectangular" :height="28" class="w-12" />
          <Skeleton variant="text" :height="12" class="w-20" />
        </div>
      </div>

      <div v-if="showContentBlocks" class="space-y-4">
        <Skeleton variant="text" :height="14" class="w-24" />
        <div class="p-4 rounded-lg border space-y-3" :class="borderClasses">
          <div class="flex items-center gap-4">
            <Skeleton variant="circular" :width="48" :height="48" />
            <div class="flex-1 space-y-2">
              <Skeleton variant="text" :height="16" class="w-3/4" />
              <Skeleton variant="text" :height="12" class="w-1/2" />
            </div>
          </div>
        </div>
      </div>

      <div v-if="showInputArea" class="space-y-4">
        <Skeleton variant="text" :height="14" class="w-32" />
        <Skeleton variant="rectangular" :height="44" class="w-full rounded-lg" />
        <div class="flex gap-3">
          <Skeleton variant="rectangular" :height="40" class="w-28 rounded-lg" />
          <Skeleton variant="rectangular" :height="40" class="w-24 rounded-lg" />
        </div>
      </div>

      <div v-if="showListRows" class="space-y-0">
        <div
          v-for="i in listRowsCount"
          :key="i"
          class="flex items-center justify-between gap-4 py-3 border-b last:border-b-0"
          :class="borderBClasses"
        >
          <div class="flex items-center gap-3 flex-1 min-w-0">
            <Skeleton variant="rectangular" :width="16" :height="16" class="rounded shrink-0" />
            <div class="space-y-1.5 flex-1 min-w-0">
              <Skeleton variant="text" :height="14" class="w-32 max-w-full" />
              <Skeleton variant="text" :height="12" class="w-48 max-w-full" />
            </div>
          </div>
          <Skeleton variant="rectangular" :width="44" :height="24" class="rounded-full shrink-0" />
        </div>
      </div>
    </div>
  </div>
</template>
