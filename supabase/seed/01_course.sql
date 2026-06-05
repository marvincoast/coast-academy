-- =============================================================
-- Seed: Coast Academy — Tape Reading e Análise de Fluxo
-- Market: BR (Dólar Futuro B3)
-- Structure: 8 módulos · 18 capítulos · 48 aulas
-- =============================================================

do $$
declare
  -- ─── IDs do Curso ─────────────────────────────────────────
  v_course_id  uuid := 'c0000000-0000-0000-0000-000000000001';

  -- ─── IDs dos Módulos ──────────────────────────────────────
  v_mod1  uuid := 'a0000000-0000-0000-0000-000000000001'; -- Fundamentos
  v_mod2  uuid := 'a0000000-0000-0000-0000-000000000002'; -- Book de Ofertas
  v_mod3  uuid := 'a0000000-0000-0000-0000-000000000003'; -- Times & Trades
  v_mod4  uuid := 'a0000000-0000-0000-0000-000000000004'; -- Absorção
  v_mod5  uuid := 'a0000000-0000-0000-0000-000000000005'; -- Exaustão/Escora
  v_mod6  uuid := 'a0000000-0000-0000-0000-000000000006'; -- Iceberg
  v_mod7  uuid := 'a0000000-0000-0000-0000-000000000007'; -- Range e Zonas
  v_mod8  uuid := 'a0000000-0000-0000-0000-000000000008'; -- Macro e Câmbio

  -- ─── IDs dos Capítulos ────────────────────────────────────
  -- Módulo 1
  v_ch1_1 uuid := 'b0000000-0001-0000-0000-000000000001';
  v_ch1_2 uuid := 'b0000000-0001-0000-0000-000000000002';
  -- Módulo 2
  v_ch2_1 uuid := 'b0000000-0002-0000-0000-000000000001';
  v_ch2_2 uuid := 'b0000000-0002-0000-0000-000000000002';
  v_ch2_3 uuid := 'b0000000-0002-0000-0000-000000000003';
  -- Módulo 3
  v_ch3_1 uuid := 'b0000000-0003-0000-0000-000000000001';
  v_ch3_2 uuid := 'b0000000-0003-0000-0000-000000000002';
  -- Módulo 4
  v_ch4_1 uuid := 'b0000000-0004-0000-0000-000000000001';
  v_ch4_2 uuid := 'b0000000-0004-0000-0000-000000000002';
  -- Módulo 5
  v_ch5_1 uuid := 'b0000000-0005-0000-0000-000000000001';
  v_ch5_2 uuid := 'b0000000-0005-0000-0000-000000000002';
  -- Módulo 6
  v_ch6_1 uuid := 'b0000000-0006-0000-0000-000000000001';
  v_ch6_2 uuid := 'b0000000-0006-0000-0000-000000000002';
  -- Módulo 7
  v_ch7_1 uuid := 'b0000000-0007-0000-0000-000000000001';
  v_ch7_2 uuid := 'b0000000-0007-0000-0000-000000000002';
  -- Módulo 8
  v_ch8_1 uuid := 'b0000000-0008-0000-0000-000000000001';
  v_ch8_2 uuid := 'b0000000-0008-0000-0000-000000000002';
begin

-- ──────────────────────────────────────────────────────────────
-- CURSO
-- ──────────────────────────────────────────────────────────────
insert into public.courses (id, title, subtitle, description, market, is_published)
values (
  v_course_id,
  'Coast Academy — Tape Reading e Análise de Fluxo',
  'Mercado Brasileiro de Dólar Futuro (DOL/WDO) na B3',
  'O curso mais completo de tape reading e análise de fluxo aplicado ao mercado de dólar futuro da B3. '
  'Você aprenderá a ler o book de ofertas, interpretar o times & trades, identificar absorções, exaustões, '
  'escoras de players, lotes iceberg, zonas de variação e fundamentos macroeconômicos que movem o câmbio. '
  'Ao final, você estará apto a operar com base no fluxo real do mercado, sem depender de indicadores atrasados.',
  'BR',
  true
)
on conflict (id) do nothing;

-- ──────────────────────────────────────────────────────────────
-- MÓDULO 1 — Fundamentos do Tape Reading
-- ──────────────────────────────────────────────────────────────
insert into public.modules (id, course_id, title, description, order_index, is_published) values
(v_mod1, v_course_id,
 'Fundamentos do Tape Reading',
 'Entenda a origem, filosofia e ferramentas essenciais do tape reading. '
 'A diferença entre o trader de fluxo e o trader técnico tradicional.',
 1, true)
on conflict (course_id, order_index) do nothing;

-- Capítulo 1.1
insert into public.chapters (id, module_id, title, order_index, is_published) values
(v_ch1_1, v_mod1, 'O que é Tape Reading?', 1, true)
on conflict (module_id, order_index) do nothing;

insert into public.lessons
  (id, chapter_id, title, description, content_type, content_markdown, duration_seconds, order_index, is_published)
values
(
  'e1100000-0000-0000-0000-000000000001', v_ch1_1,
  'História e origem do tape reading',
  'Jesse Livermore, Richard Wyckoff e como a leitura da fita nasceu nas bolsas do século XIX.',
  'text',
  E'# História e Origem do Tape Reading\n\n'
  '## O telégrafo e a fita de papel\n\n'
  'Antes dos computadores, as cotações chegavam às corretoras por telégrafo impressas em fitas de papel — '
  'o famoso *ticker tape*. Traders como **Jesse Livermore** e **Richard Wyckoff** desenvolveram a habilidade '
  'de ler esses dados brutos de preço e volume para antecipar movimentos do mercado.\n\n'
  '## Por que o fluxo nunca mente\n\n'
  'Indicadores técnicos são derivados do preço; o tape reading **é** o preço. '
  'Ao observar onde o dinheiro grande está entrando ou saindo, você enxerga a intenção real do mercado '
  'sem o atraso dos indicadores.\n\n'
  '## Aplicação moderna\n\n'
  'No dólar futuro da B3 (DOL/WDO), o "tape" é o **Times & Trades** e o **Book de Ofertas**. '
  'As mesmas técnicas de Livermore se aplicam diretamente — apenas a velocidade aumentou.\n\n'
  '> **Reflexão:** O mercado é composto de seres humanos tomando decisões. '
  'O fluxo de ordens revela a psicologia coletiva em tempo real.',
  420, 1, true
),
(
  'e1100000-0000-0000-0000-000000000002', v_ch1_1,
  'Tape reading vs. análise técnica tradicional',
  'Por que o fluxo supera o gráfico de velas na tomada de decisão em curto prazo.',
  'text',
  E'# Tape Reading vs. Análise Técnica Tradicional\n\n'
  '## A diferença fundamental\n\n'
  '| Aspecto | Análise Técnica | Tape Reading |\n'
  '|---|---|---|\n'
  '| Base | Preço histórico | Fluxo de ordens em tempo real |\n'
  '| Atraso | Sempre atrasado | Zero atraso |\n'
  '| Ferramenta | Gráfico de velas | Book + Times & Trades |\n'
  '| Sinal | Padrão gráfico | Comportamento do dinheiro grande |\n\n'
  '## Quando a análise técnica falha\n\n'
  'Suportes e resistências são conhecidos por **todos** — inclusive pelos players que **vão rompê-los** '
  'para acionar stops e capturar liquidez. O tape lhe diz se o rompimento é genuíno ou falso.\n\n'
  '## Complementaridade\n\n'
  'O trader de fluxo usa o gráfico como **contexto** (tendência, zonas macro) e o tape como **gatilho**. '
  'Nunca ignore o contexto gráfico, mas sempre execute baseado no fluxo.',
  360, 2, true
)
on conflict (chapter_id, order_index) do nothing;

