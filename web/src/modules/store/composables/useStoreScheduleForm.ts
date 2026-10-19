import type { Ref } from 'vue';
import type { DayOfWeek, StoreScheduleFormRow } from '@/modules/store/types/store-form.types';

export interface ValidateSchedulesResult {
  valid: boolean;
  errorMessage: string;
}

export interface UseStoreScheduleFormOptions {
  /** Reactive reference to schedule rows (read-only for validation). */
  scheduleRows: Ref<readonly StoreScheduleFormRow[]>;
}

const DEFAULT_SCHEDULE_ERROR = 'Opening time must be before closing time for each day.';

export function cloneScheduleRows(rows: readonly StoreScheduleFormRow[]): StoreScheduleFormRow[] {
  return rows.map((row) => ({ ...row }));
}

export function toggleScheduleDay(
  rows: readonly StoreScheduleFormRow[],
  dayOfWeek: DayOfWeek
): StoreScheduleFormRow[] {
  return rows.map((row) =>
    row.dayOfWeek === dayOfWeek ? { ...row, enabled: !row.enabled } : { ...row }
  );
}

export function setScheduleTime(
  rows: readonly StoreScheduleFormRow[],
  dayOfWeek: DayOfWeek,
  field: 'openTimeHHMM' | 'closeTimeHHMM',
  value: string
): StoreScheduleFormRow[] {
  return rows.map((row) =>
    row.dayOfWeek === dayOfWeek ? { ...row, [field]: value } : { ...row }
  );
}

export function applyScheduleToDays(
  rows: readonly StoreScheduleFormRow[],
  dayOfWeeks: DayOfWeek[],
  openTimeHHMM: string,
  closeTimeHHMM: string
): StoreScheduleFormRow[] {
  const targets = new Set(dayOfWeeks);
  return rows.map((row) =>
    targets.has(row.dayOfWeek)
      ? { ...row, enabled: true, openTimeHHMM, closeTimeHHMM }
      : { ...row }
  );
}

export function validateScheduleRows(
  rows: readonly StoreScheduleFormRow[]
): ValidateSchedulesResult {
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    if (!row.enabled) continue;
    const open = row.openTimeHHMM;
    const close = row.closeTimeHHMM;
    if (!open || !close) {
      return { valid: false, errorMessage: DEFAULT_SCHEDULE_ERROR };
    }
    const [oh, om] = open.split(':').map(Number);
    const [ch, cm] = close.split(':').map(Number);
    const openMins = oh * 60 + om;
    const closeMins = ch * 60 + cm;
    if (openMins >= closeMins) {
      return { valid: false, errorMessage: DEFAULT_SCHEDULE_ERROR };
    }
  }
  return { valid: true, errorMessage: '' };
}

/**
 * Composable for store schedule validation against reactive rows.
 * Mutations are immutable helpers above; persist changes via `setFieldValue` or v-model emit.
 */
export function useStoreScheduleForm(options: UseStoreScheduleFormOptions) {
  const { scheduleRows } = options;

  function getRow(dayOfWeek: DayOfWeek): StoreScheduleFormRow | undefined {
    return scheduleRows.value.find((row) => row.dayOfWeek === dayOfWeek);
  }

  function validateSchedules(): ValidateSchedulesResult {
    return validateScheduleRows(scheduleRows.value);
  }

  return {
    validateSchedules,
    getRow,
  };
}
