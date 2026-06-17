# PixelPlayground

TypeScript monorepo (pnpm + Turborepo) with a Next.js frontend, NestJS backend, LangGraph server, and shared tRPC API package.

## Quick Start

```bash
pnpm install
pnpm dev        # start all apps in dev mode
pnpm build      # build all apps
pnpm test       # run all tests
pnpm lint       # biome check
pnpm lint:fix   # biome check --write
```

## Project Structure

```
apps/
  frontend/       Next.js 15 (turbopack, port 7000), React 19, Tailwind CSS 4, shadcn/ui, tiptap, tRPC
  backend/        NestJS 11, tRPC server, zod
  langgraph-server/  LangGraph.js + LangChain agents
packages/
  api/            Shared tRPC router definitions (imported by frontend & backend)
```

## Tech Stack

- **Runtime**: Node 24.15.0, pnpm 9.15.9
- **Language**: TypeScript 5.x (strict mode, NodeNext module)
- **Lint/Format**: Biome 2.4.11 (2-space indent, single quotes, organize imports on save)
- **Tests**: Vitest (all workspaces); jsdom + @testing-library/react for frontend component tests
- **Commits**: Conventional commits via commitlint (types: feat,fix,docs,style,refactor,perf,test,build,ci,chore). No CJK characters in messages.
- **Git Hooks**: Husky (pre-commit: lint-staged via Biome; commit-msg: commitlint)
- **CI**: GitHub Actions — lint → build → test → coverage (Codecov)

## Development Conventions

- Use `workspace:*` protocol for internal dependencies
- All packages are `"type": "module"` except `apps/backend` (NestJS uses CommonJS)
- Backend uses `@nestjs/cli` for code generation (`nest g resource`)
- Frontend uses `shadcn` for UI component management
- Do not edit auto-generated files (lockfile, `pnpm-lock.yaml`)
- Test files co-located with source (`*.spec.ts`, `*.test.ts`)
- Test files are co-located with source (`*.spec.ts`, `*.test.ts`, `*.test.tsx`)

## OpenSpec & Superpowers Workflow

This project uses **OpenSpec** (spec-driven development) and **Superpowers** (structured AI workflows). Skills are in `.claude/skills/`.

### OpenSpec CLI

`openspec` CLI is available globally (installed via Volta).

| Command | Description |
|---------|-------------|
| `openspec new change "<name>"` | Scaffold a new change |
| `openspec list --json` | List active changes |
| `openspec status --change "<name>" [--json]` | Show artifact/task status |
| `openspec instructions <artifact-id> --change "<name>" [--json]` | Get artifact creation template |
| `openspec instructions apply --change "<name>" --json` | Get implementation status & context |
| `openspec validate [--change "<name>"]` | Validate artifacts or whole change |

### Workflow — Summary

```
/explore              → Explore ideas (no implementation)
/new-change <name>    → Create first artifact only, then STOP
/propose              → Create all artifacts (proposal→specs→design→tasks) at once
/ff-change <name>     → Fast-forward: generate all artifacts in one go
/continue-change      → Create the next artifact in sequence
/apply-change <name>  → Implement tasks from completed artifacts
/verify-change <name> → Verify implementation matches artifacts
/archive-change <name>→ Archive completed change
```

### Workflow — Detailed Steps

**1. Exploring** — Use `/explore` to think through ideas, investigate problems, compare approaches. No code changes allowed in this mode.

**2. Planning a change** — Use `/new-change <name>` or `/propose` or `/ff-change <name>`:
- Creates a kebab-case change directory at `openspec/changes/<name>/`
- Generates artifacts (proposal → specs → design → tasks) in dependency order
- Read dependency artifacts for context before creating each new artifact

**3. Implementing** — Use `/apply-change <name>`:
- Reads context files (proposal, specs, design, tasks)
- Implements tasks one by one, marking `- [ ]` → `- [x]` in tasks.md
- Pauses on blockers or ambiguity

**4. Verifying & Archiving** — Use `/verify-change <name>` then `/archive-change <name>`:
- Verifies completeness (tasks), correctness (specs), coherence (design)
- Archives to `openspec/changes/archive/YYYY-MM-DD-<name>/`

### Artifact Types (spec-driven schema)

| Artifact | File | Purpose |
|----------|------|---------|
| proposal | `proposal.md` | What & why, user-facing goal, capabilities list |
| specs | `specs/<capability>/spec.md` | Requirements with observable behavior & scenarios |
| design | `design.md` | Technical decisions, architecture, data flow |
| tasks | `tasks.md` | Implementation checklist (`- [ ]` / `- [x]`) |

### Superpowers Notes

- Durable design notes go in `docs/superpowers/specs/`
- Durable implementation plans go in `docs/superpowers/plans/`
- Keep all artifacts in English
- Keep code identifiers, file names, API names unchanged unless explicitly asked to rename

## Commands

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start all apps in dev mode |
| `pnpm build` | Build all apps |
| `pnpm test` | Run all tests |
| `pnpm test:cov` | Run all tests with coverage |
| `pnpm lint` | Biome check |
| `pnpm lint:fix` | Biome check with auto-fix |
| `pnpm spec:list` | List OpenSpec specs |
| `pnpm spec:status` | Show OpenSpec status |
| `pnpm spec:validate` | Validate all specs |
| `pnpm spec:update` | Update specs |
