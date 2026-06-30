/**
 * UI Components - Barrel Export
 * Exporta todos los componentes UI para facilitar imports
 */

export { default as Button } from './Button/Button.vue';
export { default as Input } from './Input/Input.vue';
export { default as Card } from './Card/Card.vue';
export { default as Badge } from './Badge/Badge.vue';
export { default as Select } from './Select/Select.vue';
export { default as Avatar } from './Avatar/Avatar.vue';
export { default as RoleIcon } from './RoleIcon/RoleIcon.vue';
export { default as Spinner } from './Spinner/Spinner.vue';
export { default as Skeleton } from './Skeleton/Skeleton.vue';
export { default as Toggle } from './Toggle/Toggle.vue';
export { default as Toast } from './Toast/Toast.vue';
export { default as ToastProvider } from './Toast/ToastProvider.vue';
export { default as Pagination } from './Pagination/Pagination.vue';
export { default as Autocomplete } from './Autocomplete/Autocomplete.vue';
export { default as TokenAutocomplete } from './TokenAutocomplete/TokenAutocomplete.vue';
export { default as Textarea } from './Textarea/Textarea.vue';
export { default as Section } from './Section/Section.vue';
export { default as SectionSkeleton } from './SectionSkeleton/SectionSkeleton.vue';
export { default as InfoBanner } from './InfoBanner/InfoBanner.vue';
export { default as Stepper } from './Stepper/Stepper.vue';

// Export composables
export { useToast } from '../composables/useToast';

// Export types
export type { ButtonProps } from './Button/Button.vue';
export type { InputProps } from './Input/Input.vue';
export type { CardProps, CardVariant } from './Card/Card.vue';
export type { BadgeProps, BadgeVariant } from './Badge/Badge.vue';
export type { SelectProps, SelectOption } from './Select/Select.vue';
export type { AvatarProps, AvatarStatus, AvatarSize } from './Avatar/Avatar.vue';
export type { RoleIconProps, RoleIconSize } from './RoleIcon/RoleIcon.vue';
export type { SpinnerColor, SpinnerProps, SpinnerVariant } from './Spinner/Spinner.vue';
export { SPINNER_COLOR_VALUES } from './Spinner/Spinner.vue';
export type { SkeletonProps, SkeletonVariant } from './Skeleton/Skeleton.vue';
export type { ToggleProps } from './Toggle/Toggle.vue';
export type { ToastProps, ToastVariant } from './Toast/Toast.vue';
export type { PaginationProps } from './Pagination/Pagination.vue';
export type { AutocompleteProps, AutocompleteOption } from './Autocomplete/Autocomplete.vue';
export type { StepperProps, StepperStep } from './Stepper/Stepper.vue';
export type { TextareaProps } from './Textarea/Textarea.vue';
export type { ToastOptions, ToastState, UseToastReturn } from '../composables/useToast';
