#!/usr/bin/env bash
# =============================================================================
# Coast Academy — Deduplica monitores no Uptime Kuma (SQLite / kuma.db)
# =============================================================================
set -euo pipefail

log() { echo "==> $*"; }

CONTAINER="coast-academy-uptime-kuma"

if ! docker ps --format '{{.Names}}' | grep -qx "$CONTAINER"; then
  log "AVISO: O container '${CONTAINER}' não está rodando. Pulando a deduplicação."
  exit 0
fi

log "Identificando e limpando monitores duplicados no banco SQLite do Uptime Kuma..."

# Executa um script Node.js diretamente dentro do container para manipular o SQLite com better-sqlite3 de forma segura
docker exec -i "$CONTAINER" node << 'EOF'
const Database = require('better-sqlite3');
const db = new Database('/app/data/kuma.db');
db.pragma('foreign_keys = ON');

// 1. Remove qualquer monitor duplicado (com base no nome), mantendo apenas o registro de ID menor (o mais antigo)
const deleteStmt = db.prepare(`
  DELETE FROM monitor 
  WHERE id NOT IN (
    SELECT min(id) 
    FROM monitor 
    GROUP BY name
  )
`);

const deleteResult = deleteStmt.run();
console.log(`[Deduplicador] Monitores deletados: ${deleteResult.changes}`);

// 2. Opcional: Garante que os status aceitos do "Certificate API" e do "Supabase" estejam corretos se existirem
try {
  db.prepare(`
    UPDATE monitor 
    SET accepted_statuscodes_json = '["401"]' 
    WHERE name LIKE '%Certificate%' AND accepted_statuscodes_json IS NULL
  `).run();
  
  db.prepare(`
    UPDATE monitor 
    SET accepted_statuscodes_json = '["200-299","401"]' 
    WHERE name LIKE '%Supabase%' AND accepted_statuscodes_json IS NULL
  `).run();
} catch (err) {
  console.log(`[Deduplicador] Alinhamento opcional ignorado: ${err.message}`);
}
EOF

log "Reiniciando o container '${CONTAINER}' para atualizar a memória do Uptime Kuma..."
docker restart "$CONTAINER"

log "Deduplicação concluída com sucesso!"
