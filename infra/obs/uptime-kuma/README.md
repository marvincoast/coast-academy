# Uptime Kuma — Coast Academy (OBS-T11)

Monitoramento simples de disponibilidade (RF-06), profile `obs`, UI em **http://localhost:3002**.

## Subir

```bash
./infra/scripts/obs-up.sh
# ou, se a stack obs já estiver no ar:
./infra/scripts/coast-academy-compose.sh -f docker-compose.yml -f docker-compose.obs.yml --profile obs up -d uptime-kuma
```

## Primeiro acesso

1. Abra http://localhost:3002
2. Crie usuário admin (primeira visita)
3. Adicione monitores usando [`monitors.json`](./monitors.json) como referência

### URLs na UI do Kuma (recomendado — WSL/Docker)

Use **`host.docker.internal`** (já configurado no compose). Evita `getaddrinfo EAI_AGAIN` com `traefik`.

| Monitor | URL no Kuma | Status aceito |
|---------|-------------|---------------|
| Web — Home | `http://host.docker.internal:3000/` (ou `:80` + header `Host: localhost`) | 2xx |
| Traefik — Ping | `http://host.docker.internal:8081/ping` | 2xx |
| Certificate — /me | `http://host.docker.internal/api/certificates/me` | **401** |
| Grafana | `http://host.docker.internal:3001/api/health` | 2xx |
| Supabase (opcional) | `http://host.docker.internal:54321/rest/v1/` | 2xx ou 401 |

**Alternativa** (se DNS Docker funcionar): `http://traefik/...` ou `http://coast-academy-traefik:8080/ping`.

### Import JSON (Uptime Kuma v1)

A imagem usa `louislam/uptime-kuma:1` (suporta Backup/Restore JSON na UI).

1. Settings → Backup → **Import** (se disponível na sua versão)
2. Ou crie cada monitor manualmente a partir de `monitors.json`

> Kuma v2 removeu import JSON; neste projeto mantemos v1 para seed manual documentado.

## Verificação

```bash
./infra/scripts/verify-obs-t11.sh
```

Valida UI + endpoints (equivalente aos monitores). Monitores na UI ficam verdes após configurados e com a app no ar.
