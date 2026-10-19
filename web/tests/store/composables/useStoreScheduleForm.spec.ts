import { describe, expect, it } from 'vitest';

import {
  applyScheduleToDays,
  toggleScheduleDay,
  validateScheduleRows,
} from '@/modules/store/composables/useStoreScheduleForm';
import type { StoreScheduleFormRow } from '@/modules/store/types/store-form.types';

const BASE_ROWS: StoreScheduleFormRow[] = [
  { dayOfWeek: 'monday', enabled: true, openTimeHHMM: '09:00', closeTimeHHMM: '18:00' },
  { dayOfWeek: 'tuesday', enabled: false, openTimeHHMM: '09:00', closeTimeHHMM: '18:00' },
];

describe('useStoreScheduleForm utils', () => {
  it('toggles a day without mutating the source rows', () => {
    const next = toggleScheduleDay(BASE_ROWS, 'tuesday');
    expect(BASE_ROWS[1].enabled).toBe(false);
    expect(next[1].enabled).toBe(true);
  });

  it('applies the same hours to multiple days', () => {
    const next = applyScheduleToDays(BASE_ROWS, ['tuesday', 'wednesday'], '10:00', '20:00');
    expect(next.find((row) => row.dayOfWeek === 'tuesday')).toMatchObject({
      enabled: true,
      openTimeHHMM: '10:00',
      closeTimeHHMM: '20:00',
    });
  });

  it('rejects schedules where open is not before close', () => {
    const invalid = [
      { dayOfWeek: 'monday', enabled: true, openTimeHHMM: '18:00', closeTimeHHMM: '09:00' },
    ] as StoreScheduleFormRow[];
    expect(validateScheduleRows(invalid).valid).toBe(false);
  });
});