-- Capítulo 1.2
insert into public.chapters (id, module_id, title, order_index, is_published) values
(v_ch1_2, v_mod1, 'Mercado de Dólar Futuro — Estrutura Básica', 2, true)
on conflict (module_id, order_index) do nothing;

insert into public.lessons
  (id, chapter_id, title, description, content_type, content_markdown, duration_seconds, order_index, is_published)
values
(
  'e1200000-0000-0000-0000-000000000001', v_ch1_2,
  'DOL e WDO: contratos e especificações',
  'Tamanho dos contratos, variação mínima, horário de negociação e características do mercado.',
  'text',
  E'# DOL e WDO — Contratos de Dólar Futuro na B3\n\n'
  '## Dólar Cheio (DOL)\n\n'
  '- **Tamanho:** USD 50.000 por contrato\n'
  '- **Variação mínima (tick):** R$ 0,50 = R$ 25,00 por contrato\n'
  '- **Vencimento:** mensal (primeiro dia útil do mês)\n'
  '- **Código:** DOL + mês + ano (ex: DOLM25 = junho/2025)\n\n'
  '## Mini Dólar (WDO)\n\n'
  '- **Tamanho:** USD 10.000 por contrato (1/5 do DOL)\n'
  '- **Variação mínima (tick):** R$ 0,50 = R$ 5,00 por contrato\n'
  '- **Vencimento:** mensal\n'
  '- **Público:** varejo e iniciantes pela menor margem\n\n'
  '## Horário\n\n'
  '- **Eletrônico:** 09:00 – 18:00 (Brasília)\n'
  '- **Após ajuste:** 18:01 – 18:30 (apenas ajuste de posição)\n\n'
  '## Por que o WDO é mais fácil para tape reading?\n\n'
  'O WDO tem **muito mais volume de contratos individuais** o que cria mais ruído no book — '
  'porém o DOL revela melhor o comportamento do dinheiro institucional.',
  480, 1, true
),
(
  'e1200000-0000-0000-0000-000000000002', v_ch1_2,
  'Participantes do mercado e seus papéis',
  'Bancos, fundos, exportadores, importadores, arbitradores e o trader de varejo.',
  'text',
  E'# Participantes do Mercado de Câmbio\n\n'
  '## A hierarquia do dinheiro\n\n'
  '### Tier 1 — Formadores de mercado (Market Makers)\n'
  'Grandes bancos (Itaú, Bradesco, Goldman Sachs Brasil) que **sempre têm preço** '
  'para compra e venda. Eles criam o spread e gerenciam o risco da carteira de câmbio.\n\n'
  '### Tier 2 — Players institucionais\n'
  'Fundos de hedge, fundos multimercado, exportadores e importadores que precisam '
  '**hedgear** exposição ao dólar. Suas ordens movem o mercado.\n\n'
  '### Tier 3 — Varejo especulativo\n'
  'Traders pessoa física. **Nós somos a liquidez** que os players maiores buscam. '
  'Entender isso é fundamental para não ser a contraparte errada.\n\n'
  '## O que cada player revela no fluxo\n\n'
  '- **Exportador vendendo:** pressão vendedora consistente, geralmente próximo a topos\n'
  '- **Importador comprando:** suporte compredor em correções\n'
  '- **Fundo especulativo:** grandes lotes no T&T, agressões rápidas e decisivas\n'
  '- **Market maker:** ordens no book que aparecem e desaparecem (spoofing é proibido mas ocorre)',
  450, 2, true
)
on conflict (chapter_id, order_index) do nothing;

-- ──────────────────────────────────────────────────────────────
-- MÓDULO 2 — Book de Ofertas
-- ──────────────────────────────────────────────────────────────
insert into public.modules (id, course_id, title, description, order_index, is_published) values
(v_mod2, v_course_id,
 'Book de Ofertas — Leitura e Interpretação',
 'O book de ofertas é o coração do tape reading. Aprenda a ler profundidade, '
 'desequilíbrios, renovações e o que o dinheiro grande está sinalizando.',
 2, true)
on conflict (course_id, order_index) do nothing;

-- Capítulo 2.1
insert into public.chapters (id, module_id, title, order_index, is_published) values
(v_ch2_1, v_mod2, 'Estrutura do Book de Ofertas', 1, true)
on conflict (module_id, order_index) do nothing;

insert into public.lessons
  (id, chapter_id, title, description, content_type, content_markdown, duration_seconds, order_index, is_published)
values
(
  'e2100000-0000-0000-0000-000000000001', v_ch2_1,
  'Bid, Ask e Spread — o básico que não é básico',
  'Como o book é formado, o papel do spread e o que a profundidade nos conta.',
  'text',
  E'# Bid, Ask e Spread\n\n'
  '## Anatomia do book\n\n'
  '```\n'
  'VENDEDORES (Ask / Oferta)\n'
  '   Preço    Qtd\n'
  '   5.1050    45  ← melhor ask (topo do book vendedor)\n'
  '   5.1055   120\n'
  '   5.1060    80\n'
  '   ── SPREAD ──\n'
  '   5.1045    60  ← melhor bid (topo do book comprador)\n'
  '   5.1040    95\n'
  '   5.1035   210\n'
  'COMPRADORES (Bid / Demanda)\n'
  '```\n\n'
  '## O que o spread revela\n\n'
  'No WDO o spread geralmente é de **1 tick (0,50)**. Quando o spread abre para 2+ ticks, '
  'o mercado está **ilíquido** ou há incerteza — sinal para reduzir exposição.\n\n'
  '## Profundidade (depth) importa?\n\n'
  'Sim. Um book com 500 contratos no bid e 50 no ask está **desequilibrado**. '
  'Mas atenção: a profundidade pode ser **falsa** — ordens canceladas antes de serem executadas.',
  390, 1, true
),
(
  'e2100000-0000-0000-0000-000000000002', v_ch2_1,
  'Desequilíbrios no book e sua leitura',
  'Como identificar quando o book está assimétrico e o que isso sinaliza.',
  'text',
  E'# Desequilíbrios no Book de Ofertas\n\n'
  '## Definição\n\n'
  'Um desequilíbrio ocorre quando um lado do book tem **volume significativamente maior** que o outro. '
  'Regra prática: desequilíbrio > 3:1 é relevante.\n\n'
  '## Tipos de desequilíbrio\n\n'
  '### Desequilíbrio favorável ao comprador\n'
  '- Muito mais volume no bid do que no ask\n'
  '- **Interpretação:** pressão compradora — preço tende a subir\n'
  '- **Cuidado:** pode ser blefe (ordens colocadas para criar percepção)\n\n'
  '### Desequilíbrio favorável ao vendedor\n'
  '- Muito mais volume no ask do que no bid\n'
  '- **Interpretação:** pressão vendedora — preço tende a cair\n\n'
  '## O teste de confirmação\n\n'
  'Um desequilíbrio **verdadeiro** é confirmado quando:\n'
  '1. O preço se move na direção do lado com mais volume\n'
  '2. O book se reconfigura rapidamente após o movimento\n'
  '3. O Times & Trades mostra agressão consistente no mesmo sentido',
  420, 2, true
)
on conflict (chapter_id, order_index) do nothing;

