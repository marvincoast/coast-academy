-- =============================================================
-- Seed: Question Bank — Coast Academy
-- 100 questions covering all 8 modules (tape reading, BR dollar)
-- Assessments: 8 simulados (10 q each) + 1 prova final (40 q)
-- =============================================================

do $$
declare
  -- Tags
  t_fund   uuid := 'f0000000-0000-0000-0000-000000000001'; -- fundamentos
  t_book   uuid := 'f0000000-0000-0000-0000-000000000002'; -- book-de-ofertas
  t_tnt    uuid := 'f0000000-0000-0000-0000-000000000003'; -- times-and-trades
  t_abs    uuid := 'f0000000-0000-0000-0000-000000000004'; -- absorcao
  t_exh    uuid := 'f0000000-0000-0000-0000-000000000005'; -- exaustao
  t_esc    uuid := 'f0000000-0000-0000-0000-000000000006'; -- escora
  t_ice    uuid := 'f0000000-0000-0000-0000-000000000007'; -- iceberg
  t_rng    uuid := 'f0000000-0000-0000-0000-000000000008'; -- range-zonas
  t_mac    uuid := 'f0000000-0000-0000-0000-000000000009'; -- macroeconomia
  t_seg    uuid := 'f0000000-0000-0000-0000-000000000010'; -- seguranca-risco

  -- Course / Module IDs (from seed 01)
  v_course uuid := 'c0000000-0000-0000-0000-000000000001';
  v_mod1   uuid := 'a0000000-0000-0000-0000-000000000001';
  v_mod2   uuid := 'a0000000-0000-0000-0000-000000000002';
  v_mod3   uuid := 'a0000000-0000-0000-0000-000000000003';
  v_mod4   uuid := 'a0000000-0000-0000-0000-000000000004';
  v_mod5   uuid := 'a0000000-0000-0000-0000-000000000005';
  v_mod6   uuid := 'a0000000-0000-0000-0000-000000000006';
  v_mod7   uuid := 'a0000000-0000-0000-0000-000000000007';
  v_mod8   uuid := 'a0000000-0000-0000-0000-000000000008';

  -- Assessment IDs
  a_sim1   uuid := 'e0000000-0001-0000-0000-000000000001';
  a_sim2   uuid := 'e0000000-0002-0000-0000-000000000001';
  a_sim3   uuid := 'e0000000-0003-0000-0000-000000000001';
  a_sim4   uuid := 'e0000000-0004-0000-0000-000000000001';
  a_sim5   uuid := 'e0000000-0005-0000-0000-000000000001';
  a_sim6   uuid := 'e0000000-0006-0000-0000-000000000001';
  a_sim7   uuid := 'e0000000-0007-0000-0000-000000000001';
  a_sim8   uuid := 'e0000000-0008-0000-0000-000000000001';
  a_final  uuid := 'e0000000-ffff-0000-0000-000000000001';

  -- Helper variable for current question ID
  q uuid;

begin

-- ──────────────────────────────────────────────────────────────
-- TAGS
-- ──────────────────────────────────────────────────────────────
insert into public.question_tags (id, slug, label) values
  (t_fund, 'fundamentos',      'Fundamentos'),
  (t_book, 'book-de-ofertas',  'Book de Ofertas'),
  (t_tnt,  'times-and-trades', 'Times & Trades'),
  (t_abs,  'absorcao',         'Absorção'),
  (t_exh,  'exaustao',         'Exaustão'),
  (t_esc,  'escora',           'Escora de Player'),
  (t_ice,  'iceberg',          'Iceberg'),
  (t_rng,  'range-zonas',      'Range e Zonas'),
  (t_mac,  'macroeconomia',    'Macroeconomia'),
  (t_seg,  'risco',            'Gestão de Risco')
on conflict (slug) do nothing;

-- ──────────────────────────────────────────────────────────────
-- HELPER MACRO: insert_q(id, stem, explanation, diff, tag_ids[])
-- We use individual inserts for clarity
-- ──────────────────────────────────────────────────────────────

-- ══════════════════════════════════════════════════════════════
-- MÓDULO 1 — FUNDAMENTOS (Q001–Q013)
-- ══════════════════════════════════════════════════════════════

-- Q001
q := 'f0010000-0000-0000-0000-000000000001';
insert into public.questions (id, stem, explanation, difficulty) values (q,
  'Qual instrumento era originalmente usado para transmitir cotações de bolsa antes dos computadores, dando origem ao termo "tape reading"?',
  'O telégrafo imprimia as cotações em fitas de papel (ticker tape). Traders como Jesse Livermore aprenderam a ler esses dados brutos para antecipar movimentos de preço.',
  1) on conflict (id) do nothing;
insert into public.question_options (question_id, text, is_correct, order_index) values
  (q, 'Telégrafo com fita de papel (ticker tape)', true,  0),
  (q, 'Telefone com operador especializado',        false, 1),
  (q, 'Rádio AM com transmissão ao vivo',           false, 2),
  (q, 'Jornal impresso com cotações diárias',       false, 3)
on conflict (question_id, order_index) do nothing;
insert into public.question_question_tags values (q, t_fund) on conflict do nothing;

-- Q002
q := 'f0010000-0000-0000-0000-000000000002';
insert into public.questions (id, stem, explanation, difficulty) values (q,
  'O dólar futuro cheio (DOL) na B3 tem qual tamanho de contrato?',
  'O DOL equivale a USD 50.000 por contrato. A variação mínima (tick) de R$ 0,50 representa R$ 25,00 por contrato. Já o WDO tem USD 10.000 e R$ 5,00 por tick.',
  1) on conflict (id) do nothing;
insert into public.question_options (question_id, text, is_correct, order_index) values
  (q, 'USD 50.000',  true,  0),
  (q, 'USD 10.000',  false, 1),
  (q, 'USD 100.000', false, 2),
  (q, 'USD 25.000',  false, 3)
on conflict (question_id, order_index) do nothing;
insert into public.question_question_tags values (q, t_fund) on conflict do nothing;

-- Q003
q := 'f0010000-0000-0000-0000-000000000003';
insert into public.questions (id, stem, explanation, difficulty) values (q,
  'Um tick de variação no mini dólar (WDO) equivale a quantos reais por contrato?',
  'O WDO tem tick de R$ 0,50 = R$ 5,00 por contrato (USD 10.000). O DOL tem o mesmo tick de R$ 0,50, mas equivale a R$ 25,00 por contrato (USD 50.000).',
  1) on conflict (id) do nothing;
insert into public.question_options (question_id, text, is_correct, order_index) values
  (q, 'R$ 5,00',  true,  0),
  (q, 'R$ 25,00', false, 1),
  (q, 'R$ 10,00', false, 2),
  (q, 'R$ 50,00', false, 3)
on conflict (question_id, order_index) do nothing;
insert into public.question_question_tags values (q, t_fund) on conflict do nothing;

-- Q004
q := 'f0010000-0000-0000-0000-000000000004';
insert into public.questions (id, stem, explanation, difficulty) values (q,
  'Qual a principal diferença entre tape reading e análise técnica tradicional?',
  'Tape reading opera com dados de fluxo em tempo real (book e T&T), sem atraso. A análise técnica usa preço histórico e tem atraso inerente. O gráfico é contexto; o tape é o gatilho.',
  2) on conflict (id) do nothing;
insert into public.question_options (question_id, text, is_correct, order_index) values
  (q, 'Tape reading usa fluxo de ordens em tempo real; análise técnica usa preço histórico com atraso', true,  0),
  (q, 'Tape reading é mais adequado para operações de longo prazo', false, 1),
  (q, 'Análise técnica é superior em dias de alta volatilidade',    false, 2),
  (q, 'Tape reading exige menos conhecimento técnico que AT',       false, 3)
on conflict (question_id, order_index) do nothing;
insert into public.question_question_tags values (q, t_fund) on conflict do nothing;

-- Q005
q := 'f0010000-0000-0000-0000-000000000005';
insert into public.questions (id, stem, explanation, difficulty) values (q,
  'Qual o horário de negociação eletrônico do dólar futuro (DOL/WDO) na B3?',
  'O mercado eletrônico opera das 09:00 às 18:00 (horário de Brasília). Após isso há apenas um período de ajuste até 18:30. Fora desse horário não há liquidez para tape reading.',
  1) on conflict (id) do nothing;
insert into public.question_options (question_id, text, is_correct, order_index) values
  (q, '09:00 às 18:00 (horário de Brasília)', true,  0),
  (q, '08:00 às 17:00',                       false, 1),
  (q, '10:00 às 18:30',                       false, 2),
  (q, '09:30 às 17:30',                       false, 3)
on conflict (question_id, order_index) do nothing;
insert into public.question_question_tags values (q, t_fund) on conflict do nothing;

-- Q006
q := 'f0010000-0000-0000-0000-000000000006';
insert into public.questions (id, stem, explanation, difficulty) values (q,
  'Quem são os "market makers" no mercado de dólar futuro e qual seu papel?',
  'Market makers (grandes bancos) são formadores de mercado: sempre oferecem preços de compra e venda. Eles criam liquidez e gerenciam o spread e a exposição cambial da carteira.',
  2) on conflict (id) do nothing;
insert into public.question_options (question_id, text, is_correct, order_index) values
  (q, 'Grandes bancos que sempre oferecem preços de compra e venda, criando liquidez', true,  0),
  (q, 'Fundos que especulam na direção do câmbio',                                    false, 1),
  (q, 'Empresas exportadoras que vendem dólar no spot',                                false, 2),
  (q, 'Traders de varejo com maior volume no mês',                                    false, 3)
on conflict (question_id, order_index) do nothing;
insert into public.question_question_tags values (q, t_fund) on conflict do nothing;

-- Q007
q := 'f0010000-0000-0000-0000-000000000007';
insert into public.questions (id, stem, explanation, difficulty) values (q,
  'Por que um exportador vende dólar futuro no mercado de câmbio?',
  'Exportadores recebem dólares pela venda de produtos/commodities. Para eliminar o risco cambial, vendem dólar futuro (hedge). Isso cria pressão vendedora consistente no mercado.',
  2) on conflict (id) do nothing;
insert into public.question_options (question_id, text, is_correct, order_index) values
  (q, 'Para proteger receitas em real contra variações do câmbio (hedge)',              true,  0),
  (q, 'Para especular na queda do dólar e obter lucro financeiro',                     false, 1),
  (q, 'Para cumprir exigência regulatória do Banco Central',                           false, 2),
  (q, 'Para compensar posições compradas em renda variável americana',                 false, 3)
on conflict (question_id, order_index) do nothing;
insert into public.question_question_tags values (q, t_fund) on conflict do nothing;

-- Q008
q := 'f0010000-0000-0000-0000-000000000008';
insert into public.questions (id, stem, explanation, difficulty) values (q,
  'O que é um "agressor" no mercado financeiro?',
  'Agressor é o participante que entra a mercado, aceitando o preço do passivo (market maker ou quem colocou ordem limitada). A agressão revela urgência e intenção real do operador.',
  2) on conflict (id) do nothing;
insert into public.question_options (question_id, text, is_correct, order_index) values
  (q, 'Participante que entra a mercado aceitando o preço disponível no book',  true,  0),
  (q, 'Participante que coloca ordens limitadas aguardando execução',            false, 1),
  (q, 'Algoritmo que cancela ordens antes da execução',                          false, 2),
  (q, 'Trader que opera contra a tendência principal do dia',                    false, 3)
on conflict (question_id, order_index) do nothing;
insert into public.question_question_tags values (q, t_fund) on conflict do nothing;

-- Q009
q := 'f0010000-0000-0000-0000-000000000009';
insert into public.questions (id, stem, explanation, difficulty) values (q,
  'Qual é o vencimento padrão dos contratos de dólar futuro (DOL/WDO) na B3?',
  'Os contratos vencem mensalmente no primeiro dia útil de cada mês. O código inclui mês e ano: ex. DOLM25 = junho de 2025.',
  1) on conflict (id) do nothing;
insert into public.question_options (question_id, text, is_correct, order_index) values
  (q, 'Mensal — primeiro dia útil de cada mês',   true,  0),
  (q, 'Trimestral — março, junho, setembro, dez',  false, 1),
  (q, 'Semanal — toda sexta-feira',                false, 2),
  (q, 'Semestral — janeiro e julho',               false, 3)
on conflict (question_id, order_index) do nothing;
insert into public.question_question_tags values (q, t_fund) on conflict do nothing;

-- Q010
q := 'f0010000-0000-0000-0000-000000000010';
insert into public.questions (id, stem, explanation, difficulty) values (q,
  'O que significa dizer que o varejo é a "liquidez" que os grandes players buscam?',
  'Players institucionais precisam de contraparte para executar grandes volumes. O varejo entra tipicamente no lado errado da operação, fornecendo liquidez para o lado institucional sair.',
  3) on conflict (id) do nothing;
insert into public.question_options (question_id, text, is_correct, order_index) values
  (q, 'O varejo frequentemente é a contraparte que permite que players grandes executem posições opostas', true,  0),
  (q, 'O varejo fornece capital para a B3 garantir as negociações',                                       false, 1),
  (q, 'O varejo gera mais volume que os institucionais no dólar futuro',                                  false, 2),
  (q, 'Players grandes seguem o varejo por ser um indicador avançado',                                    false, 3)
on conflict (question_id, order_index) do nothing;
insert into public.question_question_tags values (q, t_fund) on conflict do nothing;

-- Q011
q := 'f0010000-0000-0000-0000-000000000011';
insert into public.questions (id, stem, explanation, difficulty) values (q,
  'Por que o WDO (mini dólar) é mais adequado para iniciantes em tape reading do que o DOL cheio?',
  'O WDO tem margem e risco por tick (R$ 5,00) significativamente menores que o DOL (R$ 25,00/tick), permitindo gerenciamento de risco mais acessível enquanto o trader desenvolve a leitura de fluxo.',
  1) on conflict (id) do nothing;
insert into public.question_options (question_id, text, is_correct, order_index) values
  (q, 'Menor risco financeiro por tick (R$ 5,00 vs R$ 25,00) facilita o aprendizado',   true,  0),
  (q, 'O WDO tem mais liquidez que o DOL, revelando melhor o fluxo institucional',       false, 1),
  (q, 'O WDO opera em horário mais longo, dando mais oportunidades',                     false, 2),
  (q, 'No WDO o spread é maior, facilitando leituras de book',                           false, 3)
on conflict (question_id, order_index) do nothing;
insert into public.question_question_tags values (q, t_fund) on conflict do nothing;

