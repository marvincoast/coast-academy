# ranking-service

Leaderboard sazonal das aprovações na prova final + elegibilidade a prêmios da mesa proprietária.

Implementação completa na **Etapa 5** do plano.

## Endpoints planejados

- `GET /api/ranking?season=2026-Q2&limit=50` — leaderboard anonimizado (apenas `displayName`, `score`, `durationSeconds`).
- `GET /api/ranking/me?season=2026-Q2` — posição do usuário autenticado.

## Notas

- Ranking respeita `profiles.acceptsLeaderboard`; quem opta-out não aparece nem é contado.
- Cache opcional via Redis (perfil `cache` do compose), TTL 60s.
