## ADDED Requirements

### Requirement: langgraph-server build context excludes non-runtime files

The `apps/langgraph-server/.dockerignore` file SHALL exclude all files and directories not required at container runtime so that `langgraph build` has a minimal context.

#### Scenario: Build artifacts are excluded from langgraph-server context

- **WHEN** `langgraph build` constructs the Docker build context
- **THEN** `.turbo/`, `dist/`, and `node_modules/` are NOT included

#### Scenario: Test and dev files are excluded from langgraph-server context

- **WHEN** the build context is assembled
- **THEN** `tests/`, `scripts/`, `jest.config.js`, and `tsconfig.json` are NOT included

#### Scenario: Documentation and config files are excluded from langgraph-server context

- **WHEN** the build context is assembled
- **THEN** all `*.md` files, `.env`, `.env.example`, and `.gitignore` are NOT included

#### Scenario: Runtime source files pass through langgraph-server context

- **WHEN** the build context is assembled
- **THEN** `src/`, `static/`, `package.json`, and `langgraph.json` ARE included

### Requirement: backend build context excludes non-runtime files

The `apps/backend/.dockerignore` file SHALL exclude build artifacts, test files, dev configs, and documentation from the Docker build context.

#### Scenario: Backend build context is minimal

- **WHEN** `docker build -f apps/backend/Dockerfile` assembles the context
- **THEN** `node_modules/`, `dist/`, `.turbo/`, `*.md`, `.gitignore`, `vitest.workspace.ts`, `tsconfig.json`, `tsconfig.build.json`, `nest-cli.json` are NOT included
- **AND** `src/`, `package.json` ARE included

### Requirement: frontend build context excludes non-runtime files

The `apps/frontend/.dockerignore` file SHALL exclude build artifacts, test files, dev configs, and documentation from the Docker build context.

#### Scenario: Frontend build context is minimal

- **WHEN** `docker build -f apps/frontend/Dockerfile` assembles the context
- **THEN** `node_modules/`, `.next/`, `.turbo/`, `*.md`, `.gitignore`, `vitest.config.ts`, `vitest.setup.ts`, `tsconfig.json`, `tsconfig.tsbuildinfo`, `postcss.config.mjs`, `components.json` are NOT included
- **AND** `src/`, `public/`, `package.json`, `next.config.ts` ARE included