-- Q012
q := 'f0010000-0000-0000-0000-000000000012';
insert into public.questions (id, stem, explanation, difficulty) values (q,
  'Como o tape reader usa o gráfico de velas em sua análise?',
  'O gráfico de velas é usado como CONTEXTO (tendência, zonas macro, suporte/resistência). O tape (book + T&T) é o GATILHO de entrada. Nunca opere só pelo gráfico sem confirmar no fluxo.',
  2) on conflict (id) do nothing;
insert into public.question_options (question_id, text, is_correct, order_index) values
  (q, 'Como contexto de tendência e zonas; o gatilho de entrada vem sempre do fluxo (book + T&T)', true,  0),
  (q, 'O tape reader ignora completamente gráficos, usando apenas o book',                          false, 1),
  (q, 'O gráfico de 5 minutos substitui o T&T para identificar agressão',                          false, 2),
  (q, 'Gráfico é suficiente para operar dólar futuro, dispensando o book',                         false, 3)
on conflict (question_id, order_index) do nothing;
insert into public.question_question_tags values (q, t_fund) on conflict do nothing;

-- Q013
q := 'f0010000-0000-0000-0000-000000000013';
insert into public.questions (id, stem, explanation, difficulty) values (q,
  'Qual trader americano é considerado um dos maiores expoentes históricos do tape reading?',
  'Jesse Livermore (1877–1940) é um dos maiores operadores de todos os tempos. Ele aprendeu tape reading lendo fitas de telégrafo em "bucket shops" antes dos 20 anos e acumulou fortunas com leitura de fluxo puro.',
  1) on conflict (id) do nothing;
insert into public.question_options (question_id, text, is_correct, order_index) values
  (q, 'Jesse Livermore',    true,  0),
  (q, 'Warren Buffett',     false, 1),
  (q, 'George Soros',       false, 2),
  (q, 'Paul Tudor Jones',   false, 3)
on conflict (question_id, order_index) do nothing;
insert into public.question_question_tags values (q, t_fund) on conflict do nothing;

-- ══════════════════════════════════════════════════════════════
-- MÓDULO 2 — BOOK DE OFERTAS (Q014–Q026)
-- ══════════════════════════════════════════════════════════════

-- Q014
q := 'f0020000-0000-0000-0000-000000000001';
insert into public.questions (id, stem, explanation, difficulty) values (q,
  'No book de ofertas, o que representa o "Bid"?',
  'Bid = demanda = lado comprador. É o melhor preço que um comprador está disposto a pagar. O Ask (oferta) é o menor preço que um vendedor aceita. O spread é a diferença entre ambos.',
  1) on conflict (id) do nothing;
insert into public.question_options (question_id, text, is_correct, order_index) values
  (q, 'O melhor preço de compra disponível no book',            true,  0),
  (q, 'O melhor preço de venda disponível no book',             false, 1),
  (q, 'A diferença entre preço de compra e de venda',           false, 2),
  (q, 'O volume total de ordens compradoras no dia',            false, 3)
on conflict (question_id, order_index) do nothing;
insert into public.question_question_tags values (q, t_book) on conflict do nothing;

-- Q015
q := 'f0020000-0000-0000-0000-000000000002';
insert into public.questions (id, stem, explanation, difficulty) values (q,
  'Um spread de 2+ ticks no WDO durante o pregão normal é sinal de:',
  'No WDO o spread normal é 1 tick. Quando abre para 2+ ticks, indica iliquidez momentânea ou incerteza elevada (ex: aguardando notícia importante). Reduzir exposição ou aguardar normalização.',
  2) on conflict (id) do nothing;
insert into public.question_options (question_id, text, is_correct, order_index) values
  (q, 'Iliquidez momentânea ou incerteza elevada — melhor aguardar', true,  0),
  (q, 'Oportunidade de arbitragem entre bid e ask',                   false, 1),
  (q, 'Sinal de tendência forte, ideal para entrada',                 false, 2),
  (q, 'Comportamento normal em qualquer horário do pregão',           false, 3)
on conflict (question_id, order_index) do nothing;
insert into public.question_question_tags values (q, t_book) on conflict do nothing;

-- Q016
q := 'f0020000-0000-0000-0000-000000000003';
insert into public.questions (id, stem, explanation, difficulty) values (q,
  'O book exibe 800 contratos no bid e 60 no ask. O que esse desequilíbrio sugere?',
  'Desequilíbrio > 3:1 é relevante. 800 vs 60 é quase 13:1, sugerindo pressão compradora intensa. Mas atenção: pode ser liquidez artificial. Confirme no T&T se há agressão compradora real.',
  2) on conflict (id) do nothing;
insert into public.question_options (question_id, text, is_correct, order_index) values
  (q, 'Provável pressão compradora, mas confirmar no Times & Trades antes de operar',     true,  0),
  (q, 'Certeza de subida imediata; entrar comprado sem hesitar',                           false, 1),
  (q, 'Sinal de manipulação — nunca operar em desequilíbrios extremos',                   false, 2),
  (q, 'O lado vendedor está dominante, pois tem menos contratos e move o preço mais',     false, 3)
on conflict (question_id, order_index) do nothing;
insert into public.question_question_tags values (q, t_book) on conflict do nothing;

-- Q017
q := 'f0020000-0000-0000-0000-000000000004';
insert into public.questions (id, stem, explanation, difficulty) values (q,
  'Qual é o principal sinal que diferencia liquidez REAL de liquidez ARTIFICIAL no book?',
  'Liquidez real permanece e é executada quando o preço chega. Liquidez artificial (layering) desaparece antes da execução. Nunca aparece no T&T. Padrão: aparece → preço chega → cancela → repete.',
  3) on conflict (id) do nothing;
insert into public.question_options (question_id, text, is_correct, order_index) values
  (q, 'Liquidez real permanece e é executada; a artificial cancela quando o preço se aproxima', true,  0),
  (q, 'Liquidez artificial tem lotes maiores que a liquidez real',                               false, 1),
  (q, 'Liquidez real aparece apenas no DOL cheio, nunca no WDO',                                false, 2),
  (q, 'Não há como diferenciar liquidez real de artificial no book',                            false, 3)
on conflict (question_id, order_index) do nothing;
insert into public.question_question_tags values (q, t_book) on conflict do nothing;

-- Q018
q := 'f0020000-0000-0000-0000-000000000005';
insert into public.questions (id, stem, explanation, difficulty) values (q,
  'Uma ordem de 300 contratos está no bid do WDO. O preço se aproxima mas a ordem DESAPARECE antes de ser executada. Isso indica:',
  'Ordem que foge antes da execução é sinal clássico de layering/spoofing. O player cria percepção falsa de suporte para atrair compradores e vender para eles. A regra: "opere na direção da liquidez que absorve, não da que foge".',
  3) on conflict (id) do nothing;
insert into public.question_options (question_id, text, is_correct, order_index) values
  (q, 'Provável liquidez artificial (layering); o suporte é falso',                      true,  0),
  (q, 'O player comprou todo o estoque e a ordem foi completada',                        false, 1),
  (q, 'É comportamento normal; ordens grandes são sempre canceladas',                    false, 2),
  (q, 'Sinal de que o preço vai subir fortemente',                                       false, 3)
on conflict (question_id, order_index) do nothing;
insert into public.question_question_tags values (q, t_book) on conflict do nothing;

-- Q019
q := 'f0020000-0000-0000-0000-000000000006';
insert into public.questions (id, stem, explanation, difficulty) values (q,
  'O que caracteriza um suporte formado pelo book de ofertas?',
  'Suporte real pelo book = grande concentração de ordens compradoras que SE MANTÉM quando o preço chega, sendo progressivamente consumida e renovada. É mais confiável que suporte gráfico pois é dinheiro real.',
  2) on conflict (id) do nothing;
insert into public.question_options (question_id, text, is_correct, order_index) values
  (q, 'Concentração de ordens compradoras que permanecem e são renovadas quando o preço as alcança', true,  0),
  (q, 'Região de preço onde o gráfico tocou três vezes sem romper',                                  false, 1),
  (q, 'Nível onde o volume total do dia é maior',                                                    false, 2),
  (q, 'Preço exato de fechamento do dia anterior',                                                   false, 3)
on conflict (question_id, order_index) do nothing;
insert into public.question_question_tags values (q, t_book) on conflict do nothing;

-- Q020
q := 'f0020000-0000-0000-0000-000000000007';
insert into public.questions (id, stem, explanation, difficulty) values (q,
  'Por que players grandes "perfuram" levemente suportes gráficos conhecidos por todos?',
  'Suportes gráficos visíveis têm stops de compradores logo abaixo. Grandes players perfuram o nível para acionar esses stops (gerando liquidez vendedora) e então revertem, comprando mais barato. Confirme a reversão pelo T&T.',
  3) on conflict (id) do nothing;
insert into public.question_options (question_id, text, is_correct, order_index) values
  (q, 'Para acionar stops de compradores e capturar liquidez antes de reverter',              true,  0),
  (q, 'Porque a análise técnica está errada e suportes nunca funcionam',                      false, 1),
  (q, 'Para testar a resistência do mercado e depois confirmar tendência de queda',           false, 2),
  (q, 'Por falta de liquidez; o mercado naturalmente ultrapassa os níveis redondos',          false, 3)
on conflict (question_id, order_index) do nothing;
insert into public.question_question_tags values (q, t_book) on conflict do nothing;

-- Q021
q := 'f0020000-0000-0000-0000-000000000008';
insert into public.questions (id, stem, explanation, difficulty) values (q,
  'No método de leitura rápida do book, qual é o PRIMEIRO passo?',
  'Primeiro avalia-se o equilíbrio: qual lado tem mais volume? Desequilíbrio > 2:1 já é relevante. Depois vem profundidade, renovação e confirmação no T&T. Sempre em 30 segundos antes de qualquer entrada.',
  2) on conflict (id) do nothing;
insert into public.question_options (question_id, text, is_correct, order_index) values
  (q, 'Avaliar o equilíbrio: qual lado tem mais volume? (desequilíbrio > 2:1?)',   true,  0),
  (q, 'Verificar a velocidade da fita no Times & Trades',                           false, 1),
  (q, 'Calcular a zona de variação de 0,5% do dia',                                false, 2),
  (q, 'Confirmar a tendência no gráfico de 15 minutos',                            false, 3)
on conflict (question_id, order_index) do nothing;
insert into public.question_question_tags values (q, t_book) on conflict do nothing;

-- Q022
q := 'f0020000-0000-0000-0000-000000000009';
insert into public.questions (id, stem, explanation, difficulty) values (q,
  'A "profundidade" do book se refere a:',
  'Profundidade = quantidade total de ordens acumuladas em múltiplos níveis de preço, não apenas no melhor bid/ask. Maior profundidade = mais liquidez potencial, mas também mais chances de liquidez artificial.',
  1) on conflict (id) do nothing;
insert into public.question_options (question_id, text, is_correct, order_index) values
  (q, 'A quantidade de ordens acumuladas em múltiplos níveis de preço além do melhor bid/ask', true,  0),
  (q, 'O tamanho do spread entre bid e ask',                                                    false, 1),
  (q, 'A diferença entre o preço atual e o preço de ajuste anterior',                          false, 2),
  (q, 'O volume total negociado no dia até o momento',                                         false, 3)
on conflict (question_id, order_index) do nothing;
insert into public.question_question_tags values (q, t_book) on conflict do nothing;

-- Q023
q := 'f0020000-0000-0000-0000-000000000010';
insert into public.questions (id, stem, explanation, difficulty) values (q,
  'Qual é a regra fundamental ao identificar um suporte real pelo book e decidir comprar?',
  'A regra de ouro: opere na direção da liquidez que ABSORVE, não da que foge. Se a grande ordem compradora mantém o nível e consome a pressão vendedora, é suporte real. Se foge, é armadilha.',
  3) on conflict (id) do nothing;
insert into public.question_options (question_id, text, is_correct, order_index) values
  (q, 'Operar na direção da liquidez que absorve — não da que cancela antes da execução', true,  0),
  (q, 'Entrar logo que uma grande ordem aparecer no bid, sem esperar confirmação',         false, 1),
  (q, 'Comprar quando o spread fechar para zero',                                          false, 2),
  (q, 'Operar apenas quando o book estiver completamente equilibrado',                     false, 3)
on conflict (question_id, order_index) do nothing;
insert into public.question_question_tags values (q, t_book) on conflict do nothing;

-- Q024 (extra book)
q := 'f0020000-0000-0000-0000-000000000011';
insert into public.questions (id, stem, explanation, difficulty) values (q,
  'O que significa "renovação de ordens" no book e por que é relevante?',
  'Renovação = quando uma ordem grande é parcialmente consumida e imediatamente recolocada no mesmo nível. Indica liquidez real e intenção firme do player. Ordens não renovadas sugerem liquidez artificial.',
  2) on conflict (id) do nothing;
insert into public.question_options (question_id, text, is_correct, order_index) values
  (q, 'Reposição da ordem após consumo parcial, indicando intenção firme do player',        true,  0),
  (q, 'Cancelamento e recolocação da ordem em preço diferente',                             false, 1),
  (q, 'Substituição automática de ordens vencidas ao final do pregão',                     false, 2),
  (q, 'Duplicação de ordens para aumentar a percepção de liquidez',                        false, 3)
on conflict (question_id, order_index) do nothing;
insert into public.question_question_tags values (q, t_book) on conflict do nothing;

-- Q025 (extra book)
q := 'f0020000-0000-0000-0000-000000000012';
insert into public.questions (id, stem, explanation, difficulty) values (q,
  'No contexto do book, o que é "layering"?',
  'Layering é uma prática de colocar múltiplas ordens em diferentes níveis de preço para criar percepção falsa de profundidade/pressão, cancelando-as antes da execução. É manipulação de mercado e proibida pela CVM.',
  3) on conflict (id) do nothing;
insert into public.question_options (question_id, text, is_correct, order_index) values
  (q, 'Colocação de múltiplas ordens falsas para criar percepção de liquidez, canceladas antes da execução', true,  0),
  (q, 'Estratégia de entrada em lotes progressivos para reduzir preço médio',                               false, 1),
  (q, 'Técnica de leitura do book nível por nível, da base ao topo',                                       false, 2),
  (q, 'Sistema de ordens automáticas que renovam quando executadas',                                        false, 3)
on conflict (question_id, order_index) do nothing;
insert into public.question_question_tags values (q, t_book) on conflict do nothing;

-- Q026 (extra book)
q := 'f0020000-0000-0000-0000-000000000013';
insert into public.questions (id, stem, explanation, difficulty) values (q,
  'Um grande comprador quer acumular posição SEM revelar sua intenção. Qual ferramenta ele usa no book?',
  'Para não revelar a intenção, o player usa ordens iceberg (lote escondido) ou divide a entrada em muitos lotes pequenos ao longo do tempo. Ordens grandes visíveis moveriam o preço contra eles.',
  2) on conflict (id) do nothing;
