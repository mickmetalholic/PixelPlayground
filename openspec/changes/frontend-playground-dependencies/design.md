# Design: Frontend Playground Dependencies

## Architecture
This change follows strict layered boundaries in the Next.js frontend context:

- **Controller/Route Layer**
  - `src/app/playground/*/page.tsx`
  - Optional: `src/app/api/playground/ai/route.ts`
  - Responsibility: HTTP/UI boundary only (rendering, event binding, request/response mapping).

- **Service Layer**
  - `src/lib/ai/playground-ai-client.ts`
  - `src/lib/state/playground.store.ts`
  - `src/lib/validation/playground.schema.ts`
  - `src/lib/markdown/markdown-components.tsx`
  - `src/lib/editor/tiptap-extensions.ts`
  - Responsibility: framework-light business logic and reusable capability composition.

- **DAL/External Access Layer**
  - Encapsulated query functions and AI route calling adapters.
  - Responsibility: network and external IO details hidden from route/page components.

## File Structure
- `apps/frontend/components.json`
- `apps/frontend/src/components/ui/*`
- `apps/frontend/src/lib/ui/cn.ts` (or minimal compatibility alias if generated differently)
- `apps/frontend/src/lib/state/playground.store.ts`
- `apps/frontend/src/lib/validation/playground.schema.ts`
- `apps/frontend/src/lib/markdown/markdown-components.tsx`
- `apps/frontend/src/lib/editor/tiptap-extensions.ts`
- `apps/frontend/src/lib/ai/playground-ai-client.ts`
- `apps/frontend/src/app/playground/layout.tsx`
- `apps/frontend/src/app/playground/page.tsx`
- `apps/frontend/src/app/playground/query/page.tsx`
- `apps/frontend/src/app/playground/state/page.tsx`
- `apps/frontend/src/app/playground/form/page.tsx`
- `apps/frontend/src/app/playground/markdown/page.tsx`
- `apps/frontend/src/app/playground/editor/page.tsx`
- `apps/frontend/src/app/playground/ai/page.tsx`
- `apps/frontend/src/app/api/playground/ai/route.ts` (if server route proxy is needed)

## Functional Principles
- Prefer pure functions for transform/validation logic.
- Keep state updates immutable (Zustand actions return predictable next state).
- Compose small capability modules instead of large feature files.
- Keep page files thin and focused on composition.

## Data Flow
1. User enters `/playground` and chooses a capability route.
2. Capability route triggers service-level logic and/or query adapters.
3. External data access is performed through isolated request functions.
4. Route layer renders normalized states (`loading`, `success`, `error`) and user feedback.

## Error Handling
- Query: standardized three-state view and retry handling.
- Form: Zod-backed field-level validation via React Hook Form resolver.
- AI: explicit handling for timeout/network/config missing cases.
- Markdown/Tiptap: graceful fallback rendering for empty/invalid input.
- Store: avoid uncontrolled exceptions from action handlers.

## Testing Strategy
- Prioritize unit tests for `src/lib/*` pure logic modules.
- Keep route-level tests lightweight and behavior-focused.
- Validate at least one success and one error/edge scenario per capability route.

## Rollout Strategy
- Isolate all new behavior under `/playground/*`.
- Do not modify current homepage behavior.
- Keep existing tRPC pathways untouched.
