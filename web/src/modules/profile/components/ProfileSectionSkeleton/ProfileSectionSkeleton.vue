<script setup lang="ts">
import SectionSkeleton from '@/modules/ui/components/SectionSkeleton/SectionSkeleton.vue';

export type ProfileSectionSkeletonVariant =
  'referral' | 'subscription' | 'notifications' | 'security' | 'sessions' | 'default';

export interface ProfileSectionSkeletonProps {
  variant?: ProfileSectionSkeletonVariant;
  showStats?: boolean;
  showContentBlocks?: boolean;
  showInputArea?: boolean;
  showListRows?: boolean;
  listRowsCount?: number;
}

withDefaults(defineProps<ProfileSectionSkeletonProps>(), {
  variant: 'default',
  listRowsCount: 4,
});
</script>

<template>
  <SectionSkeleton
    :variant="variant"
    :show-stats="showStats"
    :show-content-blocks="showContentBlocks"
    :show-input-area="showInputArea"
    :show-list-rows="showListRows"
    :list-rows-count="listRowsCount"
  />
</template>
