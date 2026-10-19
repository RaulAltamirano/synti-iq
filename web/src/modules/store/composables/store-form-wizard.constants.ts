import type { StepperStep } from '@/modules/ui/components/Stepper/Stepper.ts';

/** Cleared on form mount/cancel/success so the wizard always opens at step 1. */
export const WIZARD_STORAGE_KEY = 'store-form-wizard-step';

export const STORE_FORM_WIZARD_STEP = {
  BASIC: 1,
  LOCATION: 2,
  SCHEDULE: 3,
} as const;

export type StoreFormWizardStep =
  (typeof STORE_FORM_WIZARD_STEP)[keyof typeof STORE_FORM_WIZARD_STEP];

export const STORE_FORM_SECTION_DIVIDER_CLASSES =
  'flex flex-col divide-y divide-gray-200 dark:divide-gray-700';

export const STORE_TYPE_OPTIONS = [
  {
    value: 'RETAIL',
    label: 'Retail',
    icon: 'store',
    description: 'General merchandise',
  },
  {
    value: 'RESTAURANT',
    label: 'Restaurant',
    icon: 'utensils',
    description: 'Food and dining',
  },
  {
    value: 'GROCERY',
    label: 'Grocery',
    icon: 'basket-shopping',
    description: 'Fresh food and staples',
  },
  {
    value: 'CONVENIENCE',
    label: 'Convenience',
    icon: 'clock',
    description: 'Quick-stop essentials',
  },
  {
    value: 'DEPARTMENT',
    label: 'Department',
    icon: 'building',
    description: 'Multi-category retail',
  },
] as const;

export type StoreTypeValue = (typeof STORE_TYPE_OPTIONS)[number]['value'];

export const WIZARD_STEPS: readonly StepperStep[] = [
  { id: 1, title: 'Basic information', shortTitle: 'Data', icon: 'info-circle' },
  { id: 2, title: 'Location', shortTitle: 'Location', icon: 'map-marker-alt' },
  { id: 3, title: 'Opening hours', shortTitle: 'Hours', icon: 'clock' },
];

/** DOM ids for `Input` / `Select` `name` — used for focus management after validation errors. */
export const STEP1_FIELD_FOCUS_ORDER: { ruleKey: string; elementId: string }[] = [
  { ruleKey: 'name', elementId: 'store-name' },
  { ruleKey: 'storeType', elementId: 'store-type' },
  { ruleKey: 'phoneNumber', elementId: 'store-phone' },
  { ruleKey: 'email', elementId: 'store-email' },
  { ruleKey: 'dailySalesTarget', elementId: 'daily-sales-target' },
  { ruleKey: 'monthlySalesTarget', elementId: 'monthly-sales-target' },
];

export const LOCATION_SEARCH_INPUT_ID = 'address-search';

/** Step 2: map/search first, then optional address fields (DOM id = focus target). */
export const STEP2_FIELD_FOCUS_ORDER: { ruleKey: string; elementId: string }[] = [
  { ruleKey: 'location.name', elementId: LOCATION_SEARCH_INPUT_ID },
  { ruleKey: 'location.fullAddress', elementId: LOCATION_SEARCH_INPUT_ID },
  { ruleKey: 'location.addressReference', elementId: 'location-reference' },
  { ruleKey: 'location.street', elementId: 'location-street' },
  { ruleKey: 'location.neighborhood', elementId: 'location-neighborhood' },
  { ruleKey: 'location.city', elementId: 'location-city' },
  { ruleKey: 'location.state', elementId: 'location-state' },
  { ruleKey: 'location.postalCode', elementId: 'location-postal-code' },
];
