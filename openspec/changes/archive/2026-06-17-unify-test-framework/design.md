## Context

The monorepo currently uses three distinct test configurations: Jest 30 (`apps/backend`, CJS ts-jest), Jest 29 (`apps/langgraph-server`, ESM ts-jest with `--experimental-vm-modules`), and Vitest 3.x (`apps/frontend`, `packages/api`). There is no shared pattern for test scripts, setup files, or coverage tooling. The frontend has no jsdom environment configured, blocking any React component testing. This design covers the migration to Vitest everywhere and the introduction of jsdom-based component testing.

## Goals / Non-Goals

**Goals:**
- Eliminate Jest from the monorepo — all workspaces use only Vitest
- Enable React component testing in the frontend via jsdom + @testing-library/react
- Standardise test scripts (`test`, `test:cov`, `test:watch`) across all workspaces
- Preserve all existing test behaviour — no existing test should break
- Preserve NestJS decorator metadata support in backend tests via SWC transform

**Non-Goals:**
- Adding actual React component tests (new tests are out of scope — this change provides the infrastructure)
- Consolidating test files or reorganising test directories
- Changing coverage thresholds or CI config beyond what is needed for the migration
- Adding end-to-end/playwright tests
- Centralising vitest at the root level with a monorepo-wide workspace (each app keeps its own config)
- Changing biome lint/format rules

## Decisions

### Decision 1: Vitest over Jest

**Rationale**: Two workspaces already use Vitest. Vitest provides native ESM and TypeScript support (no ts-jest needed), faster watch mode via Vite's HMR, and a compatible API surface (`describe`/`it`/`expect`/`vi`). Migrating the two Jest workspaces is lower total cost than migrating the two Vitest workspaces.

**Alternatives considered:**
- **Migrate everything to Jest 30**: Rejected. Would lose native ESM, need `--experimental-vm-modules` for langgraph-server, and require jsdom as a separate dependency for frontend. Vitest's watch mode is also meaningfully faster for frontend development.
- **Keep both frameworks**: Rejected. The fragmentation is the problem we are solving.

### Decision 2: jsdom over happy-dom

**Rationale**: jsdom is the more widely used DOM environment, has better compatibility with `@testing-library/react`, and is the default recommendation in the Vitest docs for React testing. `happy-dom` is faster but has known gaps with some DOM APIs (e.g., `getBoundingClientRect`, form submission).

**Alternatives considered:**
- **happy-dom**: Rejected for the React use case. While faster, it has more compatibility issues with testing-library queries and browser API coverage.

### Decision 3: Multi-project vitest config for frontend (vitest.config.ts with workspaces) over single config with env overrides

**Rationale**: The frontend has two distinct test categories: server-side logic tests (`*.test.ts`, node environment) and React component tests (`*.test.tsx`, jsdom environment). A vitest workspace (multi-project) keeps these cleanly separated with different environments, include patterns, and setup files. It avoids the need for per-file `// @vitest-environment jsdom` comments.

**Configuration shape:**
```ts
// apps/frontend/vitest.config.ts
import path from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: { alias: { '@': path.resolve(__dirname, 'src') } },
  test: {
    workspace: [
      {
        test: {
          name: 'server',
          environment: 'node',
          include: ['src/**/*.test.ts'],
        },
      },
      {
        test: {
          name: 'components',
          environment: 'jsdom',
          include: ['src/**/*.test.tsx'],
          setupFiles: ['./vitest.setup.ts'],
        },
      },
    ],
  },
});
```

**Alternatives considered:**
- **Single config with `// @vitest-environment jsdom` pragma**: Simpler config but puts the burden on every test file author to remember the comment. Workspace is more explicit and self-documenting.
- **Separate `vitest.config.ts` files for server and components**: Overkill for this scale.

### Decision 4: SWC for backend NestJS decorator metadata

**Rationale**: NestJS relies on `emitDecoratorMetadata: true` in tsconfig to emit design-time type metadata for dependency injection (`@nestjs/testing` uses this via `Reflect.getMetadata`). Vitest's default esbuild transform does not support decorator metadata. The SWC plugin (`unplugin-swc` with `@swc/core`) is the community-standard solution for NestJS + Vitest.

**Configuration shape:**
```ts
// apps/backend/vitest.workspace.ts
import swc from 'unplugin-swc';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [
    swc.vite({
      jsc: { transform: { legacyDecorator: true, decoratorMetadata: true } },
    }),
  ],
  test: {
    workspace: [
      {
        test: {
          name: 'unit',
          include: ['src/**/*.spec.ts'],
          environment: 'node',
        },
      },
      {
        test: {
          name: 'e2e',
          include: ['test/**/*.e2e-spec.ts'],
          environment: 'node',
        },
      },
    ],
  },
});
```

