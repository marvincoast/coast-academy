import { z } from 'zod';

export const MarketSchema = z.enum(['BR', 'US']);
export type Market = z.infer<typeof MarketSchema>;

export const DEFAULT_MARKET: Market = 'BR';
