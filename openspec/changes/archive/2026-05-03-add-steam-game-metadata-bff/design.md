## Context

`/data-management/steam-game-metadata` already exists as the default workspace entry, but the current `WorkspaceShell` renders hard-coded placeholder panels for workspace tools. The new experience must turn the Steam metadata entry into a read-only operational UI while preserving the existing Next.js App Router, Tailwind, shadcn-style primitives, and workspace navigation.

This design follows the durable design in `docs/superpowers/specs/2026-05-03-steam-game-metadata-design.md`. The data layer is implemented as a shared tRPC router in `packages/api` and is executed in-process by the Next.js `/api/trpc` BFF route, following the project's existing tRPC integration pattern.

The first implementation uses fixed mock data extracted from Steam appdetails for seven Steam app IDs. Runtime requests must not call Steam, Nest, a backend tRPC upstream, or a database. The shared tRPC contract is still shaped for future larger data sources because future search volume is expected to be large.

## Goals / Non-Goals

**Goals:**

- Provide a read-only Steam game metadata workspace at `/data-management/steam-game-metadata`.
- Add shared tRPC procedures in packages/api for list search and detail lookup.
- Keep search in the shared tRPC procedure layer, matching SteamID, English name, and Chinese name.
- Store fixed mock Steam metadata behind the tRPC/server boundary.
- Present a professional, data-dense admin UI consistent with the existing workspace shell and theme tokens.
- Cover search, pagination shape, detail lookup, missing detail, and fallback-name behavior with focused tests.

**Non-Goals:**

- No editing, persistence, imports, exports, batch operations, audit trail, authentication, or authorization.
- No runtime Steam API calls, Steam sync jobs, Nest backend integration, backend tRPC proxying, or database access.
- No general-purpose BFF proxy.
- No redesign of the whole workspace shell or global theme.

## Decisions

### Decision 1: Use the Next `/api/trpc` BFF with in-process tRPC procedures

Add `steam.games` and `steam.detail` procedures to the shared tRPC router in `packages/api/src/routers/`, and execute them directly from the Next.js `/api/trpc` route. The Steam metadata BFF must read local mock data through the in-process router and must not create a Nest/backend tRPC client or forward Steam metadata requests to the Nest `/trpc` endpoint in the first implementation.

Rationale:

- Follows the project's established tRPC pattern while keeping the first Steam metadata BFF self-contained in the frontend app.
- Keeps browser code decoupled from the mock data module and from future backing stores.
- Provides full type safety from the router definition to the React query hooks.
- Testing is simpler via `appRouter.createCaller()` compared to Next route handler mocks.

Alternatives considered:

- Import mock data directly into the page. This is simpler, but it weakens the future BFF boundary and puts full-result filtering in the browser.
- Add a generic proxy route. This conflicts with the existing API boundary guidance and would not model the intended Steam metadata contract.
- Forward Steam metadata requests from Next `/api/trpc` to the Nest backend. This may be useful later, but it adds an upstream dependency before the real backend data source exists.

### Decision 2: Keep the first data source as local mock data

Create a typed mock data module with records derived from Steam appdetails for app IDs `1091500`, `570`, `578080`, `2868840`, `2507950`, `271590`, and `413150`.

Rationale:

- Gives the UI realistic images, names, prices, release dates, descriptions, and categories without introducing runtime network variability.
- Makes tests deterministic.
- Leaves the shared tRPC router as the only data access point for the page.

Alternatives considered:

- Runtime Steam appdetails calls. This would slow local development, introduce failure modes outside the app, and make tests more fragile.
- Store only tiny placeholder records. This would not exercise the detail panel or data-dense UI well enough.

### Decision 3: Split list summaries from detail records

The `steam.games` procedure returns `SteamGameSummary[]` inside `{ items, pageInfo, query, total }`. The `steam.detail` procedure returns `SteamGameDetail`.

Rationale:

- Avoids teaching the UI to depend on full-detail payloads for every search result.
- Keeps the tRPC shape useful when the data source becomes large.
- Lets the right-side panel load or refresh detail independently.

Alternatives considered:

- Return all detail fields from the list procedure. This is simpler with seven mock records, but it bakes in an inefficient contract.
- Use only the list response for the detail panel. This reduces one request but weakens the detail contract.

### Decision 4: Search and pagination happen in shared API helpers

Search helpers normalize query text and match against `steamId`, `nameEn`, and `nameZh`. `limit` controls page size. `cursor` is encoded from the filtered result offset for the first version.

Rationale:

- Keeps behavior testable without rendering React.
- Models future server-side search.
- Keeps tRPC procedures thin and easier to validate.

Alternatives considered:

- Client-side filtering. This is fine for seven records but contradicts the future large-data requirement.
- Full text search dependency. This is unnecessary for the first mock-only implementation.

### Decision 5: Refactor workspace rendering around tool content

`WorkspaceShell` should keep common header, section navigation, and sidebar behavior, but the `steam-game-metadata` item should render a dedicated Steam metadata workspace component. Unimplemented tools can keep the existing placeholder panel behavior.

Rationale:

- Stops the shell from hard-coding all tool bodies.
- Keeps the existing navigation and visual identity intact.
- Creates a natural place for future tools to provide their own content.

Alternatives considered:

- Replace `WorkspaceShell` entirely. This is too broad and risks unrelated UI churn.
- Put all Steam UI directly inside `WorkspaceShell`. This would make the shell harder to maintain.

