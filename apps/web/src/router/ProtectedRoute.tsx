import { Navigate, Outlet, useLocation } from 'react-router-dom';

import { FullPageSpinner } from '@/components/ui/Spinner.js';
import { useAuth } from '@/hooks/use-auth.js';

/**
 * Guard de rota: redireciona para /login se nao autenticado.
 * Preserva a rota original em `state.from` para redirecionar apos login.
 */
export function ProtectedRoute(): JSX.Element {
  const { status } = useAuth();
  const location = useLocation();

  if (status === 'loading') {
    return <FullPageSpinner />;
  }

  if (status === 'unauthenticated') {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}