-- Capítulo 2.2
insert into public.chapters (id, module_id, title, order_index, is_published) values
(v_ch2_2, v_mod2, 'Comportamento Avançado do Book', 2, true)
on conflict (module_id, order_index) do nothing;

insert into public.lessons
  (id, chapter_id, title, description, content_type, content_markdown, duration_seconds, order_index, is_published)
values
(
  'e2200000-0000-0000-0000-000000000001', v_ch2_2,
  'Renovação e cancelamento de ordens',
  'Como diferenciar liquidez real de artificial no book.',
  'text',
  E'# Renovação e Cancelamento de Ordens\n\n'
  '## Liquidez real vs. artificial\n\n'
  '**Liquidez real:** a ordem é executada quando o preço chega nela.\n'
  '**Liquidez artificial (layering/spoofing):** a ordem é cancelada antes da execução, '
  'com objetivo de criar percepção falsa de pressão.\n\n'
  '## Como identificar\n\n'
  '### Sinal de liquidez real\n'
  '- A ordem **permanece** mesmo quando o preço se aproxima\n'
  '- Ela é progressivamente consumida pelo T&T\n'
  '- O book defende o nível (renovação após consumo parcial)\n\n'
  '### Sinal de liquidez artificial\n'
  '- A ordem **desaparece** quando o preço está a 1-2 ticks\n'
  '- Padrão repetitivo de aparição + cancelamento\n'
  '- Nunca aparece no T&T\n\n'
  '## Implicação operacional\n\n'
  'Opere **na direção da liquidez que absorve**, não na direção da que foge.',
  450, 1, true
),
(
  'e2200000-0000-0000-0000-000000000002', v_ch2_2,
  'Suporte e resistência pelo book',
  'Identificando levels significativos através da concentração de ordens.',
  'text',
  E'# Suporte e Resistência pelo Book de Ofertas\n\n'
  '## Por que o book cria suportes/resistências reais\n\n'
  'Diferentemente do suporte gráfico (que é uma observação histórica), '
  'o suporte pelo book é **dinheiro real aguardando** para comprar. '
  'É muito mais confiável — enquanto a ordem estiver lá.\n\n'
  '## Identificando o nível\n\n'
  '- Concentração de > 200 contratos (WDO) em um único preço\n'
  '- Renovação constante mesmo com consumo parcial\n'
  '- Outras ordens se empilhando logo abaixo/acima\n\n'
  '## Estratégias\n\n'
  '**Comprar no suporte do book:** entrada com risco definido (stop = rompimento do nível)\n'
  '**Vender na resistência do book:** idem para o lado vendedor\n\n'
  '## Armadilha\n\n'
  'Grandes players **sabem** que todos veem os mesmos níveis. '
  'É comum perfurar ligeiramente o suporte para acionar stops antes de reverter — '
  'observe o T&T para confirmar se o rompimento tem volume real.',
  480, 2, true
)
on conflict (chapter_id, order_index) do nothing;

-- Capítulo 2.3
insert into public.chapters (id, module_id, title, order_index, is_published) values
(v_ch2_3, v_mod2, 'Leitura em Tempo Real — Exercícios Práticos', 3, true)
on conflict (module_id, order_index) do nothing;

insert into public.lessons
  (id, chapter_id, title, description, content_type, content_markdown, duration_seconds, order_index, is_published)
values
(
  'e2300000-0000-0000-0000-000000000001', v_ch2_3,
  'Método de leitura em 30 segundos',
  'Framework rápido para avaliar o book antes de cada operação.',
  'text',
  E'# Método de Leitura do Book em 30 Segundos\n\n'
  '## O checklist do trader de fluxo\n\n'
  '### Passo 1 — Equilíbrio (5s)\n'
  '- Qual lado tem mais volume? Desequilíbrio > 2:1?\n\n'
  '### Passo 2 — Profundidade (10s)\n'
  '- Onde está a maior concentração de ordens?\n'
  '- Esse nível se manteve nos últimos 5 minutos?\n\n'
  '### Passo 3 — Renovação (10s)\n'
  '- As grandes ordens estão sendo renovadas após consumo?\n'
  '- Ou desaparecem quando o preço se aproxima?\n\n'
  '### Passo 4 — Contexto (5s)\n'
  '- O T&T confirma a mesma direção que o book sugere?\n'
  '- Estou no sentido da tendência de curto prazo?\n\n'
  '## Regra de ouro\n\n'
  '> **Nunca opere apenas pelo book. Sempre confirme no Times & Trades.**\n\n'
  'O book é intenção. O T&T é execução. Só a execução move o preço.',
  300, 1, true
)
on conflict (chapter_id, order_index) do nothing;

-- ──────────────────────────────────────────────────────────────
-- MÓDULO 3 — Times & Trades
-- ──────────────────────────────────────────────────────────────
insert into public.modules (id, course_id, title, description, order_index, is_published) values
(v_mod3, v_course_id,
 'Times & Trades — A Fita em Tempo Real',
 'Aprenda a ler o fluxo de negócios executados, identificar agressão, '
 'tamanho de lote e ritmo das operações para antecipar movimentos.',
 3, true)
on conflict (course_id, order_index) do nothing;

-- Capítulo 3.1
insert into public.chapters (id, module_id, title, order_index, is_published) values
(v_ch3_1, v_mod3, 'Como Ler a Fita', 1, true)
on conflict (module_id, order_index) do nothing;

insert into public.lessons
  (id, chapter_id, title, description, content_type, content_markdown, duration_seconds, order_index, is_published)
