<template>
  <Section
    :title="title"
    :subtitle="subtitle"
    :icon="icon"
    :icon-color="iconColor"
    :collapsible="collapsible"
    :default-expanded="defaultExpanded"
    :collapsible-header-aria-label="collapsibleHeaderAriaLabel"
    @update:expanded="$emit('update:expanded', $event)"
  >
    <slot />
    <template v-if="$slots.footer" #footer>
      <slot name="footer" />
    </template>
  </Section>
</template>

<script setup lang="ts">
import Section from '@/modules/ui/components/Section/Section.vue';

export interface ProfileSectionProps {
  title: string;
  subtitle?: string;
  icon: string[];
  iconColor?: 'blue' | 'purple' | 'green' | 'yellow' | 'red' | 'gray';
  collapsible?: boolean;
  defaultExpanded?: boolean;
  collapsibleHeaderAriaLabel?: string;
}

defineProps<ProfileSectionProps>();

defineEmits<{
  'update:expanded': [expanded: boolean];
}>();
</script>
