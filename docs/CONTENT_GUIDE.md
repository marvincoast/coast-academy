# Guia de conteúdo — Felix Empire Trading

> Esta é a **rubrica oficial** para criar e revisar questões e materiais didáticos do curso.

## Escopo do MVP (mercado BR)

- **Tape reading e análise de fluxo** do mini-dólar (WDO) e dólar cheio (DOL) na B3.
- Foco no operacional intradiário; **sem recomendação de trade ao vivo**.

## Tags canônicas

Todas as tags estão em `packages/shared-types/src/domain/question-tag.ts`. Não invente tags fora dessa lista; se faltar, abra ADR e atualize o enum + esta tabela.

| Tag | Quando usar |
|-----|-------------|
| `absorcao_preco_fixo` | Player segura preço sem deixar romper |
| `absorcao_multiplos_niveis` | Absorção que se desloca por vários níveis |
| `exaustao_compradora` | Compradores agredindo sem deslocar preço (vendedor mais forte) |
| `exaustao_vendedora` | Espelho da anterior, vendedor agressivo sem vencer compra |
| `escora_player` | Sustentação clara por player identificável |
| `iceberg_lote_escondido` | Oferta passiva que não some apesar das execuções |
| `range_volatilidade_dia` | Range típico baseado no comportamento do dia |
| `zona_0_5` / `zona_1_0` / `zona_1_5` | Variações % do dia como referência |
| `book_ofertas` | Leitura do livro (profundidade, desequilíbrios) |
| `times_and_trades` | Leitura da fita: agressões, lotes, sequência |
| `macroeconomia_brasil` | Copom, IPCA, fluxo cambial, dívida |
| `macroeconomia_global` | Fed, payroll, DXY, riscos globais |
| `gestao_risco` | (Reservado para módulos futuros) |
| `psicologia_operacional` | (Reservado para módulos futuros) |

## Distribuição alvo do seed (~100 questões)

Espelhada em `TARGET_SEED_DISTRIBUTION` no shared-types. Soma alvo ≈ 100.
Manter sincronizado entre código e este doc.

## Rubrica de qualidade de uma questão

Toda questão deve:

1. Ter **enunciado** claro (sem ambiguidade), em pt-BR.
2. Vir com **4 alternativas**, exatamente **1 correta**.
3. Apresentar **distratores plausíveis** (erros frequentes de leitura).
4. Ter **rationale** de pelo menos 2 frases (usado pelo RAG e pela tela de revisão).
5. Indicar **tag canônica** e **dificuldade** (`easy`, `medium`, `hard`).
6. Se usar mídia (image/video), o arquivo deve estar no Storage e ter `mediaUrl` válida.
7. Para `market`: `BR` no MVP; `US` reservado para Fase 2.

## Referências (curadoria interna)

A lista canônica de referências bibliográficas e materiais entra em `supabase/seed/glossary.md` (Etapa 4/7). Não usar referências fora desse arquivo na ingestão do RAG.
