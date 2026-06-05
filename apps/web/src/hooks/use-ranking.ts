import { useQuery } from '@tanstack/react-query';

import { rankingApi } from '../api/ranking.api';

export const rankingKeys = {
  all: ['ranking'] as const,
  leaderboard: () => [...rankingKeys.all, 'prova-final'] as const,
  me: () => [...rankingKeys.all, 'me'] as const,
};

export function useLeaderboard(limit = 50) {
  return useQuery({
    queryKey: rankingKeys.leaderboard(),
    queryFn: () => rankingApi.getProvaFinalLeaderboard(limit),
    staleTime: 30_000, // refresh every 30s
  });
}

export function useMyRanking() {
  return useQuery({
    queryKey: rankingKeys.me(),
    queryFn: rankingApi.getMyRanking,
    staleTime: 60_000,
  });
}
