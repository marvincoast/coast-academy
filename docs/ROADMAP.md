# Roadmap ? Felix Empire Trading

## MVP (Etapas 1?8 do plano)

| Etapa | Entreg�vel | Status |
|-------|------------|--------|
| 1 | Bootstrap, monorepo, docker, docs, ADRs | ? conclu�da |
| 2 | Auth + design system + dashboard | ? conclu�da |
| 3 | Dom�nio do curso | ? conclu�da |
| 4 | Avalia�?es + seed 100 quest?es | ? conclu�da |
| 5 | Prova final + ranking | ? conclu�da |
| 6 | Certificado + e-mail | ? conclu�da |
| 7 | RAG tutor | ? conclu�da |
| 8 | Hardening + CI/CD completo | ? conclu�da |

## P�s-MVP

### Fase 2 ? Mercado americano

- `market=US` no schema (j� preparado).
- Conte�do de **futuros do d�lar (DXY, /6E)** e sess?es RTH/ETH.
- Toggle BR/US no frontend e i18n en-US.

### Fase 3 ? Gamifica�?o

- Streaks de estudo.
- Badges por tag dominada (`absorcao`, `iceberg`, etc.).
- Replay personalizado de erros do simulado.

### Fase 4 ? Admin CMS

- Painel para criar / revisar quest?es e m�dia sem SQL.
- Workflow de revis?o (rascunho ? revis?o ? publicado).
- Upload assistido por IA com revis?o humana obrigat�ria.

### Fase 5 ? Proctoring leve

- Captura de webcam opcional na prova final.
- Detec�?o de troca de aba j� registrada via `audit_log` (Etapa 4) ganha alerta visual.
- Honor system + relat�rio para o instrutor.

### Fase 6 ? Mesa propriet�ria

- Webhook / API para exportar top N do ranking sazonal (com consentimento LGPD expl�cito).
- P�gina de pr?mios: notebook, copo, kit de caf�.
- Integra�?o com sistema interno de candidatura.

### Fase 7 ? Mobile PWA

- Manifest, service worker e suporte offline para aulas.
- Notifica�?es push para novas temporadas de ranking.

### Fase 8 ? IA generativa controlada

- Gera�?o assistida de novas quest?es (template em `apps/rag-service/prompts/system/question-author.v1.md`).
- Revis?o humana sempre obrigat�ria antes da publica�?o.
