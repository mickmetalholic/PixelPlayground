# Proposal: Frontend Playground Dependencies

## Summary
Add and scaffold the approved frontend dependency stack in `apps/frontend` for isolated capability demos under `/playground/*`.  
This change focuses on installation and baseline scaffolding only, without integrating business workflows.

## Why
- The frontend currently lacks a unified baseline for UI components, AI streaming, state management, forms, markdown rendering, and rich text editing.
- Team development speed is reduced when each feature has to bootstrap these libraries from scratch.
- An isolated playground route tree allows fast validation without risking regressions on existing home page and tRPC paths.

## Scope
### In Scope
- Install required packages for:
  - shadcn/ui (CLI initialization path)
  - Vercel AI SDK (`ai`)
  - Zustand
  - React Hook Form (+ existing Zod reuse)
  - react-markdown + remark-gfm + rehype-highlight
  - Tiptap (`@tiptap/react`, `@tiptap/pm`, `@tiptap/starter-kit`)
- Reuse existing `@tanstack/react-query` and `zod` dependencies.
- Add isolated routes:
  - `/playground`
  - `/playground/query`
  - `/playground/state`
  - `/playground/form`
  - `/playground/markdown`
  - `/playground/editor`
  - `/playground/ai`
- Add minimal supporting library modules under `src/lib/*` for layering and testability.

### Out of Scope
- Migrating existing business pages to these libraries.
- Refactoring unrelated frontend modules.
- Full production-ready editor/AI feature set.

## Success Criteria
- Frontend build succeeds after dependency and scaffold updates.
- Playground index and all six capability routes are reachable.
- Each capability page demonstrates one minimal happy path and one basic error/edge path.
- Existing root page and current tRPC behavior remain unchanged.

## Risks and Mitigations
- **Risk:** Multi-package install introduces integration friction.  
  **Mitigation:** Keep implementation isolated to playground routes and focused lib modules.
- **Risk:** Generated shadcn files may differ from existing conventions.  
  **Mitigation:** Apply minimal adaptation only, avoid broad style rewrites.
- **Risk:** AI demo requires environment configuration.  
  **Mitigation:** Provide explicit runtime fallback messages when configuration is missing.
