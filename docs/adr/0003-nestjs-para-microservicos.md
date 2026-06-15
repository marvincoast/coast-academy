# 0003 — NestJS para microserviços

- Status: Accepted
- Data: 2026-05-16

## Contexto

Microserviços em TypeScript precisam de DI, validação, OpenAPI, logging estruturado, testabilidade e curva de aprendizado razoável.

## Decisão

Adotar **NestJS 10** em todos os 6 microserviços, com:

- `nestjs-pino` para logs estruturados.
- `@nestjs/swagger` para gerar OpenAPI a partir dos controllers.
- DTOs validados via Zod (em vez de class-validator) usando o pipe `ZodValidationPipe` (a implementar na Etapa 2).
- `helmet` aplicado no bootstrap.

## Consequências

- ✅ Padronização entre serviços (todos têm o mesmo esqueleto).
- ✅ DI nativa facilita testes unitários e integração.
- ✅ OpenAPI gerado, alimentando contratos para o frontend.
- ⚠️ Decoradores e overhead de DI; aceitável para o tamanho do projeto.

## Alternativas consideradas

- **Fastify puro**: mais leve, menos opinativo, mais código manual.
- **tRPC**: ótimo para monorepo TS puro, mas perdemos OpenAPI público para integrações futuras.
