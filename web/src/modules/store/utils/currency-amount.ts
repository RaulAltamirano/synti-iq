export type CurrencyAmountValue = number | '';

export function formatCurrencyAmountDisplay(value: number): string {
  if (!Number.isFinite(value) || value < 0) return '';
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function parseCurrencyAmountDigits(raw: string): string {
  return raw.replace(/\D/g, '');
}

export function parseCurrencyAmountInput(
  raw: string,
  max?: number
): { display: string; value: CurrencyAmountValue } {
  const digits = parseCurrencyAmountDigits(raw);
  if (digits === '') {
    return { display: '', value: '' };
  }

  let numeric = Number(digits);
  if (!Number.isFinite(numeric) || numeric < 0) {
    return { display: '', value: '' };
  }

  if (max != null && numeric > max) {
    numeric = max;
  }

  return {
    display: formatCurrencyAmountDisplay(numeric),
    value: numeric,
  };
}
