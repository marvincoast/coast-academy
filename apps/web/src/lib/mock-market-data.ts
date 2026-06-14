import type { MarketTickerItem } from '@/components/market/MarketTicker.js';
import type { TapeEntry } from '@/components/market/TapeReadingVisualization.js';

/** Cotações decorativas para ticker (B3 dólar futuro). */
export const MOCK_TICKER_ITEMS: MarketTickerItem[] = [
  {
    symbol: 'DOLFUT',
    price: 5.245,
    change: 0.025,
    changePercent: 0.48,
    volume: 125000,
    timestamp: new Date(),
  },
  {
    symbol: 'WDO',
    price: 5.25,
    change: -0.015,
    changePercent: -0.29,
    volume: 98000,
    timestamp: new Date(),
  },
  {
    symbol: 'DI1',
    price: 13.42,
    change: 0.02,
    changePercent: 0.15,
    volume: 45000,
    timestamp: new Date(),
  },
  {
    symbol: 'IND',
    price: 128450,
    change: 320,
    changePercent: 0.25,
    volume: 8200,
    timestamp: new Date(),
  },
];

export const MOCK_TAPE_ENTRIES: TapeEntry[] = [
  {
    id: '1',
    timestamp: new Date(),
    price: 5.245,
    volume: 1500,
    side: 'bid',
    isAggressive: true,
  },
  {
    id: '2',
    timestamp: new Date(Date.now() - 1000),
    price: 5.244,
    volume: 800,
    side: 'ask',
    isAggressive: false,
  },
  {
    id: '3',
    timestamp: new Date(Date.now() - 2000),
    price: 5.246,
    volume: 2200,
    side: 'bid',
    isAggressive: true,
  },
  {
    id: '4',
    timestamp: new Date(Date.now() - 3000),
    price: 5.243,
    volume: 450,
    side: 'ask',
    isAggressive: false,
  },
];
