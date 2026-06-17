## ADDED Requirements

### Requirement: Frontend vitest includes .test.tsx files
The frontend vitest configuration SHALL include `**/*.test.tsx` in its test include pattern so that React component tests are not silently skipped.

#### Scenario: vitest picks up .test.tsx files
- **WHEN** `vitest run` executes in `apps/frontend`
- **THEN** any `.test.tsx` files in the source tree are discovered and executed

#### Scenario: vitest config has correct include pattern
- **WHEN** `apps/frontend/vitest.config.ts` is inspected
- **THEN** the `test.include` array contains `**/*.test.tsx`

### Requirement: CI includes dependency vulnerability audit
The GitHub Actions CI workflow SHALL include a step that runs `pnpm audit` to detect known vulnerabilities.

#### Scenario: CI workflow has audit step
- **WHEN** `.github/workflows/ci.yml` is inspected
- **THEN** it contains a step that runs `pnpm audit --audit-level=high`

#### Scenario: Audit runs in quality job
- **WHEN** the `quality` job executes on a PR
- **THEN** the audit step runs after `pnpm install`
