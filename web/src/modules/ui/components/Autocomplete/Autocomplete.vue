<script setup lang="ts">
import { ref, computed, watch, onBeforeUnmount } from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import Avatar from '../Avatar/Avatar.vue';
import {
  FIELD_HELPER_CLASSES,
  FIELD_ICON_CLASSES,
  FIELD_LABEL_CLASSES,
  type ComponentSize,
} from '../../types/component.types';
import { createFieldFallbackId } from '../../utils/field-id';

export interface AutocompleteOption<T = string> {
  label: string;
  value: T;
  description?: string;
  avatarName?: string;
}

export interface AutocompleteProps {
  modelValue: string;
  fetchSuggestions: (query: string) => Promise<AutocompleteOption[]>;
  label?: string;
  placeholder?: string;
  helperText?: string;
  disabled?: boolean;
  error?: boolean;
  errorMessage?: string;
  required?: boolean;
  minChars?: number;
  /** Override the "type at least N characters" hint for i18n. */
  minCharsText?: string;
  fullWidth?: boolean;
  size?: ComponentSize;
  name?: string;
  id?: string;
  prefixIcon?: string | string[];
  clearable?: boolean;
  loadingText?: string;
  noResultsText?: string;
  debounceMs?: number;
  maxSuggestions?: number;
}

const DEFAULT_DEBOUNCE_MS = 280;

const props = withDefaults(defineProps<AutocompleteProps>(), {
  modelValue: '',
  label: '',
  placeholder: '',
  helperText: '',
  disabled: false,
  error: false,
  errorMessage: '',
  required: false,
  minChars: 2,
  minCharsText: undefined,
  fullWidth: false,
  size: 'md',
  name: '',
  id: '',
  prefixIcon: undefined,
  clearable: true,
  loadingText: 'Searching…',
  noResultsText: 'No results',
  debounceMs: DEFAULT_DEBOUNCE_MS,
  maxSuggestions: 0,
});

const emit = defineEmits<{
  'update:modelValue': [value: string];
  select: [option: AutocompleteOption];
  focus: [];
  blur: [];
  clear: [];
}>();

const fallbackInputId = createFieldFallbackId('autocomplete');
const inputRef = ref<HTMLInputElement | null>(null);
const isOpen = ref(false);
const isLoading = ref(false);
const suggestions = ref<AutocompleteOption[]>([]);
const highlightedIndex = ref(-1);
/** Tracks the value of the last explicitly selected option — used for aria-selected. */
const selectedOptionValue = ref<string | null>(null);
const query = ref(String(props.modelValue));
const isFocused = ref(false);
let debounceTimer: ReturnType<typeof setTimeout> | null = null;
let lastRequestId = 0;

const minCharsHint = computed(
  () => props.minCharsText ?? `Type at least ${props.minChars} characters…`
);

const sizeClasses: Record<ComponentSize, string[]> = {
  xs: ['text-xs', 'px-2', 'py-1'],
  sm: ['text-sm', 'px-3', 'py-1.5'],
  md: ['text-base', 'px-4', 'py-2'],
  lg: ['text-lg', 'px-5', 'py-2.5'],
  xl: ['text-xl', 'px-6', 'py-3'],
};

const paddingLeftClass = computed(() => (props.prefixIcon ? 'pl-10' : ''));
const paddingRightClass = computed(() => {
  if (props.clearable && query.value.trim()) return 'pr-10';
  if (isLoading.value) return 'pr-10';
  return '';
});

const inputClasses = computed(() => {
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
    ...sizeClasses[props.size],
    paddingLeftClass.value,
    paddingRightClass.value,
  ];
  if (props.error) {
    base.push('border-error', 'focus:ring-error/80', 'focus:border-error');
  } else if (isFocused.value) {
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
  base.push(
    'bg-[var(--ui-field-bg)]',
    'text-[var(--ui-field-text)]',
    'placeholder:text-[var(--ui-field-placeholder)]'
  );
  return base.join(' ');
});

const labelClasses = FIELD_LABEL_CLASSES;
const helperTextClasses = FIELD_HELPER_CLASSES;
const iconClasses = FIELD_ICON_CLASSES;
const containerClasses = computed(() => [props.fullWidth && 'w-full'].filter(Boolean).join(' '));
const inputId = computed(() => props.id || props.name || fallbackInputId);
const helperId = computed(() => `${inputId.value}-help`);
const errorId = computed(() => `${inputId.value}-error`);
const describedById = computed(() => {
  const parts: string[] = [];
  if (props.helperText && !props.error) parts.push(helperId.value);
  if (props.error && props.errorMessage) parts.push(errorId.value);
  return parts.length ? parts.join(' ') : undefined;
});
const listboxId = computed(() => `autocomplete-listbox-${inputId.value}`);
const activeDescendantId = computed(() =>
  highlightedIndex.value >= 0 && suggestions.value[highlightedIndex.value]
    ? `${listboxId.value}-option-${highlightedIndex.value}`
    : undefined
);
const clearButtonClasses =
  'text-gray-500 hover:text-gray-700 focus:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 dark:focus:text-gray-200 focus:outline-none rounded p-1 transition-colors';

