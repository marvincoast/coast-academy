---
name: bug-fix
description: Diagnose and fix build, runtime, type, and CI bugs in the Coast Academy monorepo (Vite + React + NestJS + Docker). Use whenever the user reports an error log, broken build, failing test, runtime exception, or asks to "fix this bug". Walks through reproduce → root-cause → minimal patch → verify → prevent loop using the project's pnpm/Docker tooling.
---

# Bug Fix Workflow — Coast Academy

Apply this workflow EVERY time a build/runtime/CI error is reported. Do not skip steps unless explicitly asked.

## Reproduce, Diagnose, Patch, Verify, Prevent

Copy this checklist into your TODOs and mark each as you go:

```
- [ ] 1. Reproduce — capture exact failing command + truncated log (tail -50)
- [ ] 2. Locate — read the file/line cited in the error before guessing
- [ ] 3. Root cause — explain WHY it broke in 1–2 sentences
- [ ] 4. Minimal patch — change as little as possible
- [ ] 5. Verify — re-run the same command; confirm green
- [ ] 6. Prevent — add lint/test/script guard so it can't silently regress
```

## Step 1 — Reproduce

- Run the **exact** command from the user log (do not paraphrase). Most are pnpm/Docker:
  - Frontend Docker rebuild: `COAST_ACADEMY_BUILD_WEB=1 ./infra/scripts/up-local.sh`
  - Pnpm workspace build: `pnpm --filter @coast-academy/ui run build && pnpm --filter @coast-academy/web run build`
  - Service tests: `pnpm --filter <name> test`
- Capture only the last ~50 lines (`| tail -50`) to keep context small.
- If the failure happens inside Docker on `/mnt/c`, also try **without** the Docker BuildKit cache once before deeper debugging: `docker builder prune -f` then rebuild — `/mnt/c` cache stale-reads are a recurring root cause.

## Step 2 — Locate

- Always `Read` the file + line from the stack trace BEFORE editing.
- For Tailwind/PostCSS errors quoting a CSS class, also grep the class across the repo (`apps/web/src` + `packages/ui/src/styles`) — the missing class may be referenced from many places.
- For TS errors with `noUncheckedIndexedAccess`, the fix is usually `const x = arr[i]; if (x === undefined) ...` instead of using `arr[i]` directly.

## Step 3 — Root cause in 1–2 sentences

State it explicitly in the response before applying the patch. Examples that have hit this repo:

| Symptom | Real cause |
|---|---|
| `error TS2307: Cannot find module '@coast-academy/ui'` in Docker | `@coast-academy/ui` not built before `@coast-academy/web` — Dockerfile must run `pnpm --filter @coast-academy/ui run build` first OR `apps/web/tsconfig.json` must have `paths: { "@coast-academy/ui": ["../../packages/ui/src/index.ts"] }`. |
| `[postcss] The 'bg-white/6' class does not exist` | Tailwind 3 only ships `/5`, `/10`, `/20`, `/25`, `/30`, ... — custom steps (`/6`, `/8`, `/12`, `/15`, `/35`, `/55`, `/85` …) MUST be added to `packages/ui/tailwind-preset.cjs` under `theme.extend.opacity`. |
| `error TS2532: Object is possibly 'undefined'` after `arr[i]` | `noUncheckedIndexedAccess` is on; destructure with `const x = arr[i]; if (x === undefined) return;`. |
| `coast-academy-web` shows old UI after a code change | Either the Docker build failed silently or `up-local.sh` started `web` before the new image was built. Run `COAST_ACADEMY_BUILD_WEB=1 ./infra/scripts/up-local.sh` and confirm `docker image inspect coast-academy-web` shows a fresh `Created` timestamp. |
| Docker build picks up stale files from `/mnt/c` | Run `docker builder prune -f` once; if persistent, project must be cloned outside `/mnt/c` (e.g. `~/Coast-Academy`). |

## Step 4 — Minimal patch

- Touch the smallest set of files. If two files solve the same root cause, pick one.
- For Tailwind class errors: prefer extending the preset (`packages/ui/tailwind-preset.cjs`) over editing every page.
- For Docker build orchestration: prefer fixing `infra/docker/Dockerfile.web` or `infra/scripts/up-local.sh` over copying files manually.
- NEVER add `// @ts-ignore` or `eslint-disable` to mask the real cause unless explicitly asked.

## Step 5 — Verify

Run the same command that failed. Tail the log:

```bash
wsl -e bash -lc "cd /mnt/c/Projetos/Coast-Academy && COAST_ACADEMY_BUILD_WEB=1 ./infra/scripts/up-local.sh 2>&1 | tail -60"
```

Acceptance signals:

- Docker output ends with `naming to docker.io/library/coast-academy-web` (image was produced).
- `docker compose ... ps web` shows `Up ... (healthy)`.
- `curl -s -o /dev/null -w '%{http_code}' http://localhost/` returns `200`.
- Smoke test (`./infra/scripts/verify-stack.sh`) ends with `Resumo: frontend OK`.

If any signal is missing, return to Step 2. Do not declare the bug fixed.

## Step 6 — Prevent regression

- Tailwind class issue → add a comment in `tailwind-preset.cjs` documenting the custom scale, AND ensure `apps/web/src/styles/global.css` plus components reuse the same set.
- Workspace build order → keep `@coast-academy/web` `build` script chained: `pnpm --filter @coast-academy/ui run build && tsc -b && vite build`.
- Old container running after failed build → keep the guard in `up-local.sh` that builds the image BEFORE `up -d --force-recreate web` and aborts when `docker image inspect coast-academy-web:latest` fails.
- If a test exists for the broken area, add a regression case (e.g. `formatPrice` edge cases, `validateTypographyScale` with sparse arrays).

## Common one-liners

```bash
# Clear stale Docker layer cache (recurring /mnt/c issue)
docker builder prune -f

# Inspect frontend container health
docker compose --env-file .env.local ps web
docker logs coast-academy-web --tail 30

# Verify the new bundle actually shipped
docker exec coast-academy-web ls -la /usr/share/nginx/html/assets | head

# Quick CSS class probe — does Tailwind generate it?
docker exec coast-academy-web sh -c 'grep -c "bg-white\\\\/6" /usr/share/nginx/html/assets/*.css || true'
```

## Response shape (use this every time)

```
**Root cause:** <1–2 sentences>
**Patch:** <list of files touched + 1-line rationale per file>
**Verification:** <command run + tail output proving green>
**Guard added:** <how this can't silently regress>
```

If the user pastes the SAME log twice in a row, suspect (a) WSL/Docker cache stale-read or (b) the patch was not persisted; re-Read the file you edited to confirm before re-running.
