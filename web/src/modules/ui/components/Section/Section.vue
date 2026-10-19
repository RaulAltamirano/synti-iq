<template>
  <Card
    :collapsible="collapsible"
    :default-expanded="defaultExpanded"
    :collapsible-header-aria-label="collapsibleHeaderAriaLabel"
    variant="default"
    padding="md"
    class="w-full min-w-0"
    @update:expanded="handleExpandedChange"
  >
    <template #header>
      <div class="flex items-center gap-3">
        <div
          class="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
          :class="iconBgClass"
        >
          <FontAwesomeIcon :icon="icon" class="w-5 h-5" :class="iconColorClass" />
        </div>
        <div class="flex-1 min-w-0">
          <h3 class="text-lg font-semibold leading-tight text-gray-700 dark:text-gray-200">
            {{ title }}
          </h3>
          <p v-if="subtitle" class="text-sm mt-0.5 text-gray-500 dark:text-gray-400">
            {{ subtitle }}
          </p>
        </div>
      </div>
    </template>

    <slot />

    <template v-if="$slots.footer" #footer>
      <slot name="footer" />
    </template>
  </Card>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import Card from '../Card/Card.vue';

export interface SectionProps {
  title: string;
  subtitle?: string;
  icon: string[];
  iconColor?: 'blue' | 'purple' | 'green' | 'yellow' | 'red' | 'gray';
  collapsible?: boolean;
  defaultExpanded?: boolean;
  /** When collapsible, optional label for the header control (screen readers). */
  collapsibleHeaderAriaLabel?: string;
}

const props = withDefaults(defineProps<SectionProps>(), {
  subtitle: '',
  iconColor: 'blue',
  collapsible: true,
  defaultExpanded: false,
  collapsibleHeaderAriaLabel: '',
});

const emit = defineEmits<{
  'update:expanded': [expanded: boolean];
}>();

/**
 * Prop names stay descriptive for callers; classes use @theme semantic scales
 * (primary / info / success / warning / error / gray). `purple` maps to `info`.
 */
const iconBgClass = computed(() => {
  const colorMap: Record<NonNullable<SectionProps['iconColor']>, string> = {
    blue: 'bg-primary-100 dark:bg-primary-900/50',
    purple: 'bg-info-100 dark:bg-info-900/50',
    green: 'bg-success-100 dark:bg-success-900/50',
    yellow: 'bg-warning-100 dark:bg-warning-900/50',
    red: 'bg-error-100 dark:bg-error-900/50',
    gray: 'bg-gray-200 dark:bg-gray-700/50',
  };
  return colorMap[props.iconColor];
});

const iconColorClass = computed(() => {
  const colorMap: Record<NonNullable<SectionProps['iconColor']>, string> = {
    blue: 'text-primary-600 dark:text-primary-400',
    purple: 'text-info-600 dark:text-info-400',
    green: 'text-success-600 dark:text-success-400',
    yellow: 'text-warning-600 dark:text-warning-400',
    red: 'text-error-600 dark:text-error-400',
    gray: 'text-gray-600 dark:text-gray-400',
  };
  return colorMap[props.iconColor];
});

const handleExpandedChange = (expanded: boolean) => {
  emit('update:expanded', expanded);
};
</script>
