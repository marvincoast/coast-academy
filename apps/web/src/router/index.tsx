import { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';

import { AppShell } from '@/components/layout/AppShell.js';
import { FullPageSpinner } from '@/components/ui/Spinner.js';
import { ProtectedRoute } from './ProtectedRoute.js';

// Lazy imports — cada rota e um chunk separado (code split por rota)
const LoginPage = lazy(() => import('@/pages/auth/LoginPage.js'));
const AuthCallbackPage = lazy(() => import('@/pages/auth/AuthCallbackPage.js'));
const DashboardPage = lazy(() => import('@/pages/dashboard/DashboardPage.js'));
const CoursePage = lazy(() => import('@/pages/course/CoursePage.js'));
const LessonPage = lazy(() => import('@/pages/course/LessonPage.js'));
const RankingPage = lazy(() => import('@/pages/ranking/RankingPage.js'));
const CertificatesPage = lazy(() => import('@/pages/certificates/CertificatesPage.js'));
const VerifyPage = lazy(() => import('@/pages/certificates/VerifyPage.js'));
const TutorPage = lazy(() => import('@/pages/tutor/TutorPage.js'));
const ProvaFinalPage = lazy(() => import('@/pages/assessment/ProvaFinalPage.js'));
const SimuladosPage = lazy(() => import('@/pages/assessment/SimuladosPage.js'));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage.js'));

function wrap(element: React.ReactNode): React.ReactNode {
  return <Suspense fallback={<FullPageSpinner />}>{element}</Suspense>;
}

export const router: ReturnType<typeof createBrowserRouter> = createBrowserRouter([
  // ------- Rotas publicas -------
  {
    path: '/login',
    element: wrap(<LoginPage />),
  },
  {
    path: '/auth/callback',
    element: wrap(<AuthCallbackPage />),
  },
  {
    path: '/verify/:hash',
    element: wrap(<VerifyPage />),
  },

  // ------- Rotas protegidas (exigem autenticacao) -------
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppShell />,
        children: [
          { index: true, element: <Navigate to="/dashboard" replace /> },
          { path: '/dashboard', element: wrap(<DashboardPage />) },
          { path: '/curso', element: wrap(<CoursePage />) },
          { path: '/curso/:courseId', element: wrap(<CoursePage />) },
          { path: '/aula/:lessonId', element: wrap(<LessonPage />) },
          { path: '/ranking', element: wrap(<RankingPage />) },
          { path: '/certificados', element: wrap(<CertificatesPage />) },
          { path: '/tutor', element: wrap(<TutorPage />) },
          { path: '/prova-final', element: wrap(<ProvaFinalPage />) },
          { path: '/simulados', element: wrap(<SimuladosPage />) },
        ],
      },
      { path: '/simulado', element: <Navigate to="/simulados" replace /> },
      // Simulado em tela cheia (exame)
      {
        path: '/simulado/:assessmentId',
        lazy: () =>
          import('@/pages/assessment/SimuladoPage.js').then((m) => ({
            Component: m.SimuladoPage,
          })),
      },
    ],
  },

  // ------- Fallback -------
  { path: '*', element: wrap(<NotFoundPage />) },
]);
