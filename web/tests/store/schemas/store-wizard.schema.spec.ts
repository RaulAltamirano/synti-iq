import { describe, expect, it } from 'vitest';

import { storeWizardSchema } from '@/modules/store/schemas/store-wizard.schema';
import { getInitialFormState } from '@/modules/store/composables/useStoreFormPayload';

function baseValidState() {
  return getInitialFormState();
}

describe('storeWizardSchema', () => {
  it('accepts initial wizard state', () => {
    const data = baseValidState();
    data.name = 'My Store';
    data.storeType = 'RETAIL';
    data.location.name = '123 Main St, City';
    data.location.fullAddress = '123 Main St, City';
    const r = storeWizardSchema.safeParse(data);
    expect(r.success).toBe(true);
  });

  it('rejects empty store name and enforces length', () => {
    const data = baseValidState();
    data.storeType = 'RETAIL';
    data.location.name = 'x';
    data.location.fullAddress = 'x';
    expect(storeWizardSchema.safeParse(data).success).toBe(false);

    data.name = 'a';
    const short = storeWizardSchema.safeParse(data);
    expect(short.success).toBe(false);
    if (!short.success) {
      expect(short.error.issues.some((i) => i.message.includes('at least'))).toBe(true);
    }

    data.name = 'ab';
    expect(storeWizardSchema.safeParse(data).success).toBe(true);
  });

  it('requires non-empty store type', () => {
    const data = baseValidState();
    data.name = 'Valid Name';
    data.storeType = '';
    data.location.name = 'x';
    data.location.fullAddress = 'x';
    expect(storeWizardSchema.safeParse(data).success).toBe(false);
  });

  it('allows empty optional email and phone', () => {
    const data = baseValidState();
    data.name = 'Valid Name';
    data.storeType = 'GROCERY';
    data.email = '';
    data.phoneNumber = '';
    data.location.name = 'x';
    data.location.fullAddress = 'x';
    expect(storeWizardSchema.safeParse(data).success).toBe(true);
  });

  it('rejects invalid email when non-empty', () => {
    const data = baseValidState();
    data.name = 'Valid Name';
    data.storeType = 'RETAIL';
    data.email = 'bad';
    data.location.name = 'x';
    data.location.fullAddress = 'x';
    const r = storeWizardSchema.safeParse(data);
    expect(r.success).toBe(false);
    if (!r.success) {
      expect(r.error.issues.some((i) => i.message.includes('valid email'))).toBe(true);
    }
  });

  it('rejects invalid phone when non-empty', () => {
    const data = baseValidState();
    data.name = 'Valid Name';
    data.storeType = 'RETAIL';
    data.phoneNumber = '+52221';
    data.location.name = 'x';
    data.location.fullAddress = 'x';
    const r = storeWizardSchema.safeParse(data);
    expect(r.success).toBe(false);
    if (!r.success) {
      expect(r.error.issues.some((i) => i.message.includes('10 digits'))).toBe(true);
    }
  });

  it('accepts valid Mexico E.164 phone', () => {
    const data = baseValidState();
    data.name = 'Valid Name';
    data.storeType = 'RETAIL';
    data.phoneNumber = '+522212244156';
    data.location.name = 'x';
    data.location.fullAddress = 'x';
    expect(storeWizardSchema.safeParse(data).success).toBe(true);
  });

  it('allows empty sales targets; enforces numeric range', () => {
    const data = baseValidState();
    data.name = 'Valid Name';
    data.storeType = 'RETAIL';
    data.dailySalesTarget = '';
    data.monthlySalesTarget = '';
    data.location.name = 'x';
    data.location.fullAddress = 'x';
    expect(storeWizardSchema.safeParse(data).success).toBe(true);

    data.dailySalesTarget = -1;
    expect(storeWizardSchema.safeParse(data).success).toBe(false);

    data.dailySalesTarget = 10;
    expect(storeWizardSchema.safeParse(data).success).toBe(true);
  });

  it('rejects location primary fields when empty', () => {
    const data = baseValidState();
    data.name = 'Valid Name';
    data.storeType = 'RETAIL';
    data.location.name = '';
    data.location.fullAddress = '';
    expect(storeWizardSchema.safeParse(data).success).toBe(false);
  });

  it('rejects optional address lines over max length', () => {
    const data = baseValidState();
    data.name = 'Valid Name';
    data.storeType = 'RETAIL';
    data.location.name = 'Place';
    data.location.fullAddress = 'Place';
    data.location.street = 'x'.repeat(200);
    const r = storeWizardSchema.safeParse(data);
    expect(r.success).toBe(false);
    if (!r.success) {
      expect(r.error.issues.some((i) => i.message.includes('at most'))).toBe(true);
    }
  });
});