insert into public.question_options (question_id, text, is_correct, order_index) values
  (q, 'Ordens iceberg que exibem apenas uma fração do volume real',                        true,  0),
  (q, 'Coloca uma ordem única gigante no bid e aguarda execução',                          false, 1),
  (q, 'Opera no after-hours quando o book está vazio',                                     false, 2),
  (q, 'Usa spreads maiores para esconder o volume real',                                   false, 3)
on conflict (question_id, order_index) do nothing;
insert into public.question_question_tags values (q, t_book) on conflict do nothing;

-- ══════════════════════════════════════════════════════════════
-- MÓDULO 3 — TIMES & TRADES (Q027–Q038)
-- ══════════════════════════════════════════════════════════════

-- Q027
q := 'f0030000-0000-0000-0000-000000000001';
insert into public.questions (id, stem, explanation, difficulty) values (q,
  'No Times & Trades, um negócio executado NO ASK significa:',
  'Negócio no ask = comprador agrediu, aceitando o preço do vendedor passivo. É agressão compradora. Negócio no bid = vendedor agrediu. Esta distinção é fundamental para ler o fluxo.',
  1) on conflict (id) do nothing;
insert into public.question_options (question_id, text, is_correct, order_index) values
  (q, 'Um comprador agrediu o mercado, aceitando o preço do vendedor passivo',  true,  0),
  (q, 'Um vendedor agrediu o mercado, aceitando o preço do comprador passivo',  false, 1),
  (q, 'O spread fechou momentaneamente para zero',                               false, 2),
  (q, 'Uma ordem iceberg foi parcialmente executada',                            false, 3)
on conflict (question_id, order_index) do nothing;
insert into public.question_question_tags values (q, t_tnt) on conflict do nothing;

-- Q028
q := 'f0030000-0000-0000-0000-000000000002';
insert into public.questions (id, stem, explanation, difficulty) values (q,
  'Para filtrar o ruído de varejo no Times & Trades do WDO, qual tamanho mínimo de lote é recomendado visualizar?',
  'Lotes menores que 5 contratos no WDO são ruído de varejo e poluem a leitura. Filtrando para ≥ 5 (WDO) ou ≥ 1 (DOL), o trader vê apenas fluxo relevante.',
  2) on conflict (id) do nothing;
insert into public.question_options (question_id, text, is_correct, order_index) values
  (q, '≥ 5 contratos',   true,  0),
  (q, '≥ 1 contrato',    false, 1),
  (q, '≥ 50 contratos',  false, 2),
  (q, '≥ 100 contratos', false, 3)
on conflict (question_id, order_index) do nothing;
insert into public.question_question_tags values (q, t_tnt) on conflict do nothing;

-- Q029
q := 'f0030000-0000-0000-0000-000000000003';
insert into public.questions (id, stem, explanation, difficulty) values (q,
  'A fita do T&T começa a desacelerar após um forte impulso comprador. Isso sugere:',
  'Desaceleração após impulso indica esgotamento de momentum. A fita mais lenta significa menos urgência compradora. Pode preceder consolidação ou reversão. Confirmar com lotes diminuindo.',
  2) on conflict (id) do nothing;
insert into public.question_options (question_id, text, is_correct, order_index) values
  (q, 'Possível esgotamento do movimento; possível consolidação ou reversão',        true,  0),
  (q, 'Sinal de aceleração iminente; preparar compra adicional',                     false, 1),
  (q, 'Comportamento normal — a fita sempre oscila entre rápido e lento',            false, 2),
  (q, 'Entrada de player institucional escondendo o fluxo',                          false, 3)
on conflict (question_id, order_index) do nothing;
insert into public.question_question_tags values (q, t_tnt) on conflict do nothing;

-- Q030
q := 'f0030000-0000-0000-0000-000000000004';
insert into public.questions (id, stem, explanation, difficulty) values (q,
  'Sequência no T&T: 120 contratos compra → 80 contratos compra → 35 contratos compra. O que isso indica?',
  'Lotes decrescentes em sequência são sinal clássico de exaustão compradora. O momentum está perdendo força. Diferente de lotes crescentes que indicam aceleração.',
  3) on conflict (id) do nothing;
insert into public.question_options (question_id, text, is_correct, order_index) values
  (q, 'Exaustão compradora — momentum perdendo força, possível reversão',          true,  0),
  (q, 'Consolidação saudável antes de nova alta',                                   false, 1),
  (q, 'Entrada progressiva de player institucional',                                false, 2),
  (q, 'Sinal neutro — volume decrescente é comum após rally',                      false, 3)
on conflict (question_id, order_index) do nothing;
insert into public.question_question_tags values (q, t_tnt) on conflict do nothing;

-- Q031
q := 'f0030000-0000-0000-0000-000000000005';
insert into public.questions (id, stem, explanation, difficulty) values (q,
  'Para o DOL cheio (não o WDO), qual tamanho de lote é considerado "institucional"?',
  'No DOL: grande = ≥ 10 contratos; institucional = ≥ 50 contratos. No WDO: grande = ≥ 50; institucional = ≥ 200. Valores menores são ruído de varejo.',
  2) on conflict (id) do nothing;
insert into public.question_options (question_id, text, is_correct, order_index) values
  (q, '≥ 50 contratos',  true,  0),
  (q, '≥ 200 contratos', false, 1),
  (q, '≥ 10 contratos',  false, 2),
  (q, '≥ 500 contratos', false, 3)
on conflict (question_id, order_index) do nothing;
insert into public.question_question_tags values (q, t_tnt) on conflict do nothing;

-- Q032
q := 'f0030000-0000-0000-0000-000000000006';
insert into public.questions (id, stem, explanation, difficulty) values (q,
  'Um grande lote aparece no T&T mas o preço NÃO se move. O que isso pode indicar?',
  'Grande lote sem impacto de preço = sinal de iceberg (alguém absorvendo a ordem) ou fechamento de posição existente. É necessário observar o book e o contexto para diferenciar.',
  3) on conflict (id) do nothing;
insert into public.question_options (question_id, text, is_correct, order_index) values
  (q, 'Pode ser iceberg (absorção passiva) ou encerramento de posição',              true,  0),
  (q, 'Confirma tendência forte; entrar no mesmo sentido',                            false, 1),
  (q, 'Erro no sistema; grandes lotes sempre movem o preço',                         false, 2),
  (q, 'Indica spread amplo impedindo movimento',                                     false, 3)
on conflict (question_id, order_index) do nothing;
insert into public.question_question_tags values (q, t_tnt) on conflict do nothing;

-- Q033
q := 'f0030000-0000-0000-0000-000000000007';
insert into public.questions (id, stem, explanation, difficulty) values (q,
  'Como calcular o saldo de fluxo dos últimos 60 segundos pelo T&T?',
  'Somar todos os contratos comprados e vendidos nos últimos 60s. Diferença > 30% em um sentido confirma a direção dominante. Ex: 500 compra, 200 venda = 60% compra = fluxo comprador dominante.',
  2) on conflict (id) do nothing;
insert into public.question_options (question_id, text, is_correct, order_index) values
  (q, 'Somar contratos comprados e vendidos; diferença > 30% confirma direção dominante',  true,  0),
  (q, 'Contar apenas os lotes maiores que 50 contratos em cada sentido',                   false, 1),
  (q, 'Dividir o volume total pelo número de negócios do período',                         false, 2),
  (q, 'Calcular a média ponderada dos preços dos últimos 20 negócios',                     false, 3)
on conflict (question_id, order_index) do nothing;
insert into public.question_question_tags values (q, t_tnt) on conflict do nothing;

-- Q034
q := 'f0030000-0000-0000-0000-000000000008';
insert into public.questions (id, stem, explanation, difficulty) values (q,
  'O que é "agressão unidirecional" no T&T e qual sua implicação operacional?',
  'Agressão unidirecional = sequência de negócios todos no mesmo lado (todos compra ou todos venda), sem alternância. Indica urgência e convicção de um lado. Sinal de entrada no lado dominante.',
  2) on conflict (id) do nothing;
insert into public.question_options (question_id, text, is_correct, order_index) values
  (q, 'Sequência de negócios num único sentido, indicando urgência; entrar no lado dominante',  true,  0),
  (q, 'Negócios se alternando entre compra e venda no mesmo preço',                            false, 1),
  (q, 'Um único negócio de lote muito grande que domina o período',                            false, 2),
  (q, 'Fita que acelera e freia alternadamente sem tendência definida',                        false, 3)
on conflict (question_id, order_index) do nothing;
insert into public.question_question_tags values (q, t_tnt) on conflict do nothing;

-- Q035
q := 'f0030000-0000-0000-0000-000000000009';
insert into public.questions (id, stem, explanation, difficulty) values (q,
  '"O book é intenção; o T&T é execução." O que essa afirmação significa na prática?',
  'O book mostra ordens passivas aguardando execução — intenção declarada. O T&T mostra negócios efetivamente realizados — execução real. Só a execução move o preço. Nunca opere pelo book sem confirmar no T&T.',
  3) on conflict (id) do nothing;
insert into public.question_options (question_id, text, is_correct, order_index) values
  (q, 'O book indica possível pressão, mas apenas negócios executados (T&T) movem o preço', true,  0),
  (q, 'O book é mais confiável que o T&T por mostrar mais contratos',                       false, 1),
  (q, 'Ambos são equivalentes; o trader pode usar qualquer um isoladamente',                false, 2),
  (q, 'O T&T mostra apenas ordens canceladas; o book mostra as executadas',                false, 3)
on conflict (question_id, order_index) do nothing;
insert into public.question_question_tags values (q, t_tnt) on conflict do nothing;

-- Q036
q := 'f0030000-0000-0000-0000-000000000010';
insert into public.questions (id, stem, explanation, difficulty) values (q,
  'A fita do T&T mostra negócios alternando rapidamente entre compra e venda sem domínio claro. Qual a melhor ação?',
  'Alternância equilibrada = mercado em equilíbrio, sem pressão clara de nenhum lado. Lateral ou indefinido. A melhor ação é aguardar definição — entrar em mercado balanceado é operar na sorte.',
  2) on conflict (id) do nothing;
insert into public.question_options (question_id, text, is_correct, order_index) values
  (q, 'Aguardar definição de fluxo; mercado equilibrado não oferece setup claro',    true,  0),
  (q, 'Comprar, pois equilíbrio precede alta estatisticamente',                       false, 1),
  (q, 'Vender, pois equilíbrio indica distribuição de grandes players',               false, 2),
  (q, 'Operar nos dois lados simultaneamente para capturar o rompimento',             false, 3)
on conflict (question_id, order_index) do nothing;
insert into public.question_question_tags values (q, t_tnt) on conflict do nothing;

-- Q037 (extra T&T)
q := 'f0030000-0000-0000-0000-000000000011';
insert into public.questions (id, stem, explanation, difficulty) values (q,
  'Qual informação NÃO está disponível no Times & Trades padrão?',
  'O T&T mostra: horário, preço, quantidade e direção (compra/venda). Não exibe a identidade do operador. Não é possível saber quem comprou ou vendeu — apenas que a transação ocorreu.',
  1) on conflict (id) do nothing;
insert into public.question_options (question_id, text, is_correct, order_index) values
  (q, 'Identidade do comprador ou vendedor da transação',   true,  0),
  (q, 'Horário exato da execução do negócio',               false, 1),
  (q, 'Quantidade de contratos negociados',                 false, 2),
  (q, 'Se foi compra ou venda (agressão)',                  false, 3)
on conflict (question_id, order_index) do nothing;
insert into public.question_question_tags values (q, t_tnt) on conflict do nothing;

-- Q038 (extra T&T)
q := 'f0030000-0000-0000-0000-000000000012';
insert into public.questions (id, stem, explanation, difficulty) values (q,
  'Lotes crescentes em sequência no T&T (20 → 50 → 120 → 250 contratos compra) indicam:',
  'Lotes crescentes = momentum acelerando. O player está com urgência crescente e convicção. Diferente de lotes decrescentes (exaustão). Sinal de entrada no lado crescente.',
  2) on conflict (id) do nothing;
insert into public.question_options (question_id, text, is_correct, order_index) values
  (q, 'Aceleração do momentum — player com urgência crescente; sinal de entrada no mesmo sentido', true,  0),
  (q, 'Exaustão — lotes grandes indicam que o movimento está terminando',                          false, 1),
  (q, 'Manipulação — nunca operar em lotes crescentes',                                            false, 2),
  (q, 'Sinal neutro — tamanho de lote não importa, apenas a direção',                             false, 3)
on conflict (question_id, order_index) do nothing;
insert into public.question_question_tags values (q, t_tnt) on conflict do nothing;

-- ══════════════════════════════════════════════════════════════
-- MÓDULO 4 — ABSORÇÃO (Q039–Q053)
-- ══════════════════════════════════════════════════════════════

-- Q039
q := 'f0040000-0000-0000-0000-000000000001';
insert into public.questions (id, stem, explanation, difficulty) values (q,
  'O que é "absorção" no contexto de tape reading?',
  'Absorção = um player grande aceita toda a pressão contrária sem deixar o preço se mover. O vendedor agride, mas um comprador absorve cada contrato. O preço fica travado apesar do alto volume.',
  1) on conflict (id) do nothing;
insert into public.question_options (question_id, text, is_correct, order_index) values
  (q, 'Um player aceita toda a pressão contrária, impedindo o preço de se mover',   true,  0),
  (q, 'O mercado entra em lateralização por falta de participantes',                 false, 1),
  (q, 'Um algoritmo cancela todas as ordens de um lado do book',                    false, 2),
  (q, 'O preço oscila entre dois níveis sem tendência definida por dias',            false, 3)
on conflict (question_id, order_index) do nothing;
insert into public.question_question_tags values (q, t_abs) on conflict do nothing;

-- Q040
q := 'f0040000-0000-0000-0000-000000000002';
insert into public.questions (id, stem, explanation, difficulty) values (q,
  'No T&T: 85, 120, 65 e 200 contratos vendidos consecutivos em 5.0500 sem queda de preço. Qual é a interpretação correta?',
  'Alto volume de agressão vendedora sem queda = absorção compradora. Alguém está comprando cada contrato vendido. O preço fica travado. Isso sinaliza que um player grande quer comprar nesse nível.',
  2) on conflict (id) do nothing;
insert into public.question_options (question_id, text, is_correct, order_index) values
  (q, 'Absorção compradora — alguém está comprando toda a pressão vendedora',       true,  0),
  (q, 'Falta de liquidez — o preço está travado por ausência de participantes',     false, 1),
  (q, 'Sinal de queda iminente — alta venda sem movimento é confirmação bearish',   false, 2),
  (q, 'Equilíbrio natural entre compradores e vendedores — sem viés',               false, 3)
