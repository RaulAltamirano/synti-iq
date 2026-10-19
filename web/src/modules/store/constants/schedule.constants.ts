import type { DayOfWeek } from '@/modules/store/types/store-form.types';
import { DAYS_OF_WEEK } from '@/modules/store/types/store-form.types';

/** Display labels for each day of the week (same order as DAYS_OF_WEEK). */
export const DAY_LABELS: Record<DayOfWeek, string> = {
  monday: 'Monday',
  tuesday: 'Tuesday',
  wednesday: 'Wednesday',
  thursday: 'Thursday',
  friday: 'Friday',
  saturday: 'Saturday',
  sunday: 'Sunday',
};

/** Short labels for compact UI (e.g. Lun, Mar). */
export const DAY_LABELS_SHORT: Record<DayOfWeek, string> = {
  monday: 'Mon',
  tuesday: 'Tue',
  wednesday: 'Wed',
  thursday: 'Thu',
  friday: 'Fri',
  saturday: 'Sat',
  sunday: 'Sun',
};

/** Ordered list of days; use this as single source of truth for iteration. */
export { DAYS_OF_WEEK };

/** Timezone options for the schedule selector. */
export const SCHEDULE_TIMEZONE_OPTIONS = [
  { value: '-06:00', label: 'UTC-06:00 (Central Mexico)' },
  { value: '-05:00', label: 'UTC-05:00' },
  { value: '-08:00', label: 'UTC-08:00 (Pacific)' },
];
