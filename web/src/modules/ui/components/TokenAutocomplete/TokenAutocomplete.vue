<script setup lang="ts">
import { ref, computed, watch, onBeforeUnmount, nextTick } from 'vue';
import { useEventListener } from '@vueuse/core';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import Avatar from '../Avatar/Avatar.vue';
import {
  FIELD_HELPER_CLASSES,
  FIELD_ICON_CLASSES,
  FIELD_LABEL_CLASSES,
  type ComponentSize,
} from '../../types/component.types';
import { createFieldFallbackId } from '../../utils/field-id';
import type { AutocompleteOption } from '../Autocomplete/Autocomplete.vue';

const props = withDefaults(
  defineProps<{
    modelValue?: AutocompleteOption<string>[];
    fetchSuggestions: (query: string) => Promise<AutocompleteOption<string>[]>;
    label?: string;
    placeholder?: string;
    helperText?: string;
    disabled?: boolean;
    error?: boolean;
    errorMessage?: string;
    minChars?: number;
    fullWidth?: boolean;
    size?: ComponentSize;
    name?: string;
    id?: string;
    prefixIcon?: string | string[];
    /** IDs extra a excluir (p. ej. ya asignados fuera de la selección actual). */
    excludeIds?: string[];
    debounceMs?: number;
    maxSuggestions?: number;
    loadingText?: string;
    noResultsText?: string;
    /** `aria-label` for the combobox field group when `label` is not set. */
    fieldGroupAriaLabel?: string;
    /** `aria-label` for the suggestions listbox. */
    listboxAriaLabel?: string;
  }>(),
  {
    modelValue: () => [],
    label: '',
    placeholder: '',
    helperText: '',
    disabled: false,
    error: false,
    errorMessage: '',
    minChars: 2,
    fullWidth: false,
    size: 'md',
    name: '',
    id: '',
    prefixIcon: undefined,
    excludeIds: () => [],
    debounceMs: 280,
    maxSuggestions: 0,
    loadingText: 'Searching…',
    noResultsText: 'No results',
    fieldGroupAriaLabel: 'Search and select',
    listboxAriaLabel: 'Suggestions',
  }
);

const emit = defineEmits<{
  'update:modelValue': [value: AutocompleteOption<string>[]];
  focus: [];
  blur: [];
}>();

const inputRef = ref<HTMLInputElement | null>(null);
/** Anchor for floating list (Teleport + fixed); same box as the combobox field. */
const fieldRef = ref<HTMLElement | null>(null);
const dropdownStyle = ref<Record<string, string>>({
  top: '0px',
  left: '0px',
  width: '0px',
});
const isOpen = ref(false);
const isLoading = ref(false);
const suggestions = ref<AutocompleteOption<string>[]>([]);
const highlightedIndex = ref(-1);
const query = ref('');
const isFocused = ref(false);
let debounceTimer: ReturnType<typeof setTimeout> | null = null;
let lastRequestId = 0;

const DEFAULT_DEBOUNCE_MS = 280;

const fallbackInputId = createFieldFallbackId('token-autocomplete');

const sizeClasses: Record<ComponentSize, string[]> = {
  xs: ['text-xs', 'px-2', 'py-1'],
  sm: ['text-sm', 'px-3', 'py-1.5'],
  md: ['text-base', 'px-3', 'py-2'],
  lg: ['text-lg', 'px-4', 'py-2.5'],
  xl: ['text-xl', 'px-5', 'py-3'],
};

const inputId = computed(() => props.id || props.name || fallbackInputId);
const helperId = computed(() => `${inputId.value}-help`);
const errorId = computed(() => `${inputId.value}-error`);
const describedById = computed(() => {
  const parts: string[] = [];
  if (props.helperText && !props.error) parts.push(helperId.value);
  if (props.error && props.errorMessage) parts.push(errorId.value);
  return parts.length ? parts.join(' ') : undefined;
});
const listboxId = computed(() => `token-autocomplete-listbox-${inputId.value}`);
const activeDescendantId = computed(() =>
  highlightedIndex.value >= 0 && suggestions.value[highlightedIndex.value]
    ? `${listboxId.value}-option-${highlightedIndex.value}`
    : undefined
);

/** Lista seleccionada (modelo vinculado). */
const selected = computed(() => props.modelValue ?? []);

const selectedValueSet = computed(() => new Set(selected.value.map((o) => String(o.value))));

const excludeSet = computed(() => new Set(props.excludeIds.map(String)));

const displayedSuggestions = computed(() => {
  const list = suggestions.value;
  if (props.maxSuggestions && props.maxSuggestions > 0) {
    return list.slice(0, props.maxSuggestions);
  }
  return list;
});