on conflict (question_id, order_index) do nothing;
insert into public.question_question_tags values (q, t_abs) on conflict do nothing;

-- Q041
q := 'f0040000-0000-0000-0000-000000000003';
insert into public.questions (id, stem, explanation, difficulty) values (q,
  'Por que a absorção compradora sinaliza alta probabilidade de subida?',
  'A absorção indica que um player grande está acumulando posição comprada com convicção. Quando ele termina de absorver, a pressão vendedora se esgota e o preço sobe sem resistência do lado absorvedor.',
  2) on conflict (id) do nothing;
insert into public.question_options (question_id, text, is_correct, order_index) values
  (q, 'Um player grande acumulou posição; quando a pressão cede, o preço sobe livremente',     true,  0),
  (q, 'Alto volume sempre precede alta, independente do lado dominante',                        false, 1),
  (q, 'O preço travado indica consolidação antes de nova queda',                               false, 2),
  (q, 'A absorção compradora é sinal de esgotamento dos compradores',                          false, 3)
on conflict (question_id, order_index) do nothing;
insert into public.question_question_tags values (q, t_abs) on conflict do nothing;

-- Q042
q := 'f0040000-0000-0000-0000-000000000004';
insert into public.questions (id, stem, explanation, difficulty) values (q,
  'Qual é a diferença entre absorção em preço fixo e absorção em múltiplos níveis?',
  'Preço fixo: toda a absorção ocorre exatamente no mesmo preço. Múltiplos níveis (escada): o player absorve ao longo de uma faixa de 5-10 ticks, tornando a padrão mais sutil e difícil de detectar.',
  3) on conflict (id) do nothing;
insert into public.question_options (question_id, text, is_correct, order_index) values
  (q, 'Preço fixo: absorção num único preço. Múltiplos níveis: absorção ao longo de uma faixa de preços', true,  0),
  (q, 'Preço fixo usa o book; múltiplos níveis usa apenas o T&T',                                        false, 1),
  (q, 'Múltiplos níveis ocorre apenas em dias de alta volatilidade',                                     false, 2),
  (q, 'Não existe diferença; absorção sempre ocorre em múltiplos níveis',                               false, 3)
on conflict (question_id, order_index) do nothing;
insert into public.question_question_tags values (q, t_abs) on conflict do nothing;

-- Q043
q := 'f0040000-0000-0000-0000-000000000005';
insert into public.questions (id, stem, explanation, difficulty) values (q,
  'Para confirmar que uma absorção é REAL (não falsa), quais dois elementos devem ser verificados?',
  'Absorção confirmada quando: 1) preço não se move apesar do volume contrário, E 2) o T&T mostra reversão no sentido do absorvedor (primeiras agressões compradoras após absorção compradora).',
  3) on conflict (id) do nothing;
insert into public.question_options (question_id, text, is_correct, order_index) values
  (q, 'Preço travado apesar do volume contrário + T&T confirma agressão no sentido do absorvedor',  true,  0),
  (q, 'Volume total elevado + spread fechado para 0',                                                false, 1),
  (q, 'Gráfico em suporte + book com muitos compradores',                                           false, 2),
  (q, 'Dois lotes grandes consecutivos + fita acelerando',                                          false, 3)
on conflict (question_id, order_index) do nothing;
insert into public.question_question_tags values (q, t_abs) on conflict do nothing;

-- Q044
q := 'f0040000-0000-0000-0000-000000000006';
insert into public.questions (id, stem, explanation, difficulty) values (q,
  'Após detectar absorção compradora, qual é o ponto ideal de entrada?',
  'Não entrar durante a absorção. Aguardar: 1) a pressão vendedora cessar, 2) aparecimento de agressão compradora no T&T. Entrada no rompimento do nível de absorção ou na primeira agressão compradora.',
  3) on conflict (id) do nothing;
insert into public.question_options (question_id, text, is_correct, order_index) values
  (q, 'Após a absorção: quando a pressão cede e aparece a primeira agressão compradora',    true,  0),
  (q, 'No meio da absorção, aproveitando o preço travado',                                  false, 1),
  (q, 'Antes da absorção, antecipando o movimento',                                         false, 2),
  (q, 'Apenas quando o preço superar a máxima do dia',                                     false, 3)
on conflict (question_id, order_index) do nothing;
insert into public.question_question_tags values (q, t_abs) on conflict do nothing;

-- Q045
q := 'f0040000-0000-0000-0000-000000000007';
insert into public.questions (id, stem, explanation, difficulty) values (q,
  'Na absorção em escada, o que diferencia este padrão de uma tendência de queda normal?',
  'Na tendência de queda, cada recuo é maior que o anterior (novos mínimos). Na absorção em escada, cada recuo é MENOR que o anterior — o preço desacelera progressivamente, indicando acumulação.',
  3) on conflict (id) do nothing;
insert into public.question_options (question_id, text, is_correct, order_index) values
  (q, 'Na absorção em escada cada recuo é menor; na tendência real, os recuos são maiores (novos mínimos)', true,  0),
  (q, 'Na absorção em escada o volume é menor que na tendência',                                           false, 1),
  (q, 'Tendência de queda sempre tem spread mais amplo que absorção',                                     false, 2),
  (q, 'Não há diferença; ambos os padrões resultam em queda',                                            false, 3)
on conflict (question_id, order_index) do nothing;
insert into public.question_question_tags values (q, t_abs) on conflict do nothing;

-- Q046
q := 'f0040000-0000-0000-0000-000000000008';
insert into public.questions (id, stem, explanation, difficulty) values (q,
  'Absorção vendedora ocorre em resistência quando:',
  'Absorção vendedora: agressões compradoras consecutivas sem avanço de preço em resistência. Um player está vendendo tudo que os compradores oferecem, impedindo a subida.',
  2) on conflict (id) do nothing;
insert into public.question_options (question_id, text, is_correct, order_index) values
  (q, 'Agressões compradoras sem avanço de preço — alguém vende cada compra',            true,  0),
  (q, 'Volume vendedor alto com queda rápida de preço',                                   false, 1),
  (q, 'Spread fechando em resistência com lotes pequenos',                                false, 2),
  (q, 'Book vendedor com muitos contratos acumulados',                                    false, 3)
on conflict (question_id, order_index) do nothing;
insert into public.question_question_tags values (q, t_abs) on conflict do nothing;

-- Q047
q := 'f0040000-0000-0000-0000-000000000009';
insert into public.questions (id, stem, explanation, difficulty) values (q,
  'Onde se posiciona o STOP ao operar absorção compradora?',
  'Stop = abaixo do nível de absorção. Se a absorção ocorreu em 5.0500 e o preço voltou para baixo desse nível, a absorção falhou — a hipótese de compra está errada.',
  2) on conflict (id) do nothing;
insert into public.question_options (question_id, text, is_correct, order_index) values
  (q, 'Abaixo do nível onde a absorção ocorreu',                                   true,  0),
  (q, 'Abaixo da mínima do dia',                                                   false, 1),
  (q, 'Na zona de variação de -1,0% do dia',                                       false, 2),
  (q, 'Não se usa stop em operações baseadas em absorção',                          false, 3)
on conflict (question_id, order_index) do nothing;
insert into public.question_question_tags values (q, t_abs) on conflict do nothing;

-- Q048 (extra abs)
q := 'f0040000-0000-0000-0000-000000000010';
insert into public.questions (id, stem, explanation, difficulty) values (q,
  'Por qual motivo a absorção é considerada o conceito "central" do tape reading?',
  'Absorção explica como grandes players acumulam/distribuem posição sem revelar a intenção. Todos os outros conceitos (exaustão, escora, iceberg) são variações ou consequências da absorção.',
  3) on conflict (id) do nothing;
insert into public.question_options (question_id, text, is_correct, order_index) values
  (q, 'Explica como players grandes acumulam/distribuem sem revelar intenção; outros conceitos derivam dela', true,  0),
  (q, 'É o único padrão com 100% de acerto quando executado corretamente',                                   false, 1),
  (q, 'Gera os maiores ganhos por operação em comparação a outros setups',                                   false, 2),
  (q, 'Ocorre com maior frequência que qualquer outro padrão de fluxo',                                     false, 3)
on conflict (question_id, order_index) do nothing;
insert into public.question_question_tags values (q, t_abs) on conflict do nothing;

-- Q049 (extra abs)
q := 'f0040000-0000-0000-0000-000000000011';
insert into public.questions (id, stem, explanation, difficulty) values (q,
  'Qual a relação entre absorção compradora e o nível psicológico redondo?',
  'Níveis redondos (5.0000, 5.0500) são pontos naturais de defesa por players institucionais. Absorção compradora nesses níveis é especialmente confiável pois o player está "defendendo" uma posição estratégica.',
  2) on conflict (id) do nothing;
insert into public.question_options (question_id, text, is_correct, order_index) values
  (q, 'Absorção em nível redondo é mais confiável; players institucionais defendem esses pontos estrategicamente', true,  0),
  (q, 'Níveis redondos devem ser ignorados por serem muito conhecidos',                                           false, 1),
  (q, 'Absorção em nível redondo sempre resulta em rompimento, não reversão',                                    false, 2),
  (q, 'Não há relação; absorção ocorre com igual probabilidade em qualquer preço',                               false, 3)
on conflict (question_id, order_index) do nothing;
insert into public.question_question_tags values (q, t_abs) on conflict do nothing;

-- Q050 (extra abs)
q := 'f0040000-0000-0000-0000-000000000012';
insert into public.questions (id, stem, explanation, difficulty) values (q,
  'O que deve acontecer no T&T imediatamente APÓS uma absorção compradora para confirmar a entrada?',
  'Após absorção compradora, a confirmação vem quando o T&T passa a mostrar agressão compradora. Ou seja: o lado absorvedor começa a agredir também, assumindo controle definitivo do movimento.',
  3) on conflict (id) do nothing;
insert into public.question_options (question_id, text, is_correct, order_index) values
  (q, 'Aparecem as primeiras agressões compradoras no T&T (o absorvedor começa a agredir também)', true,  0),
  (q, 'O book vendedor desaparece completamente',                                                   false, 1),
  (q, 'O spread fecha para zero ticks momentaneamente',                                             false, 2),
  (q, 'O volume total cai para menos de 10 contratos por minuto',                                  false, 3)
on conflict (question_id, order_index) do nothing;
insert into public.question_question_tags values (q, t_abs) on conflict do nothing;

-- ══════════════════════════════════════════════════════════════
-- MÓDULO 5 — EXAUSTÃO E ESCORA (Q051–Q062)
-- ══════════════════════════════════════════════════════════════

-- Q051
q := 'f0050000-0000-0000-0000-000000000001';
insert into public.questions (id, stem, explanation, difficulty) values (q,
  'Qual é o principal sinal de exaustão compradora no Times & Trades?',
  'Exaustão compradora: lotes de agressão compradora diminuem progressivamente (200 → 80 → 30), o preço ainda avança mas mais devagar, e surgem as primeiras ordens passivas vendedoras resistindo.',
  2) on conflict (id) do nothing;
insert into public.question_options (question_id, text, is_correct, order_index) values
  (q, 'Lotes de agressão compradora diminuindo progressivamente (ex: 200 → 80 → 30)',  true,  0),
  (q, 'Volume total do dia superando 1 bilhão de contratos',                            false, 1),
  (q, 'Preço rompendo nova máxima com volume crescente',                                false, 2),
  (q, 'Book vendedor com mais de 500 contratos em um único nível',                     false, 3)
on conflict (question_id, order_index) do nothing;
insert into public.question_question_tags values (q, t_exh) on conflict do nothing;

-- Q052
q := 'f0050000-0000-0000-0000-000000000002';
insert into public.questions (id, stem, explanation, difficulty) values (q,
  'Exaustão compradora NÃO é sinal imediato de reversão. Por quê?',
  'Após a exaustão pode vir uma consolidação lateral antes da reversão. O trade correto é aguardar a CONFIRMAÇÃO vendedora (primeira agressão vendedora relevante) para entrar vendido.',
  3) on conflict (id) do nothing;
insert into public.question_options (question_id, text, is_correct, order_index) values
  (q, 'Pode preceder consolidação; aguardar confirmação vendedora antes de vender',        true,  0),
  (q, 'Exaustão sempre resulta em nova alta após breve pausa',                             false, 1),
  (q, 'É seguro vender imediatamente ao detectar qualquer sinal de exaustão',              false, 2),
  (q, 'Exaustão indica força compradora oculta; nunca vender nesses momentos',            false, 3)
on conflict (question_id, order_index) do nothing;
insert into public.question_question_tags values (q, t_exh) on conflict do nothing;

-- Q053
q := 'f0050000-0000-0000-0000-000000000003';
insert into public.questions (id, stem, explanation, difficulty) values (q,
  'O "padrão das três ondas" de exaustão compradora é caracterizado por:',
  'Três ondas de alta com amplitude decrescente: Onda 1 (+10t em 30s) → Onda 2 (+6t em 45s) → Onda 3 (+3t em 60s). Cada onda cobre menos ticks e demora mais tempo — momentum morrendo.',
  3) on conflict (id) do nothing;
insert into public.question_options (question_id, text, is_correct, order_index) values
  (q, 'Três ondas de alta com amplitude decrescente e duração crescente',                 true,  0),
  (q, 'Três ondas de igual amplitude separadas por lateralizações',                        false, 1),
  (q, 'Primeira onda fraca seguida de duas ondas fortes',                                 false, 2),
  (q, 'Três topos duplos consecutivos na mesma região de preço',                          false, 3)
on conflict (question_id, order_index) do nothing;
insert into public.question_question_tags values (q, t_exh) on conflict do nothing;

-- Q054
q := 'f0050000-0000-0000-0000-000000000004';
insert into public.questions (id, stem, explanation, difficulty) values (q,
  'O que é a "escora de player" e por qual objetivo é utilizada?',
  'Escora = player renova continuamente ordens passivas compradoras para sustentar artificialmente o preço enquanto distribui (vende) posição comprada para o varejo. Quando termina de distribuir, para de escurar.',
  2) on conflict (id) do nothing;
insert into public.question_options (question_id, text, is_correct, order_index) values
  (q, 'Player sustenta artificialmente o preço para distribuir sua posição ao varejo',     true,  0),
  (q, 'Player compra progressivamente para acumular posição ao longo do dia',              false, 1),
  (q, 'Market maker que equilibra o book em momentos de iliquidez',                       false, 2),
  (q, 'Algoritmo que mantém o preço dentro de um range definido',                         false, 3)
