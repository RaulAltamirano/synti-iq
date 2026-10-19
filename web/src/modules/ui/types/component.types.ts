/**
 * Component Types
 * Tipos compartidos para componentes UI
 */

export type ComponentSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export type ComponentVariant =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'error'
  | 'info'
  | 'outline'
  | 'ghost'
  | 'danger';

export type ComponentState =
  | 'default'
  | 'hover'
  | 'active'
  | 'focus'
  | 'disabled'
  | 'loading'
  | 'error';

export interface BaseComponentProps {
  size?: ComponentSize;
  disabled?: boolean;
  loading?: boolean;
  class?: string;
}

/** Shared Tailwind classes for labeled field primitives (Input, Select, Textarea, Autocomplete). */
export const FIELD_LABEL_CLASSES = 'text-gray-700 dark:text-gray-300';
export const FIELD_HELPER_CLASSES = 'text-gray-500 dark:text-gray-400';
export const FIELD_ICON_CLASSES = 'text-gray-400 dark:text-gray-500';