### Decision 6: Use a data-dense admin UI

Use a compact table/list area with complete capsule thumbnails, combined English/Chinese name presentation, platform icons, sync freshness status, and metadata columns, plus a right-side detail panel. Use existing theme tokens and lucide icons. Use hover, focus, selected, loading, empty, error, and not-found states.

Rationale:

- The task is operational data review, not marketing or editorial content.
- A table-like list and detail panel support scanning and repeated selection.
- Existing visual language remains stable across the workspace.

Alternatives considered:

- Card grid. It makes game art prominent but reduces scanability for metadata management.
- Modal detail view. It is lightweight but poor for repeated browsing and comparison.
- Separate detail page. It gives shareable URLs but adds navigation friction for this first management surface.

### Decision 7: Keep list rows scannable while showing sync state

`lastSyncedAt` is included in the list summary response so the table can show sync freshness without loading every detail record. The table displays English and Chinese names in one column with visual hierarchy, complete capsule artwork in its natural wide ratio, icon-based platforms, and a color-coded sync age.

Rationale:

- Sync freshness is operational list metadata, not detail-only content.
- Combining English and Chinese names keeps the table narrower while preserving both identifiers.
- Complete capsule artwork is more useful than cropped or tiny thumbnails for game metadata review.

### Decision 8: Use internal scrolling for the Steam metadata workspace

The Steam metadata workspace should use the full available shell content width and keep the list and detail panel as independently scrollable panes on desktop. The page body should not be the primary scroll surface during normal metadata review. Long short and detailed descriptions should use contained reading areas with subtle styled scrollbars.

Rationale:

- The table needs horizontal space to keep operational columns readable.
- Independent list/detail scrolling supports repeated review without losing the current selection context.
- Styled internal scrollbars reduce visual noise while keeping overflow discoverable.

## Data Flow

```text
Browser workspace page
  -> trpc.steam.games.useQuery({ q, limit, cursor })
  -> Next /api/trpc route
  -> in-process @pixel-playground/api steam.games procedure
  -> typed mock data + search helper
  -> list response

Browser selects a row
  -> trpc.steam.detail.useQuery({ steamId })
  -> Next /api/trpc route
  -> in-process @pixel-playground/api steam.detail procedure
  -> typed mock data lookup
  -> detail response or typed not-found error
```

The browser never imports the mock data module for list filtering. The Next BFF must resolve Steam metadata requests locally through the in-process tRPC router and local mock source; it must not depend on Nest being running. The page may keep the previous list visible while a new search is loading, but the authoritative filtered results come from the tRPC response.

## Failure Modes

- Invalid `limit` or `cursor` -> return a typed tRPC validation error from `steam.games`.
- Detail `steamId` not found -> return a typed tRPC not-found error with `STEAM_GAME_NOT_FOUND`.
- Unexpected API failure -> return a stable tRPC error without stack traces or local paths.
- Image loading failure -> render a stable visual placeholder so row and panel layout do not shift.
- Empty search result -> show an empty list state and a neutral detail empty state.
- Selected game disappears after search -> select the first returned item, or clear detail when no items remain.

## Test Strategy

- Add pure search helper tests for SteamID, English name, Chinese name, empty query, limit, cursor/pageInfo, and name fallback behavior.
- Add `packages/api` procedure tests for list success, invalid parameters, detail success, and detail not found.
- Add focused frontend tests where practical for query construction, empty state, and selection fallback.
- Run `pnpm --filter @pixel-playground/api test` and `pnpm --filter @pixel-playground/frontend test` first, followed by `pnpm lint` and `pnpm build` when implementation is complete.

## Migration Plan

1. Add Steam mock data, types, search helpers, and `steam` tRPC router procedures.
2. Register `steam` in `packages/api/src/routers/_app.ts` so it is available through the existing frontend `/api/trpc` endpoint.
3. Ensure the frontend `/api/trpc` BFF route executes Steam metadata procedures locally and does not forward Steam metadata requests to the Nest backend.
4. Refactor workspace shell rendering to delegate Steam metadata content to a dedicated component while preserving placeholder behavior for other tools.
5. Add the Steam metadata UI and client-side state using `trpc.steam.*` hooks for search, selected row, detail loading, and error states.
6. Remove any dedicated `/api/steam/*` route handler implementation if present.
7. Add tests and run focused API/frontend verification.

Rollback is straightforward: remove the `steam` router registration, Steam metadata components, and mock/search modules, then restore the previous placeholder rendering for `steam-game-metadata`. No persistent data migration is involved.

## Risks / Trade-offs

- Mock data may drift from real Steam appdetails -> Keep mock data explicitly scoped as fixed fixture data and avoid claiming live freshness in the UI.
- Right-side detail on small screens can become cramped -> Use a single-column responsive layout on mobile, with list first and detail below.
- Offset cursor is not suitable for mutable large datasets -> Treat it as a first-version compatibility shape, not the future storage strategy.
- tRPC procedure tests can become coupled to UI concerns -> Keep validation, search, and response construction in testable helpers.
- Refactoring `WorkspaceShell` can affect other workspace items -> Preserve the existing placeholder path for non-Steam tools and keep changes scoped.
- Fixed-height desktop panes can be awkward on narrow screens -> Keep the one-column mobile fallback and constrain the fixed-pane behavior to the Steam metadata workspace.

## Open Questions

- None for the first implementation.