on conflict (question_id, order_index) do nothing;
insert into public.question_question_tags values (q, t_esc) on conflict do nothing;

-- Q055
q := 'f0050000-0000-0000-0000-000000000005';
insert into public.questions (id, stem, explanation, difficulty) values (q,
  'Qual é o sinal mais crítico de que uma escora está terminando?',
  'Escora termina quando o player retira a grande ordem do book SEM ela ter sido executada. Em seguida, sem suporte, a pressão vendedora domina e o preço cai rapidamente.',
  3) on conflict (id) do nothing;
insert into public.question_options (question_id, text, is_correct, order_index) values
  (q, 'A grande ordem compradora desaparece do book sem ter sido executada',                true,  0),
  (q, 'O volume do T&T cai abruptamente para próximo de zero',                             false, 1),
  (q, 'O spread abre para 3+ ticks momentaneamente',                                       false, 2),
  (q, 'O preço sobe rapidamente após período de escora',                                   false, 3)
on conflict (question_id, order_index) do nothing;
insert into public.question_question_tags values (q, t_esc) on conflict do nothing;

-- Q056
q := 'f0050000-0000-0000-0000-000000000006';
insert into public.questions (id, stem, explanation, difficulty) values (q,
  'Qual é a ação imediata ao detectar o fim da escora (ordem grande cancelada sem execução)?',
  'Fim da escora = suporte falso removido. O player terminou de distribuir. Sem suporte artificial, o preço cai. Ação: venda imediata com stop acima do nível da escora.',
  3) on conflict (id) do nothing;
insert into public.question_options (question_id, text, is_correct, order_index) values
  (q, 'Venda imediata — o suporte artificial foi removido e o preço cairá',                true,  0),
  (q, 'Compra — o player removeu a ordem pois subiu o preço além do necessário',           false, 1),
  (q, 'Aguardar — pode ser renovação temporária antes de nova escora',                     false, 2),
  (q, 'Nenhuma ação; fim de escora não tem implicação operacional confiável',              false, 3)
on conflict (question_id, order_index) do nothing;
insert into public.question_question_tags values (q, t_esc) on conflict do nothing;

-- Q057
q := 'f0050000-0000-0000-0000-000000000007';
insert into public.questions (id, stem, explanation, difficulty) values (q,
  'Como diferenciar escora (sustentação artificial) de absorção compradora legítima?',
  'Escora: player segura o preço ENQUANTO distribui (preço não sobe após o suporte). Absorção: player acumula e o preço SOBE quando a pressão contrária cede. Na escora, o preço fica travado por tempo incomum.',
  3) on conflict (id) do nothing;
insert into public.question_options (question_id, text, is_correct, order_index) values
  (q, 'Absorção: preço sobe após o suporte. Escora: preço permanece travado enquanto distribui',    true,  0),
  (q, 'Escora tem lotes maiores que absorção',                                                       false, 1),
  (q, 'Absorção ocorre em suporte e escora apenas em resistência',                                  false, 2),
  (q, 'Não há diferença operacional entre os dois padrões',                                         false, 3)
on conflict (question_id, order_index) do nothing;
insert into public.question_question_tags values (q, t_esc) on conflict do nothing;

-- Q058
q := 'f0050000-0000-0000-0000-000000000008';
insert into public.questions (id, stem, explanation, difficulty) values (q,
  'Exaustão vendedora coincidindo com zona de -1,0% do dia gera qual tipo de setup?',
  'Zona de variação + exaustão = setup de alta probabilidade. A zona é suporte estatístico (raramente ultrapassada em dia normal) e a exaustão confirma que os vendedores estão sem força.',
  3) on conflict (id) do nothing;
insert into public.question_options (question_id, text, is_correct, order_index) values
  (q, 'Setup de compra de alta probabilidade — suporte estatístico + exaustão vendedora',   true,  0),
  (q, 'Setup de venda — a zona de -1% é resistência para vendedores',                       false, 1),
  (q, 'Sinal neutro — zonas e exaustão não se combinam operacionalmente',                   false, 2),
  (q, 'Setup de venda ainda maior — a zona atrairá mais vendedores',                        false, 3)
on conflict (question_id, order_index) do nothing;
insert into public.question_question_tags values (q, t_exh) on conflict do nothing;

-- Q059
q := 'f0050000-0000-0000-0000-000000000009';
insert into public.questions (id, stem, explanation, difficulty) values (q,
  'Onde se posiciona o stop ao operar exaustão vendedora (compra)?',
  'Stop = abaixo da mínima da exaustão. No WDO, nunca mais de 3 ticks. Se o preço vai além da mínima, a hipótese de reversão está errada e a tendência de queda continua.',
  2) on conflict (id) do nothing;
insert into public.question_options (question_id, text, is_correct, order_index) values
  (q, 'Abaixo da mínima da exaustão (no WDO: ≤ 3 ticks do preço de entrada)',   true,  0),
  (q, 'Na zona de -1,5% do dia',                                                  false, 1),
  (q, 'Igual ao alvo da operação (R/R 1:1)',                                      false, 2),
  (q, 'Abaixo da mínima dos últimos 3 pregões',                                   false, 3)
on conflict (question_id, order_index) do nothing;
insert into public.question_question_tags values (q, t_exh) on conflict do nothing;

-- Q060 (extra exh/esc)
q := 'f0050000-0000-0000-0000-000000000010';
insert into public.questions (id, stem, explanation, difficulty) values (q,
  'O que caracteriza uma "escora vendedora" (o oposto da escora compradora)?',
  'Escora vendedora: player mantém grandes ordens passivas no ask enquanto distribui posição comprada para vendê-la a preços altos. O preço fica travado perto da resistência enquanto o player distribui.',
  3) on conflict (id) do nothing;
insert into public.question_options (question_id, text, is_correct, order_index) values
  (q, 'Player sustenta ordens vendedoras no ask enquanto distribui posição, mantendo o preço próximo à resistência', true,  0),
  (q, 'Grandes volumes de venda que empurram o preço para baixo rapidamente',                                       false, 1),
  (q, 'Player vendendo a descoberto esperando queda do mercado',                                                    false, 2),
  (q, 'Algoritmo que vende progressivamente ao longo do dia',                                                      false, 3)
on conflict (question_id, order_index) do nothing;
insert into public.question_question_tags values (q, t_esc) on conflict do nothing;

-- Q061 (extra)
q := 'f0050000-0000-0000-0000-000000000011';
insert into public.questions (id, stem, explanation, difficulty) values (q,
  'O alvo mínimo de uma operação baseada em exaustão deve ser determinado por:',
  'Alvo mínimo = próxima resistência/suporte relevante pelo book, ou próxima zona de variação. A relação R/R mínima deve ser 2:1 para que a operação valha o risco.',
  2) on conflict (id) do nothing;
insert into public.question_options (question_id, text, is_correct, order_index) values
  (q, 'Próxima resistência/suporte pelo book ou zona de variação, com R/R ≥ 2:1',    true,  0),
  (q, 'Sempre a máxima ou mínima do dia anterior',                                    false, 1),
  (q, '10 ticks fixos a partir do ponto de entrada',                                  false, 2),
  (q, 'Não há alvo definido; sair ao primeiro sinal de reversão',                     false, 3)
on conflict (question_id, order_index) do nothing;
insert into public.question_question_tags values (q, t_exh) on conflict do nothing;

-- Q062 (extra)
q := 'f0050000-0000-0000-0000-000000000012';
insert into public.questions (id, stem, explanation, difficulty) values (q,
  'Em que nível de price action a escora compradora é mais comum de ser detectada?',
  'Escora compradora é mais comum em topos — o player que comprou barato sustenta o preço no topo para vender (distribuir) ao varejo que compra na "força". Também pode ocorrer em suportes que serão abandonados.',
  3) on conflict (id) do nothing;
insert into public.question_options (question_id, text, is_correct, order_index) values
  (q, 'Em topos — o player sustenta enquanto distribui para o varejo que compra na força',  true,  0),
  (q, 'Em suportes — o player prepara acumulação para nova alta',                           false, 1),
  (q, 'Apenas em períodos de baixíssimo volume (horário de almoço)',                        false, 2),
  (q, 'Exclusivamente em dias de vencimento de contratos',                                  false, 3)
on conflict (question_id, order_index) do nothing;
insert into public.question_question_tags values (q, t_esc) on conflict do nothing;

-- ══════════════════════════════════════════════════════════════
-- MÓDULO 6 — ICEBERG (Q063–Q074)
-- ══════════════════════════════════════════════════════════════

-- Q063
q := 'f0060000-0000-0000-0000-000000000001';
insert into public.questions (id, stem, explanation, difficulty) values (q,
  'O que é uma ordem iceberg e por que os players a utilizam?',
  'Iceberg exibe apenas uma fração do volume real. Quando executada parcialmente, repõe automaticamente. Usado para acumular/distribuir posição sem revelar a real magnitude ao mercado.',
  1) on conflict (id) do nothing;
insert into public.question_options (question_id, text, is_correct, order_index) values
  (q, 'Exibe fração do volume real; repõe automaticamente; usado para ocultar intenção real do player', true,  0),
  (q, 'Ordem que aumenta de tamanho progressivamente conforme o mercado move',                          false, 1),
  (q, 'Ordem colocada abaixo do mercado para capturar pullbacks',                                       false, 2),
  (q, 'Estratégia de opções que protege posição cambial',                                               false, 3)
on conflict (question_id, order_index) do nothing;
insert into public.question_question_tags values (q, t_ice) on conflict do nothing;

-- Q064
q := 'f0060000-0000-0000-0000-000000000002';
insert into public.questions (id, stem, explanation, difficulty) values (q,
  'Qual é o sinal mais claro da presença de iceberg comprador no T&T?',
  'Volume executado no T&T muito maior que o volume exibido no book. Ex: book mostrou máximo de 50 contratos, mas T&T acumulou 2.300 executados no mesmo preço.',
  2) on conflict (id) do nothing;
insert into public.question_options (question_id, text, is_correct, order_index) values
  (q, 'Volume no T&T muito maior que o volume exibido pelo book no mesmo preço',         true,  0),
  (q, 'Book com ordem grande que nunca diminui de tamanho',                               false, 1),
  (q, 'Fita acelerando fortemente no sentido comprador',                                  false, 2),
  (q, 'Spread fechando para zero repetidamente',                                          false, 3)
on conflict (question_id, order_index) do nothing;
insert into public.question_question_tags values (q, t_ice) on conflict do nothing;

-- Q065
q := 'f0060000-0000-0000-0000-000000000003';
insert into public.questions (id, stem, explanation, difficulty) values (q,
  'A diferença entre iceberg "peak fixo" e "peak aleatório" está em:',
  'Peak fixo: sempre repõe o mesmo volume (ex: sempre 50 contratos). Peak aleatório: repõe volumes variados para ser mais difícil de detectar. O peak aleatório é mais sofisticado.',
  3) on conflict (id) do nothing;
insert into public.question_options (question_id, text, is_correct, order_index) values
  (q, 'Peak fixo repõe sempre o mesmo volume; peak aleatório varia para dificultar detecção',  true,  0),
  (q, 'Peak fixo é sempre maior; peak aleatório é sempre menor',                               false, 1),
  (q, 'Peak fixo aparece no book; peak aleatório é completamente invisível',                   false, 2),
  (q, 'Não há diferença prática para o tape reader',                                           false, 3)
on conflict (question_id, order_index) do nothing;
insert into public.question_question_tags values (q, t_ice) on conflict do nothing;

-- Q066
q := 'f0060000-0000-0000-0000-000000000004';
insert into public.questions (id, stem, explanation, difficulty) values (q,
  'Iceberg comprador numa zona de suporte implica qual ação operacional?',
  'Iceberg comprador em suporte = acumulação institucional. O player quer comprar muito sem revelar. Quando o iceberg se esgota, o preço sobe sem resistência. Comprar no rompimento do topo.',
  2) on conflict (id) do nothing;
insert into public.question_options (question_id, text, is_correct, order_index) values
  (q, 'Comprar no rompimento acima do nível do iceberg após esgotamento',                    true,  0),
  (q, 'Vender — o iceberg indica que há muita pressão compradora e o preço vai cair',        false, 1),
  (q, 'Aguardar indefinidamente; icebergs nunca geram sinais confiáveis',                    false, 2),
  (q, 'Comprar imediatamente na detecção, antes do esgotamento',                             false, 3)
on conflict (question_id, order_index) do nothing;
insert into public.question_question_tags values (q, t_ice) on conflict do nothing;

-- Q067
q := 'f0060000-0000-0000-0000-000000000005';
insert into public.questions (id, stem, explanation, difficulty) values (q,
  'Como detectar iceberg pelo padrão de renovação no book?',
  'Sinal de iceberg: ordem de tamanho fixo (sempre 50 contratos) reaparece imediatamente após execução, várias vezes consecutivas. Ordens humanas não renovam tão rapidamente — é algorítmico.',
  2) on conflict (id) do nothing;
insert into public.question_options (question_id, text, is_correct, order_index) values
  (q, 'Ordem de tamanho fixo que reaparece imediatamente e repetidamente após execução',    true,  0),
  (q, 'Ordem que aumenta de tamanho após cada execução parcial',                            false, 1),
  (q, 'Grande ordem que permanece sem ser executada por mais de 5 minutos',                false, 2),
  (q, 'Ordem que aparece apenas nas primeiras trocas do dia',                              false, 3)
on conflict (question_id, order_index) do nothing;
insert into public.question_question_tags values (q, t_ice) on conflict do nothing;

-- Q068
q := 'f0060000-0000-0000-0000-000000000006';
insert into public.questions (id, stem, explanation, difficulty) values (q,
  'O que pode ser um "iceberg falso" criado propositalmente?',
  'Alguns algoritmos simulam icebergs para atrair tape readers e então reverter contra eles. A confirmação obrigatória é: o preço realmente avança após o esgotamento, com agressão real no T&T.',
  3) on conflict (id) do nothing;
insert into public.question_options (question_id, text, is_correct, order_index) values
  (q, 'Algoritmos que simulam iceberg para atrair tape readers e reverter contra eles',     true,  0),
  (q, 'Icebergs de menos de 100 contratos totais são sempre falsos',                       false, 1),
  (q, 'Qualquer iceberg que aparece em resistência é falso',                                false, 2),
  (q, 'Icebergs no DOL cheio são sempre reais; no WDO podem ser falsos',                  false, 3)
on conflict (question_id, order_index) do nothing;
insert into public.question_question_tags values (q, t_ice) on conflict do nothing;

