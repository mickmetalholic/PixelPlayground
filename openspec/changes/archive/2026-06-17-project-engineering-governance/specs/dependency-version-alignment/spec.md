## ADDED Requirements

### Requirement: Zod unified to v4 across all workspaces
All workspace packages (`@pixel-playground/api`, `@pixel-playground/backend`, `@pixel-playground/frontend`) SHALL use `zod@^4.3.6`, matching the version already used by `@pixel-playground/langgraph-server`. The shared API package's tRPC router schemas MUST remain functional after migration.

#### Scenario: API package passes tests with Zod v4
- **WHEN** `pnpm test` runs in `packages/api` after Zod v4 upgrade
- **THEN** all existing tests pass without modification

#### Scenario: Backend passes tests with Zod v4
- **WHEN** `pnpm test` runs in `apps/backend` after Zod v4 upgrade
- **THEN** all existing tests pass without modification

#### Scenario: Frontend passes tests with Zod v4
- **WHEN** `pnpm test` runs in `apps/frontend` after Zod v4 upgrade
- **THEN** all existing tests pass without modification

#### Scenario: No duplicate Zod installations
- **WHEN** `pnpm install` runs after all workspaces use compatible Zod v4 ranges
- **THEN** only one version of Zod is present in `node_modules`

### Requirement: TypeScript unified to ^5.9.x across all workspaces
All workspace packages SHALL use TypeScript `^5.9.3` as their devDependency, and the root `package.json` SHALL pin TypeScript to `^5.9.3`. The full build (`pnpm build`) MUST succeed without new type errors.

#### Scenario: Root TypeScript version updated
- **WHEN** the root `package.json` is updated
- **THEN** `devDependencies.typescript` is `^5.9.3`

#### Scenario: All workspace TypeScript versions aligned
- **WHEN** workspace `package.json` files are inspected
- **THEN** each workspace that declares TypeScript uses `^5.9.3`

#### Scenario: Full build succeeds after TypeScript upgrade
- **WHEN** `pnpm build` runs
- **THEN** all packages build without TypeScript compilation errors

### Requirement: Node version unified to 24 in langgraph.json
The LangGraph server's `langgraph.json` SHALL specify `node_version: "24"`, consistent with the project's Node.js 24 runtime and root `package.json` engines constraint.

#### Scenario: langgraph.json node_version is 24
- **WHEN** `langgraph.json` is read
- **THEN** the `node_version` field is `"24"`

### Requirement: @types/node upgraded to ^24
The `apps/frontend` and `apps/backend` packages SHALL use `@types/node@^24.0.0` in their devDependencies, matching the Node.js 24 runtime.

#### Scenario: Frontend uses @types/node ^24
- **WHEN** `apps/frontend/package.json` is inspected
- **THEN** `devDependencies.@types/node` satisfies `^24.0.0`

#### Scenario: Backend uses @types/node ^24
- **WHEN** `apps/backend/package.json` is inspected
- **THEN** `devDependencies.@types/node` satisfies `^24.0.0`
