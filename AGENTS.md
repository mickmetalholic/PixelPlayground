# PixelPlayground Agent Instructions

## Project Snapshot

- Package manager: pnpm 9.15.9.
- Runtime: Node.js 24.x, pinned through Volta to 24.15.0.
- Repository shape: Turborepo TypeScript monorepo.
- Main areas: Next.js frontend, NestJS backend, LangGraph server, and shared tRPC API package.
- Formatting and linting: Biome from the repository root.

## Common Commands

- Install dependencies: `pnpm install`
- Start development: `pnpm dev`
- Build all packages/apps: `pnpm build`
- Run tests: `pnpm test`
- Run coverage: `pnpm test:cov`
- Lint/check formatting: `pnpm lint`
- Apply safe lint fixes: `pnpm lint:fix`

## OpenSpec Workflow

- OpenSpec is configured in `openspec/config.yaml`.
- Codex OpenSpec skills live under `.codex/skills/`.
- For feature work, architecture work, cross-package contracts, or behavior changes with meaningful scope, create or continue an OpenSpec change before implementation.
- Use `openspec list --json` to inspect active changes.
- Use `openspec status --change <change-name> --json` before implementing a change.
- Use `openspec instructions <artifact-id> --change <change-name> --json` to get artifact-specific guidance.
- Keep OpenSpec artifacts in English, including `proposal.md`, `design.md`, `tasks.md`, and `spec.md`.
- Keep code identifiers, file names, public API names, and package names unchanged unless the task explicitly calls for a rename.
- After implementation, validate relevant specs or changes with `openspec validate`.

## Superpowers Workflow

- The Codex Superpowers plugin is expected to be available in this environment.
- Use Superpowers skills when they match the task, especially brainstorming, writing plans, executing plans, TDD, systematic debugging, and code review.
- Store durable Superpowers-style design notes in `docs/superpowers/specs/`.
- Store durable implementation plans in `docs/superpowers/plans/`.
- For ambiguous work, clarify requirements through brainstorming or a short written spec before editing code.
- For planned work, execute task-by-task and update checklist items as progress is made.
- For debugging, identify the root cause before making fixes; add or update a focused regression test when practical.

## Engineering Rules

- Prefer existing project patterns and local helpers over new abstractions.
- Keep edits scoped to the requested change.
- Do not rewrite unrelated files or reformat the repository opportunistically.
- Add tests in the nearest existing test style when behavior changes.
- Run the narrowest relevant verification first, then broader checks when the change affects shared behavior.
- Do not revert user changes unless explicitly asked.

## Frontend Notes

- Follow existing Next.js, React, Tailwind, shadcn/ui, and local component patterns.
- Keep operational UI dense, clear, and task-focused.
- Use existing UI primitives before introducing new ones.
