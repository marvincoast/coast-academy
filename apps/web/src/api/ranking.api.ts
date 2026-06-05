import { apiGet } from './client';

// ─── Response types ────────────────────────────────────────────────────────────

export interface LeaderboardEntryDto {
  position: number;
  userId: string;
  displayName: string;
  avatarUrl: string | null;
  scorePercent: number;
  passed: boolean;
  completedDate: string | null;
}

export interface LeaderboardResponseDto {
  entries: LeaderboardEntryDto[];
  totalParticipants: number;
  myEntry: LeaderboardEntryDto | null;
}

export interface SimuladoScoreDto {
  moduleId: string | null;
  moduleTitle: string;
  moduleOrder: number;
  scorePercent: number;
  passed: boolean;
  completedDate: string | null;
}

export interface MyRankingDto {
  provaFinal: LeaderboardEntryDto | null;
  simulados: SimuladoScoreDto[];
  profileStats: {
    completedLessons: number;
    totalLessons: number;
    simuladosPassed: number;
    provaFinalScore: number | null;
    provaFinalPassed: boolean;
  };
}

// ─── API functions ─────────────────────────────────────────────────────────────

export const rankingApi = {
  getProvaFinalLeaderboard: (limit = 50) =>
    apiGet<LeaderboardResponseDto>(`/ranking/prova-final?limit=${limit}`),

  getMyRanking: () => apiGet<MyRankingDto>('/ranking/me'),
};