values
(
  'e3100000-0000-0000-0000-000000000001', v_ch3_1,
  'Estrutura do Times & Trades',
  'Colunas, cores, tamanho de lote e como filtrar o ruído.',
  'text',
  E'# Estrutura do Times & Trades\n\n'
  '## O que cada coluna significa\n\n'
  '| Coluna | Significado |\n'
  '|---|---|\n'
  '| Hora | Timestamp do negócio executado |\n'
  '| Preço | Preço de execução |\n'
  '| Quantidade | Contratos executados neste negócio |\n'
  '| Direção | Comprador ou vendedor agrediu |\n\n'
  '## Cores padrão\n\n'
  '- **Verde/Azul:** agressão compradora (negócio no ask)\n'
  '- **Vermelho:** agressão vendedora (negócio no bid)\n\n'
  '## Filtragem de ruído\n\n'
  'Configure seu T&T para mostrar apenas lotes ≥ **5 contratos** (WDO) ou ≥ **1 contrato** (DOL). '
  'Lotes menores são ruído de varejo e poluem a leitura.\n\n'
  '## Velocidade da fita\n\n'
  'A **velocidade** do T&T é tão importante quanto o tamanho dos lotes:\n'
  '- Fita acelerando → urgência de um lado\n'
  '- Fita travando → equilíbrio, aguardar definição',
  420, 1, true
),
(
  'e3100000-0000-0000-0000-000000000002', v_ch3_1,
  'Agressão compradora e vendedora',
  'Como diferenciar quem está agredindo e o que isso significa para o preço.',
  'text',
  E'# Agressão Compradora e Vendedora\n\n'
  '## Conceito de agressão\n\n'
  'No mercado, há dois tipos de participantes:\n'
  '- **Passivos (market makers):** colocam ordens no book e **aguardam** execução\n'
  '- **Agressores:** entram a mercado, **aceitando** o preço do passivo\n\n'
  'A agressão é o sinal mais puro de intenção: alguém está **urgente** para comprar ou vender.\n\n'
  '## Leitura de agressão no T&T\n\n'
  '**Negócio no ask (topo do book vendedor):**\n'
  '→ Comprador agrediu. Pagou o preço do vendedor. **Alta probabilidade de subida.**\n\n'
  '**Negócio no bid (topo do book comprador):**\n'
  '→ Vendedor agrediu. Aceitou o preço do comprador. **Alta probabilidade de queda.**\n\n'
  '## Sequências de agressão\n\n'
  '3+ agressões consecutivas no mesmo sentido com lotes crescentes = **momentum real**.\n'
  'Lotes decrescentes = **esgotamento do movimento**, possível reversão.',
  390, 2, true
)
on conflict (chapter_id, order_index) do nothing;

-- Capítulo 3.2
insert into public.chapters (id, module_id, title, order_index, is_published) values
(v_ch3_2, v_mod3, 'Padrões Avançados na Fita', 2, true)
on conflict (module_id, order_index) do nothing;

insert into public.lessons
  (id, chapter_id, title, description, content_type, content_markdown, duration_seconds, order_index, is_published)
values
(
  'e3200000-0000-0000-0000-000000000001', v_ch3_2,
  'Sequências e ritmo das agressões',
  'Como o ritmo do T&T antecipa o próximo movimento do preço.',
  'text',
  E'# Sequências e Ritmo das Agressões\n\n'
  '## O ritmo como indicador\n\n'
  'O preço se move quando há **desequilíbrio de agressão**. '
  'O ritmo (frequência de negócios por segundo) revela a intensidade desse desequilíbrio.\n\n'
  '## Padrões de ritmo\n\n'
  '### Aceleração unidirecional\n'
  '- Negócios se sucedem rapidamente todos no mesmo lado\n'
  '- Sinal: **entrada do lado dominante**\n\n'
  '### Alternância equilibrada\n'
  '- Compras e vendas se revezam sem domínio claro\n'
  '- Sinal: **lateralização, aguardar**\n\n'
  '### Desaceleração após impulso\n'
  '- Fita que acelerou e agora freia no mesmo preço\n'
  '- Sinal: **possível reversão ou consolidação**\n\n'
  '## Ferramenta prática: contagem de lote\n\n'
  'Some o total de contratos comprados e vendidos nos últimos 60 segundos. '
  'Diferença > 30% em um sentido confirma a direção dominante.',
  450, 1, true
),
(
  'e3200000-0000-0000-0000-000000000002', v_ch3_2,
  'Grandes lotes e seu impacto no preço',
  'Como identificar a entrada de players institucionais pelo tamanho dos negócios.',
  'text',
  E'# Grandes Lotes e Impacto no Preço\n\n'
  '## O que é um "lote grande"?\n\n'
  'No WDO (mini dólar), considere:\n'
  '- **Lote grande:** ≥ 50 contratos em um único negócio\n'
  '- **Lote institucional:** ≥ 200 contratos\n\n'
  'No DOL cheio:\n'
  '- **Lote grande:** ≥ 10 contratos\n'
  '- **Lote institucional:** ≥ 50 contratos\n\n'
  '## O que um grande lote revela\n\n'
  '**Lote grande agredindo:** um player com convicção entrou rapidamente, '
  'sem se preocupar com slippage. Alta urgência.\n\n'
  '**Lote grande passivo (iceberg):** veremos no Módulo 6, mas a ausência de impacto '
  'no preço após um grande lote é o primeiro sinal.\n\n'
  '## Armadilha do lote grande\n\n'
  'Um único lote enorme pode ser **encerramento de posição**, não abertura. '
  'Confirme sempre: o preço está respondendo? O T&T continua fluindo no mesmo sentido?',
  420, 2, true
)
on conflict (chapter_id, order_index) do nothing;

-- ──────────────────────────────────────────────────────────────
-- MÓDULO 4 — Absorção
-- ──────────────────────────────────────────────────────────────
insert into public.modules (id, course_id, title, description, order_index, is_published) values
(v_mod4, v_course_id,
 'Absorção — O Conceito Central do Fluxo',
 'A absorção é quando um player de grande porte aceita toda a oferta (ou demanda) '
 'sem deixar o preço se mover. É o sinal mais poderoso de reversão ou continuação.',
 4, true)
on conflict (course_id, order_index) do nothing;

-- Capítulo 4.1
insert into public.chapters (id, module_id, title, order_index, is_published) values
(v_ch4_1, v_mod4, 'Absorção em Preço Fixo', 1, true)
on conflict (module_id, order_index) do nothing;

insert into public.lessons
  (id, chapter_id, title, description, content_type, content_markdown, duration_seconds, order_index, is_published)
values
(
  'e4100000-0000-0000-0000-000000000001', v_ch4_1,
  'Conceito e identificação da absorção',
  'O que é absorção, por que ela acontece e como identificá-la no book e no T&T.',
  'text',
  E'# Absorção — Conceito e Identificação\n\n'
  '## O que é absorção\n\n'
  'Absorção ocorre quando um player **compra toda a pressão vendedora** (ou vende toda a pressão compradora) '
  'em um determinado preço, impedindo que o mercado avance.\n\n'
  '**Analogia:** imagine uma esponja. O vendedor agride com força, mas o preço não cai — '
  'alguém está "absorvendo" cada contrato vendido com uma compra equivalente.\n\n'
  '## Por que acontece\n\n'
  '1. Um player grande quer acumular posição **sem revelar sua mão**\n'
  '2. O preço está em uma zona importante (suporte institucional)\n'
  '3. Formadores de mercado estão equilibrando exposição\n\n'
  '## Como identificar no T&T\n\n'
  '- Alto volume de agressão vendedora **sem queda de preço**\n'
  '- O preço permanece travado no mesmo nível por múltiplos negócios\n'
  '- O book vendedor é continuamente renovado\n\n'
  '## Como identificar no book\n\n'
  '- Grandes ordens compradoras no bid que se renovam após consumo\n'
  '- O nível não é rompido apesar da pressão contrária',
  540, 1, true
),
(
  'e4100000-0000-0000-0000-000000000002', v_ch4_1,
  'Absorção em preço fixo — exemplos práticos',
  'Cenários reais de absorção em suportes e resistências do dólar futuro.',
  'text',
  E'# Absorção em Preço Fixo — Exemplos Práticos\n\n'
  '## Cenário 1: Absorção compradora em suporte\n\n'
  '**Contexto:** WDOH25 em queda. Preço toca 5.0500.\n\n'
  '**O que aparece no T&T:**\n'
  '```\n'
  '14:23:01  5.0500  VND  85 contratos\n'
  '14:23:02  5.0500  VND  120 contratos\n'
  '14:23:02  5.0500  VND  65 contratos\n'
  '14:23:03  5.0500  VND  200 contratos ← lote grande\n'
  '→ PREÇO NÃO CAI\n'
  '14:23:05  5.0500  CPR  150 contratos\n'
  '14:23:06  5.0505  CPR  80 contratos  ← início de recuperação\n'
  '```\n\n'
  '**Interpretação:** 470 contratos vendidos em 2 segundos, preço travado. '
  'Alguém absorbeu toda a pressão. Compra no rompimento de 5.0505.\n\n'
  '## Cenário 2: Absorção vendedora em resistência\n\n'
  '**Contexto:** Rally comprando. Preço toca 5.1000 (nível psicológico redondo).\n\n'
  '**Sinal:** Agressões compradoras consecutivas sem avanço de preço. '
  'Book vendedor continuamente renovado a 5.1000. '
  '→ **Venda na perda de 5.0995.**',
  480, 2, true
)
on conflict (chapter_id, order_index) do nothing;

