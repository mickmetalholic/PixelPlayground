## Why

The project has accumulated configuration drift across workspaces, dependency version inconsistencies (Zod v3/v4, TypeScript spread across 5.7–5.9, Node version mismatches), and missing engineering safeguards (no CI security scanning, no env validation, no editorconfig). These issues increase maintenance friction and risk subtle runtime bugs. This change addresses them systematically before the codebase grows further.

## What Changes

### Dependency Version Alignment
- **BREAKING**: Upgrade Zod from v3 to v4 in `@pixel-playground/api`, `@pixel-playground/backend`, and `@pixel-playground/frontend` to match `langgraph-server`'s v4 usage
- Unify TypeScript to latest stable (^5.9.x) across all workspaces
- Fix `langgraph.json` `node_version` from `"20"` to `"24"` to match the project's Node 24 runtime
- Fix `@types/node` from `^20` to `^24` in frontend and backend

### Workspace Configuration Fixes
- Add missing `start` script to `langgraph-server` (required by `turbo.json`)
- Add `dev` and `build` scripts to `packages/api`
- Remove duplicate `@biomejs/biome` from backend devDependencies (already in root)
- Remove Tencent Cloud npm mirror from `.npmrc`
- Add `.editorconfig` for consistent editor defaults
- Add `.mise.toml` for mise-en-place tool version management
- Add Renovate configuration for automated dependency updates

### CI & Testing Improvements
- Add `**/*.test.tsx` to frontend vitest include pattern
- Add `pnpm audit` / dependency vulnerability scanning step to CI workflow

### Error Handling
- Add try-catch to `SteamMetadataController.list()` method for consistent error handling

### Environment Configuration
- Add environment variable validation using Zod schema
- Replace hardcoded default password in `langgraph-server/.env.example` with a placeholder

## Capabilities

### New Capabilities
- `dependency-version-alignment`: Align Zod to v4, TypeScript to ^5.9.x, @types/node to ^24, and langgraph.json node_version to 24 across all workspaces
- `workspace-config-consistency`: Fix missing scripts, remove duplicate deps, add editorconfig, add mise support, remove Tencent mirror
- `ci-pipeline-enhancement`: Add dependency audit to CI, fix vitest include patterns, configure Renovate
- `env-config-validation`: Add Zod-based environment variable validation and clean up .env.example
- `error-handling-completeness`: Add try-catch to the unprotected `list()` controller method

### Modified Capabilities
_None — this change does not modify existing capability specs._

## Impact

| Area | Impact |
|------|--------|
| `packages/api` | Zod v4 schema changes (BREAKING for consumers), new scripts |
| `apps/backend` | Zod v4 migration, @types/node update, try-catch addition |
| `apps/frontend` | Zod v4 migration, @types/node update, vitest config fix |
| `apps/langgraph-server` | `langgraph.json` node version fix, new `start` script, .env.example cleanup |
| Root config | `.npmrc` mirror removal, `.editorconfig`, `.mise.toml`, `renovate.json` |
| CI (`.github/workflows/ci.yml`) | New dependency audit step |
| Dev tooling | Mise and Renovate configs for team consistency |
