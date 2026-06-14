import { Outlet } from 'react-router-dom';

import { useAnimationPerformanceGuard } from '@/hooks/use-staggered-animation.js';

import { Sidebar } from './Sidebar.js';
import { TopBar } from './TopBar.js';

/**
 * Shell principal da plataforma autenticada.
 * Topbar fixa + Sidebar fixa + area de conteudo rolavel com glows de fundo.
 */
export function AppShell(): JSX.Element {
  useAnimationPerformanceGuard();

  return (
    <div className="flex h-screen w-full overflow-hidden bg-bg-base">
      {/* Glows de fundo — visíveis mas não intrusivos */}
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        {/* Glow dourado — canto superior esquerdo */}
        <div
          className="absolute -top-32 -left-32 h-[500px] w-[500px] rounded-full opacity-60"
          style={{
            background: 'radial-gradient(circle, rgba(201,162,39,0.15) 0%, transparent 65%)',
          }}
        />
        {/* Glow verde (bid) — canto inferior direito */}
        <div
          className="absolute -bottom-48 -right-20 h-[500px] w-[500px] rounded-full opacity-60"
          style={{ background: 'radial-gradient(circle, rgba(0,200,83,0.10) 0%, transparent 65%)' }}
        />
        {/* Glow azul/teal — centro direito */}
        <div
          className="absolute top-1/3 right-0 h-[400px] w-[400px] rounded-full opacity-40"
          style={{
            background: 'radial-gradient(circle, rgba(21,128,255,0.08) 0%, transparent 65%)',
          }}
        />
      </div>

      {/* Sidebar esquerda */}
      <Sidebar />

      {/* Coluna direita: topbar + conteudo */}
      <div className="relative z-10 flex flex-1 flex-col overflow-hidden">
        <TopBar />

        <main
          id="main-content"
          className="flex-1 overflow-y-auto p-6 focus:outline-none"
          tabIndex={-1}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}
