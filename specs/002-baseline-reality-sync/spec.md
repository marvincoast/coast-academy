# Feature Specification: Sincronização Baseline com Estado Real do Código

**Feature Branch**: `002-baseline-reality-sync`

**Created**: 2026-06-14

**Status**: Complete

**Input**: User description: "Faça uma revisão completa em todas as pastas de código do projeto (apps/, packages/, supabase/) para identificar quais funcionalidades do roadmap e melhorias já foram implementadas na prática e ainda não foram atualizadas na nossa documentação. Atualize a especificação de baseline dentro de .specify para refletir o estado real atual do Coast Academy, movendo os itens já codados do backlog para a seção de funcionalidades existentes."

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Auditar código vs. documentação (Priority: P1)

Como **mantenedor do Spec Kit**, quero uma auditoria sistemática do código contra
o backlog documentado, para que a baseline reflita a realidade e não promessas
desatualizadas.

**Why this priority**: Sem auditoria, 40% dos itens de alta prioridade apareciam
como pendentes apesar de já estarem codificados.

**Independent Test**: Cada item de ROADMAP-MELHORIAS alta prioridade tem status
`IMPLEMENTADO`, `PARCIAL` ou `PENDENTE` com evidência de arquivo.

**Acceptance Scenarios**:

1. **Given** o auditor revisa `apps/`, `packages/`, `supabase/`,
   **When** compara com backlog em ROADMAP-MELHORIAS,
   **Then** identifica divergências doc-código para cada item.
2. **Given** um item está implementado no código,
   **When** a baseline `001` é atualizada,
   **Then** o item migra para "Pós-MVP Já Implementado".

---

### User Story 2 - Atualizar baseline Spec Kit (Priority: P2)

Como **product owner**, quero que `specs/001-product-vision-backlog/spec.md`
seja a fonte de verdade atualizada, para planejar sprints sem retrabalho.

**Why this priority**: A spec 001 era baseada apenas em docs escritos, não em código.

**Independent Test**: Abrir spec 001 e verificar que fluxo pós-prova, painel PDF,
storage dual e idempotência não estão mais no backlog pendente.

**Acceptance Scenarios**:

1. **Given** a auditoria identificou 7 itens implementados não documentados,
   **When** spec 001 é atualizada,
   **Then** esses itens aparecem em "Pós-MVP Já Implementado".
2. **Given** itens parciais (e-mail, progresso dashboard, PDF v2),
   **When** spec 001 é atualizada,
   **Then** backlog mostra status "Parcial" com gap explícito.

---

### User Story 3 - Registrar achados para manutenção futura (Priority: P3)

Como **equipe de engenharia**, quero um registro dos gaps de maior impacto
encontrados na auditoria, para priorizar correções técnicas.

**Why this priority**: Auditoria revelou riscos não listados no roadmap original.

**Independent Test**: Esta spec lista os 4 gaps de maior impacto com área afetada.

**Acceptance Scenarios**:

1. **Given** a auditoria encontrou wiring ausente (certificado → e-mail),
   **When** consulto esta spec,
   **Then** o gap está documentado em Assumptions / Edge Cases.

---

### Edge Cases

- Componentes de UI de mercado vivem em `apps/web` e não em `@coast-academy/ui`:
  documentado como parcial no design system.
- `match_knowledge_chunks` com dimensão 1536 vs. coluna 768: risco técnico RAG
  documentado no backlog médio, não bloqueia esta spec.
- Docs fonte (`docs/ROADMAP-MELHORIAS.md`) permanecem desatualizados; correção
  de docs é escopo de manutenção separada.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: A auditoria DEVE cobrir `apps/` (7 aplicações), `packages/` (4
  pacotes) e `supabase/` (migrations + seeds).
- **FR-002**: Cada item de ROADMAP-MELHORIAS alta e média prioridade DEVE receber
  classificação: Implementado, Parcial ou Pendente.
- **FR-003**: Itens implementados DEVEM ser movidos da seção backlog para
  "Pós-MVP Já Implementado" em `specs/001-product-vision-backlog/spec.md`.
