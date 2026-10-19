<script setup lang="ts">
import { computed, ref, watch, onBeforeUnmount } from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import {
  FIELD_HELPER_CLASSES,
  FIELD_LABEL_CLASSES,
  type ComponentSize,
} from '../../types/component.types';
import { createFieldFallbackId } from '../../utils/field-id';

export interface SelectOption {
  label: string;
  value: string | number;
  disabled?: boolean;
}

export interface SelectProps {
  modelValue: string | number | (string | number)[];
  options: SelectOption[];
  size?: ComponentSize;
  disabled?: boolean;
  placeholder?: string;
  label?: string;
  helperText?: string;
  error?: boolean;
  errorMessage?: string;
  required?: boolean;
  multiple?: boolean;
  searchable?: boolean;
  fullWidth?: boolean;
  name?: string;
  id?: string;
  listboxLabel?: string;
  searchPlaceholder?: string;
  emptyOptionsText?: string;
}

const props = withDefaults(defineProps<SelectProps>(), {
  size: 'md',
  disabled: false,
  placeholder: 'Select an option...',
  label: '',
  helperText: '',
  error: false,
  errorMessage: '',
  required: false,
  multiple: false,
  searchable: false,
  fullWidth: false,
  name: '',
  id: '',
  listboxLabel: 'Options',
  searchPlaceholder: 'Search...',
  emptyOptionsText: 'No options found',
});

const emit = defineEmits<{
  'update:modelValue': [value: string | number | (string | number)[]];
  change: [value: string | number | (string | number)[]];
  focus: [event: FocusEvent];
  blur: [event: FocusEvent];
}>();

const selectRootRef = ref<HTMLElement | null>(null);
const fallbackFieldId = createFieldFallbackId('select');
const isOpen = ref(false);
const isFocused = ref(false);
const searchQuery = ref('');
const highlightedIndex = ref(-1);
const openWithLastHighlight = ref(false);

const fieldId = computed(() => props.id || props.name || fallbackFieldId);
const listboxId = computed(() => `select-listbox-${fieldId.value}`);
const helpId = computed(() => `${fieldId.value}-help`);
const errorId = computed(() => `${fieldId.value}-error`);
const ariaDescribedBy = computed(() => {
  const parts: string[] = [];
  if (props.helperText && !props.error) parts.push(helpId.value);
  if (props.error && props.errorMessage) parts.push(errorId.value);
  return parts.length ? parts.join(' ') : undefined;
});

const filteredOptions = computed(() => {
  if (!props.searchable || !searchQuery.value) return props.options;
  const q = searchQuery.value.toLowerCase();
  return props.options.filter((o) => o.label.toLowerCase().includes(q));
});

const selectedLabels = computed(() => {
  if (props.multiple && Array.isArray(props.modelValue)) {
    return props.options.filter((o) => props.modelValue.includes(o.value)).map((o) => o.label);
  }
  if (!props.multiple && props.modelValue !== null && props.modelValue !== undefined) {
    return props.options.find((o) => o.value === props.modelValue)?.label ?? '';
  }
  return '';
});

const activeDescendantId = computed(() => {
  const opts = filteredOptions.value;
  if (!isOpen.value || highlightedIndex.value < 0 || highlightedIndex.value >= opts.length)
    return undefined;
  return `${listboxId.value}-option-${highlightedIndex.value}`;
});

function getFirstEnabledIndex(): number {
  for (let i = 0; i < filteredOptions.value.length; i++) {
    if (!filteredOptions.value[i].disabled) return i;
  }
  return -1;
}
function getLastEnabledIndex(): number {
  for (let i = filteredOptions.value.length - 1; i >= 0; i--) {
    if (!filteredOptions.value[i].disabled) return i;
  }
  return -1;
}
function getInitialHighlightIndex(): number {
  const opts = filteredOptions.value;
  if (opts.length === 0) return -1;
  if (!props.multiple) {
    const idx = opts.findIndex((o) => o.value === props.modelValue);
    if (idx >= 0 && !opts[idx].disabled) return idx;
  }
  return getFirstEnabledIndex();
}
function findNextEnabled(current: number, direction: 1 | -1): number {
  const opts = filteredOptions.value;
  let i = current;
  for (let step = 0; step < opts.length; step++) {
    i = (i + direction + opts.length) % opts.length;
    if (!opts[i].disabled) return i;
  }
  return current;
}

