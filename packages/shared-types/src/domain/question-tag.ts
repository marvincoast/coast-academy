import { z } from 'zod';

/**
 * Tags canonicas das questoes do curso Coast Academy.
 * Cobrem os temas listados no escopo: tape reading do dolar BRL.
 *
 * Manter sincronizado com:
 *   - docs/CONTENT_GUIDE.md
 *   - supabase/migrations (enum/tabela question_tag)
 *   - apps/web tema de cores por tag
 */
export const QuestionTagSchema = z.enum([
  // Comportamento de fluxo
  'absorcao_preco_fixo',
  'absorcao_multiplos_niveis',
  'exaustao_compradora',
  'exaustao_vendedora',
  'escora_player',
  'iceberg_lote_escondido',

  // Volatilidade e zonas
  'range_volatilidade_dia',
  'zona_0_5',
  'zona_1_0',
  'zona_1_5',

  // Microestrutura
  'book_ofertas',
  'times_and_trades',

  // Macro
  'macroeconomia_brasil',
  'macroeconomia_global',

  // Operacional
  'gestao_risco',
  'psicologia_operacional',
]);

export type QuestionTag = z.infer<typeof QuestionTagSchema>;

export const QUESTION_TAG_LABELS: Record<QuestionTag, string> = {
  absorcao_preco_fixo: 'Absorção em preço fixo',
  absorcao_multiplos_niveis: 'Absorção em múltiplos níveis',
  exaustao_compradora: 'Exaustão compradora',
  exaustao_vendedora: 'Exaustão vendedora',
  escora_player: 'Escora de player',
  iceberg_lote_escondido: 'Iceberg (lote escondido)',
  range_volatilidade_dia: 'Range de volatilidade do dia',
  zona_0_5: 'Zona de 0,5%',
  zona_1_0: 'Zona de 1,0%',
  zona_1_5: 'Zona de 1,5%',
  book_ofertas: 'Book de ofertas',
  times_and_trades: 'Times & Trades',
  macroeconomia_brasil: 'Macroeconomia (Brasil)',
  macroeconomia_global: 'Macroeconomia (Global)',
  gestao_risco: 'Gestão de risco',
  psicologia_operacional: 'Psicologia operacional',
};

/**
 * Distribuicao alvo de questoes para o seed inicial (~100).
 * Detalhada em docs/CONTENT_GUIDE.md.
 */
export const TARGET_SEED_DISTRIBUTION: Record<QuestionTag, number> = {
  absorcao_preco_fixo: 8,
  absorcao_multiplos_niveis: 7,
  exaustao_compradora: 6,
  exaustao_vendedora: 6,
  escora_player: 10,
  iceberg_lote_escondido: 10,
  range_volatilidade_dia: 12,
  zona_0_5: 4,
  zona_1_0: 4,
  zona_1_5: 3,
  book_ofertas: 12,
  times_and_trades: 10,
  macroeconomia_brasil: 5,
  macroeconomia_global: 3,
  gestao_risco: 0,
  psicologia_operacional: 0,
};