- **FR-004**: Itens parciais DEVEM permanecer no backlog com descrição do gap.
- **FR-005**: Cada item implementado DEVE citar pelo menos um caminho de arquivo
  como evidência.
- **FR-006**: A spec 001 DEVE ter campo `Last Audited` com data da auditoria.
- **FR-007**: Gaps de alto impacto identificados DEVEM ser registrados:
  e-mail não conectado, E2E crítico ausente, RAG dimensão embedding, Redis sem uso.

### Key Entities

- **Auditoria de Código**: Revisão sistemática de implementação vs. documentação.
- **Divergência Doc-Código**: Item documentado como pendente mas existente no código.
- **Evidência**: Caminho de arquivo que comprova implementação.
- **Gap**: Porção não implementada de um item parcial.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: 100% dos 10 itens de alta prioridade em ROADMAP-MELHORIAS auditados
  e classificados.
- **SC-002**: 4 itens implementados removidos do backlog pendente na spec 001.
- **SC-003**: 3 itens parciais de alta prioridade documentados com gap explícito.
- **SC-004**: Spec 001 atualizada com seção "Pós-MVP Já Implementado" contendo
  ≥ 10 capacidades verificadas.
- **SC-005**: Zero itens totalmente implementados classificados como "Pendente"
  na baseline atualizada.

## Resultado da Auditoria (resumo)

### Movidos para "Implementado" (eram backlog pendente)

| Item                      | Evidência principal                                                           |
| ------------------------- | ----------------------------------------------------------------------------- |
| Fluxo pós–Prova Final     | `apps/web/src/pages/assessment/SimuladoPage.tsx`                              |
| Painel PDF com hide       | `apps/web/src/components/certificates/CertificatePdfSidePanel.tsx`            |
| Storage Appwrite/Supabase | `apps/certificate-service/src/certificate/certificate-pdf-storage.service.ts` |
| Idempotência emissão      | `apps/certificate-service/src/certificate/certificate.service.ts`             |

### Permanecem como Parcial

| Item                      | Gap principal                                               |
| ------------------------- | ----------------------------------------------------------- |
| Progresso até Prova Final | Falta copy "falta X módulos" + CTA direto                   |
| E-mail transacional       | Serviço existe; não wired na emissão; sem lembrete simulado |
| Template PDF v2           | Sem logo, assinatura, número de série                       |
| Health + smoke CI         | `/health` ok; CI não roda smoke de stack                    |
| Observabilidade           | Pino/Prometheus ok; OTEL só certificate-service             |
| i18n                      | pt-BR parcial; sem en; SimuladoPage hardcoded               |
| OpenAPI + Zod frontend    | Schemas existem; Swagger e parse frontend ausentes          |

### Permanecem como Pendente

| Item                                  |
| ------------------------------------- |
| E2E login → prova → certificado → PDF |
| Regenerar PDF em lote (admin)         |
| Fila de emissão em pico               |
| Eventos assíncronos                   |
| Cache Redis integrado                 |
| Fases estratégicas 2–8                |

### Gaps de alto impacto (novos achados)

1. **E-mail de certificado não disparado** após emissão bem-sucedida.
2. **Fluxo crítico sem E2E** — maior risco de regressão silenciosa.
3. **RAG embedding 768 vs. RPC 1536** — possível falha em busca vetorial Ollama.
4. **Redis no Compose sem uso** — infra morta até integração.

## Assumptions

- Auditoria baseada em análise estática do código (sem execução de testes E2E).
- `docs/ROADMAP-MELHORIAS.md` não é alterado nesta iteração; spec 001 prevalece.
- Itens de roadmap estratégico (Fases 2–8) permanecem pendentes salvo schema US.
- Observabilidade LGTM: infra existe; integração OTEL completa nos serviços é parcial.
- Baseline atualizada em `specs/001-product-vision-backlog/spec.md`.
- `.specify/feature.json` aponta para `specs/002-baseline-reality-sync`.