-- Q069
q := 'f0060000-0000-0000-0000-000000000007';
insert into public.questions (id, stem, explanation, difficulty) values (q,
  'Quais são os três critérios de confirmação obrigatória ao operar um iceberg?',
  'Três confirmações: 1) preço avança após esgotamento, 2) T&T confirma agressão no sentido, 3) book do lado oposto não tem iceberg contrário. Todos os três necessários.',
  3) on conflict (id) do nothing;
insert into public.question_options (question_id, text, is_correct, order_index) values
  (q, 'Preço avança + T&T confirma agressão no sentido + book oposto sem iceberg contrário', true,  0),
  (q, 'Volume no T&T > 1000 contratos + book mostra menos de 50 contratos + 3 renovações',  false, 1),
  (q, 'Spread fecha + ATR abaixo de 200 ticks + iceberg dura mais de 2 minutos',             false, 2),
  (q, 'Confirmação apenas no gráfico de 1 minuto é suficiente',                             false, 3)
on conflict (question_id, order_index) do nothing;
insert into public.question_question_tags values (q, t_ice) on conflict do nothing;

-- Q070 (extra ice)
q := 'f0060000-0000-0000-0000-000000000008';
insert into public.questions (id, stem, explanation, difficulty) values (q,
  'Por que o iceberg é mais eficaz para acumulação do que ordens grandes visíveis no book?',
  'Uma ordem grande visível move o preço contra o player (vendedores sobem o ask ao perceber a demanda). O iceberg mantém discrição, permitindo acumular ao preço desejado sem impacto adverso.',
  2) on conflict (id) do nothing;
insert into public.question_options (question_id, text, is_correct, order_index) values
  (q, 'Ordem grande visível move o preço contra o player; iceberg permite acumular sem impacto', true,  0),
  (q, 'Iceberg é mais barato em termos de taxas de corretagem',                                  false, 1),
  (q, 'Ordens grandes visíveis são proibidas acima de 100 contratos',                            false, 2),
  (q, 'O iceberg tem prioridade de execução sobre ordens normais',                               false, 3)
on conflict (question_id, order_index) do nothing;
insert into public.question_question_tags values (q, t_ice) on conflict do nothing;

-- Q071 (extra ice)
q := 'f0060000-0000-0000-0000-000000000009';
insert into public.questions (id, stem, explanation, difficulty) values (q,
  'Como somar o volume de iceberg executado para confirmar a escala da acumulação?',
  'Somar todos os negócios no T&T no mesmo preço ao longo do tempo. Se a soma superar em muito o máximo exibido pelo book, há iceberg. Ex: book mostrou 50 contratos, mas 2.300 foram executados nesse preço.',
  2) on conflict (id) do nothing;
insert into public.question_options (question_id, text, is_correct, order_index) values
  (q, 'Somar negócios no T&T no mesmo preço; se muito > exibido pelo book, confirmado',     true,  0),
  (q, 'Multiplicar o lote visível pelo número de renovações',                                false, 1),
  (q, 'Usar o volume do gráfico de 1 minuto dividido pelo lote visível',                    false, 2),
  (q, 'Não é possível calcular o volume real de iceberg pela fita',                         false, 3)
on conflict (question_id, order_index) do nothing;
insert into public.question_question_tags values (q, t_ice) on conflict do nothing;

-- Q072 (extra ice)
q := 'f0060000-0000-0000-0000-000000000010';
insert into public.questions (id, stem, explanation, difficulty) values (q,
  'Iceberg vendedor em resistência é sinal de:',
  'Iceberg vendedor em resistência = distribuição institucional. O player está vendendo grande quantidade ao varejo que compra na "força", sem revelar o real volume. Quando se esgota, sem mais oferta, o preço cai.',
  2) on conflict (id) do nothing;
insert into public.question_options (question_id, text, is_correct, order_index) values
  (q, 'Distribuição institucional — player vende ao varejo enquanto oculta o real volume',   true,  0),
  (q, 'Acumulação — player comprando escondido na resistência',                              false, 1),
  (q, 'Sinal de alta — a resistência será rompida em breve',                                false, 2),
  (q, 'Mercado equilibrado; sem direcionalidade clara',                                     false, 3)
on conflict (question_id, order_index) do nothing;
insert into public.question_question_tags values (q, t_ice) on conflict do nothing;

-- Q073 (extra ice)
q := 'f0060000-0000-0000-0000-000000000011';
insert into public.questions (id, stem, explanation, difficulty) values (q,
  'Por que é necessário verificar o book do lado oposto ao operar iceberg?',
  'Se há iceberg comprador mas também iceberg vendedor no ask, os dois players estão se confrontando — o resultado é incerto. Apenas quando um lado é claramente vazio o iceberg oferece edge direcional.',
  3) on conflict (id) do nothing;
insert into public.question_options (question_id, text, is_correct, order_index) values
  (q, 'Se há iceberg nos dois lados o resultado é incerto; o edge só existe quando um lado está vazio', true,  0),
  (q, 'O book oposto sempre tem iceberg e deve ser ignorado na análise',                                false, 1),
  (q, 'Para calcular a quantidade exata que o iceberg vai mover o preço',                              false, 2),
  (q, 'Porque o book oposto revela o próximo suporte/resistência real',                               false, 3)
on conflict (question_id, order_index) do nothing;
insert into public.question_question_tags values (q, t_ice) on conflict do nothing;

-- Q074 (extra ice)
q := 'f0060000-0000-0000-0000-000000000012';
insert into public.questions (id, stem, explanation, difficulty) values (q,
  'O iceberg é considerado uma ferramenta de "execução" ou de "análise" para o tape reader?',
  'Para o player que usa iceberg é ferramenta de execução (acumular/distribuir). Para o tape reader que o detecta é ferramenta de ANÁLISE — revela intenção e tamanho de player institucional.',
  2) on conflict (id) do nothing;
insert into public.question_options (question_id, text, is_correct, order_index) values
  (q, 'De análise — detectar iceberg revela intenção e escala de player institucional',     true,  0),
  (q, 'De execução apenas — tape readers não usam iceberg em suas operações',               false, 1),
  (q, 'De gestão de risco — iceberg limita o risco de posições grandes',                   false, 2),
  (q, 'Não tem uso para tape readers; apenas para HFT',                                    false, 3)
on conflict (question_id, order_index) do nothing;
insert into public.question_question_tags values (q, t_ice) on conflict do nothing;

-- ══════════════════════════════════════════════════════════════
-- MÓDULO 7 — RANGE E ZONAS (Q075–Q086)
-- ══════════════════════════════════════════════════════════════

-- Q075
q := 'f0070000-0000-0000-0000-000000000001';
insert into public.questions (id, stem, explanation, difficulty) values (q,
  'Qual a fórmula para calcular a zona de variação de 1,0% do dólar futuro?',
  'Zona = Preço de Ajuste (PA) × 0,010. Ex: PA = 5.0000 → zona de +1% = 5.0500; zona de -1% = 4.9500. O PA é o preço de fechamento oficial divulgado pela B3.',
  1) on conflict (id) do nothing;
insert into public.question_options (question_id, text, is_correct, order_index) values
  (q, 'PA × 0,010 (adicionado e subtraído do preço de ajuste)',  true,  0),
  (q, 'PA × 0,100',                                              false, 1),
  (q, 'PA + 500 ticks',                                          false, 2),
  (q, 'Média dos últimos 5 dias × 0,010',                        false, 3)
on conflict (question_id, order_index) do nothing;
insert into public.question_question_tags values (q, t_rng) on conflict do nothing;

-- Q076
q := 'f0070000-0000-0000-0000-000000000002';
insert into public.questions (id, stem, explanation, difficulty) values (q,
  'Com preço de ajuste (PA) de 5.2000, qual é a zona de variação de +0,5%?',
  '5.2000 × 0.005 = 26 pontos = R$ 260 em termos de cotação. Zona de +0,5% = 5.2000 + 0,0260 = 5.2260. No dólar futuro a cotação é em R$/USD×1000.',
  2) on conflict (id) do nothing;
insert into public.question_options (question_id, text, is_correct, order_index) values
  (q, '5.2260',  true,  0),
  (q, '5.2052',  false, 1),
  (q, '5.2500',  false, 2),
  (q, '5.2100',  false, 3)
on conflict (question_id, order_index) do nothing;
insert into public.question_question_tags values (q, t_rng) on conflict do nothing;

-- Q077
q := 'f0070000-0000-0000-0000-000000000003';
insert into public.questions (id, stem, explanation, difficulty) values (q,
  'O que é o ATR (Average True Range) e como se usa no planejamento do dólar futuro?',
  'ATR = variação média real dos últimos N dias. Para o WDO: normal = 200-400 ticks/dia. Usar ATR para calibrar stops (≤ 20% do ATR diário) e alvos (R/R ≥ 2:1 baseado no ATR).',
  2) on conflict (id) do nothing;
insert into public.question_options (question_id, text, is_correct, order_index) values
  (q, 'Variação média real dos últimos dias; usado para calibrar stops e alvos diários',     true,  0),
  (q, 'Volume total médio dos últimos 10 pregões',                                           false, 1),
  (q, 'Diferença entre máxima e mínima apenas do dia atual',                                false, 2),
  (q, 'Média de contratos negociados por hora no pregão',                                   false, 3)
on conflict (question_id, order_index) do nothing;
insert into public.question_question_tags values (q, t_rng) on conflict do nothing;

-- Q078
q := 'f0070000-0000-0000-0000-000000000004';
insert into public.questions (id, stem, explanation, difficulty) values (q,
  'Em dia com ATR baixo (< 200 ticks), qual zona de variação dificilmente será superada?',
  'ATR baixo = dia tranquilo. Estatisticamente, em dias de ATR baixo a zona de 0,5% raramente é ultrapassada. Operar apenas dentro dessa faixa reduz o risco de virar pó em dias sem momentum.',
  2) on conflict (id) do nothing;
insert into public.question_options (question_id, text, is_correct, order_index) values
  (q, 'Zona de 0,5% — raramente ultrapassada em dias de baixa volatilidade',  true,  0),
  (q, 'Zona de 1,5% — é o limite absoluto em qualquer dia',                    false, 1),
  (q, 'Zona de 1,0% — sempre respeitada independente da volatilidade',         false, 2),
  (q, 'Sem ATR não há zona que possa ser antecipada',                          false, 3)
on conflict (question_id, order_index) do nothing;
insert into public.question_question_tags values (q, t_rng) on conflict do nothing;

-- Q079
q := 'f0070000-0000-0000-0000-000000000005';
insert into public.questions (id, stem, explanation, difficulty) values (q,
  'O setup "Zona de +1,0% + Exaustão compradora" deve ser operado como:',
  'Zona de +1% = reversão estatisticamente esperada. Exaustão compradora = confirmação de fluxo. Venda com stop acima da máxima da zona. Alvo: zona de +0,5% (parcial) e PA (total).',
  3) on conflict (id) do nothing;
insert into public.question_options (question_id, text, is_correct, order_index) values
  (q, 'Venda com stop acima da máxima, alvo na zona de +0,5% e depois no PA',                 true,  0),
  (q, 'Compra — exaustão na zona de 1% confirma rompimento para cima',                        false, 1),
  (q, 'Aguardar — zona e exaustão juntas criam sinal nulo',                                   false, 2),
  (q, 'Venda apenas se o book vendedor tiver mais de 1000 contratos acumulados',              false, 3)
on conflict (question_id, order_index) do nothing;
insert into public.question_question_tags values (q, t_rng) on conflict do nothing;

-- Q080
q := 'f0070000-0000-0000-0000-000000000006';
insert into public.questions (id, stem, explanation, difficulty) values (q,
  'A zona de -0,5% coincide com absorção compradora. Qual é o plano de trade ideal?',
  'Compra na absorção, stop abaixo da zona de -0,5%, alvo 1 em PA (recovery), alvo 2 em zona de +0,5%. Parcial ao chegar no PA move stop para custo.',
  3) on conflict (id) do nothing;
insert into public.question_options (question_id, text, is_correct, order_index) values
  (q, 'Compra com stop abaixo da zona; parcial no PA; alvo final na zona de +0,5%',           true,  0),
  (q, 'Venda — absorção em queda confirma que a tendência é vendedora',                       false, 1),
  (q, 'Compra com alvo na zona de -1,0% (expectativa de nova queda)',                         false, 2),
  (q, 'Aguardar o PA ser rompido antes de qualquer entrada',                                  false, 3)
on conflict (question_id, order_index) do nothing;
insert into public.question_question_tags values (q, t_rng) on conflict do nothing;

-- Q081
q := 'f0070000-0000-0000-0000-000000000007';
insert into public.questions (id, stem, explanation, difficulty) values (q,
  'Em dias de evento macro (Copom, Payroll), qual ajuste se faz nas zonas de variação?',
  'Em dias de evento macro, a volatilidade pode ser 2-3x maior. Ampliar as zonas calculadas para 2,0% ou 2,5%. Ou simplesmente não operar antes da divulgação e aguardar o fluxo se estabilizar.',
  3) on conflict (id) do nothing;
insert into public.question_options (question_id, text, is_correct, order_index) values
  (q, 'Ampliar as zonas (ex: 2,0-2,5%) ou aguardar após a divulgação',                     true,  0),
  (q, 'Reduzir as zonas para 0,25% pois a volatilidade é mais previsível',                 false, 1),
  (q, 'Usar as zonas normais; eventos macro não alteram os padrões',                        false, 2),
  (q, 'Não usar zonas; apenas T&T puro em dias de evento',                                 false, 3)
on conflict (question_id, order_index) do nothing;
insert into public.question_question_tags values (q, t_rng) on conflict do nothing;

-- Q082
q := 'f0070000-0000-0000-0000-000000000008';
insert into public.questions (id, stem, explanation, difficulty) values (q,
  'Qual é o stop máximo recomendado em relação ao ATR diário?',
  'Stop ≤ 20% do ATR diário. Se ATR = 300 ticks, stop máximo = 60 ticks. No WDO, 60 ticks × R$ 5,00 = R$ 300 de risco por contrato. Manter stops pequenos é fundamental para sobrevivência.',
  2) on conflict (id) do nothing;
insert into public.question_options (question_id, text, is_correct, order_index) values
  (q, '≤ 20% do ATR diário',   true,  0),
  (q, '≤ 50% do ATR diário',   false, 1),
  (q, '= 1,0% do preço atual', false, 2),
  (q, '≤ 5% do ATR diário',    false, 3)
on conflict (question_id, order_index) do nothing;
insert into public.question_question_tags values (q, t_rng), (q, t_seg) on conflict do nothing;

