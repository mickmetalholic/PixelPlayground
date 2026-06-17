## ADDED Requirements

### Requirement: Single test framework across monorepo
Every workspace in the monorepo SHALL use Vitest (`vitest`) as its sole test framework. The monorepo MUST NOT contain any Jest dependency (`jest`, `ts-jest`, `@jest/globals`, `@types/jest`) in any `package.json` after migration.

#### Scenario: Running tests at root level
- **WHEN** `pnpm test` is executed at the monorepo root
- **THEN** every workspace runs its tests through `vitest run` and Turborepo aggregates the results

#### Scenario: No Jest imports in test files
- **WHEN** `rg "from '@jest/globals'"` or `rg "from 'jest'"` is run across the monorepo
- **THEN** zero matches are found in any test file

#### Scenario: No Jest packages in dependency trees
- **WHEN** `pnpm list --depth=0 --recursive | grep -i jest` is run
- **THEN** no Jest packages appear (except vitest-compatible transitive deps)

### Requirement: Consistent test scripts across workspaces
Every workspace SHALL provide three test scripts: `test` (single run), `test:watch` (interactive watch mode), and `test:cov` (single run with coverage output).

#### Scenario: Standard scripts in apps/frontend
- **WHEN** `pnpm test`, `pnpm test:watch`, or `pnpm test:cov` is run in `apps/frontend`
- **THEN** vitest executes with the corresponding mode (run, watch, or run --coverage)

#### Scenario: Standard scripts in apps/backend
- **WHEN** `pnpm test`, `pnpm test:watch`, or `pnpm test:cov` is run in `apps/backend`
- **THEN** vitest executes with the corresponding mode using the workspace config

#### Scenario: Standard scripts in apps/langgraph-server
- **WHEN** `pnpm test`, `pnpm test:watch`, or `pnpm test:cov` is run in `apps/langgraph-server`
- **THEN** vitest executes with the corresponding mode without `--experimental-vm-modules` flag

#### Scenario: Standard scripts in packages/api
- **WHEN** `pnpm test`, `pnpm test:watch`, or `pnpm test:cov` is run in `packages/api`
- **THEN** vitest executes with the corresponding mode using explicit vitest config

### Requirement: Backend decorator metadata compatibility
The backend workspace SHALL continue to support NestJS decorator metadata (`emitDecoratorMetadata: true`) in tests so that `@nestjs/testing` (`Test.createTestingModule`) works correctly. The vitest config MUST use an SWC transform (`@swc/core` + `unplugin-swc`) configured with `legacyDecorator: true` and `decoratorMetadata: true`.

#### Scenario: NestJS testing module compiles and runs
- **WHEN** a backend test file uses `Test.createTestingModule({ providers: [...] }).compile()`
- **THEN** the module compiles without decorator-metadata errors and the compiled module resolves injected dependencies

#### Scenario: jest.fn equivalents work in backend tests
- **WHEN** a backend test file calls `vi.fn()`, `vi.spyOn()`, or `vi.mock()`
- **THEN** the mock behaves identically to the previous `jest.fn()` / `jest.spyOn()` / `jest.mock()` call

### Requirement: Explicit vitest configuration for every workspace
Every workspace SHALL have an explicit `vitest.config.ts` (or `vitest.workspace.ts` for multi-project) file checked into version control. No workspace MAY rely on vitest defaults alone.

#### Scenario: packages/api has vitest.config.ts
- **WHEN** `ls packages/api/vitest.config.ts` is run
- **THEN** the file exists and exports a valid vitest configuration

#### Scenario: apps/backend has vitest workspace config
- **WHEN** `ls apps/backend/vitest.workspace.ts` is run
- **THEN** the file exists and defines at minimum a `unit` project and an `e2e` project
