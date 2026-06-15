import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { RouterProvider } from 'react-router-dom';

import { useAuthListener } from '@/hooks/use-auth.js';
import '@/i18n/index.js';
import { queryClient } from '@/lib/query-client.js';
import { isSentryEnabled, Sentry } from '@/lib/sentry.js';
import { router } from '@/router/index.js';

/**
 * Inicializa o listener de auth e expoe o contexto global.
 * Montado uma unica vez dentro de QueryClientProvider.
 */
function AuthGate(): null {
  useAuthListener();
  return null;
}

function AppShell(): JSX.Element {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthGate />
      <RouterProvider router={router} />
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#162130',
            color: '#F4F6FA',
            border: '1px solid rgba(244,246,250,0.08)',
            fontFamily: 'Inter, sans-serif',
            fontSize: '14px',
          },
          success: {
            iconTheme: { primary: '#00C853', secondary: '#0B0F14' },
          },
          error: {
            iconTheme: { primary: '#FF5252', secondary: '#0B0F14' },
          },
        }}
      />
    </QueryClientProvider>
  );
}

export function App(): JSX.Element {
  if (isSentryEnabled()) {
    return (
      <Sentry.ErrorBoundary
        fallback={<p className="p-4 text-sm text-white/70">Algo deu errado.</p>}
      >
        <AppShell />
      </Sentry.ErrorBoundary>
    );
  }
  return <AppShell />;
}