-- Capítulo 4.2
insert into public.chapters (id, module_id, title, order_index, is_published) values
(v_ch4_2, v_mod4, 'Absorção em Múltiplos Níveis', 2, true)
on conflict (module_id, order_index) do nothing;

insert into public.lessons
  (id, chapter_id, title, description, content_type, content_markdown, duration_seconds, order_index, is_published)
values
(
  'e4200000-0000-0000-0000-000000000001', v_ch4_2,
  'Absorção progressiva em escada',
  'Como os players grandes absorvem ao longo de uma faixa de preço, não em um único nível.',
  'text',
  E'# Absorção Progressiva em Escada\n\n'
  '## O que é a absorção em múltiplos níveis\n\n'
  'Nem sempre a absorção ocorre em um único preço. Um player grande pode acumular posição '
  'ao longo de uma **faixa** de 5-10 ticks, absorvendo a pressão gradualmente.\n\n'
  '## Padrão no T&T\n\n'
  '```\n'
  'Queda do preço com agressão vendedora moderada\n'
  '5.0520  VND  40 → preço recua para 5.0520\n'
  '5.0515  VND  55 → preço recua para 5.0515\n'
  '5.0510  VND  90 → preço TRAVA\n'
  '5.0510  VND  120 → ainda travado\n'
  '5.0510  VND  80 → renovação compradora evidente\n'
  '→ REVERSÃO\n'
  '```\n\n'
  '## Como operar\n\n'
  '- Não entrar na primeira absorção — aguardar confirmação\n'
  '- Entrada após o preço parar de cair E o T&T mostrar agressão compradora\n'
  '- Stop abaixo do nível mínimo da escada de absorção\n\n'
  '## Diferença para tendência\n\n'
  'Na tendência de queda, o preço **não para** em nenhum nível. '
  'A absorção em escada se distingue porque cada recuo é menor que o anterior.',
  510, 1, true
)
on conflict (chapter_id, order_index) do nothing;

-- ──────────────────────────────────────────────────────────────
-- MÓDULO 5 — Exaustão e Escora de Player
-- ──────────────────────────────────────────────────────────────
insert into public.modules (id, course_id, title, description, order_index, is_published) values
(v_mod5, v_course_id,
 'Exaustão e Escora de Player',
 'Reconheça quando uma tendência está se esgotando através da leitura de exaustão '
 'e identifique a escora — o comportamento de players que sustentam movimentos artificialmente.',
 5, true)
on conflict (course_id, order_index) do nothing;

-- Capítulo 5.1
insert into public.chapters (id, module_id, title, order_index, is_published) values
(v_ch5_1, v_mod5, 'Exaustão de Tendência', 1, true)
on conflict (module_id, order_index) do nothing;

insert into public.lessons
  (id, chapter_id, title, description, content_type, content_markdown, duration_seconds, order_index, is_published)
values
(
  'e5100000-0000-0000-0000-000000000001', v_ch5_1,
  'Exaustão compradora — identificação e operação',
  'Como reconhecer quando um rally está terminando antes que o preço reverta.',
  'text',
  E'# Exaustão Compradora\n\n'
  '## O que é exaustão\n\n'
  'Exaustão é quando um movimento de alta (ou baixa) **perde força progressivamente**, '
  'mesmo que o preço ainda avance. Os compradores estão "ficando sem munição".\n\n'
  '## Sinais de exaustão compradora no T&T\n\n'
  '1. **Lotes diminuindo:** agressões compradoras de 200 → 80 → 30 contratos\n'
  '2. **Preço subindo, mas devagar:** mesma quantidade de agressões, menor amplitude de preço\n'
  '3. **Contrapartidas surgindo:** primeiras vendas passivas resistindo no ask\n'
  '4. **Fita desacelerando:** pausas entre os negócios aumentam\n\n'
  '## O padrão clássico\n\n'
  '```\n'
  'Onda 1: +10 ticks em 30s (vigor total)\n'
  'Onda 2: +6 ticks em 45s (já fraqueja)\n'
  'Onda 3: +3 ticks em 60s (exaustão evidente)\n'
  '→ Venda no próximo sinal de pressão vendedora\n'
  '```\n\n'
  '## Armadilha comum\n\n'
  'Exaustão NÃO é sinal imediato de reversão — pode vir uma consolidação primeiro. '
  'Espere a **confirmação vendedora** antes de operar na ponta contrária.',
  480, 1, true
),
(
  'e5100000-0000-0000-0000-000000000002', v_ch5_1,
  'Exaustão vendedora — identificação e operação',
  'Os mesmos princípios aplicados à ponta vendedora e aos movimentos de queda.',
  'text',
  E'# Exaustão Vendedora\n\n'
  '## Espelho da exaustão compradora\n\n'
  'Todos os princípios se invertem:\n'
  '- Lotes de agressão vendedora diminuem progressivamente\n'
  '- A queda desacelera (cada onda cobre menos ticks)\n'
  '- Primeiros compradores passivos aparecem no bid\n\n'
  '## Momento de entrada\n\n'
  'A exaustão vendedora cria oportunidade de compra quando:\n'
  '1. A fita confirma o enfraquecimento (lotes menores)\n'
  '2. O book começa a mostrar acúmulo comprador\n'
  '3. A primeira agressão compradora significativa aparece\n\n'
  '## Nível psicológico + exaustão = setup poderoso\n\n'
  'Quando a exaustão vendedora coincide com um nível redondo importante '
  '(ex: 5.0000, 5.0500) ou com uma zona de variação do dia, o setup é ainda mais confiável.\n\n'
  '## Gestão de risco\n\n'
  '- Stop: abaixo da mínima da exaustão (nunca mais de 3 ticks no WDO)\n'
  '- Alvo: próximo nível de resistência pelo book ou zona de variação',
  420, 2, true
)
on conflict (chapter_id, order_index) do nothing;

-- Capítulo 5.2
insert into public.chapters (id, module_id, title, order_index, is_published) values
(v_ch5_2, v_mod5, 'Escora de Player', 2, true)
on conflict (module_id, order_index) do nothing;

