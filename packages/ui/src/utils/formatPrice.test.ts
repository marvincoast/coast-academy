import { describe, expect, it } from 'vitest';

import { formatPrice } from './formatPrice.js';

describe('formatPrice', () => {
  it('formats with thousand separators', () => {
    expect(formatPrice(1234.5, 2)).toBe('1,234.50');
  });

  it('handles negative values', () => {
    expect(formatPrice(-5.25, 2)).toBe('-5.25');
  });

  it('uses BRL decimals by default', () => {
    expect(formatPrice(5.245)).toBe('5.2450');
  });
});