**Alternatives considered:**
- **ts-jest in vitest (vitest ts-jest adapter)**: Adds back the ts-jest dependency we are trying to remove; slower than SWC; CJS/ESM configuration complexity.
- **esbuild with `esbuildDecorators` plugin**: Less mature; does not handle metadata.
- **Babel**: Another transform layer; SWC is the established NestJS pattern.

### Decision 5: Phased migration order (frontend → api → langgraph-server → backend → cleanup)

**Rationale**: Start with the lowest-risk, highest-value change (frontend jsdom — no migration, just additions), then move to trivial config additions (api), then low-risk migration (langgraph-server — only 2 test files, no mocking), then the riskiest migration (backend — 12 spec files, NestJS decorator metadata). This de-risks the hard step by building Vitest familiarity first.

**Alternatives considered:**
- **Big-bang migration all at once**: Riskier; harder to bisect if something breaks.
- **Backend first**: Wouldn't unlock value until later phases are complete.

### Decision 6: `vi.mock()` hoisting for backend — no code changes needed beyond mechanical rename

**Rationale**: Vitest hoists `vi.mock()` and `vi.fn()` to the top of the file, just like Jest does with `jest.mock()` / `jest.fn()`. The backend's existing top-level `jest.mock()` calls will translate 1:1. `vi.mocked()` has identical type-narrowing behaviour to `jest.mocked()`. No structural test changes are needed — only `jest` → `vi` renames.

## Risks / Trade-offs

- **[Risk] SWC decorator metadata compatibility with NestJS DI**: SWC's decorator metadata implementation may differ subtly from TypeScript's native `emitDecoratorMetadata`. **Mitigation**: Verify by running all 12 backend tests after migration. Use `vi.hoisted()` if mock factory hoisting behaves differently.
- **[Risk] `@nestjs/testing` internal Jest dependency**: NestJS testing package is framework-agnostic and does not depend on Jest. Verified — no risk.
- **[Risk] Langgraph-server `--experimental-vm-modules` removal**: Vitest handles ESM natively. **Mitigation**: Run existing ESM test files (`agent.test.ts`, `graph.int.test.ts`) to confirm they pass without the flag.
- **[Risk] Package manager resolution conflicts during migration**: Jest and Vitest can coexist temporarily. **Mitigation**: Migrate each workspace atomically — remove Jest deps and install Vitest deps in a single `pnpm install`.
- **[Trade-off] Frontend workspace config requires vitest ≥3.0**: The frontend already uses vitest 3.2.4, so this is not a constraint.

## Migration Plan

### Phase 1: Frontend jsdom (independent)
1. `cd apps/frontend && pnpm add -D jsdom @testing-library/react @testing-library/jest-dom`
2. Create `vitest.setup.ts` with `import '@testing-library/jest-dom'`
3. Rewrite `vitest.config.ts` → multi-project workspace as shown in Decision 3
4. Run `pnpm test` to verify existing 4 tests still pass

### Phase 2: packages/api config (independent)
1. Create `packages/api/vitest.config.ts` with `environment: 'node'`
2. Add `test:cov` and `test:watch` scripts
3. Run `pnpm test` to verify existing 5 tests still pass

### Phase 3: Langgraph-server Jest → Vitest (independent)
1. `pnpm remove -D jest ts-jest @jest/globals @types/jest && pnpm add -D vitest @vitest/coverage-v8`
2. Create `vitest.config.ts` with `environment: 'node'`, `setupFiles: ['dotenv/config']`, `testTimeout: 20_000`
3. Replace `from '@jest/globals'` with `from 'vitest'` in 2 test files
4. Update scripts: remove `--experimental-vm-modules`, replace `jest` → `vitest`
5. Run `pnpm test && pnpm test:int` to verify

### Phase 4: Backend Jest → Vitest (independent)
1. `pnpm remove -D jest ts-jest @types/jest && pnpm add -D vitest @vitest/coverage-v8 @swc/core unplugin-swc`
2. Create `vitest.workspace.ts` as shown in Decision 4
3. Replace `jest.fn()` → `vi.fn()`, `jest.spyOn()` → `vi.spyOn()`, `jest.mock()` → `vi.mock()`, `jest.restoreAllMocks()` → `vi.restoreAllMocks()`, `jest.mocked()` → `vi.mocked()` in 12 spec files
4. Update scripts: `jest` → `vitest run`, `jest --watch` → `vitest`, `jest --coverage` → `vitest run --coverage`
5. Update `test:debug` script (remove ts-node/register, use vitest equivalent)
6. Run `pnpm test` to verify all 12 tests pass

### Phase 5: Cleanup
1. Verify zero Jest dependencies in `pnpm list --recursive`
2. Update `CLAUDE.md` — remove Jest references, add Vitest section
3. Full `pnpm test` at root to verify end-to-end

### Rollback
Each phase is independently revertible — no workspace migration depends on another. To rollback a phase, revert the commit and re-run `pnpm install`.

## Open Questions

None — the approach is clear from the analysis done in the audit.
