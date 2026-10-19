import { formatUserName } from '../../utils/format-user-name.util';

describe('formatUserName', () => {
  it('returns "Unknown" when both names are empty', () => {
    expect(formatUserName()).toBe('Unknown');
    expect(formatUserName('', '')).toBe('Unknown');
    expect(formatUserName('  ', '  ')).toBe('Unknown');
  });

  it('returns full name when both provided', () => {
    expect(formatUserName('John', 'Doe')).toBe('John Doe');
  });

  it('returns single name when one is empty', () => {
    expect(formatUserName('John', '')).toBe('John');
    expect(formatUserName('', 'Doe')).toBe('Doe');
  });

  it('trims leading and trailing whitespace', () => {
    expect(formatUserName('  John', 'Doe  ')).toBe('John Doe');
  });
});
