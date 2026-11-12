import { describe, it, expect } from 'vitest';
import { formatPrice } from './currency';

describe('formatPrice utility', () => {
  it('should format minor-unit integer cents into decimal strings without currency symbol by default', () => {
    expect(formatPrice(150000)).toBe('1,500.00');
    expect(formatPrice(5000)).toBe('50.00');
    expect(formatPrice(99)).toBe('0.99');
    expect(formatPrice(0)).toBe('0.00');
  });

  it('should format with currency symbol when requested', () => {
    expect(formatPrice(150000, true)).toBe('$1,500.00');
    expect(formatPrice(99, true)).toBe('$0.99');
  });

  it('should gracefully handle null, undefined, and non-numeric inputs', () => {
    expect(formatPrice(null)).toBe('0.00');
    expect(formatPrice(undefined)).toBe('0.00');
    expect(formatPrice(NaN)).toBe('0.00');
  });
});