const selectClasses = computed(() => {
  const base = [
    'w-full',
    'rounded-lg',
    'border',
    'transition-all',
    'duration-200',
    'focus:outline-none',
    'focus:ring-2',
    'focus:ring-offset-1',
    'focus:ring-offset-white',
    'dark:focus:ring-offset-0',
    'disabled:opacity-50',
    'disabled:cursor-not-allowed',
    'bg-[var(--ui-field-bg)]',
    'text-[var(--ui-field-text)]',
  ];
  const sizeClasses: Record<ComponentSize, string[]> = {
    xs: ['text-xs', 'px-2', 'py-1'],
    sm: ['text-sm', 'px-3', 'py-1.5'],
    md: ['text-base', 'px-4', 'py-2'],
    lg: ['text-lg', 'px-5', 'py-2.5'],
    xl: ['text-xl', 'px-6', 'py-3'],
  };
  if (props.error) {
    base.push('border-error', 'focus:ring-error/80', 'focus:border-error');
  } else if (isFocused.value || isOpen.value) {
    base.push(
      'border-[var(--ui-focus-ring)]',
      'focus:ring-[color:color-mix(in_srgb,var(--ui-focus-ring)_45%,transparent)]',
      'focus:border-[var(--ui-focus-ring)]'
    );
  } else {
    base.push(
      'border-[var(--ui-field-border)]',
      'focus:ring-[color:color-mix(in_srgb,var(--ui-focus-ring)_45%,transparent)]',
      'focus:border-[var(--ui-focus-ring)]'
    );
  }
  return [...base, ...sizeClasses[props.size], props.fullWidth && 'w-full'].filter(Boolean);
});

const labelClasses = FIELD_LABEL_CLASSES;
const helperTextClasses = FIELD_HELPER_CLASSES;
const selectedTextClasses = 'text-gray-900 dark:text-gray-100';
const placeholderClasses = 'text-gray-400 dark:text-gray-500';
const dropdownClasses = 'bg-[var(--color-bg-elevated)] border border-[var(--color-border-default)]';
const dropdownSearchBorderClasses = 'border-b border-gray-200 dark:border-gray-700';
const dropdownSearchInputClasses = computed(
  () => 'border border-[var(--ui-field-border)] bg-[var(--ui-field-bg)] text-[var(--ui-field-text)]'
);
const optionSelectedClasses = 'bg-gray-100 dark:bg-gray-700';
const optionHoverClasses = 'hover:bg-gray-100 dark:hover:bg-gray-700';
const emptyOptionClasses = 'text-gray-500 dark:text-gray-400';

const isSelected = (option: SelectOption) => {
  if (props.multiple && Array.isArray(props.modelValue))
    return props.modelValue.includes(option.value);
  return props.modelValue === option.value;
};

const handleSelect = (option: SelectOption) => {
  if (option.disabled) return;
  if (props.multiple) {
    const curr = Array.isArray(props.modelValue) ? props.modelValue : [];
    const newVal = curr.includes(option.value)
      ? curr.filter((v) => v !== option.value)
      : [...curr, option.value];
    emit('update:modelValue', newVal);
    emit('change', newVal);
  } else {
    emit('update:modelValue', option.value);
    emit('change', option.value);
    isOpen.value = false;
  }
};