const displayedSuggestions = computed(() => {
  if (props.maxSuggestions && props.maxSuggestions > 0)
    return suggestions.value.slice(0, props.maxSuggestions);
  return suggestions.value;
});

function clearDebounce() {
  if (debounceTimer) {
    clearTimeout(debounceTimer);
    debounceTimer = null;
  }
}

function loadSuggestions(q: string) {
  if (q.length < props.minChars) {
    suggestions.value = [];
    isOpen.value = true;
    return;
  }
  const requestId = ++lastRequestId;
  isLoading.value = true;
  props
    .fetchSuggestions(q.trim())
    .then((items) => {
      if (requestId !== lastRequestId) return;
      suggestions.value = items;
      highlightedIndex.value = -1;
      isOpen.value = true;
    })
    .catch(() => {
      if (requestId !== lastRequestId) return;
      suggestions.value = [];
      isOpen.value = true;
    })
    .finally(() => {
      if (requestId === lastRequestId) isLoading.value = false;
    });
}

function onInput(e: Event) {
  const value = (e.target as HTMLInputElement).value;
  query.value = value;
  selectedOptionValue.value = null;
  emit('update:modelValue', value);
  clearDebounce();
  if (value.length < props.minChars) {
    suggestions.value = [];
    isOpen.value = value.length > 0;
    return;
  }
  const delay = Math.max(0, props.debounceMs ?? DEFAULT_DEBOUNCE_MS);
  debounceTimer = setTimeout(() => loadSuggestions(value), delay);
}

function selectOption(option: AutocompleteOption) {
  selectedOptionValue.value = String(option.value);
  emit('update:modelValue', option.label);
  emit('select', option);
  query.value = option.label;
  suggestions.value = [];
  isOpen.value = false;
  highlightedIndex.value = -1;
}

function handleClear() {
  query.value = '';
  selectedOptionValue.value = null;
  emit('update:modelValue', '');
  emit('clear');
  suggestions.value = [];
  isOpen.value = false;
  highlightedIndex.value = -1;
  inputRef.value?.focus();
}

function onFocus() {
  isFocused.value = true;
  if (query.value.length >= props.minChars && suggestions.value.length > 0) isOpen.value = true;
  else if (query.value.length >= props.minChars && !isLoading.value) loadSuggestions(query.value);
  emit('focus');
}

function onBlur() {
  isFocused.value = false;
  setTimeout(() => {
    isOpen.value = false;
    highlightedIndex.value = -1;
    emit('blur');
  }, 180);
}

function onKeydown(e: KeyboardEvent) {
  if (!isOpen.value) {
    if (e.key === 'Escape') isOpen.value = false;
    return;
  }
  const list = displayedSuggestions.value;
  if (e.key === 'ArrowDown') {
    e.preventDefault();
    highlightedIndex.value = Math.min(highlightedIndex.value + 1, list.length - 1);
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    highlightedIndex.value = Math.max(highlightedIndex.value - 1, -1);
  } else if (e.key === 'Enter' && highlightedIndex.value >= 0 && list[highlightedIndex.value]) {
    e.preventDefault();
    selectOption(list[highlightedIndex.value]);
  } else if (e.key === 'Escape') {
    e.preventDefault();
    isOpen.value = false;
    highlightedIndex.value = -1;
  }
}

watch(
  () => props.modelValue,
  (val) => {
    const s = String(val ?? '');
    if (query.value !== s) query.value = s;
  }
);

onBeforeUnmount(clearDebounce);
</script>

