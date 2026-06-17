## Context

PixelPlayground is a pnpm/Turborepo TypeScript monorepo with Next.js frontend, NestJS backend, LangGraph server, and shared tRPC API package. Exploration revealed 27 governance issues spanning dependency version conflicts, missing scripts, CI gaps, and configuration inconsistencies. This design covers the subset of those issues approved for this change.

## Goals / Non-Goals

**Goals:**
- Align Zod to v4 across all workspaces
- Align Node version references to 24
- Align TypeScript to ^5.9.x across all workspaces
- Fix @types/node to ^24 in frontend and backend
- Add missing scripts (langgraph-server `start`, packages/api `dev`/`build`)
- Add mise, editorconfig, Renovate support
- Remove Tencent mirror and duplicate biome dependency
- Add CI dependency audit step
- Fix vitest include pattern for .test.tsx
- Add env validation and fix .env.example defaults
- Add try-catch to unprotected controller method

**Non-Goals:**
- Logging infrastructure (deferred)
- Test framework unification (deferred)
- Lint task in turbo.json (deferred)
- Global NestJS pipes/filters (deferred)
- Docker / deployment configs (deferred)
- Auth, CORS, rate limiting (not needed for internal use)
- Monitoring/observability (deferred)

## Decisions

### 1. Zod v4 Migration Strategy
Zod v4's main breaking changes relevant to this project:
- `z.object()` no longer strips unrecognized keys by default; use `.strict()` or `.passthrough()`
- Some method signatures changed (e.g., `.pick()`, `.omit()`)
- `z.enum()` becomes `z.enum()` (unchanged API)

**Approach**: Update `packages/api` first (shared contract), verify tests pass, then update backend and frontend. Use `zod@^4.3.6` to match langgraph-server's version.

### 2. TypeScript Unified Version
Target `^5.9.3` (latest stable as of June 2026). Pin exact version in root devDependencies, use `workspace:*` or matching ranges in workspace packages. Check for deprecated flags or new strictness.

### 3. Env Validation
Use Zod v4 schemas to validate environment variables at startup. Create per-app env schema files. For the backend, validate in `main.ts` before `app.listen()`. For the frontend, validate in `next.config.ts`. For langgraph-server, add validation in graph initialization.

### 4. Renovate vs Dependabot
**Choice: Renovate**. Rationale:
- Better monorepo support (groups workspace deps)
- More configurable (schedules, auto-merge rules, labels)
- Can pin pnpm version updates

### 5. Mise Configuration
Create `.mise.toml` at repo root with `node = "24"` and `pnpm = "9.15.9"`. Mise is preferred over `.nvmrc` as it manages multiple tools.

### 6. CI Dependency Audit
Add a step after install: `pnpm audit --audit-level=high` (fails on high/critical vulnerabilities). Keep it non-blocking initially via `continue-on-error: true` to avoid CI breakage from unresolvable issues.

## Risks / Trade-offs

- **Zod v4 migration may surface runtime bugs**: Zod v4's stricter object parsing could break API calls relying on v3's lenient behavior → Mitigation: run full test suite, manually test key flows
- **TypeScript 5.9 may introduce new errors**: New strictness checks could fail CI → Mitigation: fix incrementally or lower specific strict flags
- **`pnpm audit` noise**: Many advisories are dev-only or irrelevant → Mitigation: use `--audit-level=high` threshold
- **Renovate PR noise**: Frequent dependency update PRs → Mitigation: configure monthly schedule with grouped PRs

## Migration Plan

1. Create branch, run `pnpm install` after dependency changes
2. Fix Zod v4 compat first (most likely to break tests)
3. Fix TypeScript version and any new compile errors
4. Fix remaining configs (scripts, editorconfig, mise, Renovate, etc.)
5. Verify `pnpm build && pnpm test` passes
6. Merge and monitor
