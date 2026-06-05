#!/usr/bin/env bash
set -e
cd ~/Felix

echo ">>> Copiando TODOS os arquivos corrigidos do Windows..."

# eslint-config
cp /mnt/c/Projetos/Felix/packages/eslint-config/node.cjs ~/Felix/packages/eslint-config/node.cjs
cp /mnt/c/Projetos/Felix/packages/eslint-config/react.cjs ~/Felix/packages/eslint-config/react.cjs

# apps/web - components
cp /mnt/c/Projetos/Felix/apps/web/src/components/course/ChapterAccordion.tsx ~/Felix/apps/web/src/components/course/ChapterAccordion.tsx
cp /mnt/c/Projetos/Felix/apps/web/src/components/course/LessonRow.tsx ~/Felix/apps/web/src/components/course/LessonRow.tsx
cp /mnt/c/Projetos/Felix/apps/web/src/components/course/ModuleCard.tsx ~/Felix/apps/web/src/components/course/ModuleCard.tsx
cp /mnt/c/Projetos/Felix/apps/web/src/components/layout/Sidebar.tsx ~/Felix/apps/web/src/components/layout/Sidebar.tsx
cp /mnt/c/Projetos/Felix/apps/web/src/components/layout/TopBar.tsx ~/Felix/apps/web/src/components/layout/TopBar.tsx

# apps/web - hooks
cp /mnt/c/Projetos/Felix/apps/web/src/hooks/use-certificate.ts ~/Felix/apps/web/src/hooks/use-certificate.ts
cp /mnt/c/Projetos/Felix/apps/web/src/hooks/use-course.ts ~/Felix/apps/web/src/hooks/use-course.ts
cp /mnt/c/Projetos/Felix/apps/web/src/hooks/use-ranking.ts ~/Felix/apps/web/src/hooks/use-ranking.ts

# apps/web - pages
cp /mnt/c/Projetos/Felix/apps/web/src/pages/assessment/ProvaFinalPage.tsx ~/Felix/apps/web/src/pages/assessment/ProvaFinalPage.tsx
cp /mnt/c/Projetos/Felix/apps/web/src/pages/assessment/SimuladoPage.tsx ~/Felix/apps/web/src/pages/assessment/SimuladoPage.tsx
cp /mnt/c/Projetos/Felix/apps/web/src/pages/certificates/CertificatesPage.tsx ~/Felix/apps/web/src/pages/certificates/CertificatesPage.tsx
cp /mnt/c/Projetos/Felix/apps/web/src/pages/certificates/VerifyPage.tsx ~/Felix/apps/web/src/pages/certificates/VerifyPage.tsx
cp /mnt/c/Projetos/Felix/apps/web/src/pages/course/CoursePage.tsx ~/Felix/apps/web/src/pages/course/CoursePage.tsx
cp /mnt/c/Projetos/Felix/apps/web/src/pages/course/LessonPage.tsx ~/Felix/apps/web/src/pages/course/LessonPage.tsx
cp /mnt/c/Projetos/Felix/apps/web/src/pages/dashboard/DashboardPage.tsx ~/Felix/apps/web/src/pages/dashboard/DashboardPage.tsx
cp /mnt/c/Projetos/Felix/apps/web/src/pages/ranking/RankingPage.tsx ~/Felix/apps/web/src/pages/ranking/RankingPage.tsx
cp /mnt/c/Projetos/Felix/apps/web/src/pages/tutor/TutorPage.tsx ~/Felix/apps/web/src/pages/tutor/TutorPage.tsx

# apps/course-service
cp /mnt/c/Projetos/Felix/apps/course-service/src/course/course.service.ts ~/Felix/apps/course-service/src/course/course.service.ts

echo ">>> Copia concluida!"
echo ""
echo ">>> Rodando pnpm lint..."
pnpm lint
