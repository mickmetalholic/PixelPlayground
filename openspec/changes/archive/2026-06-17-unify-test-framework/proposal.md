## Why

The monorepo uses three different test configurations — Jest 30 (backend), Jest 29 (langgraph-server), and Vitest (frontend + packages/api) — with no shared conventions, increasing maintenance overhead. Additionally, the frontend's Vitest config uses `environment: 'node'` with no jsdom/happy-dom support, making it impossible to test any of the 27 React components in the codebase. A unified, standardised test infrastructure eliminates the cognitive cost of juggling two test frameworks, enables frontend component testing, and gives every workspace a consistent test developer experience.

## What Changes

- **Frontend**: Add jsdom + `@testing-library/react` + `@testing-library/jest-dom`, restructure vitest config into a workspace-level multi-project setup (server tests stay `node`, component tests use `jsdom`), and add a setup file for DOM matchers. Existing four `.test.ts` files are unaffected.
- **packages/api**: Add an explicit `vitest.config.ts` and standardise test scripts (`test:cov`, `test:watch`).
- **LangGraph server**: Migrate from Jest 29 to Vitest. Replace `@jest/globals` imports with `vitest`, swap `dotenv/config` setup to vitest's equivalent, remove the `--experimental-vm-modules` hack. Two test files affected.
- **Backend**: Migrate from Jest 30 to Vitest using `@swc/core` + `unplugin-swc` for NestJS decorator-metadata compatibility. Replace `jest.fn`/`jest.spyOn`/`jest.mock` with `vi.fn`/`vi.spyOn`/`vi.mock`. Replace `@nestjs/testing` calls stay the same (vitest compatible). Twelve test files affected. Coverts multi-project Jest config to Vitest workspace.
- **Root/Docs**: Remove all Jest dependency traces across `package.json` files. Update `CLAUDE.md` documentation. Standardise test scripts (`test`, `test:cov`, `test:watch`) across all workspaces.

## Capabilities

### New Capabilities

- `unified-test-framework`: All workspaces (frontend, backend, langgraph-server, packages/api) use Vitest as their sole test framework with consistent configuration patterns, script naming, and coverage tooling. All Jest dependencies are removed from the monorepo.
- `react-component-testing`: The frontend workspace supports testing React components with jsdom, `@testing-library/react`, and `@testing-library/jest-dom`. New component test files (`*.test.tsx`) run in a jsdom environment while existing server-side logic tests (`*.test.ts`) continue using `node` environment.

### Modified Capabilities

None. Existing product capabilities (backend tRPC panel, frontend playground, game discount events, steam game metadata) retain their current spec-level requirements. This change is purely infrastructure — it does not alter observable behaviour of any feature.

## Impact

- **apps/frontend**: 4 new devDependencies (`jsdom`, `@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/dom`). 1 new file (`vitest.setup.ts`). `vitest.config.ts` restructured. Zero existing test files need logic changes.
- **apps/backend**: Jest dependency tree removed (`jest`, `ts-jest`, `@types/jest`). 3 new devDependencies (`vitest`, `@vitest/coverage-v8`, `@swc/core`, `unplugin-swc`). `jest.config.cjs` replaced by `vitest.workspace.ts`. Mechanical `jest.fn` → `vi.fn` transformation in 12 spec files.
- **apps/langgraph-server**: Jest dependency tree removed (`jest`, `ts-jest`, `@jest/globals`, `@types/jest`). 2 new devDependencies (`vitest`, `@vitest/coverage-v8`). `jest.config.js` replaced by `vitest.config.ts`. `@jest/globals` imports replaced in 2 test files. `--experimental-vm-modules` flag removed from scripts.
- **packages/api**: No dependency changes (already uses vitest). 1 new file (`vitest.config.ts`). 2 script additions (`test:cov`, `test:watch`).
- **Root**: No dependency changes. `CLAUDE.md` updated. `turbo.json` unchanged (transparent — `pnpm test` still calls each workspace's test command).
- **Breaking**: None. Public API contracts and package interfaces are unchanged.