insert into public.lessons
  (id, chapter_id, title, description, content_type, content_markdown, duration_seconds, order_index, is_published)
values
(
  'e5200000-0000-0000-0000-000000000001', v_ch5_2,
  'O que é escora e como identificar',
  'Quando um player grande sustenta o preço artificialmente e o que esperar quando parar.',
  'text',
  E'# Escora de Player\n\n'
  '## Definição\n\n'
  'Escora é o comportamento de um player que **mantém artificialmente** um preço, '
  'renovando continuamente suas ordens passivas para evitar que o mercado rompa um nível.\n\n'
  '## Por que um player espora o preço?\n\n'
  '1. Precisa de tempo para distribuir (vender) posição comprada\n'
  '2. Quer que o varejo compre no nível enquanto ele distribui\n'
  '3. Está aguardando um evento macro para liquidar\n\n'
  '## Sinais de escora no book\n\n'
  '- Ordem grande no bid sendo renovada constantemente\n'
  '- O preço "hesita" próximo a esse nível mas não cai\n'
  '- O T&T mostra agressões vendedoras sendo absorvidas repetidamente\n\n'
  '## O que acontece quando a escora para\n\n'
  'Quando o player para de renovar a ordem (porque concluiu a distribuição), '
  'o suporte desaparece abruptamente e o preço cai rapidamente.\n\n'
  '**Sinal:** a ordem grande some do book SEM ter sido executada. '
  'Em seguida, agressão vendedora sem resistência. → **Venda imediata.**',
  510, 1, true
)
on conflict (chapter_id, order_index) do nothing;

-- ──────────────────────────────────────────────────────────────
-- MÓDULO 6 — Iceberg (Lote Escondido)
-- ──────────────────────────────────────────────────────────────
insert into public.modules (id, course_id, title, description, order_index, is_published) values
(v_mod6, v_course_id,
 'Iceberg — O Lote Escondido',
 'Ordens iceberg permitem que players institucionais executem grandes volumes '
 'sem revelar sua real intenção no book. Aprenda a detectá-las.',
 6, true)
on conflict (course_id, order_index) do nothing;

-- Capítulo 6.1
insert into public.chapters (id, module_id, title, order_index, is_published) values
(v_ch6_1, v_mod6, 'Conceito e Mecânica do Iceberg', 1, true)
on conflict (module_id, order_index) do nothing;

insert into public.lessons
  (id, chapter_id, title, description, content_type, content_markdown, duration_seconds, order_index, is_published)
values
(
  'e6100000-0000-0000-0000-000000000001', v_ch6_1,
  'Como funciona uma ordem iceberg',
  'Mecânica técnica, tipos de iceberg e por que os grandes players os utilizam.',
  'text',
  E'# Como Funciona uma Ordem Iceberg\n\n'
  '## A metáfora do iceberg\n\n'
  'Uma ordem iceberg exibe apenas uma **fração** do seu volume total no book. '
  'À medida que é executada, automaticamente coloca mais volume — '
  'como um iceberg que afunda mas sempre mantém parte visível.\n\n'
  '## Exemplo prático\n\n'
  '```\n'
  'Player quer comprar 5.000 contratos (WDO)\n'
  'Configura iceberg com lote visível = 50 contratos\n\n'
  'Book mostra:  5.0500  CPR  50\n'
  '→ 50 contratos executados\n'
  'Book mostra:  5.0500  CPR  50  (renovação automática)\n'
  '→ 50 contratos executados\n'
  '(... repete 100 vezes = 5.000 contratos acumulados)\n'
  '```\n\n'
  '## Por que usar iceberg\n\n'
  '- **Discrição:** evita revelar intenção ao mercado\n'
  '- **Menor impacto:** ordens grandes visíveis movem o preço contra\n'
  '- **Execução a preço melhor:** acumula sem "empurrar" o mercado\n\n'
  '## Tipos de iceberg\n\n'
  '- **Peak (lote fixo):** sempre repõe o mesmo volume\n'
  '- **Random peak:** repõe volume aleatório (mais difícil de detectar)',
  480, 1, true
),
(
  'e6100000-0000-0000-0000-000000000002', v_ch6_1,
  'Identificando o iceberg no T&T e no book',
  'Padrões que revelam a presença de lotes escondidos.',
  'text',
  E'# Identificando o Iceberg\n\n'
  '## O paradoxo do iceberg\n\n'
  'O book mostra pouco volume, mas o T&T mostra execuções constantes no mesmo preço. '
  'Isso é o sinal mais claro: **muito mais passou pelo T&T do que o book mostrava.**\n\n'
  '## Padrão 1 — Renovação mecânica\n\n'
  'No book, uma ordem de tamanho fixo (ex: sempre 50 contratos) reaparece '
  'imediatamente após execução, no mesmo preço. '
  'Ordens humanas não renovam tão rapidamente — é algorítmico.\n\n'
  '## Padrão 2 — Volume no T&T vs. book\n\n'
  'Some todos os negócios no T&T no mesmo preço. '
  'Se a soma >> o que o book mostrou, há iceberg.\n\n'
  '```\n'
  'Book exibiu máximo de 50 contratos no preço 5.0500\n'
  'T&T acumulou 2.300 contratos executados a 5.0500\n'
  '→ ICEBERG CONFIRMADO\n'
  '```\n\n'
  '## Implicação operacional\n\n'
  'Iceberg comprador num suporte = acumulação institucional = compre no rompimento do topo.\n'
  'Iceberg vendedor numa resistência = distribuição = venda na perda do suporte.',
  510, 2, true
)
on conflict (chapter_id, order_index) do nothing;

-- Capítulo 6.2
insert into public.chapters (id, module_id, title, order_index, is_published) values
(v_ch6_2, v_mod6, 'Estratégia com Icebergs', 2, true)
on conflict (module_id, order_index) do nothing;

insert into public.lessons
  (id, chapter_id, title, description, content_type, content_markdown, duration_seconds, order_index, is_published)
values
(
  'e6200000-0000-0000-0000-000000000001', v_ch6_2,
  'Operando junto com o iceberg',
  'Como usar a detecção de iceberg para entrar na mesma direção que o dinheiro grande.',
  'text',
  E'# Operando Junto com o Iceberg\n\n'
  '## A lógica de seguir o dinheiro grande\n\n'
  'Quando detectamos um iceberg comprador, sabemos que:\n'
  '1. Um player com muito capital quer comprar\n'
  '2. Ele está pagando para acumular — tem convicção\n'
  '3. Quando terminar a acumulação, o preço tende a subir\n\n'
  '## Setup de entrada\n\n'
  '**Entrada:** assim que o iceberg se esgota e o preço começa a romper o nível\n'
  '**Stop:** abaixo do nível onde o iceberg estava operando (o "piso" da acumulação)\n'
  '**Alvo:** próxima resistência relevante pelo book\n\n'
  '## Atenção: o iceberg pode ser falso\n\n'
  'Alguns algoritmos criam icebergs propositalmente para atrair traders de fluxo '
  'e então reverter — literalmente "enganando o tape reader".\n\n'
  '**Confirmação obrigatória:**\n'
  '- O preço realmente avança após o esgotamento\n'
  '- O T&T confirma agressão no sentido esperado\n'
  '- O book do outro lado não tem iceberg contrário',
  480, 1, true
)
on conflict (chapter_id, order_index) do nothing;

