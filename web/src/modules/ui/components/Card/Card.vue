<script setup lang="ts">
import { computed, ref, watch, onMounted } from 'vue';

export type CardVariant = 'default' | 'elevated' | 'outlined';

export interface CardProps {
  variant?: CardVariant;
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  hover?: boolean;
  clickable?: boolean;
  /** Use when `clickable` is true and visible text may not describe the action. */
  clickableAriaLabel?: string;
  collapsible?: boolean;
  /** Use when `collapsible` is true if the header slot does not expose a clear accessible name. */
  collapsibleHeaderAriaLabel?: string;
  defaultExpanded?: boolean;
}

const props = withDefaults(defineProps<CardProps>(), {
  variant: 'default',
  padding: 'md',
  hover: false,
  clickable: false,
  clickableAriaLabel: '',
  collapsible: false,
  collapsibleHeaderAriaLabel: '',
  defaultExpanded: false,
});

const emit = defineEmits<{
  click: [event: MouseEvent];
  'update:expanded': [value: boolean];
}>();

const isExpanded = ref(props.defaultExpanded);

watch(
  () => props.defaultExpanded,
  (val) => {
    isExpanded.value = val;
  }
);

onMounted(() => {
  if (props.collapsible && props.defaultExpanded) emit('update:expanded', isExpanded.value);
});

const toggleExpand = () => {
  if (props.collapsible) {
    isExpanded.value = !isExpanded.value;
    emit('update:expanded', isExpanded.value);
  }
};

const collapseIconClasses = 'text-gray-500 dark:text-gray-400';
const footerBorderClasses = 'border-gray-200 dark:border-gray-700';

const headerClasses = computed(() => {
  const classes: string[] = [];
  if (!props.collapsible || isExpanded.value) {
    classes.push('mb-4', 'pb-4', 'border-b', 'border-gray-200', 'dark:border-gray-700');
  }
  if (props.collapsible) classes.push('cursor-pointer', 'select-none');
  return classes;
});

const cardClasses = computed(() => {
  const base = [
    'w-full',
    'max-w-full',
    'box-border',
    'rounded-lg',
    'bg-white',
    'text-gray-900',
    'dark:bg-gray-800',
    'dark:text-gray-100',
    'transition-all',
    'duration-200',
  ];
  const variantClasses: Record<CardVariant, string[]> = {
    default: ['border border-gray-200 shadow-sm', 'dark:border-gray-700 dark:shadow-none'],
    elevated: ['shadow-md', 'border-0'],
    outlined: ['border-2 border-gray-300', 'dark:border-gray-600'],
  };
  const paddingClasses: Record<string, string[]> = {
    none: [],
    sm: ['p-2'],
    md: ['p-4'],
    lg: ['p-6'],
    xl: ['p-8'],
  };
  const classes = [...base, ...variantClasses[props.variant], ...paddingClasses[props.padding]];
  if (props.hover) classes.push('hover:shadow-lg', 'hover:-translate-y-1');
  if (props.clickable) classes.push('cursor-pointer', 'hover:shadow-lg');
  return classes;
});

const handleClick = (event: MouseEvent) => {
  if (props.clickable) emit('click', event);
};

const handleKeydownEnter = (event: KeyboardEvent) => {
  if (props.clickable) handleClick(event as unknown as MouseEvent);
};

const handleKeydownSpace = (event: KeyboardEvent) => {
  const target = event.target as HTMLElement;
  if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)
    return;
  if (props.clickable) {
    event.preventDefault();
    handleClick(event as unknown as MouseEvent);
  }
};
</script>

<template>
  <div
    :class="cardClasses"
    :role="clickable ? 'button' : undefined"
    :tabindex="clickable ? 0 : undefined"
    :aria-label="clickable && clickableAriaLabel ? clickableAriaLabel : undefined"
    @click="handleClick"
    @keydown.enter="handleKeydownEnter"
    @keydown.space="handleKeydownSpace"
  >
    <!-- Header Slot (Collapsible) -->
    <div
      v-if="$slots.header"
      :class="headerClasses"
      :aria-expanded="collapsible ? isExpanded : undefined"
      :aria-label="
        collapsible && collapsibleHeaderAriaLabel ? collapsibleHeaderAriaLabel : undefined
      "
      :role="collapsible ? 'button' : undefined"
      :tabindex="collapsible ? 0 : undefined"
      @click.stop="collapsible && toggleExpand()"
      @keydown.enter.stop="collapsible && toggleExpand()"
      @keydown.space.prevent.stop="collapsible && toggleExpand()"
    >
      <div class="flex items-center justify-between w-full min-w-0">
        <div class="flex-1 min-w-0">
          <slot name="header" />
        </div>
        <svg
          v-if="collapsible"
          class="w-5 h-5 transition-transform duration-300 flex-shrink-0 ml-3"
          :class="[collapseIconClasses, { 'rotate-180': isExpanded }]"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </div>
    </div>

    <!-- Collapsible Content -->
    <div
      v-if="!collapsible || isExpanded"
      class="collapse-content min-w-0 w-full"
      :class="{ 'collapse-animate': collapsible }"
    >
      <!-- Default/Body Slot -->
      <slot />

      <!-- Footer Slot -->
      <div v-if="$slots.footer" class="mt-4 pt-4 border-t" :class="footerBorderClasses">
        <slot name="footer" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.collapse-content {
  overflow: hidden;
}

.collapse-animate {
  animation: collapse-expand 0.25s ease-out;
}

@keyframes collapse-expand {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@media (prefers-reduced-motion: reduce) {
  .collapse-animate {
    animation: none;
  }
}
</style>
