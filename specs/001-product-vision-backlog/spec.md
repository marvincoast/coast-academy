# Feature Specification: Visão Unificada do Produto Coast Academy

**Feature Branch**: `001-product-vision-backlog`

**Created**: 2026-06-14

**Last Audited**: 2026-06-14 (auditoria de código em `apps/`, `packages/`, `supabase/`)

**Status**: Active — sincronizada com estado real do código

**Input**: User description: "Unificar e consolidar a visão geral do produto, histórico de entregas e backlog futuro na estrutura oficial do Spec Kit."

## Visão do Produto

O **Coast Academy** é uma plataforma de ensino interativa para **tape reading** e
**análise de fluxo de ordens do Dólar Futuro (B3)**. O aluno acessa com login por
e-mail, percorre módulos de aula com desbloqueio sequencial, pratica em simulados
com proteção anti-fraude, conclui a prova final, recebe certificado verificável
publicamente, compete no ranking sazonal e consulta um tutor com inteligência
artificial treinado no conteúdo do curso.

**Público-alvo**: operadores e estudantes de mercado financeiro brasileiro
interessados em leitura de fluxo do mini-dólar (WDO) e dólar cheio (DOL).

**Proposta de valor**: formação prática em tape reading com avaliação rigorosa,
certificação verificável e suporte didático contextual — sem recomendação de
trade ao vivo.

**Preview público**: interface estática disponível para visualização; experiência
completa exige ambiente autenticado.

---

## MVP Entregue (Etapas 1–8, concluídas em 2026-05-17)

| Etapa                     | Capacidade entregue                                                                                     | Valor para o aluno                             |
| ------------------------- | ------------------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| 1 — Bootstrap             | Estrutura do monorepo, tipos compartilhados, infraestrutura base, documentação e decisões arquiteturais | Fundação para evolução segura e rápida         |
| 2 — Auth + design system  | Login por magic link, perfil no primeiro acesso, tema de terminal financeiro                            | Acesso seguro e identidade visual profissional |
| 3 — Domínio do curso      | 8 módulos, 48 aulas, progresso e desbloqueio sequencial                                                 | Jornada de aprendizado estruturada             |
| 4 — Avaliações            | ~100 questões de tape reading, simulados com timer e tela cheia, correção no servidor                   | Prática avaliativa com integridade acadêmica   |
| 5 — Prova final + ranking | Avaliação conclusiva (aprovação ≥ 75%), leaderboard sazonal com pódio                                   | Conclusão formal e competição sazonal          |
| 6 — Certificado + e-mail  | PDF com QR code, verificação pública por hash, serviço de notificação                                   | Credencial verificável e compartilhável        |
| 7 — Tutor IA              | Assistente contextual com citações de fonte e guardrails de escopo                                      | Suporte didático sob demanda                   |
| 8 — Hardening + CI/CD     | Segurança reforçada, pipeline de qualidade automatizado                                                 | Confiabilidade para uso contínuo               |

### Capacidades funcionais existentes (por área)

| Área         | O que o aluno pode fazer hoje                                                                                      |
| ------------ | ------------------------------------------------------------------------------------------------------------------ |
| Autenticação | Entrar por e-mail (magic link); perfil criado automaticamente                                                      |
| Curso        | Navegar 8 módulos / 48 aulas; progresso salvo; desbloqueio sequencial                                              |
| Simulados    | Responder questões em tela cheia; receber resultado sem exposição de gabarito                                      |
| Prova final  | Tentar avaliação conclusiva com limite de tentativas; ao aprovar, emitir e baixar certificado na tela de resultado |
| Ranking      | Ver posição na temporada vigente e pódio                                                                           |
| Certificados | Baixar PDF; prévia em painel lateral ocultável; terceiros verificam em `/verify/:hash`                             |
| Tutor IA     | Perguntar sobre tape reading; receber respostas com citações                                                       |
| Design       | Experiência visual de terminal financeiro (bid/ask, ticker, fluxo)                                                 |

---