-- ──────────────────────────────────────────────────────────────
-- MÓDULO 7 — Range de Volatilidade e Zonas de Variação
-- ──────────────────────────────────────────────────────────────
insert into public.modules (id, course_id, title, description, order_index, is_published) values
(v_mod7, v_course_id,
 'Range e Zonas de Variação do Dia',
 'O mercado de dólar futuro opera dentro de ranges estatísticos previsíveis. '
 'Aprenda a calcular as zonas de variação (0,5% · 1,0% · 1,5%) e usá-las como referência.',
 7, true)
on conflict (course_id, order_index) do nothing;

-- Capítulo 7.1
insert into public.chapters (id, module_id, title, order_index, is_published) values
(v_ch7_1, v_mod7, 'Range do Dia e Cálculo de Zonas', 1, true)
on conflict (module_id, order_index) do nothing;

insert into public.lessons
  (id, chapter_id, title, description, content_type, content_markdown, duration_seconds, order_index, is_published)
values
(
  'e7100000-0000-0000-0000-000000000001', v_ch7_1,
  'Zonas de variação: 0,5%, 1,0% e 1,5%',
  'Como calcular as zonas a partir do preço de ajuste e usá-las como alvos e referências.',
  'text',
  E'# Zonas de Variação do Dia\n\n'
  '## O que são as zonas\n\n'
  'As zonas de variação são **níveis percentuais calculados** a partir do preço de ajuste '
  'do dia anterior. Elas funcionam como alvos naturais de movimento e zonas de reversão.\n\n'
  '## Cálculo\n\n'
  '**Preço de ajuste anterior:** PA\n\n'
  '```\n'
  'Zona 0,5%: PA × 0.005\n'
  'Zona 1,0%: PA × 0.010\n'
  'Zona 1,5%: PA × 0.015\n\n'
  'Exemplo: PA = 5.0000\n'
  '  0,5% = 5.0000 ± 250 (5.0250 / 4.9750)\n'
  '  1,0% = 5.0000 ± 500 (5.0500 / 4.9500)\n'
  '  1,5% = 5.0000 ± 750 (5.0750 / 4.9250)\n'
  '```\n\n'
  '## Como usar\n\n'
  '- **0,5%:** alvo do primeiro trade do dia, zona de decisão\n'
  '- **1,0%:** extensão do movimento diário, reversão provável\n'
  '- **1,5%:** dia de alta volatilidade (evento macro), raramente ultrapassado sem catalisador\n\n'
  '## Combinando zonas com fluxo\n\n'
  'Quando o preço chega numa zona E o T&T mostra exaustão: setup de reversão de alta probabilidade.',
  480, 1, true
),
(
  'e7100000-0000-0000-0000-000000000002', v_ch7_1,
  'Range de volatilidade histórica',
  'Usando o range médio dos últimos dias para calibrar expectativas e dimensionar risco.',
  'text',
  E'# Range de Volatilidade Histórica\n\n'
  '## ATR aplicado ao dólar futuro\n\n'
  'O **ATR (Average True Range)** medido em ticks nos diz quanto o mercado tipicamente '
  'se move em um dia. Para o WDO:\n\n'
  '- **Dia normal:** 200-400 ticks (~R$0,01/contrato por tick)\n'
  '- **Dia de volatilidade:** 500-800 ticks\n'
  '- **Dia extremo (Copom, Payroll):** 1000+ ticks\n\n'
  '## Como usar o ATR operacionalmente\n\n'
  '**Dimensionamento de stop:** stop ≤ 20% do ATR diário\n'
  '**Alvo mínimo:** R/R ≥ 2:1 baseado no ATR\n\n'
  '## Relação entre ATR e zonas de variação\n\n'
  'Em dias de ATR baixo, a zona de 0,5% raramente é ultrapassada.\n'
  'Em dias de ATR alto, a zona de 1,0% é rotineiramente testada.\n\n'
  'Calibre seu plano de trading com o ATR do dia anterior para ter expectativas realistas.',
  420, 2, true
)
on conflict (chapter_id, order_index) do nothing;

-- Capítulo 7.2
insert into public.chapters (id, module_id, title, order_index, is_published) values
(v_ch7_2, v_mod7, 'Aplicação Prática das Zonas', 2, true)
on conflict (module_id, order_index) do nothing;

insert into public.lessons
  (id, chapter_id, title, description, content_type, content_markdown, duration_seconds, order_index, is_published)
values
(
  'e7200000-0000-0000-0000-000000000001', v_ch7_2,
  'Setups com zonas de variação e fluxo',
  'Como combinar as zonas percentuais com absorção, exaustão e iceberg para setups completos.',
  'text',
  E'# Setups com Zonas de Variação + Fluxo\n\n'
  '## O setup mais poderoso do tape reading\n\n'
  'A combinação mais confiável é: **zona de variação + exaustão/absorção + confirmação T&T**.\n\n'
  '## Setup Zona 1,0% + Exaustão\n\n'
  '**Contexto:** dólar em alta, tocando a zona de +1,0%\n\n'
  '**Sinal de entrada:**\n'
  '1. Preço na zona de +1,0%\n'
  '2. T&T mostra exaustão compradora (lotes caindo)\n'
  '3. Book vendedor se fortalece sem cancelamentos\n'
  '4. Primeira agressão vendedora > 50 contratos\n'
  '→ **Venda com stop acima da máxima da zona**\n\n'
  '## Setup Zona 0,5% + Absorção\n\n'
  '**Contexto:** dólar em queda, tocando a zona de -0,5%\n\n'
  '**Sinal de entrada:**\n'
  '1. Preço na zona de -0,5%\n'
  '2. T&T mostra absorção (vendas sem queda de preço)\n'
  '3. Iceberg comprador detectado no book\n'
  '→ **Compra com stop abaixo da zona de -0,5%**\n\n'
  '## Gestão da operação\n\n'
  '- Parcial 1: na zona seguinte (ex: de 1,0% para 0,5%)\n'
  '- Parcial 2: no preço de ajuste\n'
  '- Stop móvel: move para o custo quando chegar na Parcial 1',
  540, 1, true
)
on conflict (chapter_id, order_index) do nothing;

-- ──────────────────────────────────────────────────────────────
-- MÓDULO 8 — Macroeconomia e Câmbio
-- ──────────────────────────────────────────────────────────────
insert into public.modules (id, course_id, title, description, order_index, is_published) values
(v_mod8, v_course_id,
 'Macroeconomia Aplicada ao Dólar BRL',
 'Entenda os fundamentos que movem o câmbio e como ler o fluxo nos dias de eventos macro. '
 'Copom, Fed, Payroll, fluxo cambial e como preparar o plano de trading.',
 8, true)
on conflict (course_id, order_index) do nothing;

-- Capítulo 8.1
insert into public.chapters (id, module_id, title, order_index, is_published) values
(v_ch8_1, v_mod8, 'Fundamentos Macroeconômicos do Câmbio', 1, true)
on conflict (module_id, order_index) do nothing;