-- Q083 (extra rng)
q := 'f0070000-0000-0000-0000-000000000009';
insert into public.questions (id, stem, explanation, difficulty) values (q,
  'O que é um "dia de alta volatilidade" em termos de ATR para o WDO?',
  'Dia normal: ATR 200-400 ticks. Dia de alta volatilidade: 500-800 ticks. Dia extremo (Copom/Payroll): 1000+ ticks. Em dias extremos, a zona de 1,5% pode ser testada ou superada.',
  1) on conflict (id) do nothing;
insert into public.question_options (question_id, text, is_correct, order_index) values
  (q, 'ATR 500-800 ticks (dias extremos chegam a 1000+)',   true,  0),
  (q, 'ATR 200-400 ticks',                                  false, 1),
  (q, 'ATR acima de 100 ticks',                             false, 2),
  (q, 'ATR abaixo de 100 ticks',                            false, 3)
on conflict (question_id, order_index) do nothing;
insert into public.question_question_tags values (q, t_rng) on conflict do nothing;

-- Q084 (extra rng)
q := 'f0070000-0000-0000-0000-000000000010';
insert into public.questions (id, stem, explanation, difficulty) values (q,
  'Por que a zona de 0,5% é considerada o "alvo do primeiro trade do dia"?',
  'Estatisticamente, o mercado frequentemente se move pelo menos 0,5% desde a abertura. É o target mais acessível e com maior probabilidade de ser atingido, ideal como alvo inicial antes de operações mais ambiciosas.',
  2) on conflict (id) do nothing;
insert into public.question_options (question_id, text, is_correct, order_index) values
  (q, 'Estatisticamente é atingida na maioria dos dias — target mais confiável para início',  true,  0),
  (q, 'É o limite regulatório de variação para o primeiro pregão do mês',                     false, 1),
  (q, 'É a zona mais distante que pode ser calculada com segurança',                          false, 2),
  (q, 'Representa o stop loss máximo permitido pelo day trade',                               false, 3)
on conflict (question_id, order_index) do nothing;
insert into public.question_question_tags values (q, t_rng) on conflict do nothing;

-- Q085 (extra rng)
q := 'f0070000-0000-0000-0000-000000000011';
insert into public.questions (id, stem, explanation, difficulty) values (q,
  'Como a gestão de parciais funciona no setup de zonas de variação?',
  'Parcial 1 na primeira zona (ex: de 1% para 0,5%) trava parte do lucro. Move stop para custo (breakeven). Parcial 2 ou saída total na segunda zona ou no PA. Protege capital e captura tendência.',
  2) on conflict (id) do nothing;
insert into public.question_options (question_id, text, is_correct, order_index) values
  (q, 'Parcial 1 na próxima zona, move stop para custo; sair total na segunda zona ou PA', true,  0),
  (q, 'Sair 100% na primeira zona — parciais reduzem o lucro potencial',                   false, 1),
  (q, 'Aumentar a posição em cada zona favorável para maximizar lucro',                    false, 2),
  (q, 'Parciais apenas em dia de evento macro, nunca em dias normais',                     false, 3)
on conflict (question_id, order_index) do nothing;
insert into public.question_question_tags values (q, t_rng) on conflict do nothing;

-- Q086 (extra rng)
q := 'f0070000-0000-0000-0000-000000000012';
insert into public.questions (id, stem, explanation, difficulty) values (q,
  'Qual a relação risco/retorno mínima recomendada baseada no ATR diário?',
  'R/R mínimo 2:1 baseado no ATR. Ex: ATR = 300 ticks, stop = 60 ticks (20% ATR), alvo mínimo = 120 ticks (40% ATR). Isso garante que, mesmo acertando apenas 40% das operações, o resultado é positivo.',
  2) on conflict (id) do nothing;
insert into public.question_options (question_id, text, is_correct, order_index) values
  (q, 'R/R ≥ 2:1',   true,  0),
  (q, 'R/R = 1:1',   false, 1),
  (q, 'R/R ≥ 5:1',   false, 2),
  (q, 'R/R ≥ 3:1',   false, 3)
on conflict (question_id, order_index) do nothing;
insert into public.question_question_tags values (q, t_rng), (q, t_seg) on conflict do nothing;

-- ══════════════════════════════════════════════════════════════
-- MÓDULO 8 — MACROECONOMIA (Q087–Q100)
-- ══════════════════════════════════════════════════════════════

-- Q087
q := 'f0080000-0000-0000-0000-000000000001';
insert into public.questions (id, stem, explanation, difficulty) values (q,
  'Quando a taxa Selic sobe, qual é o efeito esperado no câmbio USD/BRL?',
  'Selic alta aumenta o carrego (carry trade) do real — dinheiro estrangeiro entra no Brasil atraído pelo rendimento. Maior demanda por real → dólar tende a cair (real se aprecia).',
  2) on conflict (id) do nothing;
insert into public.question_options (question_id, text, is_correct, order_index) values
  (q, 'Dólar tende a cair — capital estrangeiro entra no Brasil buscando o carrego da Selic',  true,  0),
  (q, 'Dólar tende a subir — juros altos encarecem importações e elevam o câmbio',             false, 1),
  (q, 'Não há relação direta entre Selic e câmbio',                                            false, 2),
  (q, 'Dólar sobe inicialmente mas normaliza em 24h',                                         false, 3)
on conflict (question_id, order_index) do nothing;
insert into public.question_question_tags values (q, t_mac) on conflict do nothing;

-- Q088
q := 'f0080000-0000-0000-0000-000000000002';
insert into public.questions (id, stem, explanation, difficulty) values (q,
  'O Comitê de Política Monetária (Copom) do Banco Central do Brasil reúne-se com qual frequência?',
  'O Copom se reúne aproximadamente a cada 45 dias (8 reuniões/ano). A decisão de juros é divulgada às 18:30 do segundo dia da reunião e é o evento mais impactante para o câmbio no mercado doméstico.',
  1) on conflict (id) do nothing;
insert into public.question_options (question_id, text, is_correct, order_index) values
  (q, 'A cada ~45 dias (8 reuniões por ano)',    true,  0),
  (q, 'Mensalmente (12 reuniões por ano)',        false, 1),
  (q, 'Trimestralmente (4 reuniões por ano)',     false, 2),
  (q, 'Semanalmente durante crises cambiais',     false, 3)
on conflict (question_id, order_index) do nothing;
insert into public.question_question_tags values (q, t_mac) on conflict do nothing;

-- Q089
q := 'f0080000-0000-0000-0000-000000000003';
insert into public.questions (id, stem, explanation, difficulty) values (q,
  'O Payroll americano (NFP — Non-Farm Payrolls) é divulgado em qual momento?',
  'NFP é divulgado na primeira sexta-feira de cada mês às 09:30 horário de Brasília (08:30 EST). É o dado mais volátil do calendário econômico e impacta fortemente o USD globalmente.',
  1) on conflict (id) do nothing;
insert into public.question_options (question_id, text, is_correct, order_index) values
  (q, 'Primeira sexta-feira do mês às 09:30 (horário de Brasília)',  true,  0),
  (q, 'Toda sexta-feira às 15:00 (horário de NY)',                    false, 1),
  (q, 'Última quinta-feira do mês às 12:00',                         false, 2),
  (q, 'Primeira segunda-feira do mês ao abrir do mercado',           false, 3)
on conflict (question_id, order_index) do nothing;
insert into public.question_question_tags values (q, t_mac) on conflict do nothing;

-- Q090
q := 'f0080000-0000-0000-0000-000000000004';
insert into public.questions (id, stem, explanation, difficulty) values (q,
  'Payroll americano acima do esperado (mercado de trabalho forte). Qual o efeito no USD/BRL?',
  'Payroll forte → Fed pode manter ou subir juros → dólar americano se fortalece globalmente → USD/BRL sobe. O mecanismo: dólar forte atrativo → fluxo saindo do real.',
  2) on conflict (id) do nothing;
insert into public.question_options (question_id, text, is_correct, order_index) values
  (q, 'USD/BRL tende a subir — dólar americano se fortalece globalmente',                  true,  0),
  (q, 'USD/BRL tende a cair — economia americana forte favorece emergentes',               false, 1),
  (q, 'Sem impacto direto no Brasil; apenas no mercado americano',                         false, 2),
  (q, 'USD/BRL cai por 2h e depois reverte para cima',                                    false, 3)
on conflict (question_id, order_index) do nothing;
insert into public.question_question_tags values (q, t_mac) on conflict do nothing;

-- Q091
q := 'f0080000-0000-0000-0000-000000000005';
insert into public.questions (id, stem, explanation, difficulty) values (q,
  'Qual é a estratégia correta do tape reader ANTES da divulgação do Copom?',
  'Antes de evento macro de alto impacto: reduzir ou zerar posições, não adivinhar o resultado. Aguardar o fluxo se estabilizar APÓS o anúncio antes de entrar. Volatilidade pre-evento é ruído.',
  2) on conflict (id) do nothing;
insert into public.question_options (question_id, text, is_correct, order_index) values
  (q, 'Reduzir ou zerar posições e aguardar o fluxo após a decisão',                      true,  0),
  (q, 'Comprar, pois o Copom historicamente sobe a Selic no segundo semestre',            false, 1),
  (q, 'Vender aggressivamente pois eventos macro sempre depreciam o real',                false, 2),
  (q, 'Aumentar a posição para aproveitar a volatilidade do evento',                     false, 3)
on conflict (question_id, order_index) do nothing;
insert into public.question_question_tags values (q, t_mac) on conflict do nothing;

-- Q092
q := 'f0080000-0000-0000-0000-000000000006';
insert into public.questions (id, stem, explanation, difficulty) values (q,
  'O comunicado do Copom usa a palavra "vigilância". O que isso sinaliza?',
  '"Vigilância" = tom hawkish (duro). Indica que o BC está atento à inflação e pode subir juros. Selic mais alta → real mais atrativo → dólar tende a cair após o comunicado.',
  3) on conflict (id) do nothing;
insert into public.question_options (question_id, text, is_correct, order_index) values
  (q, 'Tom hawkish (duro) — pode elevar juros; real tende a se apreciar',                true,  0),
  (q, 'Tom dovish (suave) — BC planeja cortar juros em breve',                           false, 1),
  (q, 'Neutro — BC aguardando próximos dados antes de decidir',                          false, 2),
  (q, 'Alerta de crise cambial iminente',                                                false, 3)
on conflict (question_id, order_index) do nothing;
insert into public.question_question_tags values (q, t_mac) on conflict do nothing;

-- Q093
q := 'f0080000-0000-0000-0000-000000000007';
insert into public.questions (id, stem, explanation, difficulty) values (q,
  'Como o fluxo de exportadores agrícolas afeta o câmbio sazonalmente?',
  'Exportadores convertem dólar em real (vendem USD) no final do mês para pagar folha, impostos etc. Isso cria pressão vendedora sistemática próximo ao final de cada mês, especialmente em colheita.',
  2) on conflict (id) do nothing;
insert into public.question_options (question_id, text, is_correct, order_index) values
  (q, 'Pressão vendedora de USD no final do mês quando convertem receitas para real',     true,  0),
  (q, 'Pressão compradora de USD pois precisam pagar fornecedores externos em dólar',    false, 1),
  (q, 'Sem impacto sazonal; exportadores operam uniformemente ao longo do ano',          false, 2),
  (q, 'Pressão vendedora apenas no início do mês, nunca no final',                       false, 3)
on conflict (question_id, order_index) do nothing;
insert into public.question_question_tags values (q, t_mac) on conflict do nothing;

-- Q094
q := 'f0080000-0000-0000-0000-000000000008';
insert into public.questions (id, stem, explanation, difficulty) values (q,
  'Qual é o evento americano de maior impacto para o USD/BRL após o Payroll?',
  'Reunião do Fed (FOMC) é o segundo maior evento, especialmente quando há mudança de juros ou guidance hawkish/dovish. CPI americano (inflação) é o terceiro mais relevante.',
  2) on conflict (id) do nothing;
insert into public.question_options (question_id, text, is_correct, order_index) values
  (q, 'Reunião do Fed (FOMC)',   true,  0),
  (q, 'PIB americano',           false, 1),
  (q, 'Balança comercial dos EUA', false, 2),
  (q, 'Confiança do consumidor', false, 3)
on conflict (question_id, order_index) do nothing;
insert into public.question_question_tags values (q, t_mac) on conflict do nothing;

-- Q095
q := 'f0080000-0000-0000-0000-000000000009';
insert into public.questions (id, stem, explanation, difficulty) values (q,
  'O que é o "Boletim Focus" do Banco Central e qual sua relevância para o tape reader?',
  'Boletim Focus = pesquisa semanal com expectativas do mercado para Selic, IPCA, câmbio e PIB. Revela o consenso de analistas — quando o Copom decide diferente do Focus, há surpresa e volatilidade.',
  2) on conflict (id) do nothing;
insert into public.question_options (question_id, text, is_correct, order_index) values
  (q, 'Pesquisa com expectativas de mercado; decisões que diferem do Focus causam volatilidade extra', true,  0),
  (q, 'Relatório diário do fluxo cambial publicado pelo BC às 9h',                                    false, 1),
  (q, 'Histórico de intervenções cambiais do BC nos últimos 12 meses',                               false, 2),
  (q, 'Índice de sentimento de traders de varejo coletado pela B3',                                  false, 3)
on conflict (question_id, order_index) do nothing;
insert into public.question_question_tags values (q, t_mac) on conflict do nothing;

-- Q096
q := 'f0080000-0000-0000-0000-000000000010';
insert into public.questions (id, stem, explanation, difficulty) values (q,
  'Como o fluxo de exportadores é DIFERENTE do fluxo especulativo no T&T?',
  'Fluxo exportador: agressões moderadas, repetidas e PACIENTES — sem urgência, não move o preço rapidamente, distribui ao longo do dia. Fluxo especulativo: rápido, urgente, grandes lotes, move o preço.',
  3) on conflict (id) do nothing;
insert into public.question_options (question_id, text, is_correct, order_index) values
  (q, 'Exportador: moderado, paciente, não move preço rapidamente. Especulativo: urgente, move o preço', true,  0),
  (q, 'Exportador opera apenas no período da tarde; especulativo na manhã',                              false, 1),
  (q, 'Não há como diferenciar no T&T — ambos têm o mesmo padrão',                                     false, 2),
  (q, 'Exportador usa lotes maiores que o especulativo',                                               false, 3)
on conflict (question_id, order_index) do nothing;
insert into public.question_question_tags values (q, t_mac) on conflict do nothing;

-- Q097
q := 'f0080000-0000-0000-0000-000000000011';
insert into public.questions (id, stem, explanation, difficulty) values (q,
  'Qual deve ser o PRIMEIRO passo da rotina pré-mercado do tape reader (antes das 09:00)?',
  'Primeiro: verificar o calendário econômico. Há evento relevante hoje? Isso define se o dia é de trading normal ou exige postura defensiva. Só depois calcular zonas e hipóteses.',
  2) on conflict (id) do nothing;