## Pós-MVP Já Implementado (não documentado no ROADMAP)

Auditoria de código em 2026-06-14 identificou capacidades **já codificadas** que
estavam listadas como backlog pendente em `docs/ROADMAP-MELHORIAS.md`:

| Capacidade                                        | Evidência no código                                            | Status anterior na doc       |
| ------------------------------------------------- | -------------------------------------------------------------- | ---------------------------- |
| Fluxo único pós–Prova Final                       | `SimuladoPage.tsx` — emissão + download na tela de resultado   | Backlog alta prioridade      |
| Painel PDF lateral com hide                       | `CertificatePdfSidePanel.tsx` em `/certificados`               | Backlog alta prioridade      |
| Storage dual de PDFs (Appwrite S3cert + Supabase) | `certificate-pdf-storage.service.ts`; migrations `0014`–`0016` | Backlog alta prioridade      |
| Idempotência na emissão de certificado            | `certificate.service.ts` — verifica `attempt_id` existente     | Backlog alta prioridade      |
| Health checks em todos os microserviços           | `health.controller.ts` em cada serviço; Docker `HEALTHCHECK`   | Backlog parcial              |
| Schemas Zod cross-stack                           | `packages/shared-types/src/domain/*.ts` consumidos por apps    | Backlog média prioridade     |
| Design tokens financeiros completos               | `packages/ui/src/tokens.ts`, `tailwind-preset.cjs`             | Redesign spec separada       |
| Pacote observabilidade (Pino + Prometheus)        | `@coast-academy/observability` em todos os NestJS              | Backlog média prioridade     |
| Stack LGTM no Docker (profile `obs`)              | `docker-compose.obs.yml`, Grafana dashboards                   | Backlog média prioridade     |
| Seeds SQL (curso + ~100 questões)                 | `supabase/seed/01_course.sql`, `02_questions.sql`              | MVP (confirmado)             |
| 16 migrations de domínio                          | `supabase/migrations/0001`–`0016`                              | MVP (confirmado)             |
| Schema preparado para mercado US                  | `MarketSchema` BR/US em shared-types + migrations              | Roadmap Fase 2 (schema only) |

---

## Backlog Futuro (pendente ou parcial)

### Prioridade alta — próximas 4–6 semanas

| Item                            | Área           | Status real  | O que falta                                                                                                        |
| ------------------------------- | -------------- | ------------ | ------------------------------------------------------------------------------------------------------------------ |
| Progresso claro até Prova Final | Produto/UX     | **Parcial**  | Dashboard mostra % e grid por módulo, mas não exibe "falta X módulos" nem CTA para próxima aula incompleta         |
| E-mail transacional             | Produto/UX     | **Parcial**  | `notification-service` implementado (certificado + welcome); **não conectado** à emissão; sem lembrete de simulado |
| Template PDF v2                 | Certificados   | **Parcial**  | PDF estilizado com QR e hash existe; faltam logo real, assinatura e número de série dedicado                       |
| Health checks + smoke no CI     | Confiabilidade | **Parcial**  | Endpoints `/health` existem; CI não executa `verify-stack.sh`                                                      |
| Testes E2E do fluxo crítico     | Confiabilidade | **Pendente** | E2E cobre login e dashboard; não cobre prova → certificado → PDF                                                   |
| Regenerar PDF em lote (admin)   | Certificados   | **Pendente** | Apenas regeneração individual sob demanda (`ensurePdfForCertificate`)                                              |
| Fila de emissão em pico         | Confiabilidade | **Pendente** | Idempotência existe; fila assíncrona não implementada                                                              |

### Prioridade média — 1–3 meses