insert into public.lessons
  (id, chapter_id, title, description, content_type, content_markdown, duration_seconds, order_index, is_published)
values
(
  'e8100000-0000-0000-0000-000000000001', v_ch8_1,
  'Copom, Selic e o dólar futuro',
  'Como as decisões do Banco Central do Brasil afetam o câmbio e o fluxo no dólar futuro.',
  'text',
  E'# Copom, Selic e o Dólar Futuro\n\n'
  '## A relação juros-câmbio\n\n'
  'A taxa Selic determina o **carrego** (carry trade) do real contra o dólar:\n'
  '- **Selic alta:** dinheiro estrangeiro entra no Brasil buscando rendimento → dólar cai\n'
  '- **Selic baixa:** carrego menos atrativo → dólar tende a subir\n\n'
  '## Reuniões do Copom\n\n'
  '- **Frequência:** a cada ~45 dias (8 reuniões/ano)\n'
  '- **Decisão:** divulgada às **18:30** do segundo dia da reunião\n'
  '- **Impacto:** nos dias de Copom, o mercado pode ter variação de 1,5%+\n\n'
  '## Como se preparar para o Copom\n\n'
  '1. Conheça o consenso de mercado (Boletim Focus / Bloomberg)\n'
  '2. Calcule as zonas de variação com margem ampliada\n'
  '3. Reduza o tamanho da posição antes da decisão\n'
  '4. Aguarde o fluxo se estabelecer APÓS o anúncio\n\n'
  '## Linguagem do comunicado\n\n'
  '- "Vigilância" → tom duro (hawkish) → pode apreciar o real\n'
  '- "Flexibilidade" → tom suave (dovish) → pode depreciar o real',
  540, 1, true
),
(
  'e8100000-0000-0000-0000-000000000002', v_ch8_1,
  'Fed, Payroll e dados externos',
  'Como os dados americanos afetam o dólar no Brasil e como ler o fluxo nessas janelas.',
  'text',
  E'# Fed, Payroll e Dados Externos\n\n'
  '## O Fed e o dólar global\n\n'
  'O Federal Reserve (banco central dos EUA) define a taxa de juros do dólar. '
  'Quando o Fed aperta (sobe juros), o dólar fortalece globalmente — inclusive o USD/BRL.\n\n'
  '## Payroll (NFP — Non-Farm Payrolls)\n\n'
  '- **Quando:** primeira sexta-feira de cada mês, **09:30** horário de Brasília\n'
  '- **Impacto:** dado mais volátil do calendário americano\n'
  '- **Acima do esperado:** dólar forte globalmente, USD/BRL sobe\n'
  '- **Abaixo do esperado:** dólar fraco, USD/BRL cai\n\n'
  '## Calendário econômico essencial\n\n'
  '| Dado | País | Impacto no DOL |\n'
  '|---|---|---|\n'
  '| NFP | EUA | Altíssimo |\n'
  '| CPI | EUA | Alto |\n'
  '| Reunião Fed | EUA | Altíssimo |\n'
  '| PIB Brasil | BR | Médio |\n'
  '| IPCA | BR | Médio |\n'
  '| Balança comercial | BR | Baixo-médio |\n\n'
  '## Estratégia em dias de dados\n\n'
  '1. **Antes:** reduza ou zere posições\n'
  '2. **Na divulgação:** observe o fluxo por 2-3 minutos\n'
  '3. **Após confirmação:** entre na direção do fluxo dominante\n'
  '4. **Não adivinhe** o resultado — opere o que o mercado fizer.',
  510, 2, true
)
on conflict (chapter_id, order_index) do nothing;

-- Capítulo 8.2
insert into public.chapters (id, module_id, title, order_index, is_published) values
(v_ch8_2, v_mod8, 'Fluxo Cambial e Notícias', 2, true)
on conflict (module_id, order_index) do nothing;

insert into public.lessons
  (id, chapter_id, title, description, content_type, content_markdown, duration_seconds, order_index, is_published)
values
(
  'e8200000-0000-0000-0000-000000000001', v_ch8_2,
  'Fluxo cambial — exportadores e importadores',
  'Como o fluxo de câmbio de empresas afeta a cotação e como o tape revela esse movimento.',
  'text',
  E'# Fluxo Cambial — Exportadores e Importadores\n\n'
  '## O fluxo cambial de curto prazo\n\n'
  'Exportadores precisam **converter dólares em reais** (vendem dólar).\n'
  'Importadores precisam **comprar dólares** para pagar fornecedores.\n\n'
  'O saldo desse fluxo impacta diretamente o câmbio diário.\n\n'
  '## Padrões sazonais\n\n'
  '- **Final de mês:** exportadores agrícolas tendem a liquidar colheita → pressão vendedora\n'
  '- **Início de mês:** importadores fecham compromissos → pressão compradora\n'
  '- **Dias de vencimento de opções:** volatilidade elevada\n\n'
  '## Como o tape revela o fluxo comercial\n\n'
  'O fluxo de exportadores aparece como pressão vendedora **consistente e paciente** — '
  'diferente da especulação que é rápida e agressiva.\n\n'
  'Características:\n'
  '- Agressões vendedoras moderadas e repetidas\n'
  '- Sem urgência (não move o preço rapidamente)\n'
  '- Mantém o preço dentro de um range enquanto distribui\n\n'
  '## Implicação\n\n'
  'Quando há fluxo exportador pesado, topos são difíceis de romper. '
  'Adapte sua estratégia: opere o range em vez de tendência.',
  480, 1, true
),
(
  'e8200000-0000-0000-0000-000000000002', v_ch8_2,
  'Integrando macro e fluxo — o plano do dia',
  'Como montar o plano de trading diário combinando contexto macro e leitura de fluxo.',
  'text',
  E'# O Plano de Trading Diário\n\n'
  '## A rotina do tape reader profissional\n\n'
  '### Antes da abertura (08:00 – 08:55)\n\n'
  '1. **Contexto macro:** há evento relevante hoje? (calendário econômico)\n'
  '2. **Preço de ajuste:** calcule as zonas de variação (0,5%, 1,0%, 1,5%)\n'
  '3. **ATR dos últimos 5 dias:** qual o range esperado para hoje?\n'
  '4. **Tendência de curto prazo:** o dólar está em tendência ou lateralização?\n'
  '5. **Hipóteses:** "Se o preço subir, vendo na zona de +0,5%." / "Se cair, compro em..."\n\n'
  '### Durante o pregão (09:00 – 18:00)\n\n'
  '1. **Book e T&T sempre abertos** (janelas separadas, monitor dedicado)\n'
  '2. Execute as hipóteses quando o fluxo confirmar\n'
  '3. Nunca opere contra o fluxo dominante\n'
  '4. Respeite stops — sempre predefinidos\n\n'
  '### Após o fechamento\n\n'
  '1. Registre todas as operações (journal)\n'
  '2. Revise: o fluxo foi na direção esperada? O que aprendi?\n'
  '3. Prepare o plano do próximo dia\n\n'
  '## O tape reader não prevê — ele reage\n\n'
  '> "Prepare cenários, execute o que o mercado mostrar, proteja o capital."',
  540, 2, true
)
on conflict (chapter_id, order_index) do nothing;

end $$;
