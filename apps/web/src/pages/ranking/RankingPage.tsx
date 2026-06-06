import { Award, Crown, Medal, Trophy, Users } from 'lucide-react';

import type { LeaderboardEntryDto } from '../../api/ranking.api';
import { GlassCard } from '../../components/ui/GlassCard';
import { MarketBadge } from '../../components/ui/MarketBadge';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { Spinner } from '../../components/ui/Spinner';
import { StatCard } from '../../components/ui/StatCard';
import { useAuth } from '../../hooks/use-auth';
import { useLeaderboard, useMyRanking } from '../../hooks/use-ranking';
import { cn } from '../../lib/cn';

// ─── Constantes de prêmios (customizável pelo admin) ─────────────────────────
const PRIZES = [
  { position: 1, label: 'Notebook Coast Academy', icon: '💻' },
  { position: 2, label: 'Kit Café Premium',         icon: '☕' },
  { position: 3, label: 'Copo Coast Academy',      icon: '🏆' },
];

const MESA_PROP_MIN_SCORE = 80; // % mínimo para candidatura à mesa proprietária

export default function RankingPage() {
  const { user } = useAuth();
  const { data: leaderboard, isLoading: loadingBoard } = useLeaderboard(50);
  const { data: myRanking, isLoading: loadingMe } = useMyRanking();

  const isLoading = loadingBoard || loadingMe;
  const myUserId = user?.id ?? '';

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="text-center animate-fade-up">
        <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-brand-gold/20 bg-brand-gold-muted">
          <Trophy className="h-7 w-7 text-brand-gold" />
        </div>
        <MarketBadge className="mb-3">Prova Final · B3</MarketBadge>
        <h1 className="text-2xl font-display font-bold text-white">Ranking Coast Academy</h1>
        <p className="mt-1 text-sm text-white/50">
          Melhores traders da Prova Final · os mais qualificados concorrem à mesa proprietária
        </p>
      </div>

      <GlassCard variant="gold" depth="surface" className="p-5">
        <p className="section-heading mb-3">Prêmios por classificação</p>
        <div className="grid grid-cols-3 gap-4">
          {PRIZES.map((p) => (
            <div key={p.position} className="text-center">
              <p className="text-2xl mb-1">{p.icon}</p>
              <p className="text-xs font-semibold text-white/70">{p.label}</p>
              <p className="mt-0.5 text-xs text-white/40">{p.position}º lugar</p>
            </div>
          ))}
        </div>
        <p className="mt-4 border-t border-white/8 pt-3 text-xs text-white/40">
          Score ≥ {MESA_PROP_MIN_SCORE}% na Prova Final — candidatura à mesa proprietária Coast Academy
        </p>
      </GlassCard>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : (
        <>
          {/* My stats card (if attempted) */}
          {myRanking && (
            <MyStatsCard myRanking={myRanking} myEntry={leaderboard?.myEntry ?? null} />
          )}

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-4">
            <StatCard
              icon={<Users className="h-4 w-4" />}
              label="Participantes"
              value={String(leaderboard?.totalParticipants ?? 0)}
            />
            <StatCard
              icon={<Award className="h-4 w-4" />}
              label="Aprovados"
              value={String(leaderboard?.entries.length ?? 0)}
            />
            <StatCard
              icon={<Medal className="h-4 w-4" />}
              label="Sua posição"
              value={
                leaderboard?.myEntry
                  ? `${leaderboard.myEntry.position}º`
                  : '—'
              }
            />
          </div>

          {/* Podium — top 3 */}
          {(leaderboard?.entries.length ?? 0) >= 3 && (
            <Podium entries={leaderboard!.entries.slice(0, 3)} />
          )}

          {/* Leaderboard table */}
          <section>
            <h2 className="section-heading mb-4">Classificação geral</h2>

            {(leaderboard?.entries.length ?? 0) === 0 ? (
              <EmptyState />
            ) : (
              <div className="flex flex-col gap-1.5">
                {leaderboard!.entries.map((entry) => (
                  <LeaderboardRow
                    key={entry.userId}
                    entry={entry}
                    isMe={entry.userId === myUserId}
                  />
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function MyStatsCard({
  myRanking,
  myEntry,
}: {
  myRanking: NonNullable<ReturnType<typeof useMyRanking>['data']>;
  myEntry: LeaderboardEntryDto | null;
}) {
  const { profileStats, simulados } = myRanking;
  const progressPct =
    profileStats.totalLessons === 0
      ? 0
      : Math.round((profileStats.completedLessons / profileStats.totalLessons) * 100);

  return (
    <GlassCard depth="elevated" className="p-5">
      <h2 className="mb-4 text-sm font-semibold text-white/80">Meu desempenho</h2>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
        <MiniStat label="Aulas concluídas" value={`${profileStats.completedLessons}/${profileStats.totalLessons}`} />
        <MiniStat label="Simulados aprovados" value={`${profileStats.simuladosPassed}/8`} />
        <MiniStat
          label="Prova Final"
          value={
            profileStats.provaFinalScore !== null
              ? `${profileStats.provaFinalScore}%`
              : 'Não tentada'
          }
          highlight={profileStats.provaFinalPassed}
        />
        <MiniStat
          label="Minha posição"
          value={myEntry ? `${myEntry.position}º` : '—'}
          highlight={!!myEntry}
        />
      </div>

      {/* Course progress bar */}
      <ProgressBar value={progressPct} label="Progresso geral do curso" showPercentage variant="gold" />

      {/* Simulado scores mini-grid */}
      {simulados.length > 0 && (
        <div className="mt-4 grid grid-cols-4 sm:grid-cols-8 gap-1.5">
          {simulados.map((s) => (
            <div
              key={s.moduleOrder}
              title={`Módulo ${s.moduleOrder}: ${s.moduleTitle} — ${s.scorePercent}%`}
              className={cn(
                'flex flex-col items-center p-1.5 rounded-lg text-center',
                s.passed ? 'bg-flow-bid/10' : 'bg-white/5',
              )}
            >
              <span className="text-xs font-bold text-white/35">M{s.moduleOrder}</span>
              <span
                className={cn(
                  'mt-0.5 text-xs font-semibold font-mono tabular-nums',
                  s.passed ? 'text-flow-bid' : 'text-white/40',
                )}
              >
                {s.scorePercent}%
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Mesa proprietária CTA */}
      {profileStats.provaFinalPassed &&
        (profileStats.provaFinalScore ?? 0) >= MESA_PROP_MIN_SCORE && (
          <div className="mt-4 flex items-center gap-3 rounded-xl border border-brand-gold/25 bg-brand-gold-muted p-3">
            <Crown className="h-5 w-5 shrink-0 text-brand-gold" />
            <p className="text-sm text-brand-gold-soft">
              Parabéns! Você se qualificou para candidatura à{' '}
              <strong>Mesa Proprietária Coast Academy</strong>.
            </p>
          </div>
        )}
    </GlassCard>
  );
}

function MiniStat({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="rounded-lg bg-bg-elevated/80 p-2.5 border border-white/8">
      <p className="mb-0.5 text-xs text-white/40">{label}</p>
      <p className={cn('text-sm font-bold', highlight ? 'text-brand-gold' : 'text-white/85')}>
        {value}
      </p>
    </div>
  );
}

function Podium({ entries }: { entries: LeaderboardEntryDto[] }) {
  const [first, second, third] = entries;

  const podiumOrder = [second!, first!, third!]; // 2nd, 1st, 3rd
  const heights = ['h-24', 'h-32', 'h-20'];
  const medals = ['🥈', '🥇', '🥉'];
  const colors = [
    'border-white/20 bg-bg-elevated/80',
    'border-brand-gold/50 bg-brand-gold-muted',
    'border-flow-ask/30 bg-flow-ask/10',
  ];

  return (
    <div className="flex items-end justify-center gap-3 py-4">
      {podiumOrder.map((entry, i) => (
        <div key={entry.userId} className="flex flex-col items-center gap-2 flex-1 max-w-36">
          <div className="text-center">
            <p className="text-2xl">{medals[i]}</p>
            <p className="text-sm font-semibold text-white mt-1 truncate">
              {entry.displayName}
            </p>
            <p className="text-xs font-bold font-mono text-brand-gold tabular-nums">{entry.scorePercent}%</p>
          </div>
          <div
            className={cn(
              'w-full rounded-t-xl border-2 flex items-center justify-center',
              heights[i],
              colors[i],
            )}
          >
            <span className="text-2xl font-black text-white/30">{entry.position}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function LeaderboardRow({
  entry,
  isMe,
}: {
  entry: LeaderboardEntryDto;
  isMe: boolean;
}) {
  const medalIcon =
    entry.position === 1
      ? '🥇'
      : entry.position === 2
        ? '🥈'
        : entry.position === 3
          ? '🥉'
          : null;

  const isEligibleMesa = entry.scorePercent >= MESA_PROP_MIN_SCORE;

  return (
    <div
      className={cn(
        'flex items-center gap-4 px-4 py-3 rounded-xl border transition-colors',
        isMe
          ? 'border-brand-gold/40 bg-brand-gold-muted/50'
          : 'border-white/8 bg-bg-surface hover:bg-bg-elevated/80',
      )}
    >
      {/* Position */}
      <div className="w-8 text-center shrink-0">
        {medalIcon ? (
          <span className="text-lg">{medalIcon}</span>
        ) : (
          <span className="text-sm font-bold text-white/40">{entry.position}</span>
        )}
      </div>

      {/* Avatar */}
      <Avatar name={entry.displayName} url={entry.avatarUrl} size={32} />

      {/* Name + badges */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              'text-sm font-semibold truncate',
              isMe ? 'text-brand-gold-soft' : 'text-white/85',
            )}
          >
            {entry.displayName}
            {isMe && <span className="ml-1 text-xs text-white/40">(você)</span>}
          </span>
          {isEligibleMesa && (
            <span className="shrink-0 rounded-full bg-brand-gold-muted px-1.5 py-0.5 text-xs font-semibold text-brand-gold">
              Mesa Prop.
            </span>
          )}
        </div>
        {entry.completedDate && (
          <p className="text-xs text-white/40">
            {new Date(entry.completedDate).toLocaleDateString('pt-BR')}
          </p>
        )}
      </div>

      {/* Score */}
      <div className="text-right shrink-0">
        <span
          className={cn(
            'text-base font-bold',
            entry.scorePercent >= 90
              ? 'text-flow-bid'
              : entry.scorePercent >= 75
                ? 'text-brand-gold'
                : 'text-white/40',
          )}
        >
          {entry.scorePercent}%
        </span>
      </div>
    </div>
  );
}

function Avatar({
  name,
  url,
  size,
}: {
  name: string;
  url: string | null;
  size: number;
}) {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  if (url) {
    return (
      <img
        src={url}
        alt={name}
        width={size}
        height={size}
        className="rounded-full object-cover shrink-0"
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-full border border-white/10 bg-bg-elevated"
      style={{ width: size, height: size }}
    >
      <span className="text-xs font-bold text-white/50">{initials}</span>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="py-16 text-center text-white/40">
      <Trophy className="h-10 w-10 mx-auto mb-3 opacity-30" />
      <p className="text-sm">Nenhum trader aprovado ainda.</p>
      <p className="text-xs mt-1">Seja o primeiro a passar na Prova Final!</p>
    </div>
  );
}
