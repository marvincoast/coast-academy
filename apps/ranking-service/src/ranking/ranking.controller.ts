import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../common/auth.guard';
import { CurrentUser, CurrentUserPayload } from '../common/current-user.decorator';
import { RankingService } from './ranking.service';

@Controller('ranking')
@UseGuards(AuthGuard)
export class RankingController {
  constructor(private readonly rankingService: RankingService) {}

  /** GET /ranking/prova-final?limit=50 — leaderboard público da prova final */
  @Get('prova-final')
  getProvaFinalLeaderboard(@Query('limit') limit: string, @CurrentUser() user: CurrentUserPayload) {
    return this.rankingService.getProvaFinalLeaderboard(
      user.id,
      limit ? Math.min(parseInt(limit, 10), 100) : 50,
    );
  }

  /** GET /ranking/me — posição e scores do usuário autenticado */
  @Get('me')
  getMyRanking(@CurrentUser() user: CurrentUserPayload) {
    return this.rankingService.getMyRanking(user.id);
  }
}
