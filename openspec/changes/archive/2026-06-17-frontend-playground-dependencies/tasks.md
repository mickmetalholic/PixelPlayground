# Tasks: Frontend Playground Dependencies

## 1. Dependency Setup
- [x] Install required dependencies in `apps/frontend`:
  - `ai`
  - `zustand`
  - `react-hook-form`
  - `react-markdown`
  - `remark-gfm`
  - `rehype-highlight`
  - `@tiptap/react`
  - `@tiptap/pm`
  - `@tiptap/starter-kit`
- [x] Confirm existing dependencies are reused:
  - `@tanstack/react-query`
  - `zod`
- [x] Run `shadcn/ui` CLI initialization for Next.js + Tailwind setup.

## 2. Shared Scaffolding
- [x] Add/update UI utility and generated shadcn component files:
  - `components.json`
  - `src/components/ui/*`
  - `src/lib/ui/cn.ts` (or generated equivalent with minimal compatibility adaptation)
- [x] Add capability library modules:
  - `src/lib/state/playground.store.ts`
  - `src/lib/validation/playground.schema.ts`
  - `src/lib/markdown/markdown-components.tsx`
  - `src/lib/editor/tiptap-extensions.ts`
  - `src/lib/ai/playground-ai-client.ts`

## 3. Playground Routes
- [x] Create playground route layout and index:
  - `src/app/playground/layout.tsx`
  - `src/app/playground/page.tsx`
- [x] Create capability routes:
  - `src/app/playground/query/page.tsx`
  - `src/app/playground/state/page.tsx`
  - `src/app/playground/form/page.tsx`
  - `src/app/playground/markdown/page.tsx`
  - `src/app/playground/editor/page.tsx`
  - `src/app/playground/ai/page.tsx`
- [x] Optional server route proxy for AI:
  - `src/app/api/playground/ai/route.ts`

## 4. Behavioral Baselines
- [x] Query page: loading/success/error + retry path.
- [x] State page: at least two predictable actions (e.g., increment/reset).
- [x] Form page: invalid input blocked, valid input accepted.
- [x] Markdown page: GFM + syntax highlight rendering samples.
- [x] Editor page: input + basic formatting + serialized output.
- [x] AI page: request/response/error paths with graceful fallback.

## 5. Validation and Safety
- [x] Ensure frontend build succeeds.
- [x] Ensure `/playground` and all capability routes are reachable.
- [x] Ensure root page and existing tRPC behavior are unaffected.
- [x] Add or update focused tests for new `src/lib/*` logic where appropriate.
