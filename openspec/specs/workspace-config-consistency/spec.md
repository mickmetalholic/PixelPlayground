## ADDED Requirements

### Requirement: langgraph-server has start script
The `apps/langgraph-server` package SHALL have a `start` script so that `turbo run start` does not fail for this workspace.

#### Scenario: langgraph-server start script present
- **WHEN** `apps/langgraph-server/package.json` is inspected
- **THEN** the `scripts` section contains a `start` entry

#### Scenario: turbo run start does not error on langgraph-server
- **WHEN** `turbo run start` is invoked
- **THEN** no error is reported for `langgraph-server` due to a missing script

### Requirement: packages/api has dev and build scripts
The `packages/api` package SHALL have explicit `dev` and `build` scripts to avoid confusion in the Turborepo pipeline.

#### Scenario: api dev and build scripts present
- **WHEN** `packages/api/package.json` is inspected
- **THEN** the `scripts` section contains both `dev` and `build` entries

### Requirement: No duplicate @biomejs/biome in backend
The `apps/backend` package SHALL NOT list `@biomejs/biome` in its devDependencies, as it is already provided by the root workspace.

#### Scenario: Backend does not duplicate biome
- **WHEN** `apps/backend/package.json` is inspected
- **THEN** `devDependencies` does not contain `@biomejs/biome`

### Requirement: No hardcoded Tencent npm mirror
The root `.npmrc` file SHALL NOT contain a Tencent Cloud registry override. The default npm registry SHALL be used.

#### Scenario: .npmrc has no mirror
- **WHEN** `.npmrc` is read
- **THEN** no `registry=` line referencing `mirrors.cloud.tencent.com` exists

### Requirement: .editorconfig present
The project root SHALL contain an `.editorconfig` file with consistent editor settings for the project.

#### Scenario: editorconfig exists with correct settings
- **WHEN** `.editorconfig` is read
- **THEN** it defines `indent_style = space`, `indent_size = 2`, `charset = utf-8`, and `end_of_line = lf`

### Requirement: Mise tool version configuration present
The project root SHALL contain a `.mise.toml` file specifying Node.js 24 and pnpm 9.15.9.

#### Scenario: mise.toml specifies correct tools
- **WHEN** `.mise.toml` is read
- **THEN** it configures `node = "24"` and `pnpm = "9.15.9"`

### Requirement: Renovate configuration present
The project root SHALL contain a `renovate.json` file configuring automated dependency updates with monorepo-aware settings.

#### Scenario: renovate.json exists
- **WHEN** `renovate.json` is read
- **THEN** it extends `config:recommended` and enables pnpm manager
