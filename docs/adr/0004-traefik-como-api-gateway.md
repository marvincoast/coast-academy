# 0004 — Traefik como API Gateway

- Status: Accepted
- Data: 2026-05-16

## Contexto

Precisamos de TLS, roteamento por prefixo (`/api/courses`, `/api/assessments`, ...), rate limit, headers de segurança (CSP, HSTS) e descoberta automática de containers em Docker Compose.

## Decisão

Usar **Traefik v3** com configuração estática em `infra/traefik/traefik.yml`, regras dinâmicas em `infra/traefik/dynamic.yml` (middlewares `secureheaders`, `ratelimit`, `cors-api`) e labels Docker em `docker-compose.yml`.

## Consequências

- ✅ Descoberta automática via labels — adicionar serviço é mudar `docker-compose.yml`.
- ✅ Middlewares centralizam segurança (CSP, HSTS, rate limit).
- ✅ Let's Encrypt integrado para TLS em produção (preparado, comentado por enquanto).
- ⚠️ DSL própria do Traefik; documentar bem.

## Alternativas consideradas

- **Nginx**: maduro, mas configuração estática menos ergonômica para Compose.
- **Caddy**: ótimo TLS automático, mas comunidade menor para padrões corporativos.
