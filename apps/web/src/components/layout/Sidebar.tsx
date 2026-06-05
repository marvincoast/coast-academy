import {
  Award,
  Bot,
  LayoutDashboard,
  Lock,
  Medal,
  BookOpen,
  Target,
  Trophy,
  TrendingUp,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { NavLink, useLocation } from 'react-router-dom';

import { Logo } from '@/components/ui/Logo.js';
import { FELIX_COURSE_ID } from '@/config/constants.js';
import { useAuth } from '@/hooks/use-auth.js';
import { useCourse } from '@/hooks/use-course.js';
import { cn } from '@/lib/cn.js';

interface NavItem {
  key: string;
  to: string;
  icon: React.ElementType;
  locked?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { key: 'dashboard', to: '/dashboard', icon: LayoutDashboard },
  { key: 'course', to: '/curso', icon: BookOpen },
  { key: 'simulations', to: '/simulados', icon: Target },
  { key: 'finalExam', to: '/prova-final', icon: Trophy },
  { key: 'ranking', to: '/ranking', icon: Medal },
  { key: 'certificates', to: '/certificados', icon: Award },
  { key: 'tutor', to: '/tutor', icon: Bot },
];

export function Sidebar(): JSX.Element {
  const { t } = useTranslation('common');
  const { user } = useAuth();
  const { data: course } = useCourse(FELIX_COURSE_ID);

  const displayName =
    (user?.user_metadata?.['display_name'] as string | undefined) ??
    user?.email?.split('@')[0] ??
    'Trader';

  const initials = displayName.slice(0, 2).toUpperCase();
  const progressPct = course?.progressPct ?? 0;

  return (
    <nav
      aria-label="Navegação principal"
      className="relative flex w-64 shrink-0 flex-col overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, #0d1520 0%, #0b1018 100%)',
        borderRight: '1px solid rgba(201,162,39,0.12)',
      }}
    >
      {/* Glow decorativo na sidebar */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-0 left-0 right-0 h-40 opacity-70"
        style={{ background: 'linear-gradient(180deg, rgba(201,162,39,0.08) 0%, transparent 100%)' }}
      />

      {/* Logo */}
      <div
        className="relative flex h-16 items-center px-5"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        <Logo size="sm" />
      </div>

      {/* Links */}
      <ul className="relative flex flex-col gap-0.5 p-3 flex-1">
        {NAV_ITEMS.map((item) => (
          <SidebarNavItem key={item.key} item={item} label={t(`nav.${item.key}`)} />
        ))}
      </ul>

      {/* Rodapé: progresso + avatar do usuário */}
      <div
        className="relative p-4 space-y-3"
        style={{ borderTop: '1px solid rgba(201,162,39,0.10)' }}
      >
        {/* Progresso global compacto */}
        {course && (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <TrendingUp size={10} className="text-brand-gold" aria-hidden="true" />
                <span className="text-[10px] uppercase tracking-widest text-white/35 font-semibold">
                  Progresso
                </span>
              </div>
              <span className="font-mono text-[10px] text-brand-gold font-bold">
                {progressPct}%
              </span>
            </div>
            {/* Progress bar custom com glow */}
            <div className="h-1 rounded-full bg-white/6 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${progressPct}%`,
                  background: 'linear-gradient(90deg, #c9a227, #f0c040)',
                  boxShadow: progressPct > 0 ? '0 0 8px rgba(201,162,39,0.6)' : 'none',
                }}
                role="progressbar"
                aria-valuenow={progressPct}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`Progresso do curso: ${progressPct}%`}
              />
            </div>
          </div>
        )}

        {/* Avatar + nome */}
        <div className="flex items-center gap-2.5 pt-0.5">
          <div
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-bg-base text-xs font-bold select-none"
            style={{
              background: 'linear-gradient(135deg, #c9a227, #f0c040)',
              boxShadow: '0 0 12px rgba(201,162,39,0.35)',
            }}
            aria-hidden="true"
          >
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold text-white/85">{displayName}</p>
            <p className="font-mono text-[9px] uppercase tracking-widest text-white/30">
              Trader · Dólar B3
            </p>
          </div>
        </div>
      </div>
    </nav>
  );
}

interface SidebarNavItemProps {
  item: NavItem;
  label: string;
}

function SidebarNavItem({ item, label }: SidebarNavItemProps): JSX.Element {
  const location = useLocation();
  const Icon = item.icon;

  if (item.locked) {
    return (
      <li>
        <span
          aria-disabled="true"
          title="Disponível em breve"
          className="flex cursor-not-allowed items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-white/18 select-none"
        >
          <Icon size={17} aria-hidden="true" />
          <span className="flex-1">{label}</span>
          <Lock size={11} aria-hidden="true" className="opacity-40" />
        </span>
      </li>
    );
  }

  const isActive =
    item.to === '/dashboard'
      ? location.pathname === '/dashboard'
      : location.pathname.startsWith(item.to);

  return (
    <li>
      <NavLink
        to={item.to}
        aria-current={isActive ? 'page' : undefined}
        className={cn(
          'relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all duration-200',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold',
          isActive
            ? 'text-brand-gold font-medium'
            : 'text-white/45 hover:text-white/80',
        )}
        style={isActive ? {
          background: 'linear-gradient(90deg, rgba(201,162,39,0.15) 0%, rgba(201,162,39,0.04) 100%)',
          boxShadow: 'inset 0 0 0 1px rgba(201,162,39,0.20)',
        } : {}}
      >
        {/* Barra lateral indicadora para item ativo */}
        {isActive && (
          <span
            aria-hidden="true"
            className="absolute left-0 top-1/2 h-4 w-0.5 -translate-y-1/2 rounded-full"
            style={{ background: 'linear-gradient(180deg, #f0c040, #c9a227)', boxShadow: '0 0 8px rgba(201,162,39,0.8)' }}
          />
        )}

        <Icon
          size={17}
          aria-hidden="true"
          className={cn(
            'transition-transform duration-200',
            isActive ? 'text-brand-gold' : 'opacity-60',
          )}
        />
        <span>{label}</span>
      </NavLink>
    </li>
  );
}
