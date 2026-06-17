## 1. Frontend — Enable React component testing infrastructure

- [x] 1.1 Install jsdom, @testing-library/react, and @testing-library/jest-dom in `apps/frontend`: `pnpm add -D jsdom @testing-library/react @testing-library/jest-dom`
- [x] 1.2 Create `apps/frontend/vitest.setup.ts` with a single `import '@testing-library/jest-dom/vitest'` entry
- [x] 1.3 Restructure `apps/frontend/vitest.config.ts` into a multi-project workspace: `server` (node, `*.test.ts`) and `components` (jsdom, `*.test.tsx`, setupFile)
- [x] 1.4 Run `pnpm test` in `apps/frontend` and verify all 12 existing tests pass unchanged

## 2. packages/api — Add explicit vitest configuration

- [x] 2.1 Create `packages/api/vitest.config.ts` with `environment: 'node'` and explicit include patterns
- [x] 2.2 Add `test:cov` and `test:watch` scripts to `packages/api/package.json` matching the standard pattern
- [x] 2.3 Run `pnpm test` in `packages/api` and verify all 46 existing tests pass unchanged

## 3. LangGraph server — Migrate from Jest 29 to Vitest

- [x] 3.1 Remove Jest dependencies and install Vitest: `pnpm remove -D jest ts-jest @jest/globals @types/jest && pnpm add -D vitest @vitest/coverage-v8`
- [x] 3.2 Create `apps/langgraph-server/vitest.config.ts` with `environment: 'node'`, `setupFiles: ['dotenv/config']`, and `testTimeout: 20_000`
- [x] 3.3 Replace `import { describe, expect, it } from '@jest/globals'` with `import { describe, expect, it } from 'vitest'` in `tests/agent.test.ts` and `tests/graph.int.test.ts`
- [x] 3.4 Update test scripts in `package.json`: replace `jest` with `vitest`, remove `--experimental-vm-modules` flag, add `test:watch` script
- [x] 3.5 Delete `apps/langgraph-server/jest.config.js`
- [x] 3.6 Run `pnpm test` in `apps/langgraph-server` and verify 2 tests pass

## 4. Backend — Migrate from Jest 30 to Vitest with SWC decorator support

- [x] 4.1 Remove Jest dependencies and install Vitest + SWC: `pnpm remove -D jest ts-jest @types/jest && pnpm add -D vitest @vitest/coverage-v8 @swc/core unplugin-swc`
- [x] 4.2 Create `apps/backend/vitest.config.ts` with SWC plugin (legacyDecorator + decoratorMetadata), `globals: true`, and include patterns for unit and e2e tests
- [x] 4.3 Convert `apps/backend/jest.config.cjs` moduleNameMapper to vitest `resolve.alias`: map `@pixel-playground/api` to the shared package source, keep `superjson` mock
- [x] 4.4 Mechanical rename `jest.fn()` → `vi.fn()` in all files under `apps/backend/src/` and `apps/backend/test/`
- [x] 4.5 Mechanical rename `jest.spyOn(` → `vi.spyOn(` in the same files
- [x] 4.6 Mechanical rename `jest.mock(` → `vi.mock(` in the same files
- [x] 4.7 Mechanical rename `jest.restoreAllMocks()` → `vi.restoreAllMocks()` in the same files
- [x] 4.8 Mechanical rename `jest.mocked(` → `vi.mocked(` in the same files
- [x] 4.9 Update test scripts in `apps/backend/package.json`: replace `jest` commands with `vitest` equivalents; simplify `test:debug` to `vitest --inspect-brk --threads false`
- [x] 4.10 Delete `apps/backend/jest.config.cjs`
- [x] 4.11 Run `pnpm test` in `apps/backend` and verify all 44 unit + e2e tests pass

## 5. Cleanup and documentation

- [x] 5.1 Run `pnpm list --recursive | grep -iE 'jest|@jest'` from root to verify zero Jest packages remain (only `@testing-library/jest-dom` — not Jest framework)
- [x] 5.2 Verify all workspaces pass: frontend 12, api 46, langgraph-server 2, backend 44 = 104 tests total
- [x] 5.3 Update `CLAUDE.md`: remove Jest references from tech stack, add Vitest as the single test framework, note jsdom frontend capability