const toggleOpen = () => {
  if (props.disabled) return;
  isOpen.value = !isOpen.value;
  if (isOpen.value) {
    searchQuery.value = '';
    openWithLastHighlight.value = false;
  }
};

const handleFocus = (event: FocusEvent) => {
  isFocused.value = true;
  emit('focus', event);
};
const handleBlur = (event: FocusEvent) => {
  isFocused.value = false;
  emit('blur', event);
};

const handleClickOutside = (event: MouseEvent) => {
  if (!selectRootRef.value?.contains(event.target as Node)) isOpen.value = false;
};
const handleDocumentKeydown = (event: KeyboardEvent) => {
  if (isOpen.value && event.key === 'Escape') {
    event.preventDefault();
    isOpen.value = false;
  }
};

function onSearchKeydown(event: KeyboardEvent) {
  if (['ArrowDown', 'ArrowUp', 'Home', 'End', 'Enter', 'Escape'].includes(event.key))
    onKeydown(event);
}

function onKeydown(event: KeyboardEvent) {
  if (props.disabled) return;
  const opts = filteredOptions.value;
  if (!isOpen.value) {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      openWithLastHighlight.value = false;
      isOpen.value = true;
      searchQuery.value = '';
      return;
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      openWithLastHighlight.value = true;
      isOpen.value = true;
      searchQuery.value = '';
      return;
    }
    return;
  }
  if (event.key === 'Escape') {
    event.preventDefault();
    isOpen.value = false;
    return;
  }
  if (event.key === 'ArrowDown') {
    event.preventDefault();
    if (opts.length === 0) return;
    highlightedIndex.value =
      highlightedIndex.value < 0
        ? getFirstEnabledIndex()
        : findNextEnabled(highlightedIndex.value, 1);
    return;
  }
  if (event.key === 'ArrowUp') {
    event.preventDefault();
    if (opts.length === 0) return;
    highlightedIndex.value =
      highlightedIndex.value < 0
        ? getLastEnabledIndex()
        : findNextEnabled(highlightedIndex.value, -1);
    return;
  }
  if (event.key === 'Home') {
    event.preventDefault();
    highlightedIndex.value = getFirstEnabledIndex();
    return;
  }
  if (event.key === 'End') {
    event.preventDefault();
    highlightedIndex.value = getLastEnabledIndex();
    return;
  }
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    if (highlightedIndex.value >= 0 && opts[highlightedIndex.value])
      handleSelect(opts[highlightedIndex.value]);
    return;
  }
}

watch(isOpen, (open) => {
  if (open) {
    highlightedIndex.value = openWithLastHighlight.value
      ? getLastEnabledIndex()
      : getInitialHighlightIndex();
    openWithLastHighlight.value = false;
    document.addEventListener('click', handleClickOutside);
    document.addEventListener('keydown', handleDocumentKeydown);
  } else {
    highlightedIndex.value = -1;
    document.removeEventListener('click', handleClickOutside);
    document.removeEventListener('keydown', handleDocumentKeydown);
  }
});

watch(filteredOptions, () => {
  if (!isOpen.value) return;
  if (filteredOptions.value.length === 0) {
    highlightedIndex.value = -1;
    return;
  }
  if (highlightedIndex.value >= filteredOptions.value.length)
    highlightedIndex.value = getFirstEnabledIndex();
});

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside);
  document.removeEventListener('keydown', handleDocumentKeydown);
});
</script>