insert into public.question_options (question_id, text, is_correct, order_index) values
  (q, 'Verificar o calendário econômico — há evento macro relevante hoje?',                true,  0),
  (q, 'Calcular as zonas de variação do dia',                                               false, 1),
  (q, 'Verificar a posição de abertura do mercado americano no overnight',                 false, 2),
  (q, 'Revisar as operações perdedoras do dia anterior',                                   false, 3)
on conflict (question_id, order_index) do nothing;
insert into public.question_question_tags values (q, t_mac) on conflict do nothing;

-- Q098
q := 'f0080000-0000-0000-0000-000000000012';
insert into public.questions (id, stem, explanation, difficulty) values (q,
  'O que significa "operar o que o mercado mostrar" em dias de evento macro?',
  'Não antecipar nem adivinhar o resultado do evento. Aguardar a reação do mercado (fluxo no T&T pós-divulgação) e entrar na direção que o dinheiro grande validar. Evitar posições pré-evento.',
  3) on conflict (id) do nothing;
insert into public.question_options (question_id, text, is_correct, order_index) values
  (q, 'Aguardar a reação pós-evento e entrar na direção confirmada pelo fluxo real',       true,  0),
  (q, 'Calcular a probabilidade do resultado e posicionar-se antes da divulgação',         false, 1),
  (q, 'Comprar sempre que o resultado for positivo para o Brasil',                          false, 2),
  (q, 'Não operar em dias de evento — esperar o próximo dia útil',                        false, 3)
on conflict (question_id, order_index) do nothing;
insert into public.question_question_tags values (q, t_mac) on conflict do nothing;

-- Q099
q := 'f0080000-0000-0000-0000-000000000013';
insert into public.questions (id, stem, explanation, difficulty) values (q,
  'Por que é importante manter um "journal" (diário) de operações?',
  'O journal permite identificar padrões: quais setups funcionam, em quais horários o trader performa melhor, quais erros se repetem. É a ferramenta principal de melhoria contínua do trader de fluxo.',
  1) on conflict (id) do nothing;
insert into public.question_options (question_id, text, is_correct, order_index) values
  (q, 'Para identificar padrões de acerto/erro e melhorar continuamente os setups e a execução', true,  0),
  (q, 'Exigência regulatória da CVM para traders de day trade',                                  false, 1),
  (q, 'Para calcular o imposto de renda mensal sobre ganhos',                                    false, 2),
  (q, 'Para compartilhar operações em redes sociais de traders',                                 false, 3)
on conflict (question_id, order_index) do nothing;
insert into public.question_question_tags values (q, t_mac), (q, t_seg) on conflict do nothing;

-- Q100
q := 'f0080000-0000-0000-0000-000000000014';
insert into public.questions (id, stem, explanation, difficulty) values (q,
  'A máxima "Prepare cenários, execute o que o mercado mostrar, proteja o capital" resume qual filosofia?',
  'Planejar antecipadamente sem viés direcional, executar apenas quando o fluxo confirmar, e priorizar preservação de capital acima de qualquer lucro. Esta é a filosofia central do tape reader profissional.',
  2) on conflict (id) do nothing;
insert into public.question_options (question_id, text, is_correct, order_index) values
  (q, 'A filosofia central do tape reader: planejar sem viés, executar pelo fluxo e preservar capital', true,  0),
  (q, 'Uma regra de gestão de risco que exige sempre usar stop de 5 ticks',                             false, 1),
  (q, 'Estratégia de swing trade; não se aplica ao day trade de fluxo',                                false, 2),
  (q, 'Técnica de backtesting para avaliar estratégias históricas',                                    false, 3)
on conflict (question_id, order_index) do nothing;
insert into public.question_question_tags values (q, t_mac), (q, t_seg) on conflict do nothing;

-- ──────────────────────────────────────────────────────────────
-- ASSESSMENTS — 8 simulados + 1 prova final
-- ──────────────────────────────────────────────────────────────
insert into public.assessments
  (id, course_id, module_id, title, assessment_type, time_limit_seconds, passing_score, question_count, is_published)
values
  (a_sim1, v_course, v_mod1, 'Simulado — Fundamentos do Tape Reading',          'simulado',    900,  0.70, 10, true),
  (a_sim2, v_course, v_mod2, 'Simulado — Book de Ofertas',                      'simulado',    900,  0.70, 10, true),
  (a_sim3, v_course, v_mod3, 'Simulado — Times & Trades',                       'simulado',    900,  0.70, 10, true),
  (a_sim4, v_course, v_mod4, 'Simulado — Absorção',                             'simulado',    900,  0.70, 10, true),
  (a_sim5, v_course, v_mod5, 'Simulado — Exaustão e Escora',                    'simulado',    900,  0.70, 10, true),
  (a_sim6, v_course, v_mod6, 'Simulado — Iceberg',                              'simulado',    900,  0.70, 10, true),
  (a_sim7, v_course, v_mod7, 'Simulado — Range e Zonas de Variação',            'simulado',    900,  0.70, 10, true),
  (a_sim8, v_course, v_mod8, 'Simulado — Macroeconomia e Câmbio',               'simulado',    900,  0.70, 10, true),
  (a_final, v_course, null,  'Prova Final — Coast Academy',              'prova_final', 3600, 0.75, 40, true)
on conflict (course_id, assessment_type, module_id) do nothing;

-- ──────────────────────────────────────────────────────────────
-- ASSESSMENT ↔ QUESTIONS (pool for each simulado)
-- Each simulado draws from ~13 questions of its module
-- Prova final draws from all 100 questions
-- ──────────────────────────────────────────────────────────────

-- Simulado 1 — Fundamentos (Q001–Q013)
insert into public.assessment_questions (assessment_id, question_id) values
  (a_sim1, 'f0010000-0000-0000-0000-000000000001'),
  (a_sim1, 'f0010000-0000-0000-0000-000000000002'),
  (a_sim1, 'f0010000-0000-0000-0000-000000000003'),
  (a_sim1, 'f0010000-0000-0000-0000-000000000004'),
  (a_sim1, 'f0010000-0000-0000-0000-000000000005'),
  (a_sim1, 'f0010000-0000-0000-0000-000000000006'),
  (a_sim1, 'f0010000-0000-0000-0000-000000000007'),
  (a_sim1, 'f0010000-0000-0000-0000-000000000008'),
  (a_sim1, 'f0010000-0000-0000-0000-000000000009'),
  (a_sim1, 'f0010000-0000-0000-0000-000000000010'),
  (a_sim1, 'f0010000-0000-0000-0000-000000000011'),
  (a_sim1, 'f0010000-0000-0000-0000-000000000012'),
  (a_sim1, 'f0010000-0000-0000-0000-000000000013')
on conflict do nothing;

-- Simulado 2 — Book de Ofertas (Q014–Q026)
insert into public.assessment_questions (assessment_id, question_id) values
  (a_sim2, 'f0020000-0000-0000-0000-000000000001'),
  (a_sim2, 'f0020000-0000-0000-0000-000000000002'),
  (a_sim2, 'f0020000-0000-0000-0000-000000000003'),
  (a_sim2, 'f0020000-0000-0000-0000-000000000004'),
  (a_sim2, 'f0020000-0000-0000-0000-000000000005'),
  (a_sim2, 'f0020000-0000-0000-0000-000000000006'),
  (a_sim2, 'f0020000-0000-0000-0000-000000000007'),
  (a_sim2, 'f0020000-0000-0000-0000-000000000008'),
  (a_sim2, 'f0020000-0000-0000-0000-000000000009'),
  (a_sim2, 'f0020000-0000-0000-0000-000000000010'),
  (a_sim2, 'f0020000-0000-0000-0000-000000000011'),
  (a_sim2, 'f0020000-0000-0000-0000-000000000012'),
  (a_sim2, 'f0020000-0000-0000-0000-000000000013')
on conflict do nothing;

-- Simulado 3 — T&T (Q027–Q038)
insert into public.assessment_questions (assessment_id, question_id) values
  (a_sim3, 'f0030000-0000-0000-0000-000000000001'),
  (a_sim3, 'f0030000-0000-0000-0000-000000000002'),
  (a_sim3, 'f0030000-0000-0000-0000-000000000003'),
  (a_sim3, 'f0030000-0000-0000-0000-000000000004'),
  (a_sim3, 'f0030000-0000-0000-0000-000000000005'),
  (a_sim3, 'f0030000-0000-0000-0000-000000000006'),
  (a_sim3, 'f0030000-0000-0000-0000-000000000007'),
  (a_sim3, 'f0030000-0000-0000-0000-000000000008'),
  (a_sim3, 'f0030000-0000-0000-0000-000000000009'),
  (a_sim3, 'f0030000-0000-0000-0000-000000000010'),
  (a_sim3, 'f0030000-0000-0000-0000-000000000011'),
  (a_sim3, 'f0030000-0000-0000-0000-000000000012')
on conflict do nothing;

-- Simulado 4 — Absorção (Q039–Q050)
insert into public.assessment_questions (assessment_id, question_id) values
  (a_sim4, 'f0040000-0000-0000-0000-000000000001'),
  (a_sim4, 'f0040000-0000-0000-0000-000000000002'),
  (a_sim4, 'f0040000-0000-0000-0000-000000000003'),
  (a_sim4, 'f0040000-0000-0000-0000-000000000004'),
  (a_sim4, 'f0040000-0000-0000-0000-000000000005'),
  (a_sim4, 'f0040000-0000-0000-0000-000000000006'),
  (a_sim4, 'f0040000-0000-0000-0000-000000000007'),
  (a_sim4, 'f0040000-0000-0000-0000-000000000008'),
  (a_sim4, 'f0040000-0000-0000-0000-000000000009'),
  (a_sim4, 'f0040000-0000-0000-0000-000000000010'),
  (a_sim4, 'f0040000-0000-0000-0000-000000000011'),
  (a_sim4, 'f0040000-0000-0000-0000-000000000012')
on conflict do nothing;

-- Simulado 5 — Exaustão e Escora (Q051–Q062)
insert into public.assessment_questions (assessment_id, question_id) values
  (a_sim5, 'f0050000-0000-0000-0000-000000000001'),
  (a_sim5, 'f0050000-0000-0000-0000-000000000002'),
  (a_sim5, 'f0050000-0000-0000-0000-000000000003'),
  (a_sim5, 'f0050000-0000-0000-0000-000000000004'),
  (a_sim5, 'f0050000-0000-0000-0000-000000000005'),
  (a_sim5, 'f0050000-0000-0000-0000-000000000006'),
  (a_sim5, 'f0050000-0000-0000-0000-000000000007'),
  (a_sim5, 'f0050000-0000-0000-0000-000000000008'),
  (a_sim5, 'f0050000-0000-0000-0000-000000000009'),
  (a_sim5, 'f0050000-0000-0000-0000-000000000010'),
  (a_sim5, 'f0050000-0000-0000-0000-000000000011'),
  (a_sim5, 'f0050000-0000-0000-0000-000000000012')
on conflict do nothing;

-- Simulado 6 — Iceberg (Q063–Q074)
insert into public.assessment_questions (assessment_id, question_id) values
  (a_sim6, 'f0060000-0000-0000-0000-000000000001'),
  (a_sim6, 'f0060000-0000-0000-0000-000000000002'),
  (a_sim6, 'f0060000-0000-0000-0000-000000000003'),
  (a_sim6, 'f0060000-0000-0000-0000-000000000004'),
  (a_sim6, 'f0060000-0000-0000-0000-000000000005'),
  (a_sim6, 'f0060000-0000-0000-0000-000000000006'),
  (a_sim6, 'f0060000-0000-0000-0000-000000000007'),
  (a_sim6, 'f0060000-0000-0000-0000-000000000008'),
  (a_sim6, 'f0060000-0000-0000-0000-000000000009'),
  (a_sim6, 'f0060000-0000-0000-0000-000000000010'),
  (a_sim6, 'f0060000-0000-0000-0000-000000000011'),
  (a_sim6, 'f0060000-0000-0000-0000-000000000012')
on conflict do nothing;

-- Simulado 7 — Range e Zonas (Q075–Q086)
insert into public.assessment_questions (assessment_id, question_id) values
  (a_sim7, 'f0070000-0000-0000-0000-000000000001'),
  (a_sim7, 'f0070000-0000-0000-0000-000000000002'),
  (a_sim7, 'f0070000-0000-0000-0000-000000000003'),
  (a_sim7, 'f0070000-0000-0000-0000-000000000004'),
  (a_sim7, 'f0070000-0000-0000-0000-000000000005'),
  (a_sim7, 'f0070000-0000-0000-0000-000000000006'),
  (a_sim7, 'f0070000-0000-0000-0000-000000000007'),
  (a_sim7, 'f0070000-0000-0000-0000-000000000008'),
  (a_sim7, 'f0070000-0000-0000-0000-000000000009'),
  (a_sim7, 'f0070000-0000-0000-0000-000000000010'),
  (a_sim7, 'f0070000-0000-0000-0000-000000000011'),
  (a_sim7, 'f0070000-0000-0000-0000-000000000012')
on conflict do nothing;

-- Simulado 8 — Macroeconomia (Q087–Q100)
insert into public.assessment_questions (assessment_id, question_id) values
  (a_sim8, 'f0080000-0000-0000-0000-000000000001'),
  (a_sim8, 'f0080000-0000-0000-0000-000000000002'),
  (a_sim8, 'f0080000-0000-0000-0000-000000000003'),
  (a_sim8, 'f0080000-0000-0000-0000-000000000004'),
  (a_sim8, 'f0080000-0000-0000-0000-000000000005'),
  (a_sim8, 'f0080000-0000-0000-0000-000000000006'),
  (a_sim8, 'f0080000-0000-0000-0000-000000000007'),
  (a_sim8, 'f0080000-0000-0000-0000-000000000008'),
  (a_sim8, 'f0080000-0000-0000-0000-000000000009'),
  (a_sim8, 'f0080000-0000-0000-0000-000000000010'),
  (a_sim8, 'f0080000-0000-0000-0000-000000000011'),
  (a_sim8, 'f0080000-0000-0000-0000-000000000012'),
  (a_sim8, 'f0080000-0000-0000-0000-000000000013'),
  (a_sim8, 'f0080000-0000-0000-0000-000000000014')
on conflict do nothing;

-- Prova Final — todas as 100 questões (pool completo, sorteio de 40)
insert into public.assessment_questions (assessment_id, question_id)
select a_final, id from public.questions where is_published = true
on conflict do nothing;

end $$;
