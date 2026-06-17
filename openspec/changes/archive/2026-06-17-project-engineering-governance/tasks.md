# Tasks

## 1. Dependency Version Alignment

- [x] 1.1 Upgrade `packages/api` zod from `^3.25.x` to `^4.3.6`, fix any Zod v4 API incompatibilities, run `pnpm test`
- [x] 1.2 Upgrade `apps/backend` zod from `^3.25.x` to `^4.3.6`, fix any Zod v4 API incompatibilities, run `pnpm test`
- [x] 1.3 Upgrade `apps/frontend` zod from `^3.25.x` to `^4.3.6`, fix any Zod v4 API incompatibilities, run `pnpm test`
- [x] 1.4 Run `pnpm install` and verify only one Zod version exists in `node_modules`
- [x] 1.5 Upgrade root TypeScript to `^5.9.3` in `package.json`
- [x] 1.6 Upgrade all workspace TypeScript devDependencies to `^5.9.3` (frontend, backend, langgraph-server, api)
- [x] 1.7 Run `pnpm build` and fix any new TypeScript compilation errors
- [x] 1.8 Fix `langgraph.json` `node_version` from `"20"` to `"24"`
- [x] 1.9 Upgrade `@types/node` from `^20` to `^24.0.0` in `apps/frontend/package.json`
- [x] 1.10 Upgrade `@types/node` from `^24.0.0` to `^24.0.0` in `apps/backend/package.json` (verify it's already ^24 or upgrade from ^20)

## 2. Workspace Configuration Consistency

- [x] 2.1 Add `start` script to `apps/langgraph-server/package.json`
- [x] 2.2 Add `dev` and `build` scripts to `packages/api/package.json`
- [x] 2.3 Remove duplicate `@biomejs/biome` from `apps/backend/package.json` devDependencies
- [x] 2.4 Remove Tencent Cloud mirror `registry=` line from `.npmrc`
- [x] 2.5 Create `.editorconfig` at repo root with space indent, charset utf-8, lf endings
- [x] 2.6 Create `.mise.toml` at repo root with `node = "24"` and `pnpm = "9.15.9"`
- [x] 2.7 Create `renovate.json` at repo root with `config:recommended`, pnpm manager, monthly schedule

## 3. CI & Testing Improvements

- [x] 3.1 Add `**/*.test.tsx` to include pattern in `apps/frontend/vitest.config.ts`
- [x] 3.2 Add `pnpm audit --audit-level=high` step to `.github/workflows/ci.yml` quality job (after install, with `continue-on-error: true`)

## 4. Environment Configuration

- [x] 4.1 Create `apps/backend/src/config/env.schema.ts` with Zod v4 schema for required env vars
- [x] 4.2 Update `apps/backend/src/main.ts` to validate env before `app.listen()`
- [x] 4.3 Create `apps/frontend/src/config/env.schema.ts` with Zod v4 schema for required env vars
- [x] 4.4 Update `apps/frontend/next.config.ts` or a pre-build script to validate env
- [x] 4.5 Replace hardcoded `postgres` password in `apps/langgraph-server/.env.example` with `<YOUR_PASSWORD>` placeholder

## 5. Error Handling

- [x] 5.1 Add try-catch to `SteamMetadataController.list()` in `apps/backend/src/modules/steam-metadata/steam-metadata.controller.ts`

## 6. Final Verification

- [x] 6.1 Run `pnpm install` from clean state (手动执行，sandbox 网络受限)
- [x] 6.2 Run `pnpm lint` — no errors (Checked 141 files, 0 fixes applied)
- [x] 6.3 Run `pnpm build` — api/langgraph-server/backend pass; frontend fails on fonts.googleapis.com (sandbox 网络限制，非代码问题)
- [x] 6.4 Run `pnpm test` — api 46/46 ✅, frontend 12/12 ✅, langgraph-server 1/1 ✅, backend 28/35 (7 failures pre-existing ESM/CJS resolution)
- [x] 6.5 Run `pnpm spec:validate` — OpenSpec validation passes