const paddingLeftClass = computed(() => (props.prefixIcon ? 'pl-9' : ''));
const paddingRightClass = computed(() => (isLoading.value ? 'pr-9' : ''));

const inputClasses = computed(() => {
  const base = [
    'flex-1',
    'min-w-28',
    'border-0',
    'bg-transparent',
    'shadow-none',
    'ring-0',
    'outline-none',
    'focus:ring-0',
    'placeholder:text-inherit',
    'disabled:opacity-50',
    'disabled:cursor-not-allowed',
    ...sizeClasses[props.size],
    paddingLeftClass.value,
    paddingRightClass.value,
  ];
  if (props.error) {
    base.push('text-error');
  } else {
    base.push('text-[var(--ui-field-text)]', 'placeholder:text-[var(--ui-field-placeholder)]');
  }
  return base.join(' ');
});

const containerClasses = computed(() => [props.fullWidth && 'w-full'].filter(Boolean).join(' '));

const labelClasses = FIELD_LABEL_CLASSES;
const helperTextClasses = FIELD_HELPER_CLASSES;
const iconClasses = FIELD_ICON_CLASSES;

/**
 * Chips must not use `--ui-field-text` in dark mode: that token is light (for typing in the field).
 * A light chip bg + light text caused unreadable contrast (e.g. white on gray-200).
 */
const chipClasses =
  'inline-flex max-w-full shrink-0 items-center gap-1.5 rounded-full border px-2 py-1 text-sm ' +
  'border-[var(--ui-field-border)] bg-gray-100 text-gray-800 ' +
  'dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100';

const fieldShellClasses = computed(() => {
  const base = [
    'flex',
    'flex-wrap',
    'items-center',
    'gap-1.5',
    'min-h-[2.75rem]',
    'rounded-lg',
    'border',
    'px-2',
    'py-1.5',
    'transition-all',
    'duration-200',
    'cursor-text',
  ];
  if (props.error) {
    base.push('border-error', 'ring-1', 'ring-error/30');
  } else if (isFocused.value) {
    base.push(
      'border-[var(--ui-focus-ring)]',
      'ring-2',
      'ring-[color:color-mix(in_srgb,var(--ui-focus-ring)_35%,transparent)]',
      'ring-offset-0',
      'bg-[var(--ui-field-bg)]'
    );
  } else {
    base.push('border-[var(--ui-field-border)]', 'bg-[var(--ui-field-bg)]', 'ring-0');
  }
  if (props.disabled) {
    base.push('opacity-50', 'cursor-not-allowed');
  }
  return base.join(' ');
});

