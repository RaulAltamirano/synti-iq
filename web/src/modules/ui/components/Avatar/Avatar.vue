<script setup lang="ts">
import { computed } from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import type { ComponentSize } from '../../types/component.types';
import { generateAvatarColor } from '../../../shared/utils/avatarColor';

export type AvatarStatus = 'online' | 'offline' | 'away' | 'busy';
export type AvatarSize = ComponentSize | '2xl';

export interface AvatarProps {
  src?: string;
  alt?: string;
  name?: string;
  icon?: string | string[];
  size?: AvatarSize;
  status?: AvatarStatus;
  statusPosition?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  rounded?: boolean;
  bgColor?: string;
  colorSeed?: string;
}

const props = withDefaults(defineProps<AvatarProps>(), {
  src: '',
  alt: '',
  name: '',
  icon: undefined,
  size: 'md',
  status: undefined,
  statusPosition: 'bottom-right',
  rounded: true,
  bgColor: '',
  colorSeed: '',
});

const wrapperSizeClasses: Record<AvatarSize, string[]> = {
  xs: ['w-6', 'h-6'],
  sm: ['w-8', 'h-8'],
  md: ['w-10', 'h-10'],
  lg: ['w-12', 'h-12'],
  xl: ['w-16', 'h-16'],
  '2xl': ['w-32', 'h-32'],
};

const initials = computed(() => {
  if (!props.name) return '';
  const parts = props.name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return parts[0][0].toUpperCase();
});

const wrapperClasses = computed(() => [
  'relative',
  'inline-flex',
  'flex-shrink-0',
  ...wrapperSizeClasses[props.size],
  props.rounded ? 'rounded-full' : 'rounded-lg',
]);

const avatarClasses = computed(() => {
  const textSizeClasses: Record<AvatarSize, string> = {
    xs: 'text-xs',
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
    '2xl': 'text-4xl',
  };
  return [
    'w-full',
    'h-full',
    'inline-flex',
    'items-center',
    'justify-center',
    'bg-gray-200',
    'text-gray-600',
    'dark:bg-gray-700',
    'dark:text-gray-300',
    'font-medium',
    'overflow-hidden',
    props.rounded ? 'rounded-full' : 'rounded-lg',
    textSizeClasses[props.size],
  ];
});

const statusClasses = computed(() => {
  if (!props.status) return [];
  const statusColorClasses = {
    online: ['bg-success'],
    offline: ['bg-gray-400'],
    away: ['bg-warning'],
    busy: ['bg-error'],
  };
  const statusSizeClasses: Record<AvatarSize, string[]> = {
    xs: ['w-2', 'h-2'],
    sm: ['w-2.5', 'h-2.5'],
    md: ['w-3.5', 'h-3.5'],
    lg: ['w-4', 'h-4'],
    xl: ['w-4', 'h-4'],
    '2xl': ['w-5', 'h-5'],
  };
  const positionClasses = {
    'top-right': ['top-0', 'right-0'],
    'top-left': ['top-0', 'left-0'],
    'bottom-right': ['bottom-0', 'right-0'],
    'bottom-left': ['bottom-0', 'left-0'],
  };
  return [
    'absolute',
    'z-10',
    'border-2',
    'border-white',
    'dark:border-gray-800',
    'rounded-full',
    ...statusColorClasses[props.status],
    ...statusSizeClasses[props.size],
    ...positionClasses[props.statusPosition],
  ];
});

const avatarStyle = computed(() => {
  if (props.bgColor) return { backgroundColor: props.bgColor, color: '#ffffff' };
  if (props.colorSeed)
    return { backgroundColor: generateAvatarColor(props.colorSeed), color: '#ffffff' };
  return {};
});
</script>

<template>
  <div :class="wrapperClasses">
    <div :class="avatarClasses" :style="avatarStyle">
      <img
        v-if="src"
        :src="src"
        :alt="alt || name || 'Avatar'"
        class="h-full w-full object-cover"
      />
      <FontAwesomeIcon v-else-if="icon" :icon="icon" class="h-1/2 w-1/2" />
      <span v-else-if="name && initials">{{ initials }}</span>
      <FontAwesomeIcon v-else icon="user" class="h-1/2 w-1/2" />
    </div>
    <span v-if="status" :class="statusClasses" :aria-label="`Status: ${status}`" />
  </div>
</template>
