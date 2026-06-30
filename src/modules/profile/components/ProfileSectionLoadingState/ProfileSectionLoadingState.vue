<template>
  <div
    role="status"
    aria-live="polite"
    aria-busy="true"
    :aria-label="label"
    class="profile-section-loading w-full min-w-0"
  >
    <span class="sr-only">{{ label }}</span>
    <ProfileSectionSkeleton :variant="variant" v-bind="skeletonProps" />
  </div>
</template>

<script setup lang="ts">
import ProfileSectionSkeleton, {
  type ProfileSectionSkeletonProps,
} from '../ProfileSectionSkeleton/ProfileSectionSkeleton.vue';

export interface ProfileSectionLoadingStateProps {
  variant: NonNullable<ProfileSectionSkeletonProps['variant']>;
  label?: string;
  skeletonProps?: Omit<ProfileSectionSkeletonProps, 'variant'>;
}

withDefaults(defineProps<ProfileSectionLoadingStateProps>(), {
  label: 'Loading section content',
  skeletonProps: () => ({}),
});
</script>

<style scoped>
.profile-section-loading {
  animation: profile-section-loading-enter 0.2s ease-out;
}

@keyframes profile-section-loading-enter {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@media (prefers-reduced-motion: reduce) {
  .profile-section-loading {
    animation: none;
  }
}
</style>