| Item                                  | Área        | Status real  | O que falta                                                              |
| ------------------------------------- | ----------- | ------------ | ------------------------------------------------------------------------ |
| Padronização de erros na API          | Arquitetura | **Parcial**  | `ApiError` no frontend; sem envelope unificado nos serviços              |
| Eventos assíncronos                   | Arquitetura | **Pendente** | Sem `certificate.issued` / `attempt.submitted` wired                     |
| Cache Redis (ranking, catálogo)       | Arquitetura | **Pendente** | Container Redis no Compose (profile `cache`); sem uso no código          |
| Cobertura de testes nos microserviços | Qualidade   | **Parcial**  | Jest com `--passWithNoTests`; cobertura mínima                           |
| Contratos OpenAPI gerados             | Qualidade   | **Parcial**  | Zod schemas existem; Swagger não gerado nos serviços                     |
| Internacionalização (pt-BR / en)      | i18n        | **Parcial**  | 4 namespaces pt-BR; `SimuladoPage` e certificados hardcoded; sem `en`    |
| Observabilidade OTEL completa         | Operações   | **Parcial**  | OTEL SDK só em `certificate-service`; demais serviços: Pino + Prometheus |
| RAG: correção dimensão embedding      | Operações   | **Parcial**  | Coluna `vector(768)` mas função RPC ainda declara `vector(1536)`         |
| Rotação de secrets e auditoria RLS    | Segurança   | **Pendente** | Documentado em SECURITY.md; não automatizado                             |

### Roadmap estratégico pós-MVP (fases 2–8) — sem implementação

| Fase | Tema                     | Escopo resumido                                                                 |
| ---- | ------------------------ | ------------------------------------------------------------------------------- |
| 2    | Mercado americano        | Conteúdo DXY/6E, sessões RTH/ETH, toggle BR/US (schema pronto, sem conteúdo US) |
| 3    | Gamificação              | Streaks, badges por tag, replay de erros                                        |
| 4    | Admin CMS                | Criar/revisar questões e mídia sem SQL; workflow de publicação                  |
| 5    | Proctoring leve          | Webcam opcional, alertas de troca de aba na prova final                         |
| 6    | Mesa proprietária        | Exportação de ranking, prêmios, integração de candidatura                       |
| 7    | Mobile PWA               | Offline de aulas, notificações push                                             |
| 8    | IA generativa controlada | Geração assistida de questões com revisão humana obrigatória                    |

### Prioridade longa — 3+ meses

- Multi-tenant / multi-curso (hoje curso fixo por UUID no seed)
- Painel administrativo (conteúdo, usuários, revogação de certificado)
- Analytics de aprendizado (tempo por aula, abandono, heatmap de questões)

---

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Consultar estado real do produto (Priority: P1)

Como **stakeholder**, quero uma especificação que reflita o que está **realmente
implementado** no código, não apenas o que a documentação antiga afirmava estar
pendente.

**Why this priority**: Backlog desatualizado gera retrabalho e priorização errada.

**Independent Test**: Comparar itens "Pós-MVP Já Implementado" com busca no
repositório confirma existência dos arquivos citados.

**Acceptance Scenarios**:

1. **Given** um item estava no backlog como pendente,
   **When** o código já o implementa,
   **Then** aparece em "Pós-MVP Já Implementado" e sai do backlog pendente.
2. **Given** um item está parcialmente implementado,
   **When** consulto o backlog,
   **Then** vejo status "Parcial" com descrição do que falta.

---

### User Story 2 - Priorizar sprint com backlog honesto (Priority: P2)

Como **product owner**, quero ver apenas itens genuinamente pendentes na
prioridade alta, para não replanejar trabalho já feito.

**Why this priority**: 4 dos 10 itens de alta prioridade já estavam codificados.

**Independent Test**: Sprint de 4–6 semanas montado a partir da seção "Prioridade
alta" contém zero itens já implementados.

**Acceptance Scenarios**:

1. **Given** o product owner revisa Prioridade alta,
   **When** seleciona itens para o próximo ciclo,
   **Then** nenhum item marcado como implementado em "Pós-MVP" aparece como pendente.

---

### User Story 3 - Onboarding técnico com baseline confiável (Priority: P3)

Como **desenvolvedor novo**, quero saber o que existe no código vs. o que falta,
sem ler 600 linhas de DELIVERY.md e comparar manualmente com ROADMAP.