function filterSuggestions(items: AutocompleteOption<string>[]): AutocompleteOption<string>[] {
  return items.filter((o) => {
    const id = String(o.value);
    if (selectedValueSet.value.has(id)) return false;
    if (excludeSet.value.has(id)) return false;
    return true;
  });
}

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
  const fetch = props.fetchSuggestions;
  fetch(q.trim())
    .then((items) => {
      if (requestId !== lastRequestId) return;
      suggestions.value = filterSuggestions(items);
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
  clearDebounce();
  if (value.length < props.minChars) {
    suggestions.value = [];
    isOpen.value = value.length > 0;
    return;
  }
  const delay = Math.max(0, props.debounceMs ?? DEFAULT_DEBOUNCE_MS);
  debounceTimer = setTimeout(() => loadSuggestions(value), delay);
}

function selectOption(option: AutocompleteOption<string>) {
  const id = String(option.value);
  if (selectedValueSet.value.has(id) || excludeSet.value.has(id)) return;
  emit('update:modelValue', [...selected.value, option]);
  query.value = '';
  suggestions.value = [];
  isOpen.value = false;
  highlightedIndex.value = -1;
  inputRef.value?.focus();
}

function removeChip(index: number) {
  if (props.disabled) return;
  const next = selected.value.filter((_, i) => i !== index);
  emit('update:modelValue', next);
}

function onFocusField() {
  if (props.disabled) return;
  isFocused.value = true;
  inputRef.value?.focus();
}

function onFocusInput() {
  isFocused.value = true;
  if (query.value.length >= props.minChars && suggestions.value.length > 0) {
    isOpen.value = true;
  } else if (query.value.length >= props.minChars && !isLoading.value) {
    loadSuggestions(query.value);
  }
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
  if (e.key === 'Backspace' && query.value === '' && selected.value.length > 0) {
    e.preventDefault();
    removeChip(selected.value.length - 1);
    return;
  }
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
  () => {
    if (isOpen.value && query.value.length >= props.minChars) {
      loadSuggestions(query.value);
    }
  },
  { deep: true }
);

function syncDropdownPosition(): void {
  const el = fieldRef.value;
  if (!el) return;
  const r = el.getBoundingClientRect();
  const gap = 6;
  dropdownStyle.value = {
    top: `${Math.round(r.bottom + gap)}px`,
    left: `${Math.round(r.left)}px`,
    width: `${Math.max(0, Math.round(r.width))}px`,
  };
}

useEventListener(
  globalThis,
  'scroll',
  () => {
    if (isOpen.value) {
      void nextTick(() => syncDropdownPosition());
    }
  },
  { capture: true }
);

useEventListener(globalThis, 'resize', () => {
  if (isOpen.value) {
    void nextTick(() => syncDropdownPosition());
  }
});

watch(isOpen, (open) => {
  if (open) {
    void nextTick(() => syncDropdownPosition());
  }
});

watch(query, () => {
  if (isOpen.value) {
    void nextTick(() => syncDropdownPosition());
  }
});

onBeforeUnmount(clearDebounce);
</script>

<template>
  <div :class="containerClasses">
    <label v-if="label" :for="inputId" class="mb-1 block text-sm font-medium" :class="labelClasses">
      {{ label }}
    </label>

    <div
      ref="fieldRef"
      :class="fieldShellClasses"
      role="group"
      :aria-label="label || fieldGroupAriaLabel"
      @mousedown="onFocusField"
    >
      <span v-for="(opt, idx) in selected" :key="String(opt.value)" :class="chipClasses">
        <Avatar
          v-if="opt.avatarName"
          :name="opt.avatarName"
          :color-seed="String(opt.value)"
          size="xs"
          class="shrink-0"
        />
        <span class="min-w-0 truncate max-w-48">{{ opt.label }}</span>
        <button
          type="button"
          class="ml-0.5 rounded p-0.5 text-gray-600 opacity-80 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-primary/50 dark:text-gray-300"
          :disabled="disabled"
          :aria-label="`Remove ${opt.label}`"
          @mousedown.stop.prevent
          @click.stop.prevent="removeChip(idx)"
        >
          <FontAwesomeIcon :icon="['fas', 'times']" class="h-3 w-3" />
        </button>
      </span>

      <div class="relative flex min-w-0 flex-1 items-center">
        <div
          v-if="prefixIcon"
          class="pointer-events-none absolute left-1 z-10"
          :class="iconClasses"
          aria-hidden="true"
        >
          <FontAwesomeIcon :icon="prefixIcon" class="h-4 w-4" />
        </div>
        <input
          :id="inputId"
          ref="inputRef"
          type="text"
          autocomplete="off"
          :name="name"
          :value="query"
          :placeholder="selected.length ? '' : placeholder"
          :disabled="disabled"
          :class="inputClasses"
          :aria-expanded="isOpen"
          :aria-autocomplete="'list'"
          :aria-controls="listboxId"
          :aria-activedescendant="activeDescendantId"
          :aria-invalid="error"
          :aria-describedby="describedById"
          role="combobox"
          @input="onInput"
          @focus="onFocusInput"
          @blur="onBlur"
          @keydown="onKeydown"
        />
        <div
          v-if="isLoading"
          class="pointer-events-none absolute right-1 top-1/2 -translate-y-1/2"
          :class="iconClasses"
          aria-hidden="true"
        >
          <FontAwesomeIcon :icon="['fas', 'spinner']" class="h-4 w-4 animate-spin" />
        </div>
      </div>
    </div>

    <Teleport to="body">
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
          class="fixed z-1100 overflow-hidden rounded-xl border border-[var(--ui-field-border)] bg-[var(--ui-field-bg)] shadow-xl"
          :style="dropdownStyle"
        >
          <ul
            :id="listboxId"
            class="max-h-[min(16rem,50dvh)] overflow-y-auto overscroll-contain py-1.5 sm:max-h-64"
            role="listbox"
            :aria-label="listboxAriaLabel"
          >
            <li
              v-if="isLoading && displayedSuggestions.length === 0"
              class="flex items-center gap-3 px-4 py-3 text-sm text-gray-500 dark:text-gray-400"
              role="option"
              aria-disabled="true"
            >
              <FontAwesomeIcon :icon="['fas', 'spinner']" class="h-4 w-4 shrink-0 animate-spin" />
              <span>{{ loadingText }}</span>
            </li>

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

            <li
              v-else-if="query.length > 0 && query.length < minChars"
              class="px-4 py-3 text-sm text-gray-400 dark:text-gray-500"
              role="status"
            >
              Type at least {{ minChars }} characters…
            </li>

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
              :aria-selected="index === highlightedIndex"
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
    </Teleport>

    <p v-if="helperText && !error" :id="helperId" class="mt-1.5 text-sm" :class="helperTextClasses">
      {{ helperText }}
    </p>
    <p v-if="error && errorMessage" :id="errorId" class="mt-1.5 text-sm text-error" role="alert">
      {{ errorMessage }}
    </p>
  </div>
</template>