<template>
  <div :class="containerClasses">
    <label v-if="label" :for="inputId" class="mb-1 block text-sm font-medium" :class="labelClasses">
      {{ label }}
      <span v-if="required" class="ml-0.5 text-error" aria-hidden="true">*</span>
    </label>

    <div class="relative">
      <!-- Prefix icon -->
      <div
        v-if="prefixIcon"
        class="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2"
        :class="iconClasses"
        aria-hidden="true"
      >
        <FontAwesomeIcon :icon="prefixIcon" class="h-5 w-5" />
      </div>

      <input
        :id="inputId"
        ref="inputRef"
        :name="name"
        type="text"
        autocomplete="off"
        :value="query"
        :placeholder="placeholder"
        :disabled="disabled"
        :class="inputClasses"
        :aria-expanded="isOpen"
        :aria-autocomplete="'list'"
        :aria-controls="listboxId"
        :aria-activedescendant="activeDescendantId"
        :aria-invalid="error"
        :aria-describedby="describedById"
        :aria-required="required"
        role="combobox"
        @input="onInput"
        @focus="onFocus"
        @blur="onBlur"
        @keydown="onKeydown"
      />

      <!-- Loading indicator -->
      <div
        v-if="isLoading"
        class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2"
        :class="iconClasses"
        aria-hidden="true"
      >
        <FontAwesomeIcon :icon="['fas', 'spinner']" class="h-5 w-5 animate-spin" />
      </div>

      <!-- Clear button -->
      <button
        v-else-if="clearable && query.trim() && !disabled"
        type="button"
        class="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1 focus:outline-none focus:ring-2 focus:ring-primary/50"
        :class="clearButtonClasses"
        aria-label="Clear"
        @mousedown.prevent
        @click="handleClear"
      >
        <FontAwesomeIcon :icon="['fas', 'times-circle']" class="h-5 w-5" />
      </button>

      <!-- Dropdown panel -->
      <Transition
        enter-active-class="transition duration-150 ease-out"
        enter-from-class="opacity-0 scale-[0.98]"
        enter-to-class="opacity-100 scale-100"
        leave-active-class="transition duration-100 ease-in"
        leave-from-class="opacity-100 scale-100"
        leave-to-class="opacity-0 scale-[0.98]"
      >
        <div
          v-show="isOpen"
          class="absolute z-20 mt-1.5 w-full overflow-hidden rounded-lg border border-[var(--ui-field-border)] bg-[var(--ui-field-bg)] shadow-lg"
        >
          <ul
            :id="listboxId"
            class="max-h-64 overflow-auto py-1.5"
            role="listbox"
            aria-label="Suggestions"
          >
            <!-- Loading state -->
            <li
              v-if="isLoading && displayedSuggestions.length === 0"
              class="flex items-center gap-3 px-4 py-3 text-sm text-gray-500 dark:text-gray-400"
              role="option"
              aria-disabled="true"
            >
              <FontAwesomeIcon :icon="['fas', 'spinner']" class="h-4 w-4 shrink-0 animate-spin" />
              <span>{{ loadingText }}</span>
            </li>

            <!-- No results -->
            <li
              v-else-if="
                !isLoading && displayedSuggestions.length === 0 && query.length >= minChars
              "
              class="flex flex-col items-center justify-center gap-2 px-4 py-8 text-center text-gray-500 dark:text-gray-400"
              role="status"
            >
              <FontAwesomeIcon
                :icon="['fas', 'search']"
                class="h-8 w-8 opacity-50"
                aria-hidden="true"
              />
              <span class="text-sm">{{ noResultsText }}</span>
            </li>

            <!-- Hint when query too short -->
            <li
              v-else-if="query.length > 0 && query.length < minChars"
              class="px-4 py-3 text-sm text-gray-400 dark:text-gray-500"
              role="status"
            >
              {{ minCharsHint }}
            </li>

            <!-- Options -->
            <li
              v-for="(option, index) in displayedSuggestions"
              :id="`${listboxId}-option-${index}`"
              :key="String(option.value)"
              class="flex cursor-pointer items-start gap-3 px-4 py-2.5 outline-none transition-colors"
              :class="[
                index === highlightedIndex
                  ? 'bg-primary/10 text-primary dark:bg-primary/20'
                  : 'text-gray-900 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-700/80',
              ]"
              role="option"
              :aria-selected="
                selectedOptionValue !== null && String(option.value) === selectedOptionValue
              "
              @mousedown.prevent="selectOption(option)"
            >
              <Avatar
                v-if="option.avatarName"
                :name="option.avatarName"
                :color-seed="String(option.value)"
                size="sm"
                class="mt-0.5 shrink-0"
              />
              <div class="flex min-w-0 flex-1 flex-col gap-0.5">
                <span class="font-medium leading-snug">{{ option.label }}</span>
                <span
                  v-if="option.description"
                  class="max-w-full truncate text-xs leading-snug"
                  :class="
                    index === highlightedIndex ? 'opacity-90' : 'text-gray-500 dark:text-gray-400'
                  "
                >
                  {{ option.description }}
                </span>
              </div>
            </li>
          </ul>
        </div>
      </Transition>
    </div>

    <!-- Helper text -->
    <p v-if="helperText && !error" :id="helperId" class="mt-1.5 text-sm" :class="helperTextClasses">
      {{ helperText }}
    </p>

    <!-- Error message -->
    <p v-if="error && errorMessage" :id="errorId" class="mt-1.5 text-sm text-error" role="alert">
      {{ errorMessage }}
    </p>
  </div>
</template>
