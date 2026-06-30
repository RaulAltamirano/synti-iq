import { describe, expect, it } from 'vitest';

import { WIZARD_STEPS } from '@/modules/store/composables/store-form-wizard.constants';

describe('WIZARD_STEPS', () => {
  it('has three steps with stable ids', () => {
    expect(WIZARD_STEPS).toHaveLength(3);
    expect(WIZARD_STEPS.map((s) => s.id)).toEqual([1, 2, 3]);
  });
});
