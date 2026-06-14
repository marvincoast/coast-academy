const CURRENCY_DECIMALS: Record<string, number> = {
  USD: 2,
  BRL: 4,
  EUR: 2,
};

const ISO_CURRENCY = /^[A-Z]{3}$/;

/**
 * Formata preço financeiro com separadores de milhar e casas decimais.
 */
export function formatPrice(value: number, decimals?: number, currency = 'BRL'): string {
  if (!Number.isFinite(value)) {
    console.warn('[formatPrice] Invalid value:', value);
    return '0';
  }

  const code = currency.toUpperCase();
  if (!ISO_CURRENCY.test(code)) {
    console.warn('[formatPrice] Invalid currency code:', currency);
  }

  const resolvedDecimals = decimals ?? CURRENCY_DECIMALS[code] ?? 2;
  if (resolvedDecimals < 0 || resolvedDecimals > 8) {
    throw new RangeError('decimals must be between 0 and 8');
  }

  if (value === 0) {
    return resolvedDecimals > 0 ? `0.${'0'.repeat(resolvedDecimals)}` : '0';
  }

  const sign = value < 0 ? '-' : '';
  const absValue = Math.abs(value);
  const formatted = absValue.toFixed(resolvedDecimals);
  const [integerPart, decimalPart] = formatted.split('.');
  const integerWithSeparators = integerPart!.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  if (resolvedDecimals === 0) {
    return sign + integerWithSeparators;
  }

  return `${sign}${integerWithSeparators}.${decimalPart ?? ''}`;
}
