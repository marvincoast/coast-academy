import { colors, isValidColor } from '../tokens.js';

export type FlowVariant = 'solid' | 'subtle';

const FLOW_SOLID = {
  bid: colors.flow.bid,
  ask: colors.flow.ask,
  neutral: colors.flow.neutral,
} as const;

const FLOW_SUBTLE = {
  bid: colors.flow.bidSubtle,
  ask: colors.flow.askSubtle,
  neutral: 'rgba(255, 255, 255, 0.05)',
} as const;

/**
 * Retorna cor semântica bid/ask/neutral conforme variação do valor.
 */
export function getFlowColor(
  value: number,
  previousValue: number,
  variant: FlowVariant = 'solid',
): string {
  if (!Number.isFinite(value) || !Number.isFinite(previousValue)) {
    console.warn('[getFlowColor] Non-finite values:', value, previousValue);
    return FLOW_SOLID.neutral;
  }

  const delta = value - previousValue;
  const palette = variant === 'solid' ? FLOW_SOLID : FLOW_SUBTLE;

  let color: string;
  if (delta > 0) {
    color = palette.bid;
  } else if (delta < 0) {
    color = palette.ask;
  } else {
    color = palette.neutral;
  }

  if (!isValidColor(color)) {
    console.warn('[getFlowColor] Invalid color token:', color);
    return FLOW_SOLID.neutral;
  }

  return color;
}
