import { Injectable, Logger } from '@nestjs/common';
import { SupabaseService } from '../common/supabase.service';
import {
  LeaderboardEntryDto,
  LeaderboardResponseDto,
  MyRankingDto,
  SimuladoScoreDto,
} from './ranking.dto';

@Injectable()
export class RankingService {
  private readonly logger = new Logger(RankingService.name);

  constructor(private readonly supabase: SupabaseService) {}

  // ── Prova Final leaderboard ────────────────────────────────────────────────

  async getProvaFinalLeaderboard(
    userId: string,
    limit = 50,
  ): Promise<LeaderboardResponseDto> {
    // All passing entries (public leaderboard)
    const { data: entries, error } = await this.supabase.admin
      .from('prova_final_leaderboard')
      .select('*')
      .limit(limit);

    if (error) {
      this.logger.error('Failed to fetch leaderboard', error);
      return { entries: [], totalParticipants: 0, myEntry: null };
    }

    const mapped: LeaderboardEntryDto[] = (entries ?? []).map(this.mapEntry);

    // Total participants (including failed)
    const { count } = await this.supabase.admin
      .from('prova_final_all_attempts')
      .select('*', { count: 'exact', head: true });

    // User's own entry (may not be in top N)
    const myEntry = await this.getUserProvaFinalEntry(userId);

    return {
      entries: mapped,
      totalParticipants: count ?? 0,
      myEntry,
    };
  }

  private async getUserProvaFinalEntry(
    userId: string,
  ): Promise<LeaderboardEntryDto | null> {
    const { data } = await this.supabase.admin
      .from('prova_final_all_attempts')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (!data) return null;
    return this.mapEntry(data);
  }

  // ── My ranking (self) ──────────────────────────────────────────────────────

  async getMyRanking(userId: string): Promise<MyRankingDto> {
    // Profile stats
    const { data: stats } = await this.supabase.admin
      .from('user_profile_stats')
      .select('*')
      .eq('user_id', userId)
      .single();

    // Simulado scores
    const { data: simulados } = await this.supabase.admin
      .from('user_simulado_scores')
      .select('*')
      .eq('user_id', userId)
      .order('module_order');

    const simuladoScores: SimuladoScoreDto[] = (simulados ?? []).map(
      (s: {
        module_id: string | null;
        module_title: string;
        module_order: number;
        score_percent: number;
        passed: boolean;
        completed_date: string | null;
      }) => ({
        moduleId: s.module_id,
        moduleTitle: s.module_title,
        moduleOrder: s.module_order,
        scorePercent: s.score_percent,
        passed: s.passed,
        completedDate: s.completed_date,
      }),
    );

    // Prova final entry
    const provaFinal = await this.getUserProvaFinalEntry(userId);

    return {
      provaFinal,
      simulados: simuladoScores,
      profileStats: {
        completedLessons: stats?.completed_lessons ?? 0,
        totalLessons: stats?.total_lessons ?? 0,
        simuladosPassed: stats?.simulados_passed ?? 0,
        provaFinalScore: stats?.prova_final_score ?? null,
        provaFinalPassed: stats?.prova_final_passed ?? false,
      },
    };
  }

  // ── Helper ─────────────────────────────────────────────────────────────────

  private mapEntry(data: {
    position: number;
    user_id: string;
    display_name: string;
    avatar_url: string | null;
    score_percent: number;
    passed: boolean;
    completed_date: string | null;
  }): LeaderboardEntryDto {
    return {
      position: data.position,
      userId: data.user_id,
      displayName: data.display_name ?? 'Trader',
      avatarUrl: data.avatar_url,
      scorePercent: data.score_percent,
      passed: data.passed,
      completedDate: data.completed_date,
    };
  }
}