<template>
  <div ref="selectRootRef" :class="{ 'w-full': fullWidth }">
    <!-- Label -->
    <label v-if="label" :for="fieldId" class="block text-sm font-medium mb-1" :class="labelClasses">
      {{ label }}
      <span v-if="required" class="text-error ml-1" aria-hidden="true">*</span>
    </label>

    <!-- Select Container -->
    <div class="relative">
      <!-- Select Button/Display -->
      <button
        :id="fieldId"
        type="button"
        :class="selectClasses"
        :disabled="disabled"
        aria-haspopup="listbox"
        :aria-expanded="isOpen"
        :aria-controls="listboxId"
        :aria-activedescendant="activeDescendantId"
        :aria-invalid="error"
        :aria-describedby="ariaDescribedBy"
        @click="toggleOpen"
        @focus="handleFocus"
        @blur="handleBlur"
        @keydown="onKeydown"
      >
        <span
          v-if="multiple && Array.isArray(modelValue) && modelValue.length > 0"
          class="flex items-center gap-2"
        >
          <span :class="selectedTextClasses"> {{ modelValue.length }} selected </span>
        </span>
        <span v-else-if="!multiple && selectedLabels" :class="selectedTextClasses">
          {{ selectedLabels }}
        </span>
        <span v-else :class="placeholderClasses">
          {{ placeholder }}
        </span>
        <FontAwesomeIcon
          icon="chevron-down"
          class="ml-auto h-4 w-4 text-gray-400 transition-transform"
          :class="{ 'rotate-180': isOpen }"
          aria-hidden="true"
        />
      </button>

      <!-- Dropdown -->
      <Transition
        enter-active-class="transition duration-150 ease-out"
        enter-from-class="opacity-0 scale-[0.98]"
        enter-to-class="opacity-100 scale-100"
        leave-active-class="transition duration-100 ease-in"
        leave-from-class="opacity-100 scale-100"
        leave-to-class="opacity-0 scale-[0.98]"
      >
        <div
          v-if="isOpen"
          class="absolute z-50 w-full mt-1 rounded-lg shadow-lg max-h-60 overflow-auto"
          :class="dropdownClasses"
        >
          <!-- Search Input -->
          <div v-if="searchable" class="p-2 border-b" :class="dropdownSearchBorderClasses">
            <input
              v-model="searchQuery"
              type="text"
              :placeholder="searchPlaceholder"
              class="w-full px-3 py-2 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-primary"
              :class="dropdownSearchInputClasses"
              :aria-label="searchPlaceholder"
              @click.stop
              @keydown="onSearchKeydown"
            />
          </div>

          <!-- Options List -->
          <ul :id="listboxId" class="py-1" role="listbox" :aria-label="listboxLabel">
            <li
              v-for="(option, index) in filteredOptions"
              :id="`${listboxId}-option-${index}`"
              :key="String(option.value)"
              :class="[
                'px-4 py-2 cursor-pointer transition-colors outline-none',
                {
                  'bg-primary text-white': isSelected(option) && !multiple,
                  [optionSelectedClasses]: isSelected(option) && multiple,
                  [optionHoverClasses]: !isSelected(option) && !option.disabled,
                  'opacity-50 cursor-not-allowed': option.disabled,
                  'ring-2 ring-inset ring-primary':
                    index === highlightedIndex && !(isSelected(option) && !multiple),
                },
              ]"
              role="option"
              :aria-selected="isSelected(option)"
              :aria-disabled="option.disabled ? true : undefined"
              @click="handleSelect(option)"
            >
              <div class="flex items-center gap-2">
                <FontAwesomeIcon
                  v-if="multiple && isSelected(option)"
                  icon="check"
                  class="h-4 w-4"
                />
                <span>{{ option.label }}</span>
              </div>
            </li>
            <li
              v-if="filteredOptions.length === 0"
              class="px-4 py-2 text-sm"
              :class="emptyOptionClasses"
              role="status"
            >
              {{ emptyOptionsText }}
            </li>
          </ul>
        </div>
      </Transition>
    </div>

    <!-- Helper Text or Error Message -->
    <p v-if="helperText && !error" :id="helpId" class="mt-1 text-sm" :class="helperTextClasses">
      {{ helperText }}
    </p>
    <p v-else-if="error && errorMessage" :id="errorId" class="mt-1 text-sm text-error" role="alert">
      {{ errorMessage }}
    </p>
  </div>
</template>
