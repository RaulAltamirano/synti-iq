import { describe, expect, it } from 'vitest';

import {
  formatCurrencyAmountDisplay,
  parseCurrencyAmountInput,
} from '@/modules/store/utils/currency-amount';
import { STORE_FORM_LIMITS } from '@/modules/store/constants/store-form-limits';

describe('currency-amount utils', () => {
  it('formats integers with thousands separators', () => {
    expect(formatCurrencyAmountDisplay(0)).toBe('0');
    expect(formatCurrencyAmountDisplay(1000)).toBe('1,000');
    expect(formatCurrencyAmountDisplay(1234567)).toBe('1,234,567');
  });

  it('parses empty input as empty value', () => {
    expect(parseCurrencyAmountInput('')).toEqual({ display: '', value: '' });
    expect(parseCurrencyAmountInput('   ')).toEqual({ display: '', value: '' });
  });

  it('parses formatted currency strings into numbers', () => {
    expect(parseCurrencyAmountInput('1,234')).toEqual({ display: '1,234', value: 1234 });
    expect(parseCurrencyAmountInput('$5,000')).toEqual({ display: '5,000', value: 5000 });
  });

  it('caps values at the configured maximum', () => {
    const max = STORE_FORM_LIMITS.SALES_MAX;
    expect(parseCurrencyAmountInput(String(max + 1), max)).toEqual({
      display: formatCurrencyAmountDisplay(max),
      value: max,
    });
  });
});