**Independent Test**: Desenvolvedor identifica em < 5 min se "e-mail transacional"
é greenfield (não — serviço existe, falta wiring).

**Acceptance Scenarios**:

1. **Given** um desenvolvedor consulta "E-mail transacional",
   **When** lê status "Parcial",
   **Then** entende que `notification-service` existe mas não é chamado na emissão.

---

### Edge Cases

- Item implementado em um fluxo mas não em outro (ex.: painel PDF em `/certificados`
  mas não na tela de resultado da prova): documentado como implementado com nota
  de escopo.
- Documentação fonte (`ROADMAP-MELHORIAS.md`) permanece desatualizada até ciclo
  de manutenção de docs; esta spec prevalece como baseline Spec Kit.
- Spec técnica de observabilidade (`docs/specs/observability/SPEC.md`) permanece
  separada; status real refletido aqui como "Parcial".

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: A baseline DEVE distinguir MVP entregue, pós-MVP implementado e
  backlog genuinamente pendente.
- **FR-002**: Cada item movido do backlog para "implementado" DEVE ter evidência
  rastreável a arquivos em `apps/`, `packages/` ou `supabase/`.
- **FR-003**: Itens parciais DEVEM indicar explicitamente o que falta, sem
  classificá-los como totalmente implementados ou totalmente ausentes.
- **FR-004**: A baseline DEVE ser atualizada quando auditorias de código
  subsequentes identificarem novas divergências doc vs. código.
- **FR-005**: Fases estratégicas 2–8 permanecem no backlog até primeira
  implementação verificável no código.
- **FR-006**: A baseline NÃO DEVE contradizer `.specify/memory/constitution.md`.
- **FR-007**: Novas features do backlog genuíno DEVEM ser especificadas via
  `/speckit-specify` com numeração sequencial (`003-`, `004-`…).

### Key Entities

- **Capacidade Existente**: Funcionalidade verificada no código e disponível ao usuário.
- **Capacidade Parcial**: Implementação iniciada com gaps documentados.
- **Item de Backlog Pendente**: Planejado mas sem implementação verificável no código.
- **Evidência de Código**: Referência a arquivo(s) que comprovam implementação.
- **Divergência Doc-Código**: Item documentado como pendente mas já implementado.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: 100% dos itens de alta prioridade em ROADMAP-MELHORIAS têm status
  real correto (implementado, parcial ou pendente).
- **SC-002**: Zero itens totalmente implementados permanecem no backlog como
  "pendente".
- **SC-003**: Cada item em "Pós-MVP Já Implementado" tem pelo menos um caminho
  de arquivo como evidência.
- **SC-004**: Um planejador monta sprint de 4–6 semanas sem incluir trabalho
  já concluído.
- **SC-005**: Desenvolvedor identifica status de qualquer item de alta prioridade
  em menos de 2 minutos consultando esta spec.

## Assumptions

- Auditoria realizada em 2026-06-14 cobrindo `apps/`, `packages/`, `supabase/`.
- `docs/ROADMAP-MELHORIAS.md` e `docs/ROADMAP.md` **não foram alterados** nesta
  iteração; divergências são corrigidas nesta spec baseline.
- Itens "parciais" permanecem no backlog com escopo reduzido ao gap restante.
- Próxima manutenção de docs fonte (`docs/`) deve sincronizar com esta baseline.

## Referências

| Documento                                 | Papel                                        |
| ----------------------------------------- | -------------------------------------------- |
| `specs/002-baseline-reality-sync/spec.md` | Spec da auditoria que gerou esta atualização |
| `README.md`                               | Visão geral do produto                       |
| `docs/DELIVERY.md`                        | Histórico das 8 etapas MVP                   |
| `docs/ROADMAP-MELHORIAS.md`               | Fonte original do backlog (desatualizada)    |
| `docs/ROADMAP.md`                         | Fases estratégicas pós-MVP                   |
| `.specify/memory/constitution.md`         | Governança do projeto                        |
